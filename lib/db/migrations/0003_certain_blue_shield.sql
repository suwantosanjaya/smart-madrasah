CREATE TABLE "soal" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluasi_id" integer,
	"pertanyaan" text NOT NULL,
	"tipe" text DEFAULT 'pilihan_ganda',
	"level_bloom" text,
	"opsi_a" text,
	"opsi_b" text,
	"opsi_c" text,
	"opsi_d" text,
	"kunci_jawaban" text,
	"bobot" double precision DEFAULT 1,
	"pembahasan" text,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "soal" ADD CONSTRAINT "soal_evaluasi_id_evaluasi_id_fk" FOREIGN KEY ("evaluasi_id") REFERENCES "public"."evaluasi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluasi" DROP COLUMN "soal";