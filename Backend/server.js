require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();
const PORTA = process.env.PORT || 3000;
const PASTA_FRONTEND = path.join(__dirname, "../frontend");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Frontend integrado: o Render entrega o site e a API pela mesma origem.
app.get("/", (req, res) => {
    res.sendFile(path.join(PASTA_FRONTEND, "Main.dc.html"));
});
app.use(express.static(PASTA_FRONTEND));

app.get("/status", async (req, res) => {
    try {
        await pool.query("SELECT NOW()");
        res.json({ status: "ok", banco: "conectado" });
    } catch (erro) {
        console.error("Erro ao conectar ao PostgreSQL:", erro);
        res.status(500).json({ status: "erro", banco: "indisponível" });
    }
});

class ErroApi extends Error {
    constructor(status, mensagem) {
        super(mensagem);
        this.status = status;
    }
}

const COLUNAS_PUBLICAS = "id, nome, email, telefone, cep, latitude, longitude";

// Cria a tabela de cache sem exigir uma migração manual no deploy.
let cacheTableReady;
async function prepararCache() {
    if (!cacheTableReady) {
        cacheTableReady = pool.query(`
            CREATE TABLE IF NOT EXISTS cep_localizacoes (
                cep CHAR(8) PRIMARY KEY,
                endereco JSONB NOT NULL,
                latitude DOUBLE PRECISION NOT NULL,
                longitude DOUBLE PRECISION NOT NULL,
                atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `).catch((erro) => {
            cacheTableReady = null;
            throw erro;
        });
    }
    return cacheTableReady;
}

// Nominatim público: no máximo uma solicitação por segundo por instância.
// O cache persistente no PostgreSQL evita consultar CEPs já conhecidos.
let filaNominatim = Promise.resolve();
let ultimaConsultaNominatim = 0;

function consultarNominatim(url) {
    const tarefa = filaNominatim.then(async () => {
        const intervalo = Date.now() - ultimaConsultaNominatim;
        if (intervalo < 1100) {
            await new Promise(resolve => setTimeout(resolve, 1100 - intervalo));
        }

        ultimaConsultaNominatim = Date.now();

        const resposta = await fetch(url, {
            headers: {
                "User-Agent": process.env.NOMINATIM_USER_AGENT ||
                    "WadeBrasil/1.0 (projeto acadêmico)"
            },
            signal: AbortSignal.timeout(15000)
        });

        const texto = await resposta.text();

        if (resposta.status === 429) {
            const retry = resposta.headers.get("retry-after");
            throw new ErroApi(
                503,
                `O serviço de mapas está temporariamente limitando as consultas. Tente novamente${retry ? ` em ${retry} segundos` : " mais tarde"}.`
            );
        }

        if (!resposta.ok) {
            console.error("Nominatim HTTP", resposta.status, texto.slice(0, 500));
            throw new ErroApi(502, "O serviço de mapas está temporariamente indisponível.");
        }

        let dados;
        try {
            dados = JSON.parse(texto);
        } catch {
            console.error("Resposta inesperada do Nominatim:", texto.slice(0, 500));
            throw new ErroApi(502, "O serviço de mapas retornou uma resposta inválida.");
        }

        return dados;
    });

    // Mantém a fila funcional mesmo se uma chamada falhar.
    filaNominatim = tarefa.catch(() => {});
    return tarefa;
}

async function localizarCep(cep) {
    const cepLimpo = String(cep || "").replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
        throw new ErroApi(400, "CEP inválido. Informe os 8 números.");
    }

    await prepararCache();

    // 1) Cache persistente: não chama ViaCEP/Nominatim se o CEP já foi localizado.
    const salvo = await pool.query(
        `SELECT cep, endereco, latitude, longitude
         FROM cep_localizacoes WHERE cep = $1`,
        [cepLimpo]
    );

    if (salvo.rows.length) {
        const item = salvo.rows[0];
        return {
            cep: item.cep.trim(),
            endereco: item.endereco,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude)
        };
    }

    // 2) Consulta ViaCEP.
    let endereco;
    try {
        const resposta = await fetch(
            `https://viacep.com.br/ws/${cepLimpo}/json/`,
            { signal: AbortSignal.timeout(12000) }
        );
        if (!resposta.ok) throw new Error(`ViaCEP HTTP ${resposta.status}`);
        endereco = await resposta.json();
    } catch (erro) {
        console.error("Falha ao consultar ViaCEP:", erro.message);
        throw new ErroApi(502, "O serviço de CEP está indisponível. Tente novamente.");
    }

    if (endereco.erro) {
        throw new ErroApi(404, "CEP não encontrado.");
    }

    // 3) Busca geográfica: tenta do endereço mais específico ao município.
    const montar = (...partes) => partes.filter(Boolean).join(", ");
    const buscas = [
        montar(endereco.logradouro, endereco.bairro, endereco.localidade, endereco.uf, "Brasil"),
        montar(endereco.bairro, endereco.localidade, endereco.uf, "Brasil"),
        montar(endereco.localidade, endereco.uf, "Brasil")
    ].filter((valor, indice, lista) => valor && lista.indexOf(valor) === indice);

    let localizacao = null;

    for (const busca of buscas) {
        const url = "https://nominatim.openstreetmap.org/search?" +
            "format=jsonv2&q=" + encodeURIComponent(busca) +
            "&countrycodes=br&limit=1";

        const encontrados = await consultarNominatim(url);
        if (Array.isArray(encontrados) && encontrados.length) {
            localizacao = encontrados[0];
            break;
        }
    }

    if (!localizacao) {
        throw new ErroApi(404, "O CEP existe, mas não foi possível encontrar sua região no mapa.");
    }

    const latitude = Number(localizacao.lat);
    const longitude = Number(localizacao.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new ErroApi(502, "O serviço de mapas não retornou coordenadas válidas.");
    }

    const resultado = {
        cep: cepLimpo,
        endereco,
        latitude,
        longitude
    };

    // 4) Persiste as coordenadas para pesquisas futuras.
    await pool.query(
        `INSERT INTO cep_localizacoes (cep, endereco, latitude, longitude)
         VALUES ($1, $2::jsonb, $3, $4)
         ON CONFLICT (cep) DO UPDATE SET
             endereco = EXCLUDED.endereco,
             latitude = EXCLUDED.latitude,
             longitude = EXCLUDED.longitude,
             atualizado_em = NOW()`,
        [cepLimpo, JSON.stringify(endereco), latitude, longitude]
    );

    return resultado;
}

function distanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function responderErro(res, erro, mensagemPadrao) {
    if (erro instanceof ErroApi) {
        return res.status(erro.status).json({ erro: erro.message });
    }
    console.error(mensagemPadrao, erro);
    return res.status(500).json({ erro: mensagemPadrao });
}

// Cadastrar consultor (mantém compatibilidade com o formulário antigo).
app.post("/vendedores", async (req, res) => {
    try {
        const { nome, email, telefone, cpf, cep } = req.body || {};
        if (!nome || !cep) {
            return res.status(400).json({ erro: "Nome e CEP são obrigatórios." });
        }

        const local = await localizarCep(cep);
        const resultado = await pool.query(
            `INSERT INTO vendedores
             (nome, email, telefone, cpf, cep, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING ${COLUNAS_PUBLICAS}`,
            [
                String(nome).trim(),
                email ? String(email).trim() : null,
                telefone ? String(telefone).trim() : null,
                cpf ? String(cpf).trim() : null,
                local.cep,
                local.latitude,
                local.longitude
            ]
        );

        res.status(201).json({
            mensagem: "Consultor cadastrado com sucesso!",
            vendedor: resultado.rows[0]
        });
    } catch (erro) {
        responderErro(res, erro, "Erro ao cadastrar consultor.");
    }
});

// Listagem pública sem CPF.
app.get("/vendedores", async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT ${COLUNAS_PUBLICAS} FROM vendedores ORDER BY id`
        );
        res.json(resultado.rows);
    } catch (erro) {
        responderErro(res, erro, "Erro ao buscar consultores.");
    }
});

// Localização de um CEP.
app.get("/localizar/:cep", async (req, res) => {
    try {
        res.json(await localizarCep(req.params.cep));
    } catch (erro) {
        responderErro(res, erro, "Erro ao localizar CEP.");
    }
});

// Consultores mais próximos de um CEP. Ex.: ?limite=3
app.get("/vendedores/proximos/:cep", async (req, res) => {
    try {
        const cliente = await localizarCep(req.params.cep);
        const resultado = await pool.query(
            `SELECT ${COLUNAS_PUBLICAS}
             FROM vendedores
             WHERE latitude IS NOT NULL AND longitude IS NOT NULL`
        );

        let vendedores = resultado.rows.map(vendedor => ({
            ...vendedor,
            distancia: distanciaKm(
                cliente.latitude,
                cliente.longitude,
                Number(vendedor.latitude),
                Number(vendedor.longitude)
            )
        }));

        vendedores.sort((a, b) => a.distancia - b.distancia);

        const limite = Number.parseInt(req.query.limite, 10);
        if (Number.isInteger(limite) && limite > 0) {
            vendedores = vendedores.slice(0, Math.min(limite, 50));
        }

        res.json({
            cliente: {
                cep: cliente.cep,
                latitude: cliente.latitude,
                longitude: cliente.longitude
            },
            vendedores
        });
    } catch (erro) {
        responderErro(res, erro, "Erro ao buscar consultores próximos.");
    }
});

// Busca exata por e-mail, sem expor a lista completa de contatos.
app.get("/vendedores/email/:email", async (req, res) => {
    try {
        const email = String(req.params.email || "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ erro: "E-mail inválido." });
        }

        const resultado = await pool.query(
            `SELECT ${COLUNAS_PUBLICAS}
             FROM vendedores
             WHERE LOWER(email) = $1`,
            [email]
        );
        res.json({ vendedores: resultado.rows });
    } catch (erro) {
        responderErro(res, erro, "Erro ao buscar consultor por e-mail.");
    }
});

if (require.main === module) {
    app.listen(PORTA, "0.0.0.0", () => {
        console.log(`Servidor Wade iniciado na porta ${PORTA}`);
    });
}

module.exports = app;
