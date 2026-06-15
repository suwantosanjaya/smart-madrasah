import { db } from "@/lib/db";
import { users, roles, userRoles, guru } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Briefcase } from "lucide-react";
import StaffTableClient from "./StaffTableClient";
import { CreateStaffDialog } from "@/components/admin/CreateStaffDialog";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manajemen Staf & Guru | Smart Madrasah",
};

export default async function AdminStaffPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const currentUserRole = session.user.activeRole; // 'super_admin' atau 'admin'

  // Ambil semua daftar roles
  const daftarRoles = await db.select().from(roles);

  // Ambil data staf (guru, admin, kepsek) beserta rolenya
  // Untuk menyederhanakan, kita gunakan query terpisah lalu gabungkan
  const allUsers = await db
    .select({
      id: users.id,
      namaLengkap: users.namaLengkap,
      email: users.email,
      isActive: users.isActive,
      roleId: userRoles.roleId,
      namaRole: roles.namaRole,
      labelRole: roles.label,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(roles.namaRole, 'guru')) // Atau ambil semua non-siswa/orangtua
    .orderBy(desc(users.id));

  // Agar query bisa menampilkan SEMUA staff (admin, kepala_madrasah, guru) tapi TIDAK siswa/orangtua
  const staffQuery = await db
    .select({
      id: users.id,
      namaLengkap: users.namaLengkap,
      email: users.email,
      isActive: users.isActive,
      roleId: userRoles.roleId,
      namaRole: roles.namaRole,
      labelRole: roles.label,
      // Data guru (jika ada)
      nip: guru.nip,
      noHp: guru.noHp,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .leftJoin(guru, eq(users.id, guru.userId))
    .orderBy(desc(users.id));

  // Filter out role yang bukan staff
  let filteredStaff = staffQuery.filter(
    (u) => ["super_admin", "admin", "kepala_madrasah", "guru"].includes(u.namaRole)
  );

  // Group by user ID to prevent duplicate rows if a user has multiple roles
  const userMap = new Map();
  for (const staff of filteredStaff) {
    if (!userMap.has(staff.id)) {
      userMap.set(staff.id, { ...staff, allRoles: [staff.labelRole] });
    } else {
      const existing = userMap.get(staff.id);
      if (!existing.allRoles.includes(staff.labelRole)) {
        existing.allRoles.push(staff.labelRole);
        // Update labelRole to show multiple roles (e.g., "Guru, Kepala Madrasah")
        existing.labelRole = existing.allRoles.join(", ");
      }
    }
  }
  let staffData = Array.from(userMap.values());

  // Jika currentUserRole adalah 'admin', sembunyikan super_admin dan sesama admin (kecuali dirinya sendiri)
  if (currentUserRole === "admin") {
    staffData = staffData.filter(
      (u) => u.namaRole !== "super_admin" && (u.namaRole !== "admin" || u.id === session.user.id)
    );
  }

  // Jika currentUser adalah admin biasa, jangan tampilkan opsi untuk membuat super_admin atau admin
  const allowedRolesToCreate = currentUserRole === "super_admin" 
    ? ["super_admin", "admin", "kepala_madrasah", "guru"]
    : ["kepala_madrasah", "guru"];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            Manajemen Guru & Staf
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data pegawai, guru, dan administrator sistem madrasah.
          </p>
        </div>
        
        {/* Tombol Pendaftaran Staf */}
        <CreateStaffDialog daftarRoles={daftarRoles.filter(r => allowedRolesToCreate.includes(r.namaRole))} />
      </div>

      <StaffTableClient daftarStaff={staffData} currentUserRole={currentUserRole} currentUserId={session.user.id} />
    </div>
  );
}
