"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ShieldCheck, Mail, User } from "lucide-react";
import { createAdmin } from "@/app/actions/adminActions";

export default function CreateAdminDialog() {
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
    const res = await createAdmin(formData);

    if (res.success) {
      setSuccess(res.message);
      formRef.current?.reset();
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
        router.refresh();
      }, 1500);
    } else {
      setError(res.error || "Gagal membuat akun administrator");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-medium rounded-lg px-4 py-2.5 shadow-sm transition-all duration-200 cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        Tambah Administrator
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: "fadeInScale 0.2s ease-out" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tambah Administrator Baru</h3>
                  <p className="text-rose-100 text-xs mt-0.5">
                    Password default akan disetel sama dengan alamat email
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="create-admin-nama" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      id="create-admin-nama"
                      name="namaLengkap"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="create-admin-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      id="create-admin-email"
                      name="email"
                      type="email"
                      placeholder="admin@smartmadrasah.id"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Email juga berfungsi sebagai password default login pertama
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Catatan:</strong> Administrator baru akan memiliki akses penuh ke modul manajemen siswa, guru, kelas, mata pelajaran, dan pengumuman. Pastikan pemberian akses sesuai kebutuhan operasional madrasah.
                  </p>
                </div>

                {/* Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                    <p className="text-sm text-emerald-600 font-medium">{success}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Simpan Akun
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
