import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", ".next/"]
    }
  },
  resolve: {
    alias: {
      "@/": "/"
    }
  }
});
