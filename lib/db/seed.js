import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || "postgresql://postgres:1234567890@localhost:5432/smart_madrasah";
if (connectionString.includes("?")) {
  connectionString = connectionString.split("?")[0];
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Roles
  const rolesData = [
    { namaRole: "admin", label: "Administrator", deskripsi: "Pengelola sistem" },
    { namaRole: "kepala_madrasah", label: "Kepala Madrasah", deskripsi: "Pimpinan madrasah" },
    { namaRole: "guru", label: "Guru", deskripsi: "Tenaga pendidik" },
    { namaRole: "siswa", label: "Siswa", deskripsi: "Peserta didik" },
    { namaRole: "orangtua", label: "Orang Tua", deskripsi: "Wali murid" },
  ];

  for (const role of rolesData) {
    await db.insert(schema.roles).values(role).onConflictDoNothing({ target: schema.roles.namaRole });
  }
  console.log("  ✅ Roles seeded");

  // 2. Madrasah
  await db.insert(schema.madrasah).values({
    nama: "MI Tahfizh Cendekia Pekanbaru",
    npsn: "69945678",
    alamat: "Jl. Pendidikan No. 1",
    kota: "Pekanbaru",
    provinsi: "Riau",
    telepon: "0761-12345678",
    email: "info@mitahfizhcendekia.sch.id",
    kepalaMadrasah: "Melia Asnita, S.Pd., M.Pd",
    visi: "Menjadi Madrasah Ibtidaiyah Unggulan yang Melahirkan Generasi Qurani, Berilmu, dan Berkarakter Islami melalui Inovasi Pembelajaran Berbasis Teknologi AI",
    misi: "1. Menyelenggarakan pendidikan tahfizh Al-Quran yang berkualitas\n2. Mengembangkan pembelajaran berbasis teknologi AI\n3. Membentuk karakter islami peserta didik\n4. Meningkatkan kompetensi guru melalui pelatihan berkelanjutan\n5. Membangun kemitraan dengan stakeholder pendidikan",
  }).onConflictDoNothing({ target: schema.madrasah.npsn });
  console.log("  ✅ Madrasah seeded");

  // 3. Tahun Ajaran
  for (const ta of [
    {
      nama: "2025/2026",
      semester: "Genap",
      tanggalMulai: "2026-01-05",
      tanggalSelesai: "2026-06-20",
      isActive: 0,
    },
    {
      nama: "2026/2027",
      semester: "Ganjil",
      tanggalMulai: "2026-07-14",
      tanggalSelesai: "2026-12-20",
      isActive: 1,
    },
  ]) {
    await db.insert(schema.tahunAjaran).values(ta).onConflictDoNothing();
  }
  console.log("  ✅ Tahun Ajaran seeded");

  // 4. Admin User
  const passwordHash = bcryptjs.hashSync("admin123", 10);
  await db.insert(schema.users).values({
    namaLengkap: "Administrator",
    email: "admin@smartmadrasah.id",
    passwordHash,
  }).onConflictDoNothing({ target: schema.users.email });

  const [adminUser] = await db.select().from(schema.users).where(
    eq(schema.users.email, "admin@smartmadrasah.id")
  ).limit(1);

  if (adminUser) {
    const [adminRole] = await db.select().from(schema.roles).where(
      eq(schema.roles.namaRole, "admin")
    ).limit(1);
    if (adminRole) {
      await db.insert(schema.userRoles).values({
        userId: adminUser.id,
        roleId: adminRole.id,
      }).onConflictDoNothing();
    }
  }
  console.log("  ✅ Admin user seeded (admin@smartmadrasah.id / admin123)");

  // 5. Kepala Madrasah User
  const kmPasswordHash = bcryptjs.hashSync("kepala123", 10);
  await db.insert(schema.users).values({
    namaLengkap: "Melia Asnita, S.Pd., M.Pd",
    email: "kepala@smartmadrasah.id",
    passwordHash: kmPasswordHash,
  }).onConflictDoNothing({ target: schema.users.email });

  const [kmUser] = await db.select().from(schema.users).where(
    eq(schema.users.email, "kepala@smartmadrasah.id")
  ).limit(1);

  if (kmUser) {
    const [kmRole] = await db.select().from(schema.roles).where(
      eq(schema.roles.namaRole, "kepala_madrasah")
    ).limit(1);
    if (kmRole) {
      await db.insert(schema.userRoles).values({
        userId: kmUser.id,
        roleId: kmRole.id,
      }).onConflictDoNothing();
    }
  }
  console.log("  ✅ Kepala Madrasah user seeded (kepala@smartmadrasah.id / kepala123)");

  // 6. Sample Guru Users
  const guruData = [
    { nama: "Ahmad Fauzi, S.Pd.I", email: "ahmad.fauzi@smartmadrasah.id", bidang: "Al-Quran Hadits" },
    { nama: "Siti Rahmah, S.Pd", email: "siti.rahmah@smartmadrasah.id", bidang: "Matematika" },
    { nama: "Rudi Hartono, S.Pd", email: "rudi.hartono@smartmadrasah.id", bidang: "IPA" },
  ];

  const guruPasswordHash = bcryptjs.hashSync("guru123", 10);
  const [guruRole] = await db.select().from(schema.roles).where(
    eq(schema.roles.namaRole, "guru")
  ).limit(1);

  for (const g of guruData) {
    await db.insert(schema.users).values({
      namaLengkap: g.nama,
      email: g.email,
      passwordHash: guruPasswordHash,
    }).onConflictDoNothing({ target: schema.users.email });

    const [guruUser] = await db.select().from(schema.users).where(
      eq(schema.users.email, g.email)
    ).limit(1);

    if (guruUser && guruRole) {
      await db.insert(schema.userRoles).values({
        userId: guruUser.id,
        roleId: guruRole.id,
      }).onConflictDoNothing();

      await db.insert(schema.guru).values({
        userId: guruUser.id,
        bidangKeahlian: g.bidang,
        jenisKelamin: g.nama.includes("Siti") ? "P" : "L",
        statusKepegawaian: "GTY",
      }).onConflictDoNothing();
    }
  }
  console.log("  ✅ Guru users seeded");

  // 7. Mata Pelajaran (Kurikulum MI)
  const mapelData = [
    { kode: "AQH", nama: "Al-Quran Hadits", kelompok: "Agama", jamPerMinggu: 2 },
    { kode: "AKD", nama: "Akidah Akhlak", kelompok: "Agama", jamPerMinggu: 2 },
    { kode: "FIQ", nama: "Fikih", kelompok: "Agama", jamPerMinggu: 2 },
    { kode: "SKI", nama: "Sejarah Kebudayaan Islam", kelompok: "Agama", jamPerMinggu: 2 },
    { kode: "BAR", nama: "Bahasa Arab", kelompok: "Agama", jamPerMinggu: 2 },
    { kode: "PKN", nama: "Pendidikan Pancasila", kelompok: "Umum", jamPerMinggu: 2 },
    { kode: "BIN", nama: "Bahasa Indonesia", kelompok: "Umum", jamPerMinggu: 4 },
    { kode: "MTK", nama: "Matematika", kelompok: "Umum", jamPerMinggu: 4 },
    { kode: "IPA", nama: "Ilmu Pengetahuan Alam", kelompok: "Umum", jamPerMinggu: 3 },
    { kode: "IPS", nama: "Ilmu Pengetahuan Sosial", kelompok: "Umum", jamPerMinggu: 3 },
    { kode: "SBK", nama: "Seni Budaya & Keterampilan", kelompok: "Umum", jamPerMinggu: 2 },
    { kode: "PJK", nama: "Pendidikan Jasmani", kelompok: "Umum", jamPerMinggu: 2 },
    { kode: "BIG", nama: "Bahasa Inggris", kelompok: "Muatan Lokal", jamPerMinggu: 2 },
    { kode: "THF", nama: "Tahfizh Al-Quran", kelompok: "Muatan Lokal", jamPerMinggu: 4 },
  ];

  for (const m of mapelData) {
    await db.insert(schema.mapel).values(m).onConflictDoNothing({ target: schema.mapel.kode });
  }
  console.log("  ✅ Mata Pelajaran seeded");

  // 8. Kelas
  const [tahunAktif] = await db.select().from(schema.tahunAjaran).where(
    eq(schema.tahunAjaran.isActive, 1)
  ).limit(1);

  if (tahunAktif) {
    const kelasData = [
      { namaKelas: "1A", tingkat: 1 },
      { namaKelas: "1B", tingkat: 1 },
      { namaKelas: "2A", tingkat: 2 },
      { namaKelas: "2B", tingkat: 2 },
      { namaKelas: "3A", tingkat: 3 },
      { namaKelas: "3B", tingkat: 3 },
      { namaKelas: "4A", tingkat: 4 },
      { namaKelas: "4B", tingkat: 4 },
      { namaKelas: "5A", tingkat: 5 },
      { namaKelas: "5B", tingkat: 5 },
      { namaKelas: "6A", tingkat: 6 },
      { namaKelas: "6B", tingkat: 6 },
    ];

    for (const k of kelasData) {
      await db.insert(schema.kelas).values({
        ...k,
        tahunAjaranId: tahunAktif.id,
        kapasitas: 25,
      }).onConflictDoNothing();
    }
  }
  console.log("  ✅ Kelas seeded");

  console.log("\n🎉 Database seeding completed!");
  console.log("\n📋 Login Credentials:");
  console.log("  Admin:           admin@smartmadrasah.id / admin123");
  console.log("  Kepala Madrasah: kepala@smartmadrasah.id / kepala123");
  console.log("  Guru:            ahmad.fauzi@smartmadrasah.id / guru123");
  console.log("                   siti.rahmah@smartmadrasah.id / guru123");
  console.log("                   rudi.hartono@smartmadrasah.id / guru123");
}

seed().catch(console.error).finally(() => pool.end());
