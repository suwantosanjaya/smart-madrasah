"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: username, // Mengirimkan username (bisa email atau no hp) sebagai 'email' ke NextAuth
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10" />

        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-48 h-48 bg-emerald-400 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-64 h-64 bg-teal-300 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/20">
            <GraduationCap className="w-10 h-10" />
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center">
            Smart Madrasah
          </h1>
          <p className="text-emerald-100 text-center text-lg max-w-md leading-relaxed mb-10">
            Sistem Informasi Pembelajaran Cerdas berbasis AI untuk MI Tahfizh
            Cendekia Pekanbaru
          </p>

          <div className="space-y-4 w-full max-w-sm">
            {[
              "Kelola RPP & Bahan Ajar dengan AI",
              "Evaluasi & Penilaian Otomatis",
              "Monitoring Tahfizh Real-time",
              "Dashboard Analitik Lengkap",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-300 flex-shrink-0 pulse-dot" />
                <span className="text-sm text-emerald-50">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Smart Madrasah
              </h1>
              <p className="text-xs text-slate-500">MI Tahfizh Cendekia</p>
            </div>
          </div>

          <Card className="shadow-xl border-slate-100">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-2xl">Masuk</CardTitle>
              </div>
              <CardDescription>
                Masukkan email dan password untuk mengakses Smart Madrasah
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Email atau No. HP</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="nama@email.com atau 0812..."
                      className="pl-10"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full shadow-lg shadow-emerald-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Masuk
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-500">
                Belum punya akun Guru?{" "}
                <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
                  Daftar di sini
                </Link>
              </div>

              {/* Demo accounts */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center mb-4">
                  Akun Demo untuk Testing
                </p>
                <div className="space-y-2">
                  {[
                    {
                      role: "Super Admin",
                      email: "superadmin@smartmadrasah.id",
                      pass: "admin123", // Assuming same default password
                      color: "bg-rose-50 border-rose-100 text-rose-700",
                    },
                    {
                      role: "Administrator",
                      email: "admin@smartmadrasah.id",
                      pass: "admin123",
                      color: "bg-red-50 border-red-100 text-red-700",
                    },
                    {
                      role: "Kepala Madrasah",
                      email: "kepala@smartmadrasah.id",
                      pass: "kepala123",
                      color: "bg-amber-50 border-amber-100 text-amber-700",
                    },
                    {
                      role: "Guru",
                      email: "siti.rahmah@smartmadrasah.id",
                      pass: "guru123",
                      color: "bg-emerald-50 border-emerald-100 text-emerald-700",
                    },
                  ].map((demo) => (
                    <button
                      key={demo.role}
                      type="button"
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg border ${demo.color} hover:opacity-80 transition-opacity cursor-pointer`}
                      onClick={() => {
                        setUsername(demo.email);
                        setPassword(demo.pass);
                      }}
                    >
                      <strong>{demo.role}:</strong> {demo.email}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 Smart Madrasah — MI Tahfizh Cendekia Pekanbaru
          </p>
        </div>
      </div>
    </div>
  );
}
