"use client";

import { signOut, useSession } from "next-auth/react";
import { useSidebarContext } from "@/app/dashboard/DashboardLayoutClient";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Search,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { menuConfig } from "./sidebar";

export default function Header({ session }) {
  const { setMobileSidebarOpen } = useSidebarContext();
  const { update } = useSession();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const dropdownRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const userName = session?.user?.name || "User";
  let userEmail = session?.user?.email || "";
  if (userEmail.endsWith("@ortu.madrasah.id")) {
    userEmail = "HP: " + userEmail.replace("@ortu.madrasah.id", "");
  }
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeRole = session?.user?.activeRole || "guest";
  const roleLabels = {
    super_admin: "Super Administrator",
    admin: "Administrator",
    kepala_madrasah: "Kepala Madrasah",
    guru: "Guru",
    siswa: "Siswa",
    orangtua: "Orang Tua",
  };

  const availableRoles = session?.user?.roles || [];

  const handleRoleSwitch = async (roleName) => {
    if (roleName === activeRole) return;
    setIsSwitchingRole(true);
    await update({ activeRole: roleName });
    setProfileOpen(false);
    setIsSwitchingRole(false);
    
    // Redirect ke halaman default peran baru agar URL sinkron
    const targetUrl = menuConfig[roleName]?.items?.[0]?.href || "/dashboard";
    router.push(targetUrl);
    router.refresh(); // Opsional: pastikan state server di-refresh di halaman baru
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-64 lg:w-80 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari menu, fitur..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearch && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50">
              <div className="p-2">
                <div className="text-xs font-semibold text-slate-500 mb-2 px-2">Hasil Pencarian Menu</div>
                {(() => {
                  const items = menuConfig[activeRole]?.items || [];
                  const results = items.filter(item => 
                    item.label.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (results.length === 0) {
                    return (
                      <div className="px-2 py-4 text-center text-sm text-slate-500">
                        Menu "{searchQuery}" tidak ditemukan
                      </div>
                    );
                  }

                  return results.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                      <span className="text-sm text-slate-700 group-hover:text-emerald-700">{item.label}</span>
                    </Link>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white pulse-dot" />
        </Button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-tight truncate max-w-[120px]">
                {userName}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {roleLabels[activeRole] || activeRole}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                  <User className="w-4 h-4" />
                  Profil Saya
                </button>

                {availableRoles.length > 1 && (
                  <>
                    <hr className="my-1 border-slate-100" />
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                        Ganti Peran ({availableRoles.length})
                      </p>
                      <div className="space-y-1">
                        {availableRoles.map((r) => (
                          <button
                            key={r.roleId}
                            onClick={() => handleRoleSwitch(r.namaRole)}
                            disabled={isSwitchingRole}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                              activeRole === r.namaRole
                                ? "bg-emerald-50 text-emerald-700 font-medium"
                                : "text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSwitchingRole && activeRole !== r.namaRole ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                              ) : (
                                <User className="w-4 h-4 opacity-50" />
                              )}
                              <span>{roleLabels[r.namaRole] || r.label}</span>
                            </div>
                            {activeRole === r.namaRole && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <hr className="my-1 border-slate-100" />
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
