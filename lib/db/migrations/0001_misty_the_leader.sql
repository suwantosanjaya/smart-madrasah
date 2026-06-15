ALTER TABLE "bahan_ajar" ADD COLUMN "rpp_id" integer;--> statement-breakpoint
ALTER TABLE "bahan_ajar" ADD CONSTRAINT "bahan_ajar_rpp_id_rpp_id_fk" FOREIGN KEY ("rpp_id") REFERENCES "public"."rpp"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rpp" DROP COLUMN "mapel";