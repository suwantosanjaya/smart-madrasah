import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelompokTahfizh, anggotaTahfizh, guru, users, tahunAjaran, siswa, kelas } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import HalaqahClient from "./HalaqahClient";

export const metadata = {
  title: "Kelompok Tahfizh (Halaqah) | Smart Madrasah",
};

export default async function HalaqahPage() {
  const session = await auth();
  
  if (!session || !session.user || session.user.activeRole !== "admin") {
    redirect("/login");
  }

  // Fetch groups
  const halaqahDataRaw = await db.select({
    id: kelompokTahfizh.id,
    namaKelompok: kelompokTahfizh.namaKelompok,
    deskripsi: kelompokTahfizh.deskripsi,
    guruId: kelompokTahfizh.guruId,
    guruNama: users.namaLengkap,
    tahunAjaranId: kelompokTahfizh.tahunAjaranId,
    tahunAjaranNama: tahunAjaran.nama,
  })
  .from(kelompokTahfizh)
  .leftJoin(guru, eq(kelompokTahfizh.guruId, guru.id))
  .leftJoin(users, eq(guru.userId, users.id))
  .leftJoin(tahunAjaran, eq(kelompokTahfizh.tahunAjaranId, tahunAjaran.id))
  .orderBy(desc(kelompokTahfizh.id));

  // Fetch all members to attach them to the groups
  const allAnggotaRaw = await db.select({
    kelompokId: anggotaTahfizh.kelompokId,
    siswaId: anggotaTahfizh.siswaId,
    siswaNama: siswa.namaLengkap,
    kelasNama: kelas.namaKelas,
  })
  .from(anggotaTahfizh)
  .leftJoin(siswa, eq(anggotaTahfizh.siswaId, siswa.id))
  .leftJoin(kelas, eq(siswa.kelasId, kelas.id));

  const halaqahData = halaqahDataRaw.map(h => {
    return {
      ...h,
      anggota: allAnggotaRaw.filter(a => a.kelompokId === h.id)
    }
  });

  // Fetch references for dropdowns
  const guruList = await db.select({ id: guru.id, nama: users.namaLengkap })
    .from(guru).innerJoin(users, eq(guru.userId, users.id));
    
  const tahunList = await db.select().from(tahunAjaran).orderBy(desc(tahunAjaran.tanggalMulai));
  
  const siswaList = await db.select({
    id: siswa.id,
    namaLengkap: siswa.namaLengkap,
    kelasId: siswa.kelasId,
    kelasNama: kelas.namaKelas,
  })
  .from(siswa)
  .leftJoin(kelas, eq(siswa.kelasId, kelas.id))
  .orderBy(kelas.tingkat, siswa.namaLengkap);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelompok Tahfizh (Halaqah)</h1>
        <p className="text-slate-500 mt-1">Kelola pembagian siswa per kelompok hafalan yang dibimbing oleh Guru Tahfizh.</p>
      </div>

      <HalaqahClient 
        initialData={halaqahData} 
        daftarGuru={guruList} 
        daftarTahun={tahunList}
        daftarSiswa={siswaList}
      />
    </div>
  );
}
