import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas, siswa, tahunAjaran } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import RombelClient from "./RombelClient";

export const metadata = {
  title: "Manajemen Rombel & Kenaikan Kelas | Smart Madrasah",
};

export default async function RombelPage() {
  const session = await auth();
  
  if (!session || !session.user || session.user.activeRole !== "admin") {
    redirect("/login");
  }

  // Ambil data referensi untuk dropdown
  const daftarTahunAjaran = await db.select().from(tahunAjaran).orderBy(desc(tahunAjaran.tanggalMulai));
  
  const daftarKelas = await db.select({
      id: kelas.id,
      namaKelas: kelas.namaKelas,
      tingkat: kelas.tingkat,
      tahunAjaranId: kelas.tahunAjaranId,
  }).from(kelas).orderBy(kelas.tingkat);

  // Ambil semua siswa (nantinya difilter di sisi client untuk mengurangi beban bolak-balik server)
  const daftarSiswa = await db.select({
      id: siswa.id,
      namaLengkap: siswa.namaLengkap,
      nis: siswa.nis,
      nisn: siswa.nisn,
      kelasId: siswa.kelasId,
      status: siswa.status,
  }).from(siswa);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Rombel & Kenaikan Kelas</h1>
        <p className="text-slate-500 mt-1">Pindahkan siswa antar kelas secara massal untuk tahun ajaran baru.</p>
      </div>

      <RombelClient 
        daftarTahunAjaran={daftarTahunAjaran} 
        daftarKelas={daftarKelas} 
        daftarSiswa={daftarSiswa} 
      />
    </div>
  );
}
