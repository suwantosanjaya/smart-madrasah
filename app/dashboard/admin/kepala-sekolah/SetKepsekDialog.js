"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Calendar, FileText, CheckCircle2, User } from "lucide-react";
import { setKepalaMadrasah } from "@/app/actions/kepsekActions";

export default function SetKepsekDialog({ candidates }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const res = await setKepalaMadrasah(formData);

    if (res.success) {
      setSuccess(res.message);
      formRef.current?.reset();
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
        router.refresh();
      }, 1500);
    } else {
      setError(res.error || "Gagal menetapkan Kepala Madrasah");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 shadow-sm transition-all"
      >
        <UserCog className="w-4 h-4" />
        Tetapkan Kepala Madrasah Baru
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <UserCog className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tetapkan Kepala Madrasah</h3>
                  <p className="text-rose-100 text-xs mt-0.5">Penetapan baru akan otomatis menonaktifkan pejabat sebelumnya</p>
                </div>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>
                )}
                {success && (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-medium border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Guru</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select name="userId" required
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none">
                      <option value="">-- Pilih Kandidat --</option>
                      {candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.namaLengkap} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor SK Penetapan</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input name="nomorSk" placeholder="Contoh: SK/01/2026"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Mulai Jabatan</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input name="tanggalMulai" type="date" required
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Keterangan Tambahan (Opsional)</label>
                  <textarea name="keterangan" rows={2} placeholder="Catatan penetapan..."
                    className="w-full p-3 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Penting:</strong> Kepala Madrasah yang lama akan secara otomatis berubah status menjadi Purna Tugas dan Hak Akses (Role) Kepala Madrasah-nya akan dicabut. Role sebagai Guru tetap ada.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button type="button" onClick={() => { setOpen(false); setError(""); setSuccess(""); }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading ? "Menyimpan..." : "Tetapkan Jabatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
