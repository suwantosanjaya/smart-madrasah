import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, orangtua, siswa, kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, BookOpen, Clock, Activity, Users } from "lucide-react";

export const metadata = {
  title: "Dashboard Orang Tua | Smart Madrasah",
};

export default async function OrangTuaDashboard() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect("/login");
  }

  // Cari data orang tua berdasarkan userId dari sesi
  const [dataOrtu] = await db.select().from(orangtua).where(eq(orangtua.userId, session.user.id)).limit(1);

  if (!dataOrtu) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Profil tidak ditemukan</h2>
        <p className="text-slate-500">Akun ini tidak terdaftar sebagai profil orang tua. Silakan hubungi admin.</p>
      </div>
    );
  }

  // Cari semua anak yang terhubung dengan orang tua ini
  const daftarAnak = await db
    .select({
      id: siswa.id,
      nama: siswa.namaLengkap,
      nis: siswa.nis,
      nisn: siswa.nisn,
      kelas: kelas.namaKelas,
      status: siswa.status,
    })
    .from(siswa)
    .leftJoin(kelas, eq(siswa.kelasId, kelas.id))
    .where(eq(siswa.orangtuaId, dataOrtu.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Selamat Datang, Bapak/Ibu {dataOrtu.namaAyah || dataOrtu.namaIbu || session.user.name}</h1>
        <p className="text-slate-500 mt-1">Pantau perkembangan belajar putra/putri Anda dengan mudah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daftarAnak.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada data siswa yang dihubungkan dengan akun Anda.</p>
          </div>
        ) : (
          daftarAnak.map((anak) => (
            <Card key={anak.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${anak.status === 'aktif' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    {anak.nama.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{anak.nama}</CardTitle>
                      {anak.status !== 'aktif' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded-full">
                          {anak.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      NIS: {anak.nis || "-"} • NISN: {anak.nisn || "-"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center"><User className="w-4 h-4 mr-2" /> Kelas</span>
                  <span className="font-semibold text-slate-800">{anak.kelas || "Belum ditentukan"}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a 
                    href={anak.status === 'aktif' ? `/dashboard/orangtua/nilai?siswaId=${anak.id}` : '#'} 
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${anak.status === 'aktif' ? 'bg-blue-50 hover:bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-400 cursor-not-allowed pointer-events-none'}`}
                  >
                    <BookOpen className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Lihat Nilai</span>
                  </a>
                  <a 
                    href={anak.status === 'aktif' ? `/dashboard/orangtua/absensi?siswaId=${anak.id}` : '#'} 
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${anak.status === 'aktif' ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400 cursor-not-allowed pointer-events-none'}`}
                  >
                    <Clock className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Absensi</span>
                  </a>
                  <a 
                    href={anak.status === 'aktif' ? `/dashboard/orangtua/tahfizh?siswaId=${anak.id}` : '#'} 
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors col-span-2 ${anak.status === 'aktif' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-400 cursor-not-allowed pointer-events-none'}`}
                  >
                    <Activity className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Perkembangan Tahfizh</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
