import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, userRoles, roles, madrasah } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  FileText,
  BookMarked,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const getDashboardConfig = (activeRole, realStats = {}) => ({
  super_admin: {
    greeting: "Panel Super Administrasi",
    stats: [
      { label: "Total Administrator", value: realStats.totalAdmin || "0", icon: Users, change: "", color: "from-rose-500 to-pink-500" },
      { label: "Status Profil Madrasah", value: realStats.profilStatus || "Belum Diisi", icon: BookOpen, change: "", color: "from-blue-500 to-indigo-500" },
      { label: "Riwayat Kepemimpinan", value: `${realStats.kepsekSistem || "0"} Tercatat`, icon: ClipboardCheck, change: "", color: "from-purple-500 to-pink-500" },
      { label: "Kesehatan Sistem", value: "Optimal", icon: Sparkles, change: "", color: "from-emerald-500 to-teal-500" },
    ],
    quickActions: [
      { label: "Manajemen Admin", href: "/dashboard/superadmin/admins", icon: Users, desc: "Kelola tingkat akses" },
      { label: "Profil Madrasah", href: "/dashboard/admin/madrasah", icon: BookOpen, desc: "Atur identitas institusi" },
      { label: "Riwayat Kepsek", href: "/dashboard/superadmin/kepala-sekolah", icon: ClipboardCheck, desc: "Manajemen pimpinan" },
      { label: "Log Sistem", href: "/dashboard/admin/settings", icon: FileText, desc: "Lihat aktivitas" },
    ],
  },
  admin: {
    greeting: "Panel Administrasi",
    stats: [
      { label: "Total Guru", value: "40", icon: Users, change: "+3", color: "from-emerald-500 to-teal-500" },
      { label: "Total Siswa", value: "312", icon: GraduationCap, change: "+24", color: "from-blue-500 to-indigo-500" },
      { label: "Kelas Aktif", value: "12", icon: BookOpen, change: "0", color: "from-amber-500 to-orange-500" },
      { label: "Mata Pelajaran", value: "14", icon: FileText, change: "+2", color: "from-purple-500 to-pink-500" },
    ],
    quickActions: [
      { label: "Kelola User", href: "/dashboard/admin/users", icon: Users, desc: "Tambah, edit, hapus user" },
      { label: "Kelola Kelas", href: "/dashboard/admin/kelas", icon: BookOpen, desc: "Atur kelas & wali kelas" },
      { label: "Mata Pelajaran", href: "/dashboard/admin/mapel", icon: FileText, desc: "Kelola data mapel" },
      { label: "Pengumuman", href: "/dashboard/admin/pengumuman", icon: CalendarDays, desc: "Buat pengumuman" },
    ],
  },
  kepala_madrasah: {
    greeting: "Dashboard Kepala Madrasah",
    stats: [
      { label: "RPP Pending", value: "8", icon: FileText, change: "-2", color: "from-amber-500 to-orange-500" },
      { label: "Kehadiran Hari Ini", value: "94%", icon: CheckCircle2, change: "+2%", color: "from-emerald-500 to-teal-500" },
      { label: "Rata-rata Nilai", value: "78.5", icon: TrendingUp, change: "+3.2", color: "from-blue-500 to-indigo-500" },
      { label: "Hafalan Selesai", value: "156", icon: BookMarked, change: "+12", color: "from-purple-500 to-pink-500" },
    ],
    quickActions: [
      { label: "Monitoring Guru", href: "/dashboard/kepala/monitoring-guru", icon: Users, desc: "Pantau aktivitas guru" },
      { label: "Approval RPP", href: "/dashboard/kepala/approval-rpp", icon: ClipboardCheck, desc: "Review RPP guru" },
      { label: "Laporan", href: "/dashboard/kepala/laporan", icon: BarChart3, desc: "Lihat analitik" },
      { label: "Monitoring Siswa", href: "/dashboard/kepala/monitoring-siswa", icon: GraduationCap, desc: "Performa siswa" },
    ],
  },
  guru: {
    greeting: "Dashboard Guru",
    stats: [
      { label: "Jadwal Hari Ini", value: "4", icon: CalendarDays, change: "", color: "from-emerald-500 to-teal-500" },
      { label: "RPP Dibuat", value: "12", icon: FileText, change: "+2", color: "from-blue-500 to-indigo-500" },
      { label: "Tugas Belum Dinilai", value: "23", icon: ClipboardCheck, change: "-5", color: "from-amber-500 to-orange-500" },
      { label: "Siswa Diampu", value: "75", icon: GraduationCap, change: "", color: "from-purple-500 to-pink-500" },
    ],
    quickActions: [
      { label: "Buat RPP Baru", href: "/dashboard/guru/rpp", icon: FileText, desc: "Generate RPP dengan AI" },
      { label: "Input Absensi", href: "/dashboard/guru/absensi", icon: CheckCircle2, desc: "Catat kehadiran siswa" },
      { label: "Buat Evaluasi", href: "/dashboard/guru/evaluasi", icon: ClipboardCheck, desc: "Buat soal & tugas" },
      { label: "Tahfizh", href: "/dashboard/guru/tahfizh", icon: BookMarked, desc: "Catat setoran hafalan" },
    ],
  },
  siswa: {
    greeting: "Dashboard Siswa",
    stats: [
      { label: "Jadwal Hari Ini", value: "6", icon: CalendarDays, change: "", color: "from-emerald-500 to-teal-500" },
      { label: "Tugas Aktif", value: "3", icon: ClipboardCheck, change: "", color: "from-amber-500 to-orange-500" },
      { label: "Rata-rata Nilai", value: "85.2", icon: TrendingUp, change: "+2.1", color: "from-blue-500 to-indigo-500" },
      { label: "Hafalan", value: "12 Surah", icon: BookMarked, change: "+1", color: "from-purple-500 to-pink-500" },
    ],
    quickActions: [
      { label: "Lihat Materi", href: "/dashboard/siswa/materi", icon: BookOpen, desc: "Akses bahan ajar" },
      { label: "Tugas Saya", href: "/dashboard/siswa/tugas", icon: ClipboardCheck, desc: "Lihat & submit tugas" },
      { label: "Nilai Saya", href: "/dashboard/siswa/nilai", icon: TrendingUp, desc: "Cek nilai terbaru" },
      { label: "Tahfizh", href: "/dashboard/siswa/tahfizh", icon: BookMarked, desc: "Progress hafalan" },
    ],
  },
  orangtua: {
    greeting: "Dashboard Orang Tua",
    stats: [
      { label: "Kehadiran Bulan Ini", value: "96%", icon: CheckCircle2, change: "+1%", color: "from-emerald-500 to-teal-500" },
      { label: "Rata-rata Nilai", value: "82.5", icon: TrendingUp, change: "+4.3", color: "from-blue-500 to-indigo-500" },
      { label: "Tugas Selesai", value: "15/18", icon: ClipboardCheck, change: "", color: "from-amber-500 to-orange-500" },
      { label: "Hafalan", value: "10 Surah", icon: BookMarked, change: "+2", color: "from-purple-500 to-pink-500" },
    ],
    quickActions: [
      { label: "Nilai Anak", href: "/dashboard/orangtua/nilai", icon: TrendingUp, desc: "Pantau nilai anak" },
      { label: "Kehadiran", href: "/dashboard/orangtua/absensi", icon: CheckCircle2, desc: "Rekap kehadiran" },
      { label: "Tahfizh", href: "/dashboard/orangtua/tahfizh", icon: BookMarked, desc: "Progress hafalan" },
      { label: "Pengumuman", href: "/dashboard/orangtua/pengumuman", icon: CalendarDays, desc: "Info madrasah" },
    ],
  },
});

