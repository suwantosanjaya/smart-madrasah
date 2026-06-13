import { pgTable, text, serial, integer, doublePrecision } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// =============================================
// 1. USERS & AUTHENTICATION
// =============================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  namaLengkap: text("nama_lengkap").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(sql`now()`),
  updatedAt: text("updated_at").default(sql`now()`),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  namaRole: text("nama_role").unique().notNull(),
  label: text("label").notNull(),
  deskripsi: text("deskripsi"),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").references(() => roles.id, { onDelete: "cascade" }),
});

// =============================================
// 2. MADRASAH & TAHUN AJARAN
// =============================================
export const madrasah = pgTable("madrasah", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  npsn: text("npsn").unique(),
  alamat: text("alamat"),
  kota: text("kota"),
  provinsi: text("provinsi"),
  telepon: text("telepon"),
  email: text("email"),
  kepalaMadrasah: text("kepala_madrasah"),
  logoUrl: text("logo_url"),
  visi: text("visi"),
  misi: text("misi"),
});

export const riwayatJabatan = pgTable("riwayat_jabatan", {
  id: serial("id").primaryKey(),
  madrasahId: integer("madrasah_id").references(() => madrasah.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // Which user holds the title
  jabatan: text("jabatan").default("kepala_madrasah"),
  nomorSk: text("nomor_sk"),
  tanggalMulai: text("tanggal_mulai").notNull(),
  tanggalSelesai: text("tanggal_selesai"),
  status: text("status").default("aktif"), // aktif / purna
  keterangan: text("keterangan"),
  createdAt: text("created_at").default(sql`now()`),
});

export const tahunAjaran = pgTable("tahun_ajaran", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  semester: text("semester").notNull(),
  tanggalMulai: text("tanggal_mulai").notNull(),
  tanggalSelesai: text("tanggal_selesai").notNull(),
  isActive: integer("is_active").default(0),
});

// =============================================
// 3. GURU
// =============================================
export const guru = pgTable("guru", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  nip: text("nip"),
  nuptk: text("nuptk"),
  tempatLahir: text("tempat_lahir"),
  tanggalLahir: text("tanggal_lahir"),
  jenisKelamin: text("jenis_kelamin"),
  pendidikanTerakhir: text("pendidikan_terakhir"),
  bidangKeahlian: text("bidang_keahlian"),
  noHp: text("no_hp"),
  alamat: text("alamat"),
  statusKepegawaian: text("status_kepegawaian"),
});

// =============================================
// 4. KELAS
// =============================================
export const kelas = pgTable("kelas", {
  id: serial("id").primaryKey(),
  namaKelas: text("nama_kelas").notNull(),
  tingkat: integer("tingkat").notNull(),
  tahunAjaranId: integer("tahun_ajaran_id").references(() => tahunAjaran.id),
  waliKelasId: integer("wali_kelas_id").references(() => guru.id),
  kapasitas: integer("kapasitas").default(30),
});

// =============================================
// 5. SISWA
// =============================================
export const siswa = pgTable("siswa", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  nis: text("nis").unique(),
  nisn: text("nisn").unique(),
  namaLengkap: text("nama_lengkap").notNull(),
  tempatLahir: text("tempat_lahir"),
  tanggalLahir: text("tanggal_lahir"),
  jenisKelamin: text("jenis_kelamin"),
  alamat: text("alamat"),
  kelasId: integer("kelas_id").references(() => kelas.id),
  orangtuaId: integer("orangtua_id").references(() => orangtua.id),
  status: text("status").default("aktif"),
});

// =============================================
// 6. ORANG TUA
// =============================================
export const orangtua = pgTable("orangtua", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  namaAyah: text("nama_ayah"),
  namaIbu: text("nama_ibu"),
  pekerjaanAyah: text("pekerjaan_ayah"),
  pekerjaanIbu: text("pekerjaan_ibu"),
  noHp: text("no_hp"),
  alamat: text("alamat"),
});

// =============================================
// 7. MATA PELAJARAN
// =============================================
export const mapel = pgTable("mapel", {
  id: serial("id").primaryKey(),
  kode: text("kode").unique().notNull(),
  nama: text("nama").notNull(),
  kelompok: text("kelompok"),
  tingkat: integer("tingkat"),
  jamPerMinggu: integer("jam_per_minggu").default(2),
  deskripsi: text("deskripsi"),
});

// =============================================
// 8. CAPAIAN PEMBELAJARAN
// =============================================
export const capaianPembelajaran = pgTable("capaian_pembelajaran", {
  id: serial("id").primaryKey(),
  mapelId: integer("mapel_id").references(() => mapel.id, { onDelete: "cascade" }),
  fase: text("fase").notNull(),
  elemen: text("elemen").notNull(),
  deskripsi: text("deskripsi").notNull(),
});

