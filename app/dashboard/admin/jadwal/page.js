import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jadwalMengajar, guru, users, mapel, kelas, tahunAjaran } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import JadwalClient from "./JadwalClient";

export const metadata = {
  title: "Penugasan Guru & Jadwal Mengajar | Smart Madrasah",
};

export default async function JadwalPage() {
  const session = await auth();
  
  if (!session || !session.user || session.user.activeRole !== "admin") {
    redirect("/login");
  }

  // Fetch all assignments/schedules
  const jadwalData = await db.select({
    id: jadwalMengajar.id,
    guruId: jadwalMengajar.guruId,
    guruNama: users.namaLengkap,
    mapelId: jadwalMengajar.mapelId,
    mapelNama: mapel.nama,
    kelasId: jadwalMengajar.kelasId,
    kelasNama: kelas.namaKelas,
    tahunAjaranId: jadwalMengajar.tahunAjaranId,
    tahunAjaranNama: tahunAjaran.nama,
    hari: jadwalMengajar.hari,
    jamMulai: jadwalMengajar.jamMulai,
    jamSelesai: jadwalMengajar.jamSelesai,
    ruangan: jadwalMengajar.ruangan,
  })
  .from(jadwalMengajar)
  .leftJoin(guru, eq(jadwalMengajar.guruId, guru.id))
  .leftJoin(users, eq(guru.userId, users.id))
  .leftJoin(mapel, eq(jadwalMengajar.mapelId, mapel.id))
  .leftJoin(kelas, eq(jadwalMengajar.kelasId, kelas.id))
  .leftJoin(tahunAjaran, eq(jadwalMengajar.tahunAjaranId, tahunAjaran.id))
  .orderBy(desc(jadwalMengajar.id));

  // Fetch references
  const guruList = await db.select({ id: guru.id, nama: users.namaLengkap })
    .from(guru).innerJoin(users, eq(guru.userId, users.id));
    
  const mapelList = await db.select({ id: mapel.id, nama: mapel.nama }).from(mapel);
  const kelasList = await db.select({ id: kelas.id, nama: kelas.namaKelas, tingkat: kelas.tingkat }).from(kelas).orderBy(kelas.tingkat, kelas.namaKelas);
  const tahunList = await db.select().from(tahunAjaran).orderBy(desc(tahunAjaran.tanggalMulai));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Jadwal & Penugasan Mengajar</h1>
        <p className="text-slate-500 mt-1">Atur penugasan Guru Bidang Studi, Guru Kelas, maupun Guru Tahfizh.</p>
      </div>

      <JadwalClient 
        initialData={jadwalData} 
        daftarGuru={guruList} 
        daftarMapel={mapelList}
        daftarKelas={kelasList}
        daftarTahun={tahunList}
      />
    </div>
  );
}
