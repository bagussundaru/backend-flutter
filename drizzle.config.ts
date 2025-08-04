import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error("DATABASE_URL is required for production");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/fallback",
  },
});
