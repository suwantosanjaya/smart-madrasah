import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserCog, AlertCircle } from "lucide-react";
import RiwayatTableClient from "./RiwayatTableClient";
import SetKepsekDialog from "./SetKepsekDialog";
import { getRiwayatKepsek, getCandidates } from "@/app/actions/kepsekActions";

export const metadata = {
  title: "Riwayat Kepala Sekolah | Smart Madrasah",
  description: "Kelola riwayat pergantian dan penetapan Kepala Madrasah",
};

export default async function SuperAdminKepsekPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.activeRole !== "super_admin") {
    redirect("/dashboard");
  }

  const [riwayat, candidates] = await Promise.all([
    getRiwayatKepsek(),
    getCandidates()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            Riwayat Kepala Sekolah
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-11">
            Catatan periode masa jabatan pimpinan dan penetapan SK Kepala Sekolah.
          </p>
        </div>
        <SetKepsekDialog candidates={candidates} />
      </div>

      {/* Info Card */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-sm text-sky-800 leading-relaxed">
          <p className="font-semibold mb-1">Mekanisme Penetapan</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Kandidat dipilih dari daftar Guru/Staff aktif di sistem.</li>
            <li>Guru yang terpilih akan mendapatkan peran (role) tambahan sebagai <strong>Kepala Madrasah</strong>.</li>
            <li>Pejabat yang lama otomatis berstatus Purna Tugas dan perannya sebagai Kepala Madrasah dicabut (peran Guru tetap).</li>
            <li>Nama di "Profil Madrasah" akan diperbarui secara otomatis.</li>
          </ul>
        </div>
      </div>

      {/* Table */}
      <RiwayatTableClient riwayat={riwayat} />
    </div>
  );
}
