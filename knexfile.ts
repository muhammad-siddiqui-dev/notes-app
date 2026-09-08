import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: (() => {
      if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim().length === 0) {
        throw new Error("DATABASE_URL must be set in .env (no hardcoded secrets — T048 Security & Data Integrity principle)");
      }
      return process.env.DATABASE_URL;
    })(),
    migrations: {
      directory: "./backend/src/migrations",
      extension: "ts"
    },
    seeds: {
      directory: "./backend/src/seeds"
    }
  },
  production: {
    client: "pg",
    connection: (() => {
      if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim().length === 0) {
        throw new Error("DATABASE_URL must be set in .env (no hardcoded secrets — T048 Security & Data Integrity principle)");
      }
      return process.env.DATABASE_URL;
    })(),
    migrations: {
      directory: "./backend/src/migrations",
      extension: "ts"
    }
  }
};

export default config;
