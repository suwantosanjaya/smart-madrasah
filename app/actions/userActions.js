'use server'

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function resetPassword(userId) {
  try {
    const passwordHash = await bcrypt.hash("123456", 10);
    await db.update(users)
      .set({
        passwordHash: passwordHash,
        mustChangePassword: 1,
      })
      .where(eq(users.id, userId));
      
    revalidatePath('/dashboard/admin/staff');
    revalidatePath('/dashboard/admin/users');
    return { success: true, message: "Password berhasil di-reset menjadi '123456'" };
  } catch (error) {
    console.error("Error resetPassword:", error);
    return { success: false, error: "Gagal me-reset password." };
  }
}

export async function forceChangePassword(userId, newPassword) {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(users)
      .set({
        passwordHash: passwordHash,
        mustChangePassword: 0,
      })
      .where(eq(users.id, parseInt(userId)));
      
    return { success: true, message: "Password berhasil diubah. Silakan masuk kembali." };
  } catch (error) {
    console.error("Error forceChangePassword:", error);
    return { success: false, error: "Gagal merubah password." };
  }
}

export async function registerGuru(formData) {
  try {
    const namaLengkap = formData.namaLengkap;
    const email = formData.email;
    const password = formData.password;
    const nip = formData.nip;
    const noHp = formData.noHp;

    if (!namaLengkap || !email || !password) {
      return { success: false, error: "Nama, email, dan password wajib diisi." };
    }

    // Cek email unique
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return { success: false, error: "Email sudah terdaftar." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      namaLengkap,
      email,
      passwordHash,
      isActive: 0, // Inactive by default
    }).returning({ id: users.id });

    // Role guru
    const { roles, userRoles, guru } = await import("@/lib/db/schema");
    const roleGuru = await db.select().from(roles).where(eq(roles.namaRole, 'guru')).limit(1);
    const roleId = roleGuru.length > 0 ? roleGuru[0].id : 4; 

    await db.insert(userRoles).values({
      userId: newUser.id,
      roleId: roleId
    });

    await db.insert(guru).values({
      userId: newUser.id,
      nip: nip || null,
      noHp: noHp || null,
    });

    return { success: true, message: "Registrasi berhasil! Akun Anda sedang menunggu persetujuan Administrator." };
  } catch (error) {
    console.error("Error registerGuru:", error);
    return { success: false, error: "Gagal melakukan registrasi." };
  }
}
