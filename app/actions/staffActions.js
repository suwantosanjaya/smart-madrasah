"use server";

import { db } from "@/lib/db";
import { users, roles, userRoles, guru, orangtua } from "@/lib/db/schema";
import { eq, or, desc, and, sql } from "drizzle-orm";
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
    const allowedRolesForWaliKelas = ["guru", "kepala_madrasah"];
    const isTeacherRole = selectedRole.length > 0 && allowedRolesForWaliKelas.includes(selectedRole[0].namaRole);
    
    if (isTeacherRole) {
      // Insert ke tabel guru
      await db.insert(guru).values({
        userId: newUser.id,
        nip,
        noHp,
        // Set default values untuk kolom lainnya jika diperlukan
      });
    }

    const isOrangTua = formData.get("isOrangTua") === "true";
    if (isOrangTua) {
      // VALIDASI: Cek apakah noHp sudah dipakai oleh orang tua lain
      if (noHp) {
        const existingHp = await db.select().from(orangtua).where(eq(orangtua.noHp, noHp)).limit(1);
        if (existingHp.length > 0) {
          // Kita tidak bisa me-return error biasa karena user sudah telanjur di-insert ke db (di atas).
          // Pendekatan terbaik: Gagal membuat akun (throw error sebelum commit transaksi)
          // Tapi karena tidak pakai transaksi, lebih baik kembalikan pesan peringatan spesifik.
          return { success: false, error: "Staf berhasil dibuat, NAMUN gagal menambahkan peran Orang Tua karena Nomor WhatsApp sudah terdaftar pada akun lain. Silakan edit staf ini secara manual." };
        }
      }
    
      const [ortuRole] = await db.select().from(roles).where(eq(roles.namaRole, "orangtua")).limit(1);
      if (ortuRole) {
        await db.insert(userRoles).values({
          userId: newUser.id,
          roleId: ortuRole.id,
        });
        await db.insert(orangtua).values({
          userId: newUser.id,
          noHp: noHp || null,
        });
      }
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

// Update Profil Staff
export async function updateStaff(userId, formData) {
  try {
    const namaLengkap = formData.get("namaLengkap");
    const email = formData.get("email");
    const roleId = parseInt(formData.get("roleId"));
    const nip = formData.get("nip") || null;
    const noHp = formData.get("noHp") || null;
    
    // Cek apakah email sudah terdaftar untuk user lain
    const existingUser = await db.select().from(users).where(and(eq(users.email, email), sql`${users.id} != ${userId}`)).limit(1);
    if (existingUser.length > 0) {
      return { success: false, error: "Email sudah digunakan oleh akun lain!" };
    }
    
    // Update User
    await db.update(users).set({
      namaLengkap,
      email,
    }).where(eq(users.id, userId));
    
    // Update Role, namun pertahankan role "kepala_madrasah" (jangan dihapus jika ada)
    const kepsekRole = await db.select().from(roles).where(eq(roles.namaRole, 'kepala_madrasah')).limit(1);
    
    if (kepsekRole.length > 0) {
      await db.delete(userRoles).where(
        and(
          eq(userRoles.userId, userId),
          sql`${userRoles.roleId} != ${kepsekRole[0].id}`
        )
      );
    } else {
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
    }
    
    const existingNewRole = await db.select().from(userRoles).where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId))
    ).limit(1);
    
    if (existingNewRole.length === 0) {
      await db.insert(userRoles).values({
        userId: userId,
        roleId: roleId,
      });
    }
    
    // Cek apakah role yang dipilih butuh tabel guru
    const selectedRole = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    const allowedRolesForWaliKelas = ["guru", "kepala_madrasah"];
    const isTeacherRole = selectedRole.length > 0 && allowedRolesForWaliKelas.includes(selectedRole[0].namaRole);
    
    if (isTeacherRole) {
      const existingGuru = await db.select().from(guru).where(eq(guru.userId, userId)).limit(1);
      if (existingGuru.length > 0) {
        await db.update(guru).set({ nip, noHp }).where(eq(guru.userId, userId));
      } else {
        await db.insert(guru).values({ userId, nip, noHp });
      }
    } else {
      // Jika diubah menjadi admin/role lain yang tidak perlu data guru, kita bisa hapus dari tabel guru (opsional)
      // await db.delete(guru).where(eq(guru.userId, userId));
    }

    const isOrangTua = formData.get("isOrangTua") === "true";
    const [ortuRole] = await db.select().from(roles).where(eq(roles.namaRole, "orangtua")).limit(1);
    
    if (ortuRole) {
      if (isOrangTua) {
        // VALIDASI: Cek apakah noHp sudah dipakai oleh orang tua lain
        if (noHp) {
          const existingHp = await db.select().from(orangtua).where(
            and(
              eq(orangtua.noHp, noHp),
              sql`${orangtua.userId} IS NOT NULL`,
              sql`${orangtua.userId} != ${userId}`
            )
          ).limit(1);
          
          if (existingHp.length > 0) {
            return { success: false, error: "Nomor WhatsApp ini sudah terdaftar pada akun Orang Tua lain. Silakan periksa kembali!" };
          }
        }
      
        const existingOrtuRole = await db.select().from(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, ortuRole.id))).limit(1);
        if (existingOrtuRole.length === 0) {
          await db.insert(userRoles).values({ userId, roleId: ortuRole.id });
        }
        const existingOrtu = await db.select().from(orangtua).where(eq(orangtua.userId, userId)).limit(1);
        if (existingOrtu.length === 0) {
          await db.insert(orangtua).values({ userId, noHp: noHp || null });
        } else {
          await db.update(orangtua).set({ noHp: noHp || null }).where(eq(orangtua.userId, userId));
        }
      } else {
        await db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, ortuRole.id)));
      }
    }
    
    revalidatePath("/dashboard/admin/staff");
    return { success: true, message: "Profil staf berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating staff:", error);
    return { success: false, error: "Terjadi kesalahan pada server" };
  }
}
