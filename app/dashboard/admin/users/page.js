import { db } from "@/lib/db";
import { siswa, orangtua, kelas } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CreateSiswaDialog } from "@/components/admin/CreateSiswaDialog";
import { Users } from "lucide-react";
import UsersTableClient from "./UsersTableClient";

export default async function AdminUsersPage() {
  // Ambil daftar kelas untuk dikirim ke dropdown di Dialog
  const daftarKelas = await db.select().from(kelas);

  // Ambil daftar siswa beserta data kelas dan orang tuanya
  const daftarSiswa = await db
    .select({
      id: siswa.id,
      nis: siswa.nis,
      nisn: siswa.nisn,
      namaSiswa: siswa.namaLengkap,
      tempatLahir: siswa.tempatLahir,
      tanggalLahir: siswa.tanggalLahir,
      jenisKelamin: siswa.jenisKelamin,
      alamat: siswa.alamat,
      status: siswa.status,
      kelasId: siswa.kelasId,
      namaKelas: kelas.namaKelas,
      orangtuaId: orangtua.id,
      namaOrtu: orangtua.namaAyah,
      noHpOrtu: orangtua.noHp,
    })
    .from(siswa)
    .leftJoin(kelas, eq(siswa.kelasId, kelas.id))
    .leftJoin(orangtua, eq(siswa.orangtuaId, orangtua.id))
    .orderBy(desc(siswa.id));

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Users className="w-6 h-6 text-emerald-600" />
            Manajemen Siswa & Orang Tua
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data siswa dan akun orang tua untuk akses portal madrasah.
          </p>
        </div>
        
        {/* Tombol pendaftaran siswa dan orang tua */}
        <CreateSiswaDialog kelasList={daftarKelas} />
      </div>

      {/* Tabel Data Siswa melalui Client Component agar interaktif */}
      <UsersTableClient daftarSiswa={daftarSiswa} daftarKelas={daftarKelas} />
    </div>
  );
}