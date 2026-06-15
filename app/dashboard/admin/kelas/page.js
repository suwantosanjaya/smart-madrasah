import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas, guru, users, tahunAjaran } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import KelasClient from "./KelasClient";

export const metadata = {
  title: "Kelola Kelas & Wali Kelas | Smart Madrasah",
};

export default async function KelasPage() {
  const session = await auth();
  
  if (!session || !session.user || session.user.activeRole !== "admin") {
    redirect("/login");
  }

  // Fetch all classes
  const kelasData = await db.select({
    id: kelas.id,
    namaKelas: kelas.namaKelas,
    tingkat: kelas.tingkat,
    kapasitas: kelas.kapasitas,
    tahunAjaranId: kelas.tahunAjaranId,
    tahunAjaranNama: tahunAjaran.nama,
    waliKelasId: kelas.waliKelasId,
    waliKelasNama: users.namaLengkap,
  })
  .from(kelas)
  .leftJoin(tahunAjaran, eq(kelas.tahunAjaranId, tahunAjaran.id))
  .leftJoin(guru, eq(kelas.waliKelasId, guru.id))
  .leftJoin(users, eq(guru.userId, users.id))
  .orderBy(kelas.tingkat, kelas.namaKelas);

  // Fetch all teachers for dropdown
  const guruData = await db.select({
    id: guru.id,
    namaLengkap: users.namaLengkap,
  })
  .from(guru)
  .innerJoin(users, eq(guru.userId, users.id));

  // Fetch all academic years
  const tahunData = await db.select().from(tahunAjaran).orderBy(desc(tahunAjaran.tanggalMulai));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Kelas</h1>
        <p className="text-slate-500 mt-1">Manajemen data kelas dan penunjukan Wali Kelas.</p>
      </div>

      <KelasClient 
        initialKelas={kelasData} 
        daftarGuru={guruData} 
        daftarTahun={tahunData} 
      />
    </div>
  );
}