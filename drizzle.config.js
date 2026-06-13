import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.js",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:1234567890@localhost:5432/smart_madrasah",
  },
});
