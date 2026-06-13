import { db } from "@/lib/db";
import { rpp, guru, users } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import ApprovalClient from "./ApprovalClient";

export const metadata = {
  title: "Persetujuan RPP | Smart Madrasah",
};

export default async function Page() {
  const rppData = await db
    .select({
      id: rpp.id,
      mapel: rpp.mapel,
      tingkat: rpp.tingkat,
      semester: rpp.semester,
      judul: rpp.judul,
      alokasiWaktu: rpp.alokasiWaktu,
      tujuan: rpp.tujuan,
      pendahuluan: rpp.pendahuluan,
      inti: rpp.inti,
      penutup: rpp.penutup,
      penilaian: rpp.penilaian,
      status: rpp.status,
      catatanRevisi: rpp.catatanRevisi,
      aiGenerated: rpp.aiGenerated,
      updatedAt: rpp.updatedAt,
      guruNama: users.namaLengkap,
    })
    .from(rpp)
    .leftJoin(guru, eq(rpp.guruId, guru.id))
    .leftJoin(users, eq(guru.userId, users.id))
    .where(inArray(rpp.status, ["submitted", "approved", "revision"]))
    .orderBy(desc(rpp.updatedAt));

  return <ApprovalClient initialData={rppData} />;
}