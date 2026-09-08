const parser = require("@typescript-eslint/parser");

const config = [
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**", ".next/**", "*.min.js", "backend/src/lib/**", "backend/src/api/**", "frontend/src/pages/**"]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  }
];

module.exports = config;
