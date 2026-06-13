import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, orangtua, siswa, nilai, evaluasi, jadwalMengajar, mapel, kelas } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Nilai Anak | Smart Madrasah",
};

export default async function NilaiAnakPage(props) {
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
        <p className="text-slate-500 mb-4">Silakan kembali ke Dashboard untuk memilih anak yang ingin dilihat nilainya.</p>
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

  // Ambil data nilai
  const daftarNilai = await db
    .select({
      id: nilai.id,
      nilai: nilai.nilai,
      catatan: nilai.catatan,
      gradedAt: nilai.gradedAt,
      evaluasiJudul: evaluasi.judul,
      evaluasiJenis: evaluasi.jenis,
      mapelNama: mapel.nama,
    })
    .from(nilai)
    .innerJoin(evaluasi, eq(nilai.evaluasiId, evaluasi.id))
    .innerJoin(jadwalMengajar, eq(evaluasi.jadwalId, jadwalMengajar.id))
    .innerJoin(mapel, eq(jadwalMengajar.mapelId, mapel.id))
    .where(eq(nilai.siswaId, anak.id))
    .orderBy(desc(nilai.gradedAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orangtua" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nilai Akademik</h1>
          <p className="text-slate-500 mt-1">Perkembangan nilai untuk {anak.nama}</p>
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
            <BookOpen className="w-5 h-5 text-slate-500" />
            Riwayat Nilai Evaluasi & Ujian
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {daftarNilai.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Belum ada nilai yang diinputkan oleh guru untuk siswa ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Mata Pelajaran</th>
                    <th className="px-6 py-4 font-medium">Evaluasi</th>
                    <th className="px-6 py-4 font-medium text-center">Nilai</th>
                    <th className="px-6 py-4 font-medium">Keterangan/Catatan</th>
                    <th className="px-6 py-4 font-medium">Tanggal Dinilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daftarNilai.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.mapelNama}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-700">{item.evaluasiJudul}</span>
                          <Badge variant="outline" className="w-max text-[10px] bg-white">
                            {item.evaluasiJenis}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                          item.nilai >= 85 ? "bg-emerald-100 text-emerald-700" :
                          item.nilai >= 70 ? "bg-blue-100 text-blue-700" :
                          item.nilai >= 60 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {item.nilai}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.catatan || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.gradedAt ? new Date(item.gradedAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : "-"}
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