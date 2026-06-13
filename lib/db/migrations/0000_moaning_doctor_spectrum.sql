CREATE TABLE "absensi" (
	"id" serial PRIMARY KEY NOT NULL,
	"jadwal_id" integer,
	"siswa_id" integer,
	"tanggal" text NOT NULL,
	"status" text NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE "bahan_ajar" (
	"id" serial PRIMARY KEY NOT NULL,
	"guru_id" integer,
	"mapel_id" integer,
	"judul" text NOT NULL,
	"jenis" text NOT NULL,
	"konten" text,
	"file_url" text,
	"ai_generated" integer DEFAULT 0,
	"is_published" integer DEFAULT 0,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "capaian_pembelajaran" (
	"id" serial PRIMARY KEY NOT NULL,
	"mapel_id" integer,
	"fase" text NOT NULL,
	"elemen" text NOT NULL,
	"deskripsi" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluasi" (
	"id" serial PRIMARY KEY NOT NULL,
	"guru_id" integer,
	"jadwal_id" integer,
	"judul" text NOT NULL,
	"jenis" text NOT NULL,
	"deskripsi" text,
	"tanggal" text,
	"batas_waktu" text,
	"bobot" double precision DEFAULT 0,
	"soal" text,
	"ai_generated" integer DEFAULT 0,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guru" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"nip" text,
	"nuptk" text,
	"tempat_lahir" text,
	"tanggal_lahir" text,
	"jenis_kelamin" text,
	"pendidikan_terakhir" text,
	"bidang_keahlian" text,
	"no_hp" text,
	"alamat" text,
	"status_kepegawaian" text
);
--> statement-breakpoint
CREATE TABLE "hafalan" (
	"id" serial PRIMARY KEY NOT NULL,
	"siswa_id" integer,
	"guru_id" integer,
	"surah" text NOT NULL,
	"juz" integer,
	"ayat_mulai" integer,
	"ayat_selesai" integer,
	"status" text NOT NULL,
	"nilai_tajwid" double precision,
	"nilai_kelancaran" double precision,
	"nilai_makhorijul" double precision,
	"catatan" text,
	"tanggal_setor" text,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jadwal_mengajar" (
	"id" serial PRIMARY KEY NOT NULL,
	"guru_id" integer,
	"mapel_id" integer,
	"kelas_id" integer,
	"tahun_ajaran_id" integer,
	"hari" text NOT NULL,
	"jam_mulai" text NOT NULL,
	"jam_selesai" text NOT NULL,
	"ruangan" text
);
--> statement-breakpoint
CREATE TABLE "kelas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_kelas" text NOT NULL,
	"tingkat" integer NOT NULL,
	"tahun_ajaran_id" integer,
	"wali_kelas_id" integer,
	"kapasitas" integer DEFAULT 30
);
--> statement-breakpoint
CREATE TABLE "madrasah" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"npsn" text,
	"alamat" text,
	"kota" text,
	"provinsi" text,
	"telepon" text,
	"email" text,
	"kepala_madrasah" text,
	"logo_url" text,
	"visi" text,
	"misi" text,
	CONSTRAINT "madrasah_npsn_unique" UNIQUE("npsn")
);
--> statement-breakpoint
CREATE TABLE "mapel" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"kelompok" text,
	"tingkat" integer,
	"jam_per_minggu" integer DEFAULT 2,
	"deskripsi" text,
	CONSTRAINT "mapel_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "nilai" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluasi_id" integer,
	"siswa_id" integer,
	"nilai" double precision,
	"catatan" text,
	"submitted_at" text,
	"graded_at" text
);
--> statement-breakpoint
CREATE TABLE "notifikasi" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"judul" text NOT NULL,
	"pesan" text NOT NULL,
	"jenis" text,
	"is_read" integer DEFAULT 0,
	"link" text,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orangtua" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"nama_ayah" text,
	"nama_ibu" text,
	"pekerjaan_ayah" text,
	"pekerjaan_ibu" text,
	"no_hp" text,
	"alamat" text
);
--> statement-breakpoint
CREATE TABLE "pengumuman" (
	"id" serial PRIMARY KEY NOT NULL,
	"judul" text NOT NULL,
	"konten" text NOT NULL,
	"pengirim_id" integer,
	"target_role" text,
	"is_pinned" integer DEFAULT 0,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "riwayat_jabatan" (
	"id" serial PRIMARY KEY NOT NULL,
	"madrasah_id" integer,
	"user_id" integer,
	"jabatan" text DEFAULT 'kepala_madrasah',
	"nomor_sk" text,
	"tanggal_mulai" text NOT NULL,
	"tanggal_selesai" text,
	"status" text DEFAULT 'aktif',
	"keterangan" text,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_role" text NOT NULL,
	"label" text NOT NULL,
	"deskripsi" text,
	CONSTRAINT "roles_nama_role_unique" UNIQUE("nama_role")
);
--> statement-breakpoint
CREATE TABLE "rpp" (
	"id" serial PRIMARY KEY NOT NULL,
	"guru_id" integer,
	"mapel" text NOT NULL,
	"tingkat" text NOT NULL,
	"semester" text NOT NULL,
	"judul" text NOT NULL,
	"alokasi_waktu" text,
	"tujuan" text,
	"pendahuluan" text,
	"inti" text,
	"penutup" text,
	"penilaian" text,
	"status" text DEFAULT 'draft',
	"catatan_revisi" text,
	"ai_generated" integer DEFAULT 0,
	"created_at" text DEFAULT now(),
	"updated_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "siswa" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"nis" text,
	"nisn" text,
	"nama_lengkap" text NOT NULL,
	"tempat_lahir" text,
	"tanggal_lahir" text,
	"jenis_kelamin" text,
	"alamat" text,
	"kelas_id" integer,
	"orangtua_id" integer,
	"status" text DEFAULT 'aktif',
	CONSTRAINT "siswa_nis_unique" UNIQUE("nis"),
	CONSTRAINT "siswa_nisn_unique" UNIQUE("nisn")
);
--> statement-breakpoint
CREATE TABLE "tahun_ajaran" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"semester" text NOT NULL,
	"tanggal_mulai" text NOT NULL,
	"tanggal_selesai" text NOT NULL,
	"is_active" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"role_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_lengkap" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"avatar_url" text,
	"is_active" integer DEFAULT 1,
	"created_at" text DEFAULT now(),
	"updated_at" text DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_jadwal_id_jadwal_mengajar_id_fk" FOREIGN KEY ("jadwal_id") REFERENCES "public"."jadwal_mengajar"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_siswa_id_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."siswa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bahan_ajar" ADD CONSTRAINT "bahan_ajar_guru_id_guru_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."guru"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bahan_ajar" ADD CONSTRAINT "bahan_ajar_mapel_id_mapel_id_fk" FOREIGN KEY ("mapel_id") REFERENCES "public"."mapel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capaian_pembelajaran" ADD CONSTRAINT "capaian_pembelajaran_mapel_id_mapel_id_fk" FOREIGN KEY ("mapel_id") REFERENCES "public"."mapel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluasi" ADD CONSTRAINT "evaluasi_guru_id_guru_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."guru"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluasi" ADD CONSTRAINT "evaluasi_jadwal_id_jadwal_mengajar_id_fk" FOREIGN KEY ("jadwal_id") REFERENCES "public"."jadwal_mengajar"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guru" ADD CONSTRAINT "guru_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hafalan" ADD CONSTRAINT "hafalan_siswa_id_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."siswa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hafalan" ADD CONSTRAINT "hafalan_guru_id_guru_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."guru"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_mengajar" ADD CONSTRAINT "jadwal_mengajar_guru_id_guru_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."guru"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_mengajar" ADD CONSTRAINT "jadwal_mengajar_mapel_id_mapel_id_fk" FOREIGN KEY ("mapel_id") REFERENCES "public"."mapel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_mengajar" ADD CONSTRAINT "jadwal_mengajar_kelas_id_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "public"."kelas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_mengajar" ADD CONSTRAINT "jadwal_mengajar_tahun_ajaran_id_tahun_ajaran_id_fk" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "public"."tahun_ajaran"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_tahun_ajaran_id_tahun_ajaran_id_fk" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "public"."tahun_ajaran"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_wali_kelas_id_guru_id_fk" FOREIGN KEY ("wali_kelas_id") REFERENCES "public"."guru"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_evaluasi_id_evaluasi_id_fk" FOREIGN KEY ("evaluasi_id") REFERENCES "public"."evaluasi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_siswa_id_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."siswa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orangtua" ADD CONSTRAINT "orangtua_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_pengirim_id_users_id_fk" FOREIGN KEY ("pengirim_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_jabatan" ADD CONSTRAINT "riwayat_jabatan_madrasah_id_madrasah_id_fk" FOREIGN KEY ("madrasah_id") REFERENCES "public"."madrasah"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_jabatan" ADD CONSTRAINT "riwayat_jabatan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rpp" ADD CONSTRAINT "rpp_guru_id_guru_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."guru"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_kelas_id_kelas_id_fk" FOREIGN KEY ("kelas_id") REFERENCES "public"."kelas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siswa" ADD CONSTRAINT "siswa_orangtua_id_orangtua_id_fk" FOREIGN KEY ("orangtua_id") REFERENCES "public"."orangtua"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;