import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orangtua, siswa, absensi, jadwalMengajar, mapel, kelas } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Absensi Anak | Smart Madrasah",
};

export default async function AbsensiAnakPage(props) {
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

  // Jika tidak ada siswaId di URL, tampilkan pesan error
  if (!siswaId) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Siswa belum dipilih</h2>
        <p className="text-slate-500 mb-4">Silakan kembali ke Dashboard untuk memilih anak yang ingin dilihat absensinya.</p>
        <Link href="/dashboard/orangtua" className="text-emerald-600 hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </div>
    );
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

  // Ambil data absensi
  const daftarAbsensi = await db
    .select({
      id: absensi.id,
      tanggal: absensi.tanggal,
      status: absensi.status,
      keterangan: absensi.keterangan,
      mapelNama: mapel.nama,
      jamMulai: jadwalMengajar.jamMulai,
      jamSelesai: jadwalMengajar.jamSelesai,
    })
    .from(absensi)
    .innerJoin(jadwalMengajar, eq(absensi.jadwalId, jadwalMengajar.id))
    .innerJoin(mapel, eq(jadwalMengajar.mapelId, mapel.id))
    .where(eq(absensi.siswaId, anak.id))
    .orderBy(desc(absensi.tanggal));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orangtua" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kehadiran & Absensi</h1>
          <p className="text-slate-500 mt-1">Pantau kehadiran harian {anak.nama}</p>
        </div>
      </div>

      <Card className="border-amber-100 bg-amber-50/50">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-amber-600" />
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
            <Clock className="w-5 h-5 text-slate-500" />
            Riwayat Kehadiran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {daftarAbsensi.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Belum ada data kehadiran yang diinputkan oleh guru untuk siswa ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Tanggal</th>
                    <th className="px-6 py-4 font-medium">Mata Pelajaran</th>
                    <th className="px-6 py-4 font-medium">Waktu</th>
                    <th className="px-6 py-4 font-medium">Status Kehadiran</th>
                    <th className="px-6 py-4 font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daftarAbsensi.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">{item.mapelNama}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.jamMulai} - {item.jamSelesai}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`w-max ${
                          item.status.toLowerCase() === 'hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.status.toLowerCase() === 'sakit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          item.status.toLowerCase() === 'izin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.keterangan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}