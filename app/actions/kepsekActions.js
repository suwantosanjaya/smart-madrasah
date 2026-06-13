"use server";

import { db } from "@/lib/db";
import { users, roles, userRoles, riwayatJabatan, madrasah } from "@/lib/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Get all teachers (guru) and admin users who could be assigned as Kepala Madrasah
 */
export async function getCandidates() {
  try {
    const candidates = await db
      .select({
        id: users.id,
        namaLengkap: users.namaLengkap,
        email: users.email,
        namaRole: roles.namaRole,
      })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(sql`${roles.namaRole} IN ('guru', 'admin')`);

    // Deduplicate if a user has multiple roles
    const uniqueCandidates = [];
    const map = new Map();
    for (const c of candidates) {
      if (!map.has(c.id)) {
        map.set(c.id, true);
        uniqueCandidates.push(c);
      }
    }
    
    return uniqueCandidates;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return [];
  }
}

/**
 * Get the history of principals
 */
export async function getRiwayatKepsek() {
  try {
    const history = await db
      .select({
        id: riwayatJabatan.id,
        jabatan: riwayatJabatan.jabatan,
        nomorSk: riwayatJabatan.nomorSk,
        tanggalMulai: riwayatJabatan.tanggalMulai,
        tanggalSelesai: riwayatJabatan.tanggalSelesai,
        status: riwayatJabatan.status,
        keterangan: riwayatJabatan.keterangan,
        userId: riwayatJabatan.userId,
        namaLengkap: users.namaLengkap,
        email: users.email,
      })
      .from(riwayatJabatan)
      .innerJoin(users, eq(riwayatJabatan.userId, users.id))
      .orderBy(desc(riwayatJabatan.id));

    return history;
  } catch (error) {
    console.error("Error fetching riwayat kepsek:", error);
    return [];
  }
}

/**
 * Set a new Principal (Kepala Madrasah)
 */
export async function setKepalaMadrasah(formData) {
  try {
    const session = await auth();
    if (!session || session.user.activeRole !== "super_admin") {
      return { success: false, error: "Akses ditolak." };
    }

    const userId = formData.get("userId");
    const nomorSk = formData.get("nomorSk");
    const tanggalMulai = formData.get("tanggalMulai");
    const keterangan = formData.get("keterangan");

    if (!userId || !tanggalMulai) {
      return { success: false, error: "User dan Tanggal Mulai wajib diisi." };
    }

    const [newPrincipal] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!newPrincipal) {
      return { success: false, error: "User tidak ditemukan." };
    }

    // 1. Dapatkan role 'kepala_madrasah'
    let [kepsekRole] = await db.select().from(roles).where(eq(roles.namaRole, "kepala_madrasah")).limit(1);
    
    // Jika belum ada role di db, insert
    if (!kepsekRole) {
      const [inserted] = await db.insert(roles).values({
        namaRole: "kepala_madrasah",
        label: "Kepala Madrasah",
        deskripsi: "Pimpinan tertinggi madrasah"
      }).returning();
      kepsekRole = inserted;
    }

    // 2. Cari kepala madrasah yang sedang aktif (status = 'aktif')
    const [currentActive] = await db.select()
      .from(riwayatJabatan)
      .where(eq(riwayatJabatan.status, "aktif"))
      .limit(1);

    if (currentActive) {
      if (String(currentActive.userId) === String(userId)) {
        return { success: false, error: "User ini sudah menjabat sebagai Kepala Madrasah aktif saat ini." };
      }

      // Nonaktifkan yang lama
      await db.update(riwayatJabatan)
        .set({ 
          status: "purna", 
          tanggalSelesai: tanggalMulai // Selesai ketika yang baru mulai
        })
        .where(eq(riwayatJabatan.id, currentActive.id));

      // Cabut role dari user lama (biarkan role lain jika dia guru/admin)
      await db.delete(userRoles)
        .where(and(
          eq(userRoles.userId, currentActive.userId),
          eq(userRoles.roleId, kepsekRole.id)
        ));
    }

    // 3. Masukkan riwayat jabatan baru
    const [m] = await db.select().from(madrasah).limit(1);
    let madrasahId = null;
    if (m) madrasahId = m.id;

    await db.insert(riwayatJabatan).values({
      madrasahId,
      userId,
      nomorSk,
      tanggalMulai,
      keterangan,
      status: "aktif"
    });

    // 4. Tambahkan role 'kepala_madrasah' ke user baru jika belum punya
    const [hasRole] = await db.select().from(userRoles).where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.roleId, kepsekRole.id)
    )).limit(1);

    if (!hasRole) {
      await db.insert(userRoles).values({
        userId,
        roleId: kepsekRole.id
      });
    }

    // 5. Update nama di tabel madrasah
    if (m) {
      await db.update(madrasah)
        .set({ kepalaMadrasah: newPrincipal.namaLengkap })
        .where(eq(madrasah.id, m.id));
    }

    revalidatePath("/dashboard/superadmin/kepala-sekolah");
    revalidatePath("/dashboard/admin/madrasah");
    
    return { success: true, message: `Berhasil menetapkan ${newPrincipal.namaLengkap} sebagai Kepala Madrasah.` };
  } catch (error) {
    console.error("Error setting kepala madrasah:", error);
    return { success: false, error: "Terjadi kesalahan server saat menetapkan Kepala Madrasah." };
  }
}
