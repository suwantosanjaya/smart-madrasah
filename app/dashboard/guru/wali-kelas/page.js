import { BookMarked } from "lucide-react";

export const metadata = {
  title: "Wali Kelas (Rapor) | Smart Madrasah",
};

export default function WaliKelasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <BookMarked className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Wali Kelas</h1>
          <p className="text-slate-500">Akses khusus untuk Wali Kelas mencetak Rapor dan Kehadiran Bulanan.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center mt-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <BookMarked className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Modul Sedang Dikembangkan</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Fitur ini muncul secara dinamis karena Anda terdeteksi sebagai Wali Kelas di sistem. 
          Nantinya, Anda dapat memantau akumulasi nilai dari seluruh Guru Bidang Studi di sini.
        </p>
      </div>
    </div>
  );
}
