import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, roles, userRoles } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ShieldCheck, Users, UserCheck, UserX } from "lucide-react";
import AdminTableClient from "./AdminTableClient";
import CreateAdminDialog from "./CreateAdminDialog";

export const metadata = {
  title: "Manajemen Admin | Smart Madrasah",
  description: "Kelola akun administrator sistem Smart Madrasah",
};

export default async function SuperAdminAdminsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.activeRole !== "super_admin") {
    redirect("/dashboard");
  }

  // Ambil semua admin users
  const adminList = await db
    .select({
      id: users.id,
      namaLengkap: users.namaLengkap,
      email: users.email,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      roleId: userRoles.roleId,
      namaRole: roles.namaRole,
      labelRole: roles.label,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(roles.namaRole, "admin"))
    .orderBy(desc(users.id));

  const totalAdmin = adminList.length;
  const activeAdmin = adminList.filter((a) => a.isActive === 1).length;
  const inactiveAdmin = totalAdmin - activeAdmin;

  const stats = [
    { label: "Total Admin", value: totalAdmin, icon: Users, color: "from-rose-500 to-pink-500", bg: "bg-rose-50", text: "text-rose-600" },
    { label: "Admin Aktif", value: activeAdmin, icon: UserCheck, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Admin Nonaktif", value: inactiveAdmin, icon: UserX, color: "from-slate-400 to-slate-500", bg: "bg-slate-50", text: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            Manajemen Administrator
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-11">
            Kelola akun, akses, dan status administrator sistem Smart Madrasah.
          </p>
        </div>
        <CreateAdminDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <AdminTableClient
        daftarAdmin={adminList}
        currentUserId={session.user.id}
      />
    </div>
  );
}
