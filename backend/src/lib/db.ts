import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { Pool } from "pg";

if (existsSync(".env")) {
  loadEnvFile(".env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};

export default db;