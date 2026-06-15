"use client";

import { useState } from "react";
import { registerGuru } from "@/app/actions/userActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, School, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    password: "",
    nip: "",
    noHp: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    setError("");
    
    const res = await registerGuru(formData);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Smart Madrasah</h1>
          <p className="text-slate-500 mt-1">Platform Manajemen Pendidikan Digital</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Pendaftaran Guru</CardTitle>
            <CardDescription className="text-slate-500">
              Buat akun untuk bergabung ke portal madrasah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Registrasi Berhasil!</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Akun Anda telah berhasil dibuat. Saat ini akun Anda berstatus <strong>Menunggu Persetujuan</strong> dari Administrator sebelum bisa digunakan untuk login.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    Kembali ke Halaman Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="namaLengkap">Nama Lengkap & Gelar <span className="text-red-500">*</span></Label>
                  <Input id="namaLengkap" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} placeholder="Contoh: Budi Santoso, S.Pd" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Aktif <span className="text-red-500">*</span></Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="guru@madrasah.id" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Minimal 6 karakter" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nip">NIP / NUPTK</Label>
                    <Input id="nip" name="nip" value={formData.nip} onChange={handleChange} placeholder="Opsional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noHp">No. HP / WA</Label>
                    <Input id="noHp" name="noHp" value={formData.noHp} onChange={handleChange} placeholder="Contoh: 0812..." />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4" disabled={loading}>
                  {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                </Button>
              </form>
            )}
          </CardContent>
          {!success && (
            <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
              <Link href="/login" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali ke halaman Login
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
