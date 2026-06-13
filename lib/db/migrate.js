import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || "postgresql://postgres:1234567890@localhost:5432/smart_madrasah",
});

const db = drizzle(pool);

console.log("🔄 Running migrations...");
await migrate(db, { migrationsFolder: path.join(process.cwd(), "lib/db/migrations") });
console.log("✅ Migrations completed!");

await pool.end();
