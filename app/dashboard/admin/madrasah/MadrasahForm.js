"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMadrasah } from "@/app/actions/madrasahActions";
import { School, MapPin, Phone, Mail, User, ShieldCheck, Target, TargetIcon, Navigation, GraduationCap, CheckCircle2 } from "lucide-react";

export default function MadrasahForm({ data }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const formData = new FormData(e.currentTarget);
    const res = await updateMadrasah(formData);

    if (res.success) {
      setMessage({ text: res.message, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      router.refresh();
    } else {
      setMessage({ text: res.error, type: "error" });
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Informasi Profil Madrasah</h2>
            <p className="text-emerald-100 text-xs mt-0.5">Perbarui data identitas dan visi misi institusi</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identitas Utama */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-500" />
              Identitas Utama
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Madrasah</label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input name="nama" defaultValue={data?.nama || ""} required
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NPSN</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input name="npsn" defaultValue={data?.npsn || ""}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kepala Madrasah</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input name="kepalaMadrasah" defaultValue={data?.kepalaMadrasah || ""} readOnly
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                *Dikelola otomatis melalui menu Riwayat Kepala Sekolah
              </p>
            </div>
          </div>

          {/* Kontak & Lokasi */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              Kontak & Lokasi
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">No. Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input name="telepon" defaultValue={data?.telepon || ""}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input name="email" type="email" defaultValue={data?.email || ""}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kota/Kabupaten</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input name="kota" defaultValue={data?.kota || ""}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Provinsi</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input name="provinsi" defaultValue={data?.provinsi || ""}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Lengkap</label>
              <textarea name="alamat" defaultValue={data?.alamat || ""} rows={2}
                className="w-full p-3 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
          </div>
          
          {/* Visi & Misi */}
          <div className="col-span-1 md:col-span-2 space-y-4 mt-2">
            <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Visi & Misi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Visi
                </label>
                <textarea name="visi" defaultValue={data?.visi || ""} rows={4} placeholder="Masukkan visi madrasah..."
                  className="w-full p-3 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <TargetIcon className="w-3.5 h-3.5 text-emerald-600" /> Misi
                </label>
                <textarea name="misi" defaultValue={data?.misi || ""} rows={4} placeholder="Masukkan misi madrasah (bisa berupa poin-poin)..."
                  className="w-full p-3 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <School className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
