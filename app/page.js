"use client";

import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Sparkles,
  Shield,
  ChevronRight,
  BookMarked,
  ClipboardCheck,
  CalendarDays,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "RPP Kurikulum Merdeka",
    description:
      "Buat Rencana Pelaksanaan Pembelajaran secara otomatis dengan bantuan AI sesuai format Kurikulum Merdeka.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Learning",
    description:
      "Manfaatkan teknologi AI untuk membuat bahan ajar, soal evaluasi, dan materi pembelajaran yang inovatif.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: ClipboardCheck,
    title: "Evaluasi & Penilaian",
    description:
      "Kelola UH, UTS, UAS, dan tugas dengan mudah. Generate soal otomatis dan rekap nilai secara real-time.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: BookMarked,
    title: "Tahfizh Tracking",
    description:
      "Pantau progres hafalan Al-Quran setiap santri secara detail dengan penilaian tajwid dan kelancaran.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: CalendarDays,
    title: "Absensi Digital",
    description:
      "Rekam kehadiran siswa secara digital. Laporan absensi otomatis tersedia untuk guru dan orang tua.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analitik",
    description:
      "Visualisasi data performa madrasah, kelas, dan siswa melalui dashboard interaktif dan laporan PDF.",
    color: "from-rose-500 to-red-500",
  },
];

const stats = [
  { value: "40+", label: "Guru Terlatih" },
  { value: "12", label: "Kelas Aktif" },
  { value: "300+", label: "Santri" },
  { value: "14", label: "Mata Pelajaran" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Smart Madrasah
                </h1>
                <p className="text-[10px] text-slate-500 leading-tight">
                  MI Tahfizh Cendekia
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a
                href="#fitur"
                className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Fitur
              </a>
              <a
                href="#tentang"
                className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Tentang
              </a>
              <a
                href="#statistik"
                className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Statistik
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="shadow-lg shadow-emerald-500/20">
                  <Zap className="w-4 h-4 mr-1" />
                  Mulai Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden islamic-pattern">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                Didukung Teknologi AI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Transformasi Digital
              <br />
              <span className="gradient-text">Madrasah Cerdas</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Sistem informasi pembelajaran berbasis AI untuk{" "}
              <strong className="text-slate-900">
                MI Tahfizh Cendekia Pekanbaru
              </strong>
              . Kelola kurikulum, RPP, evaluasi, absensi, dan tahfizh dalam satu
              platform terpadu.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-base px-8 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Masuk ke Aplikasi
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <a href="#fitur">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Lihat Fitur
                </Button>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div
            id="statistik"
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all stat-card"
              >
                <div className="text-3xl font-extrabold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-4">
              <Star className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                Fitur Unggulan
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Semua yang Madrasah Butuhkan
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Platform lengkap untuk mendukung proses pembelajaran dari
              perencanaan hingga evaluasi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-100 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Tentang Program
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Mewujudkan{" "}
                <span className="gradient-text">Smart Madrasah</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Program Smart Madrasah merupakan bagian dari kegiatan Pengabdian
                kepada Masyarakat (PkM) yang bertujuan untuk mewujudkan
                transformasi digital di MI Tahfizh Cendekia Pekanbaru melalui
                implementasi teknologi Artificial Intelligence (AI) pada proses
                pembelajaran.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Aplikasi ini dirancang untuk membantu guru dalam merealisasikan{" "}
                <strong>Kurikulum Merdeka</strong> melalui pembuatan RPP, bahan
                ajar, hingga evaluasi berbasis AI. Pendekatan yang digunakan
                selaras dengan nilai-nilai keislaman yang kuat.
              </p>

              <div className="space-y-4">
                {[
                  "Kurikulum Merdeka & Berbasis Kompetensi",
                  "Integrasi Nilai Keislaman & Tahfizh",
                  "AI-Powered untuk Efisiensi Pembelajaran",
                  "Multi-Role: Admin, Guru, Siswa, Orang Tua",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl transform rotate-3" />
              <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-700">
                        5 Role
                      </div>
                      <div className="text-sm text-emerald-600">
                        Pengguna Terintegrasi
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                      <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-blue-900">
                        RPP Generator
                      </div>
                      <div className="text-xs text-blue-600">
                        AI-Assisted
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
                      <BookMarked className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-amber-900">
                        Tahfizh
                      </div>
                      <div className="text-xs text-amber-600">
                        Progress Tracking
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                      <ClipboardCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-purple-900">
                        Evaluasi
                      </div>
                      <div className="text-xs text-purple-600">
                        Auto-Generate
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
                      <BarChart3 className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-rose-900">
                        Analitik
                      </div>
                      <div className="text-xs text-rose-600">
                        Real-time Data
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Siap Bertransformasi Digital?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Mulai gunakan Smart Madrasah sekarang dan rasakan kemudahan
            mengelola pembelajaran dengan teknologi AI.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-slate-100 text-base px-10 shadow-xl"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Masuk Sekarang
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-300 font-medium">
                Smart Madrasah — MI Tahfizh Cendekia Pekanbaru
              </span>
            </div>
            <p className="text-sm">
              © 2026 Program PkM. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
