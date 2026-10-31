# Wade Brasil — site integrado + busca de consultores

Este pacote preserva o novo design do diretório `frontend/` e integra a seção **Consultores** ao backend Node.js/Express e PostgreSQL.

## Como funciona

- Busca por CEP: retorna até 3 consultores mais próximos, ordenados pela distância.
- Busca por e-mail: procura correspondência exata, sem diferenciar maiúsculas/minúsculas.
- Os cards exibem nome, e-mail, telefone e distância (quando a busca é por CEP).
- O CPF nunca é devolvido pelas rotas públicas.
- O site e a API são servidos pelo mesmo endereço. Assim, a busca usa URLs relativas e não depende de `localhost` nem de uma URL externa configurada no HTML.

## Requisitos

- Node.js 18 ou superior.
- PostgreSQL (Render PostgreSQL recomendado para hospedagem).

## Configurar localmente

1. Entre na pasta `backend`.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente. Copie `.env.example` para `.env` e preencha os dados do seu PostgreSQL. Nunca publique o `.env`.
4. Crie/atualize as tabelas sem apagar os dados existentes:

   ```bash
   psql -U postgres -d sistemaWade -f schema.sql
   ```

5. Inicie:

   ```bash
   npm start
   ```

6. Abra `http://localhost:3000`.

## Hospedar no Render

Crie um **Web Service** apontando para este repositório/pasta:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Runtime: Node

Configure no painel do Render as variáveis:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DB_HOST` | host externo do PostgreSQL Render |
| `DB_PORT` | `5432` |
| `DB_NAME` | nome do banco |
| `DB_USER` | usuário do banco |
| `DB_PASSWORD` | senha do banco |

Não coloque aspas nem o prefixo `https://` no `DB_HOST`. Use o host externo fornecido pelo Render. Não coloque credenciais no GitHub.

O serviço entrega o site em `/` e a API no mesmo domínio. **Não configure o frontend para chamar `localhost`**. A Netlify não é necessária para esta modalidade de hospedagem integrada.

> Se optar por hospedar o frontend separadamente na Netlify, será necessário configurar `window.WADE_API_URL` com a URL pública do Web Service antes do script do site. O modo integrado no Render é o caminho mais simples e já está preparado neste pacote.

## Cache de CEP e serviço de mapas

As coordenadas são guardadas na tabela `cep_localizacoes` do PostgreSQL. Consultas futuras ao mesmo CEP reutilizam o resultado salvo e não fazem nova chamada ao ViaCEP/Nominatim.

Para CEPs ainda não cadastrados no cache:
- o backend consulta o ViaCEP;
- tenta localizar o endereço no Nominatim;
- serializa as chamadas ao Nominatim nesta instância para respeitar o intervalo mínimo;
- identifica HTTP 429 e retorna mensagem de serviço temporariamente limitado.

O Nominatim público tem política de uso e não é indicado para aplicações com alto volume. Para uso em produção com tráfego significativo, contrate um provedor de geocodificação ou hospede uma solução própria. O cache reduz chamadas, mas não remove essa limitação para CEPs inéditos.

## Rotas

| Método | Rota | Função |
|---|---|---|
| GET | `/` | Site Wade |
| GET | `/status` | Teste de conexão com PostgreSQL |
| GET | `/vendedores/proximos/:cep?limite=3` | Consultores próximos |
| GET | `/vendedores/email/:email` | Busca exata por e-mail |
| POST | `/vendedores` | Cadastro de consultor |
| GET | `/vendedores` | Lista de consultores sem CPF |
| GET | `/localizar/:cep` | Endereço e coordenadas do CEP |

## Cadastrar consultor

```bash
curl -X POST http://localhost:3000/vendedores \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza","email":"ana@exemplo.com","telefone":"45999990001","cep":"85900-000"}'
```

O campo `cpf` continua aceito para compatibilidade com o banco antigo, mas não é exposto nas respostas públicas.
