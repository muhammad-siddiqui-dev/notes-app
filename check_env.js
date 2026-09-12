import "./backend/src/lib/db.ts";
process.stdout.write("DATABASE_URL: " + (process.env.DATABASE_URL ? "set" : "undefined") + "\n");
process.stdout.write("OAUTH_PROVIDER: " + (process.env.OAUTH_PROVIDER || "undefined") + "\n");