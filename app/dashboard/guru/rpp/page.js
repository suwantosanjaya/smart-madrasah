import { db } from "@/lib/db";
import { rpp, mapel } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import RPPClient from "./RPPClient";

export const metadata = {
  title: "RPP / Modul Ajar | Smart Madrasah",
};

export default async function Page() {
  const rppData = await db.select({
    id: rpp.id,
    guruId: rpp.guruId,
    mapelId: rpp.mapelId,
    mapel: mapel.nama,
    tingkat: rpp.tingkat,
    semester: rpp.semester,
    judul: rpp.judul,
    alokasiWaktu: rpp.alokasiWaktu,
    tujuan: rpp.tujuan,
    pendahuluan: rpp.pendahuluan,
    inti: rpp.inti,
    penutup: rpp.penutup,
    penilaian: rpp.penilaian,
    targetKognitif: rpp.targetKognitif,
    status: rpp.status,
    catatanRevisi: rpp.catatanRevisi,
    aiGenerated: rpp.aiGenerated,
    createdAt: rpp.createdAt,
    updatedAt: rpp.updatedAt,
  })
  .from(rpp)
  .leftJoin(mapel, eq(rpp.mapelId, mapel.id))
  .orderBy(desc(rpp.updatedAt));
  
  const mapelData = await db.select().from(mapel);

  return <RPPClient initialData={rppData} initialMapel={mapelData} />;
}
