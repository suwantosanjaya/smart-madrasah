import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || "postgresql://postgres:1234567890@localhost:5432/smart_madrasah";
if (connectionString.includes("?")) {
  connectionString = connectionString.split("?")[0];
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema });
export default db;
