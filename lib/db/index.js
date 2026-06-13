import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1234567890@localhost:5432/smart_madrasah",
});

export const db = drizzle(pool, { schema });
export default db;
