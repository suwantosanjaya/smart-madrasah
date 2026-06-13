/**
 * Script untuk transfer data dari SQLite lama ke PostgreSQL baru.
 * Membaca semua data dari SQLite dan memasukkannya ke PostgreSQL.
 */
import Database from "better-sqlite3";
import pg from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";

// --- SQLite Source ---
const sqliteDbPath = path.join(process.cwd(), "data", "smart-madrasah.db");
if (!fs.existsSync(sqliteDbPath)) {
  console.error("❌ Database SQLite tidak ditemukan di:", sqliteDbPath);
  console.log("ℹ️  Tidak ada data lama untuk dipindahkan. Menjalankan seed saja...");
  process.exit(0);
}

const sqlite = new Database(sqliteDbPath);
sqlite.pragma("foreign_keys = OFF"); // Matikan FK saat baca

// --- PostgreSQL Target ---
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1234567890@localhost:5432/smart_madrasah",
});

const pgClient = await pool.connect();

// Urutan tabel sesuai dependency (parent dulu)
const TABLE_ORDER = [
  "roles",
  "users", 
  "user_roles",
  "madrasah",
  "tahun_ajaran",
  "guru",
  "orangtua",
  "kelas",
  "siswa",
  "riwayat_jabatan",
  "mapel",
  "capaian_pembelajaran",
  "jadwal_mengajar",
  "rpp",
  "bahan_ajar",
  "evaluasi",
  "nilai",
  "absensi",
  "hafalan",
  "pengumuman",
  "notifikasi",
];

async function transferTable(tableName) {
  try {
    const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all();
    
    if (rows.length === 0) {
      console.log(`  ⏭️  ${tableName}: kosong, skip`);
      return 0;
    }

    const columns = Object.keys(rows[0]);
    
    let inserted = 0;
    for (const row of rows) {
      const values = columns.map((col) => row[col]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const colNames = columns.map((c) => `"${c}"`).join(", ");
      
      try {
        await pgClient.query(
          `INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        inserted++;
      } catch (err) {
        // Skip individual row errors (e.g. FK violations for orphan data)
        console.warn(`  ⚠️  ${tableName} row skip:`, err.message.split('\n')[0]);
      }
    }
    
    // Reset sequence to max id
    if (columns.includes("id")) {
      try {
        await pgClient.query(
          `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tableName}"), 1))`
        );
      } catch (e) {
        // Table might not have a serial sequence
      }
    }
    
    console.log(`  ✅ ${tableName}: ${inserted}/${rows.length} baris dipindahkan`);
    return inserted;
  } catch (err) {
    if (err.message.includes("no such table")) {
      console.log(`  ⏭️  ${tableName}: tidak ada di SQLite, skip`);
    } else {
      console.error(`  ❌ ${tableName}: ${err.message}`);
    }
    return 0;
  }
}

async function main() {
  console.log("🔄 Memulai transfer data SQLite → PostgreSQL...\n");
  
  // Disable FK constraints selama transfer
  await pgClient.query("SET session_replication_role = 'replica';");
  
  let totalTransferred = 0;
  
  for (const table of TABLE_ORDER) {
    totalTransferred += await transferTable(table);
  }
  
  // Re-enable FK constraints
  await pgClient.query("SET session_replication_role = 'origin';");
  
  console.log(`\n🎉 Transfer selesai! Total ${totalTransferred} baris dipindahkan.`);
  
  // Verifikasi
  console.log("\n📋 Verifikasi data:");
  for (const table of TABLE_ORDER) {
    try {
      const result = await pgClient.query(`SELECT count(*) FROM "${table}"`);
      const count = result.rows[0].count;
      if (parseInt(count) > 0) {
        console.log(`  📊 ${table}: ${count} baris`);
      }
    } catch (e) {
      // skip
    }
  }
}

main()
  .catch(console.error)
  .finally(() => {
    pgClient.release();
    pool.end();
    sqlite.close();
  });
