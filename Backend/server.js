const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../Frontend")));

// ==================================
// ROTA PRINCIPAL
// ==================================

app.get("/", async (req, res) => {
    try {
        const resultado = await pool.query("SELECT NOW()");

        console.log("PostgreSQL conectado!");
        console.log(resultado.rows[0]);

        res.send("Servidor funcionando! PostgreSQL conectado.");

    } catch (erro) {
        console.error("Erro ao conectar ao PostgreSQL:", erro);

        res.status(500).send(
            "Erro ao conectar ao PostgreSQL."
        );
    }
});

// ==================================
// CADASTRAR VENDEDOR
// ==================================

app.post("/vendedores", async (req, res) => {

    try {

        const { nome, email, telefone, cpf, cep } = req.body;


        // ==================================
        // VERIFICAR DADOS
        // ==================================

        if (!nome || !cep) {

            return res.status(400).json({
                erro: "Nome e CEP são obrigatórios."
            });

        }


        // Remove caracteres do CEP
        // Exemplo: 85913-130 → 85913130

        const cepLimpo = cep.replace(/\D/g, "");


        if (cepLimpo.length !== 8) {

            return res.status(400).json({
                erro: "CEP inválido."
            });

        }


        // ==================================
        // BUSCAR CEP NO VIACEP
        // ==================================

        const respostaViaCep = await fetch(
            `https://viacep.com.br/ws/${cepLimpo}/json/`
        );

        // Pega a resposta como texto primeiro
        const textoViaCep = await respostaViaCep.text();

        console.log("Resposta do ViaCEP:");
        console.log(textoViaCep);

        let endereco;

        try {

            endereco = JSON.parse(textoViaCep);

        } catch (erro) {

            console.error("O ViaCEP não retornou JSON.");

            return res.status(500).json({
                erro: "O serviço ViaCEP não está disponível no momento."
            });

        }


        // ==================================
        // CEP NÃO ENCONTRADO
        // ==================================

        if (endereco.erro) {

            return res.status(400).json({
                erro: "CEP não encontrado."
            });

        }


        console.log(
            "Endereço encontrado:",
            endereco
        );

        // ==================================
        // BUSCAR LOCALIZAÇÃO NO NOMINATIM
        // ==================================

        // Vamos tentar primeiro o endereço completo
        const buscas = [

            `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`,

            `${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`,

            `${endereco.localidade}, ${endereco.uf}, Brasil`

        ];

        let localizacoes = [];


        // ==================================
        // TENTAR AS BUSCAS
        // ==================================

        for (const busca of buscas) {

            console.log("Tentando localizar:");
            console.log(busca);

            const url =
                "https://nominatim.openstreetmap.org/search?" +
                "format=jsonv2" +
                "&q=" +
                encodeURIComponent(busca) +
                "&countrycodes=br" +
                "&limit=1";

            const respostaNominatim = await fetch(url, {

                headers: {
                    "User-Agent": "SistemaWade/1.0"
                }

            });

            const textoNominatim =
                await respostaNominatim.text();

            console.log("Resposta do Nominatim:");
            console.log(textoNominatim);


            try {

                localizacoes =
                    JSON.parse(textoNominatim);

            } catch (erro) {

                console.error(
                    "O Nominatim não retornou JSON."
                );

                continue;

            }


            // Se encontrou, para o loop
            if (localizacoes.length > 0) {

                console.log(
                    "Localização encontrada!"
                );

                break;

            }

        }


        // ==================================
        // NÃO ENCONTROU LOCALIZAÇÃO
        // ==================================

        if (localizacoes.length === 0) {

            return res.status(400).json({

                erro:
                    "Não foi possível localizar o endereço no mapa."

            });

        }


        // ==================================
        // PEGAR LATITUDE E LONGITUDE
        // ==================================

        const latitude =
            parseFloat(localizacoes[0].lat);

        const longitude =
            parseFloat(localizacoes[0].lon);


        console.log(
            "Latitude:",
            latitude
        );

        console.log(
            "Longitude:",
            longitude
        );

        // ==================================
        // NÃO ENCONTROU LOCALIZAÇÃO
        // ==================================

        if (localizacoes.length === 0) {

            return res.status(400).json({
                erro:
                    "O CEP existe, mas não foi possível localizar o endereço no mapa."
            });

        }



        // ==================================
        // SALVAR NO POSTGRESQL
        // ==================================

        const resultado = await pool.query(
            `INSERT INTO vendedores
            (nome, email, telefone, cpf, cep, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [nome, email, telefone, cpf, cepLimpo, latitude, longitude]
        );


        // ==================================
        // RESPONDER AO FRONTEND
        // ==================================

        res.status(201).json({

            mensagem:
                "Vendedor cadastrado com sucesso!",

            vendedor:
                resultado.rows[0]

        });


    } catch (erro) {

        console.error(
            "Erro ao cadastrar vendedor:",
            erro
        );


        res.status(500).json({

            erro:
                "Erro ao cadastrar vendedor."

        });

    }

});

// ==================================
// BUSCAR TODOS OS VENDEDORES
// ==================================

app.get("/vendedores", async (req, res) => {

    try {

        const resultado = await pool.query(
            `SELECT *
             FROM vendedores
             ORDER BY id`
        );

        res.json(resultado.rows);

    } catch (erro) {

        console.error(
            "Erro ao buscar vendedores:",
            erro
        );

        res.status(500).json({
            erro: "Erro ao buscar vendedores."
        });

    }

});

// ==================================
// BUSCAR LOCALIZAÇÃO DO CLIENTE
// ==================================

app.get("/localizar/:cep", async (req, res) => {

    try {

        const cep = req.params.cep;

        // Remove pontos, traços e espaços
        const cepLimpo = cep.replace(/\D/g, "");

        // Verificar se o CEP possui 8 números
        if (cepLimpo.length !== 8) {

            return res.status(400).json({
                erro: "CEP inválido."
            });

        }


        // ==================================
        // BUSCAR CEP NO VIACEP
        // ==================================

        const respostaViaCep = await fetch(
            `https://viacep.com.br/ws/${cepLimpo}/json/`
        );

        const textoViaCep =
            await respostaViaCep.text();

        let endereco;

        try {

            endereco = JSON.parse(textoViaCep);
            console.log("Resposta recebida do ViaCEP:", textoViaCep);

        } catch (erro) {

            return res.status(500).json({
                erro:
                    "O serviço ViaCEP não está disponível no momento."
            });

        }


        // ==================================
        // VERIFICAR CEP
        // ==================================

        if (endereco.erro) {

            return res.status(400).json({
                erro: "CEP não encontrado."
            });

        }


        console.log(
            "Endereço do cliente:",
            endereco
        );


        // ==================================
        // BUSCAR LOCALIZAÇÃO
        // ==================================

        const buscas = [

            `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`,

            `${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`,

            `${endereco.localidade}, ${endereco.uf}, Brasil`

        ];


        let localizacoes = [];


        // ==================================
        // TENTAR BUSCAS
        // ==================================

        for (const busca of buscas) {

            console.log("Tentando localizar cliente:");
            console.log(busca);

            const url =
                "https://nominatim.openstreetmap.org/search?" +
                "format=jsonv2" +
                "&q=" +
                encodeURIComponent(busca) +
                "&countrycodes=br" +
                "&limit=1";

            const respostaNominatim = await fetch(url, {

                headers: {
                    "User-Agent": "SistemaWade/1.0"
                }

            });

            const textoNominatim =
                await respostaNominatim.text();

            console.log("Resposta do Nominatim:");
            console.log(textoNominatim);

            try {

                localizacoes =
                    JSON.parse(textoNominatim);

            } catch (erro) {

                console.error(
                    "O Nominatim não retornou JSON."
                );

                continue;

            }

            if (localizacoes.length > 0) {

                console.log(
                    "Localização encontrada!"
                );

                break;

            }

            // Esperar 1 segundo antes da próxima busca
            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );

        }


        // ==================================
        // NÃO ENCONTROU
        // ==================================

        if (localizacoes.length === 0) {

            return res.status(400).json({

                erro:
                    "Não foi possível localizar o CEP no mapa."

            });

        }


        // ==================================
        // LATITUDE E LONGITUDE
        // ==================================

        const latitude =
            parseFloat(localizacoes[0].lat);

        const longitude =
            parseFloat(localizacoes[0].lon);


        // ==================================
        // RETORNAR DADOS
        // ==================================

        res.json({

            cep: cepLimpo,

            endereco: endereco,

            latitude: latitude,

            longitude: longitude

        });


    } catch (erro) {

        console.error(
            "Erro ao localizar cliente:",
            erro
        );

        res.status(500).json({

            erro:
                "Erro ao localizar cliente."

        });

    }

});

