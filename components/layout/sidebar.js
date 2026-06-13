"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "@/app/dashboard/DashboardLayoutClient";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  ClipboardCheck,
  CalendarDays,
  BarChart3,
  FileText,
  BookMarked,
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  School,
  UserCog,
  FolderOpen,
  ListChecks,
  TrendingUp,
  Eye,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const menuConfig = {
  super_admin: {
    label: "Super Administrator",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/superadmin/admins", icon: ShieldCheck, label: "Manajemen Admin" },
      { href: "/dashboard/admin/madrasah", icon: School, label: "Profil Madrasah" },
      { href: "/dashboard/superadmin/kepala-sekolah", icon: UserCog, label: "Riwayat Kepala Sekolah" },
    ],
  },
  admin: {
    label: "Administrator",
    color: "text-red-600",
    bgColor: "bg-red-50",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/admin/users", icon: Users, label: "Siswa & Orang Tua" },
      { href: "/dashboard/admin/staff", icon: Briefcase, label: "Guru & Staf" },
      { href: "/dashboard/admin/mapel", icon: BookOpen, label: "Mata Pelajaran" },
      { href: "/dashboard/admin/kelas", icon: FolderOpen, label: "Kelola Kelas" },
      { href: "/dashboard/admin/rombel", icon: ListChecks, label: "Manajemen Rombel" },
      { href: "/dashboard/admin/tahun-ajaran", icon: CalendarDays, label: "Tahun Ajaran" },
      { href: "/dashboard/admin/pengumuman", icon: Megaphone, label: "Pengumuman" },
      { href: "/dashboard/admin/settings", icon: Settings, label: "Pengaturan" },
    ],
  },
  kepala_madrasah: {
    label: "Kepala Madrasah",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/kepala/monitoring-guru", icon: Eye, label: "Monitoring Guru" },
      { href: "/dashboard/kepala/monitoring-siswa", icon: Users, label: "Monitoring Siswa" },
      { href: "/dashboard/kepala/approval-rpp", icon: ListChecks, label: "Approval RPP" },
      { href: "/dashboard/kepala/laporan", icon: BarChart3, label: "Laporan & Analitik" },
      { href: "/dashboard/kepala/pengumuman", icon: Megaphone, label: "Pengumuman" },
    ],
  },
  guru: {
    label: "Guru",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/guru/jadwal", icon: CalendarDays, label: "Jadwal Mengajar" },
      { href: "/dashboard/guru/rpp", icon: FileText, label: "RPP / Modul Ajar" },
      { href: "/dashboard/guru/bahan-ajar", icon: BookOpen, label: "Bahan Ajar" },
      { href: "/dashboard/guru/evaluasi", icon: ClipboardCheck, label: "Evaluasi" },
      { href: "/dashboard/guru/absensi", icon: ListChecks, label: "Absensi" },
      { href: "/dashboard/guru/nilai", icon: TrendingUp, label: "Penilaian" },
      { href: "/dashboard/guru/tahfizh", icon: BookMarked, label: "Tahfizh" },
    ],
  },
  siswa: {
    label: "Siswa",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/siswa/jadwal", icon: CalendarDays, label: "Jadwal Pelajaran" },
      { href: "/dashboard/siswa/materi", icon: BookOpen, label: "Materi" },
      { href: "/dashboard/siswa/tugas", icon: ClipboardCheck, label: "Tugas" },
      { href: "/dashboard/siswa/nilai", icon: TrendingUp, label: "Nilai" },
      { href: "/dashboard/siswa/tahfizh", icon: BookMarked, label: "Tahfizh Saya" },
    ],
  },
  orangtua: {
    label: "Orang Tua",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    items: [
      { href: "/dashboard/orangtua", icon: LayoutDashboard, label: "Pilih Profil Anak" },
      { href: "/dashboard/orangtua/nilai", icon: TrendingUp, label: "Nilai Anak" },
      { href: "/dashboard/orangtua/absensi", icon: ListChecks, label: "Kehadiran" },
      { href: "/dashboard/orangtua/tahfizh", icon: BookMarked, label: "Tahfizh" },
      { href: "/dashboard/orangtua/pengumuman", icon: Bell, label: "Pengumuman" },
    ],
  },
};

export default function Sidebar({ session, madrasahName = "Smart Madrasah" }) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen } =
    useSidebarContext();

  const activeRole = session?.user?.activeRole || "guru";
  const menu = menuConfig[activeRole] || menuConfig.guru;

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-30 transition-all duration-300 hidden lg:flex flex-col",
          sidebarOpen ? "w-[280px]" : "w-[72px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-slate-900 leading-tight truncate">
                Smart Madrasah
              </h1>
              <p className="text-[10px] text-slate-400 leading-tight truncate">
                {madrasahName}
              </p>
            </div>
          )}
        </div>

        {/* Role Badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-100">
            <div
              className={`inline-flex items-center gap-2 ${menu.bgColor} rounded-lg px-3 py-1.5`}
            >
              <UserCog className={`w-3.5 h-3.5 ${menu.color}`} />
              <span className={`text-xs font-semibold ${menu.color}`}>
                {menu.label}
              </span>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="space-y-1">
            {menu.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                  isActive(item.href)
                    ? "bg-emerald-50 text-emerald-700 font-medium sidebar-link-active"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive(item.href)
                      ? "text-emerald-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Collapse button */}
        <div className="px-2 py-3 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                <span>Tutup Sidebar</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-white border-r border-slate-200 z-50 transition-transform duration-300 lg:hidden flex flex-col",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Smart Madrasah</h1>
            <p className="text-[10px] text-slate-400">{madrasahName}</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div
            className={`inline-flex items-center gap-2 ${menu.bgColor} rounded-lg px-3 py-1.5`}
          >
            <UserCog className={`w-3.5 h-3.5 ${menu.color}`} />
            <span className={`text-xs font-semibold ${menu.color}`}>
              {menu.label}
            </span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="space-y-1">
            {menu.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive(item.href)
                    ? "bg-emerald-50 text-emerald-700 font-medium sidebar-link-active"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive(item.href) ? "text-emerald-600" : "text-slate-400"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