// Activity logs for super_admin
const superAdminActivities = [
  { text: "Admin Ahmad login ke sistem", time: "5 menit lalu", icon: Users, color: "text-blue-600 bg-blue-50" },
  { text: "Backup Database Harian Berhasil", time: "1 jam lalu", icon: Sparkles, color: "text-emerald-600 bg-emerald-50" },
  { text: "Profil Madrasah diperbarui", time: "3 jam lalu", icon: BookOpen, color: "text-amber-600 bg-amber-50" },
  { text: "Gagal login terdeteksi dari IP Tidak Dikenal", time: "5 jam lalu", icon: FileText, color: "text-rose-600 bg-rose-50" },
  { text: "Pengaturan email SMTP dikonfigurasi", time: "1 hari lalu", icon: FileText, color: "text-purple-600 bg-purple-50" },
];

// System Status for super_admin
const systemStatus = [
  { label: "Database", status: "Sehat", icon: FileText, color: "text-emerald-700", bg: "bg-emerald-50" },
  { label: "Storage", status: "45% Terpakai", icon: BookMarked, color: "text-blue-700", bg: "bg-blue-50" },
  { label: "Server Load", status: "12%", icon: TrendingUp, color: "text-amber-700", bg: "bg-amber-50" },
  { label: "SSL Certificate", status: "Aktif", icon: Sparkles, color: "text-emerald-700", bg: "bg-emerald-50" },
];

