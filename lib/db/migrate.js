import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || "postgresql://postgres:1234567890@localhost:5432/smart_madrasah";
if (connectionString.includes("?")) {
  connectionString = connectionString.split("?")[0];
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false }
});

const db = drizzle(pool);

console.log("🔄 Running migrations...");
await migrate(db, { migrationsFolder: path.join(process.cwd(), "lib/db/migrations") });
console.log("✅ Migrations completed!");

await pool.end();