// =============================================
// 9. JADWAL MENGAJAR
// =============================================
export const jadwalMengajar = pgTable("jadwal_mengajar", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").references(() => guru.id),
  mapelId: integer("mapel_id").references(() => mapel.id),
  kelasId: integer("kelas_id").references(() => kelas.id),
  tahunAjaranId: integer("tahun_ajaran_id").references(() => tahunAjaran.id),
  hari: text("hari").notNull(),
  jamMulai: text("jam_mulai").notNull(),
  jamSelesai: text("jam_selesai").notNull(),
  ruangan: text("ruangan"),
});

// =============================================
// 10. RPP / MODUL AJAR
// =============================================
export const rpp = pgTable("rpp", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").references(() => guru.id),
  mapel: text("mapel").notNull(),
  tingkat: text("tingkat").notNull(),
  semester: text("semester").notNull(),
  judul: text("judul").notNull(),
  alokasiWaktu: text("alokasi_waktu"),
  tujuan: text("tujuan"),
  pendahuluan: text("pendahuluan"),
  inti: text("inti"),
  penutup: text("penutup"),
  penilaian: text("penilaian"),
  status: text("status").default("draft"),
  catatanRevisi: text("catatan_revisi"),
  aiGenerated: integer("ai_generated").default(0),
  createdAt: text("created_at").default(sql`now()`),
  updatedAt: text("updated_at").default(sql`now()`),
});

// =============================================
// 11. BAHAN AJAR
// =============================================
export const bahanAjar = pgTable("bahan_ajar", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").references(() => guru.id),
  mapelId: integer("mapel_id").references(() => mapel.id),
  judul: text("judul").notNull(),
  jenis: text("jenis").notNull(),
  konten: text("konten"),
  fileUrl: text("file_url"),
  aiGenerated: integer("ai_generated").default(0),
  isPublished: integer("is_published").default(0),
  createdAt: text("created_at").default(sql`now()`),
});

// =============================================
// 12. EVALUASI & PENILAIAN
// =============================================
export const evaluasi = pgTable("evaluasi", {
  id: serial("id").primaryKey(),
  guruId: integer("guru_id").references(() => guru.id),
  jadwalId: integer("jadwal_id").references(() => jadwalMengajar.id),
  judul: text("judul").notNull(),
  jenis: text("jenis").notNull(),
  deskripsi: text("deskripsi"),
  tanggal: text("tanggal"),
  batasWaktu: text("batas_waktu"),
  bobot: doublePrecision("bobot").default(0),
  soal: text("soal"),
  aiGenerated: integer("ai_generated").default(0),
  createdAt: text("created_at").default(sql`now()`),
});

export const nilai = pgTable("nilai", {
  id: serial("id").primaryKey(),
  evaluasiId: integer("evaluasi_id").references(() => evaluasi.id, { onDelete: "cascade" }),
  siswaId: integer("siswa_id").references(() => siswa.id, { onDelete: "cascade" }),
  nilai: doublePrecision("nilai"),
  catatan: text("catatan"),
  submittedAt: text("submitted_at"),
  gradedAt: text("graded_at"),
});

// =============================================
// 13. ABSENSI
// =============================================
export const absensi = pgTable("absensi", {
  id: serial("id").primaryKey(),
  jadwalId: integer("jadwal_id").references(() => jadwalMengajar.id),
  siswaId: integer("siswa_id").references(() => siswa.id, { onDelete: "cascade" }),
  tanggal: text("tanggal").notNull(),
  status: text("status").notNull(),
  keterangan: text("keterangan"),
});

// =============================================
// 14. TAHFIZH
// =============================================
export const hafalan = pgTable("hafalan", {
  id: serial("id").primaryKey(),
  siswaId: integer("siswa_id").references(() => siswa.id, { onDelete: "cascade" }),
  guruId: integer("guru_id").references(() => guru.id),
  surah: text("surah").notNull(),
  juz: integer("juz"),
  ayatMulai: integer("ayat_mulai"),
  ayatSelesai: integer("ayat_selesai"),
  status: text("status").notNull(),
  nilaiTajwid: doublePrecision("nilai_tajwid"),
  nilaiKelancaran: doublePrecision("nilai_kelancaran"),
  nilaiMakhorijul: doublePrecision("nilai_makhorijul"),
  catatan: text("catatan"),
  tanggalSetor: text("tanggal_setor"),
  createdAt: text("created_at").default(sql`now()`),
});

// =============================================
// 15. PENGUMUMAN & NOTIFIKASI
// =============================================
export const pengumuman = pgTable("pengumuman", {
  id: serial("id").primaryKey(),
  judul: text("judul").notNull(),
  konten: text("konten").notNull(),
  pengirimId: integer("pengirim_id").references(() => users.id),
  targetRole: text("target_role"),
  isPinned: integer("is_pinned").default(0),
  createdAt: text("created_at").default(sql`now()`),
});

export const notifikasi = pgTable("notifikasi", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  pesan: text("pesan").notNull(),
  jenis: text("jenis"),
  isRead: integer("is_read").default(0),
  link: text("link"),
  createdAt: text("created_at").default(sql`now()`),
});
