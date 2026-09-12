import { describe, it, expect } from "vitest";
import "./backend/src/lib/db.ts";

describe("PostgreSQL DATABASE_URL availability", () => {
  it("DATABASE_URL should be defined in process.env after db.ts import", () => {
    // DATABASE_URL is loaded from .env by db.ts import
    // The .env file contains the Neon PostgreSQL connection string
    expect(process.env.DATABASE_URL).toBeDefined();
    // Since we've verified it's defined, cast for the length check
    // @ts-expect-error - type narrowing via runtime check
    expect(process.env.DATABASE_URL.length).toBeGreaterThan(0);
  });
});