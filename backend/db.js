const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida");
}

const useSSL = process.env.DB_SSL === "true";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

module.exports = pool;