import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, orangtua, siswa, hafalan, kelas, guru } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookMarked, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Tahfizh Anak | Smart Madrasah",
};

export default async function OrangTuaTahfizhPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session || !session.user || session.user.activeRole !== "orangtua") {
    redirect("/login");
  }

  const siswaId = searchParams?.siswaId;

  // Cari data orang tua berdasarkan userId dari sesi
  const dataOrtu = await db.select().from(orangtua).where(eq(orangtua.userId, session.user.id)).limit(1);

  if (dataOrtu.length === 0) {
    return <div className="p-6 text-center">Profil orang tua tidak ditemukan.</div>;
  }

  // Jika tidak ada siswaId di URL, otomatis pilih anak pertama
  if (!siswaId) {
    const daftarAnak = await db.select({ id: siswa.id }).from(siswa).where(eq(siswa.orangtuaId, dataOrtu[0].id)).orderBy(siswa.id);
    if (daftarAnak.length > 0) {
      redirect(`/dashboard/orangtua/tahfizh?siswaId=${daftarAnak[0].id}`);
    } else {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">Tidak Ada Data Anak</h2>
          <p className="text-slate-500 mb-4">Anda belum memiliki profil anak yang terhubung ke akun Anda.</p>
        </div>
      );
    }
  }

  // Verifikasi apakah siswaId ini benar-benar anak dari orang tua yang sedang login
  const dataSiswa = await db
    .select({
      id: siswa.id,
      nama: siswa.namaLengkap,
      nisn: siswa.nisn,
      kelas: kelas.namaKelas,
    })
    .from(siswa)
    .leftJoin(kelas, eq(siswa.kelasId, kelas.id))
    .where(and(eq(siswa.id, parseInt(siswaId)), eq(siswa.orangtuaId, dataOrtu[0].id)))
    .limit(1);

  if (dataSiswa.length === 0) {
    return <div className="p-6 text-center">Akses ditolak: Siswa ini tidak terhubung dengan akun Anda.</div>;
  }

  const anak = dataSiswa[0];

  // Ambil data hafalan
  const daftarHafalan = await db
    .select({
      id: hafalan.id,
      surah: hafalan.surah,
      juz: hafalan.juz,
      ayatMulai: hafalan.ayatMulai,
      ayatSelesai: hafalan.ayatSelesai,
      status: hafalan.status,
      nilaiTajwid: hafalan.nilaiTajwid,
      nilaiKelancaran: hafalan.nilaiKelancaran,
      nilaiMakhorijul: hafalan.nilaiMakhorijul,
      catatan: hafalan.catatan,
      tanggalSetor: hafalan.tanggalSetor,
      namaGuru: users.namaLengkap,
    })
    .from(hafalan)
    .innerJoin(guru, eq(hafalan.guruId, guru.id))
    .innerJoin(users, eq(guru.userId, users.id))
    .where(eq(hafalan.siswaId, anak.id))
    .orderBy(desc(hafalan.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orangtua" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monitoring Tahfizh</h1>
          <p className="text-slate-500 mt-1">Perkembangan hafalan Al-Qur'an untuk {anak.nama}</p>
        </div>
      </div>

      <Card className="border-emerald-100 bg-emerald-50/50">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{anak.nama}</h2>
            <p className="text-sm text-slate-500">NISN: {anak.nisn || "-"} • Kelas: {anak.kelas || "Belum ditentukan"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-slate-500" />
            Riwayat Setoran Hafalan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {daftarHafalan.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Belum ada riwayat setoran hafalan untuk anak ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-4 font-medium">Tanggal</th>
                    <th className="px-4 py-4 font-medium">Surah & Juz</th>
                    <th className="px-4 py-4 font-medium">Ayat</th>
                    <th className="px-4 py-4 font-medium text-center">Kualitas</th>
                    <th className="px-4 py-4 font-medium text-center">Nilai Rata-rata</th>
                    <th className="px-4 py-4 font-medium">Guru Pembimbing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daftarHafalan.map((item) => {
                    const avg = ((item.nilaiTajwid + item.nilaiKelancaran + item.nilaiMakhorijul) / 3).toFixed(1);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors bg-white">
                        <td className="px-4 py-4 text-slate-600">
                          {item.tanggalSetor ? new Date(item.tanggalSetor).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          }) : "-"}
                        </td>
                        <td className="px-4 py-4 font-medium text-emerald-700">
                          {item.surah} (Juz {item.juz})
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {item.ayatMulai} - {item.ayatSelesai}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge className={
                            item.status === "Lancar" ? "bg-emerald-100 text-emerald-800" : 
                            item.status === "Perlu Murojaah" ? "bg-blue-100 text-blue-800" :
                            "bg-amber-100 text-amber-800"
                          } variant="outline">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-xs ${
                            avg >= 85 ? "bg-emerald-100 text-emerald-700" :
                            avg >= 75 ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {avg}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-slate-800">{item.namaGuru}</p>
                          {item.catatan && (
                            <p className="text-xs text-slate-500 mt-1 italic">"{item.catatan}"</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}