// ==================================
// BUSCAR VENDEDORES MAIS PRÓXIMOS
// ==================================

app.get("/vendedores/proximos/:cep", async (req, res) => {

    try {

        const cep = req.params.cep;

        const cepLimpo = cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8) {

            return res.status(400).json({
                erro: "CEP inválido."
            });

        }

        // ==================================
        // LOCALIZAR CLIENTE
        // ==================================

        const respostaCliente = await fetch(
            `${BASE_URL}/localizar/${cepLimpo}`
        );

        const cliente = await respostaCliente.json();

        if (!respostaCliente.ok) {

            return res.status(400).json({
                erro: cliente.erro
            });

        }

        const latitudeCliente = cliente.latitude;
        const longitudeCliente = cliente.longitude;


        // ==================================
        // BUSCAR VENDEDORES
        // ==================================

        const resultado = await pool.query(
            `SELECT *
             FROM vendedores
             WHERE latitude IS NOT NULL
             AND longitude IS NOT NULL`
        );

        const vendedores = resultado.rows;


        // ==================================
        // CALCULAR DISTÂNCIA
        // ==================================

        const distancia = (lat1, lon1, lat2, lon2) => {

            const R = 6371;

            const dLat =
                (lat2 - lat1) * Math.PI / 180;

            const dLon =
                (lon2 - lon1) * Math.PI / 180;

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1 * Math.PI / 180) *
                Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;

            const c =
                2 * Math.atan2(
                    Math.sqrt(a),
                    Math.sqrt(1 - a)
                );

            return R * c;

        };


        // ==================================
        // ADICIONAR DISTÂNCIA
        // ==================================

        vendedores.forEach(vendedor => {

            vendedor.distancia = distancia(

                latitudeCliente,
                longitudeCliente,

                parseFloat(vendedor.latitude),
                parseFloat(vendedor.longitude)

            );

        });


        // ==================================
        // ORDENAR
        // ==================================

        vendedores.sort(
            (a, b) => a.distancia - b.distancia
        );


        // ==================================
        // RETORNAR RESULTADO
        // ==================================

        res.json({

            cliente: {

                cep: cepLimpo,

                latitude: latitudeCliente,

                longitude: longitudeCliente

            },

            vendedores: vendedores

        });


    } catch (erro) {

        console.error(
            "Erro ao buscar vendedores próximos:",
            erro
        );

        res.status(500).json({

            erro:
                "Erro ao buscar vendedores próximos."

        });

    }

});


// ==================================
// INICIAR SERVIDOR
// ==================================



const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});