// Recent activity mock data
const recentActivities = [
  { text: "RPP Matematika Kelas 3A telah disetujui", time: "10 menit lalu", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  { text: "Absensi Kelas 2B telah diinput", time: "30 menit lalu", icon: ClipboardCheck, color: "text-blue-600 bg-blue-50" },
  { text: "Nilai UH Bahasa Indonesia diperbarui", time: "1 jam lalu", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  { text: "3 siswa menyelesaikan tugas IPA", time: "2 jam lalu", icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
  { text: "Setoran hafalan Surah Al-Mulk", time: "3 jam lalu", icon: BookMarked, color: "text-rose-600 bg-rose-50" },
];

// Upcoming schedule mock data
const upcomingSchedule = [
  { time: "07:30", subject: "Tahfizh Al-Quran", class: "Kelas 3A", status: "ongoing" },
  { time: "09:00", subject: "Matematika", class: "Kelas 4B", status: "upcoming" },
  { time: "10:30", subject: "Bahasa Indonesia", class: "Kelas 2A", status: "upcoming" },
  { time: "13:00", subject: "IPA", class: "Kelas 5A", status: "upcoming" },
];

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const activeRole = session?.user?.activeRole || "guru";
  
  // Redirect orang tua ke halaman pilihan profil anak mereka sendiri
  if (activeRole === "orangtua") {
    redirect("/dashboard/orangtua");
  }

  let realStats = {};

  if (activeRole === "super_admin") {
    // Ambil data real dari database untuk Super Admin
    const [adminRolesCount] = await db
      .select({ count: sql`count(*)` })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(roles.namaRole, 'admin'))
      .limit(1);
      
    // Cek profil madrasah
    const [madrasahProfile] = await db.select().from(madrasah).limit(1);
    
    // Hitung riwayat kepemimpinan (untuk sementara kita hitung yang pernah jadi kepsek)
    const [kepsekCount] = await db
      .select({ count: sql`count(*)` })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(roles.namaRole, 'kepala_madrasah'))
      .limit(1);

    realStats = {
      totalAdmin: adminRolesCount?.count || 0,
      profilStatus: madrasahProfile && madrasahProfile.nama ? "Terisi Lengkap" : "Menunggu Data",
      kepsekSistem: kepsekCount?.count || 0,
    };
  }

  const dashboardConfig = getDashboardConfig(activeRole, realStats);
  const config = dashboardConfig[activeRole] || dashboardConfig.guru;
  const userName = session?.user?.name?.split(" ")[0] || "User";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Assalamu&apos;alaikum, {userName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">{config.greeting} — Selamat datang di Smart Madrasah</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {config.stats.map((stat, i) => (
          <Card key={i} className="stat-card overflow-hidden border-slate-100">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">
                        {stat.change} dari bulan lalu
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="border-slate-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
              </div>
              <CardDescription>Akses menu yang sering digunakan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.quickActions.map((action, i) => (
                <Link key={i} href={action.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                      <action.icon className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-slate-400">{action.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="border-slate-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">
                  {activeRole === "super_admin" || activeRole === "admin" ? "Log Aktivitas Sistem" : "Aktivitas Terbaru"}
                </CardTitle>
              </div>
              <CardDescription>
                {activeRole === "super_admin" || activeRole === "admin" ? "Riwayat penggunaan sistem terakhir" : "Riwayat aktivitas terakhir"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(activeRole === "super_admin" ? superAdminActivities : recentActivities).map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">
                      {activity.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Conditional Schedule vs System Status */}
        <div className="lg:col-span-1">
          <Card className="border-slate-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {activeRole === "super_admin" ? (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-lg">Kesehatan Sistem</CardTitle>
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-lg">Jadwal Hari Ini</CardTitle>
                  </>
                )}
              </div>
              <CardDescription>
                {activeRole === "super_admin" ? "Status infrastruktur" : "Agenda pembelajaran hari ini"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRole === "super_admin" ? (
                systemStatus.map((status, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 ${status.bg}`}>
                    <div className="text-center">
                      <status.icon className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
                    </div>
                    <Badge variant="outline" className={`bg-white border-transparent shadow-sm ${status.color}`}>
                      {status.status}
                    </Badge>
                  </div>
                ))
              ) : (
                upcomingSchedule.map((schedule, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      schedule.status === "ongoing"
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <div className="text-center min-w-[48px]">
                      <p
                        className={`text-sm font-bold ${
                          schedule.status === "ongoing"
                            ? "text-emerald-700"
                            : "text-slate-700"
                        }`}
                      >
                        {schedule.time}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          schedule.status === "ongoing"
                            ? "text-emerald-800"
                            : "text-slate-700"
                        }`}
                      >
                        {schedule.subject}
                      </p>
                      <p
                        className={`text-xs ${
                          schedule.status === "ongoing"
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {schedule.class}
                      </p>
                    </div>
                    {schedule.status === "ongoing" && (
                      <Badge variant="default" className="text-[10px]">
                        Berlangsung
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
