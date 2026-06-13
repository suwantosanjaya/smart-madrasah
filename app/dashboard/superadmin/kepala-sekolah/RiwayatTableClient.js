"use client";

import { Calendar, FileText, CheckCircle2, History, AlertCircle, UserCog } from "lucide-react";

export default function RiwayatTableClient({ riwayat }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try { return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); }
    catch { return "-"; }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Pejabat Kepala Madrasah</th>
              <th className="px-6 py-4">Nomor SK</th>
              <th className="px-6 py-4">Masa Jabatan</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {riwayat.length > 0 ? riwayat.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{item.namaLengkap}</div>
                  <div className="text-xs text-slate-500">{item.email}</div>
                  {item.keterangan && (
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 italic">
                      <AlertCircle className="w-3 h-3" /> {item.keterangan}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {item.nomorSk || "-"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Mulai: <span className="font-medium text-slate-800">{formatDate(item.tanggalMulai)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      Selesai: {item.tanggalSelesai ? formatDate(item.tanggalSelesai) : "Sekarang"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${item.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {item.status === 'aktif' ? <CheckCircle2 className="w-3 h-3" /> : <History className="w-3 h-3" />}
                    {item.status === 'aktif' ? "Aktif Menjabat" : "Purna Tugas"}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                  <UserCog className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-500">Belum ada riwayat kepala madrasah</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
