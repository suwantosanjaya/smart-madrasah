import { db } from "@/lib/db";
import { bahanAjar, mapel, rpp } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import BahanAjarClient from "./BahanAjarClient";

export const metadata = {
  title: "Bahan Ajar | Smart Madrasah",
};

export default async function Page() {
  const bahanData = await db.select({
    id: bahanAjar.id,
    guruId: bahanAjar.guruId,
    mapelId: bahanAjar.mapelId,
    rppId: bahanAjar.rppId,
    judul: bahanAjar.judul,
    jenis: bahanAjar.jenis,
    konten: bahanAjar.konten,
    fileUrl: bahanAjar.fileUrl,
    aiGenerated: bahanAjar.aiGenerated,
    createdAt: bahanAjar.createdAt,
    mapelNama: mapel.nama,
    rppJudul: rpp.judul,
  })
  .from(bahanAjar)
  .leftJoin(mapel, eq(bahanAjar.mapelId, mapel.id))
  .leftJoin(rpp, eq(bahanAjar.rppId, rpp.id))
  .orderBy(desc(bahanAjar.createdAt));

  const mapelData = await db.select().from(mapel);
  const rppData = await db.select({
    id: rpp.id,
    judul: rpp.judul,
    mapelId: rpp.mapelId,
  }).from(rpp);

  return <BahanAjarClient initialData={bahanData} mapelData={mapelData} rppData={rppData} />;
}
