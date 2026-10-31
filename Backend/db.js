require("dotenv").config();

const { Pool } = require("pg");

const host = process.env.DB_HOST || process.env.PGHOST || "localhost";
const production = process.env.NODE_ENV === "production";

const pool = new Pool({
    host,
    port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    database: process.env.DB_NAME || process.env.PGDATABASE || "sistemaWade",
    user: process.env.DB_USER || process.env.PGUSER || "postgres",
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
    ssl: process.env.DB_SSL === "false"
        ? false
        : (production ? { rejectUnauthorized: false } : undefined),
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
});

pool.on("error", erro => {
    console.error("Erro inesperado no pool PostgreSQL:", erro);
});

module.exports = pool;
