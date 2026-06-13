"use server";

import { db } from "@/lib/db";
import { users, roles, userRoles } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";

/**
 * Ambil semua administrator (role: admin) beserta info user-nya.
 * Hanya bisa diakses oleh super_admin.
 */
export async function getAdmins() {
  try {
    const admins = await db
      .select({
        id: users.id,
        namaLengkap: users.namaLengkap,
        email: users.email,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        avatarUrl: users.avatarUrl,
        roleId: userRoles.roleId,
        namaRole: roles.namaRole,
        labelRole: roles.label,
      })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(roles.namaRole, "admin"));

    return admins;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

/**
 * Buat akun administrator baru.
 * Password default sama dengan email.
 */
export async function createAdmin(formData) {
  try {
    // Verifikasi bahwa user yang melakukan aksi adalah super_admin
    const session = await auth();
    if (!session || session.user.activeRole !== "super_admin") {
      return { success: false, error: "Akses ditolak. Hanya Super Administrator yang dapat menambah admin." };
    }

    const namaLengkap = formData.get("namaLengkap");
    const email = formData.get("email");

    if (!namaLengkap || !email) {
      return { success: false, error: "Nama lengkap dan email wajib diisi." };
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Format email tidak valid." };
    }

    // Cek apakah email sudah digunakan
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return { success: false, error: "Email sudah digunakan oleh akun lain." };
    }

    // Password default = email
    const passwordHash = await hash(email, 10);

    // Insert user baru
    const [newUser] = await db
      .insert(users)
      .values({
        namaLengkap,
        email,
        passwordHash,
        isActive: 1,
      })
      .returning();

    // Ambil role admin
    const [adminRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.namaRole, "admin"))
      .limit(1);

    if (!adminRole) {
      return { success: false, error: "Role Administrator tidak ditemukan di sistem." };
    }

    // Assign role admin
    await db.insert(userRoles)
      .values({
        userId: newUser.id,
        roleId: adminRole.id,
      });

    revalidatePath("/dashboard/superadmin/admins");
    return { success: true, message: `Akun administrator "${namaLengkap}" berhasil dibuat!` };
  } catch (error) {
    console.error("Error creating admin:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

/**
 * Toggle status aktif/nonaktif administrator.
 */
export async function toggleAdminStatus(userId) {
  try {
    const session = await auth();
    if (!session || session.user.activeRole !== "super_admin") {
      return { success: false, error: "Akses ditolak." };
    }

    // Cegah menonaktifkan diri sendiri
    if (String(userId) === String(session.user.id)) {
      return { success: false, error: "Anda tidak dapat mengubah status akun Anda sendiri." };
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return { success: false, error: "User tidak ditemukan." };
    }

    const newStatus = user.isActive === 1 ? 0 : 1;
    await db.update(users)
      .set({ isActive: newStatus, updatedAt: sql`now()` })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/superadmin/admins");
    return {
      success: true,
      message: `Akun ${user.namaLengkap} telah ${newStatus === 1 ? "diaktifkan" : "dinonaktifkan"}.`,
    };
  } catch (error) {
    console.error("Error toggling admin status:", error);
    return { success: false, error: "Gagal mengubah status akun." };
  }
}

/**
 * Update data administrator (nama dan email).
 */
export async function updateAdmin(userId, formData) {
  try {
    const session = await auth();
    if (!session || session.user.activeRole !== "super_admin") {
      return { success: false, error: "Akses ditolak." };
    }

    const namaLengkap = formData.get("namaLengkap");
    const email = formData.get("email");

    if (!namaLengkap || !email) {
      return { success: false, error: "Nama lengkap dan email wajib diisi." };
    }

    // Cek apakah email baru sudah digunakan oleh user lain
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser && existingUser.id !== userId) {
      return { success: false, error: "Email sudah digunakan oleh akun lain." };
    }

    await db.update(users)
      .set({
        namaLengkap,
        email,
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/superadmin/admins");
    return { success: true, message: `Data administrator "${namaLengkap}" berhasil diperbarui.` };
  } catch (error) {
    console.error("Error updating admin:", error);
    return { success: false, error: "Gagal memperbarui data administrator." };
  }
}

/**
 * Reset password administrator ke default (email).
 */
export async function resetAdminPassword(userId) {
  try {
    const session = await auth();
    if (!session || session.user.activeRole !== "super_admin") {
      return { success: false, error: "Akses ditolak." };
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return { success: false, error: "User tidak ditemukan." };
    }

    const newPasswordHash = await hash(user.email, 10);
    await db.update(users)
      .set({ passwordHash: newPasswordHash, updatedAt: sql`now()` })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/superadmin/admins");
    return {
      success: true,
      message: `Password ${user.namaLengkap} telah direset. Password baru = email login.`,
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Gagal mereset password." };
  }
}

/**
 * Hapus akun administrator secara permanen.
 * Hanya bisa menghapus akun yang sudah dinonaktifkan terlebih dahulu.
 */
export async function deleteAdmin(userId) {
  try {
    const session = await auth();
    if (!session || session.user.activeRole !== "super_admin") {
      return { success: false, error: "Akses ditolak." };
    }

    // Cegah menghapus diri sendiri
    if (String(userId) === String(session.user.id)) {
      return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri." };
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return { success: false, error: "User tidak ditemukan." };
    }

    if (user.isActive === 1) {
      return { success: false, error: "Nonaktifkan akun terlebih dahulu sebelum menghapus." };
    }

    // Hapus user (cascade akan menghapus user_roles terkait)
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/dashboard/superadmin/admins");
    return { success: true, message: `Akun "${user.namaLengkap}" telah dihapus permanen.` };
  } catch (error) {
    console.error("Error deleting admin:", error);
    return { success: false, error: "Gagal menghapus akun administrator." };
  }
}
