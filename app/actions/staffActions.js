"use server";

import { db } from "@/lib/db";
import { users, roles, userRoles, guru } from "@/lib/db/schema";
import { eq, or, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

// Ambil semua role dari database
export async function getRoles() {
  try {
    return await db.select().from(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

// Buat akun staf baru
export async function createStaff(formData) {
  try {
    const namaLengkap = formData.get("namaLengkap");
    const email = formData.get("email");
    const roleId = parseInt(formData.get("roleId"));
    const nip = formData.get("nip") || null;
    const noHp = formData.get("noHp") || null;
    
    // Password default adalah email
    const passwordHash = await hash(email, 10);
    
    // Cek apakah email sudah terdaftar
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return { success: false, error: "Email sudah digunakan oleh akun lain!" };
    }
    
    // Insert User
    const [newUser] = await db.insert(users).values({
      namaLengkap,
      email,
      passwordHash,
      isActive: 1,
    }).returning();
    
    // Insert User Role
    await db.insert(userRoles).values({
      userId: newUser.id,
      roleId: roleId,
    });
    
    // Cek apakah role yang dipilih adalah "guru"
    const selectedRole = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    const isGuru = selectedRole.length > 0 && selectedRole[0].namaRole === "guru";
    
    if (isGuru) {
      // Insert ke tabel guru
      await db.insert(guru).values({
        userId: newUser.id,
        nip,
        noHp,
        // Set default values untuk kolom lainnya jika diperlukan
      });
    }
    
    revalidatePath("/dashboard/admin/staff");
    return { success: true, message: "Akun staf berhasil dibuat!" };
  } catch (error) {
    console.error("Error creating staff:", error);
    return { success: false, error: "Terjadi kesalahan pada server" };
  }
}

// Update Status Akun
export async function toggleStatusStaff(userId, currentStatus) {
  try {
    const newStatus = currentStatus === 1 ? 0 : 1;
    await db.update(users).set({ isActive: newStatus }).where(eq(users.id, userId));
    revalidatePath("/dashboard/admin/staff");
    return { success: true };
  } catch (error) {
    console.error("Error toggling status:", error);
    return { success: false, error: "Gagal mengubah status akun" };
  }
}

// Hapus Staff
export async function deleteStaff(userId) {
  try {
    // Karena onDelete: 'cascade' di schema, menghapus user akan menghapus user_roles dan guru yang terkait.
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/dashboard/admin/staff");
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return { success: false, error: "Gagal menghapus akun staf" };
  }
}
