-- Estrutura base do Wade Brasil.
-- Executar em um banco existente não apaga nem substitui os dados.

CREATE TABLE IF NOT EXISTS vendedores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(30),
    cpf VARCHAR(14),
    cep CHAR(8) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_vendedores_email
    ON vendedores (LOWER(email));

-- Cache persistente: um CEP já geocodificado não precisa consultar
-- novamente o ViaCEP/Nominatim em cada pesquisa.
CREATE TABLE IF NOT EXISTS cep_localizacoes (
    cep CHAR(8) PRIMARY KEY,
    endereco JSONB NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
