"use server";

import { db } from "@/lib/db";
import { kelompokTahfizh, anggotaTahfizh } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createHalaqah(data) {
  try {
    const [newHalaqah] = await db.insert(kelompokTahfizh).values({
      namaKelompok: data.namaKelompok,
      guruId: data.guruId,
      tahunAjaranId: data.tahunAjaranId,
      deskripsi: data.deskripsi,
    }).returning();
    
    revalidatePath("/dashboard/admin/halaqah");
    return { success: true, data: newHalaqah };
  } catch (error) {
    console.error("Error createHalaqah:", error);
    return { success: false, error: "Gagal membuat kelompok Tahfizh." };
  }
}

export async function updateHalaqah(id, data) {
  try {
    await db.update(kelompokTahfizh).set({
      namaKelompok: data.namaKelompok,
      guruId: data.guruId,
      tahunAjaranId: data.tahunAjaranId,
      deskripsi: data.deskripsi,
    }).where(eq(kelompokTahfizh.id, id));
    
    revalidatePath("/dashboard/admin/halaqah");
    return { success: true };
  } catch (error) {
    console.error("Error updateHalaqah:", error);
    return { success: false, error: "Gagal memperbarui kelompok Tahfizh." };
  }
}

export async function deleteHalaqah(id) {
  try {
    // Cascade delete is configured, so it will also delete from anggota_tahfizh
    await db.delete(kelompokTahfizh).where(eq(kelompokTahfizh.id, id));
    revalidatePath("/dashboard/admin/halaqah");
    return { success: true };
  } catch (error) {
    console.error("Error deleteHalaqah:", error);
    return { success: false, error: "Gagal menghapus kelompok Tahfizh." };
  }
}

export async function saveAnggotaHalaqah(kelompokId, siswaIds) {
  try {
    // Remove all existing members for this group
    await db.delete(anggotaTahfizh).where(eq(anggotaTahfizh.kelompokId, kelompokId));
    
    // Insert new members
    if (siswaIds && siswaIds.length > 0) {
      const values = siswaIds.map(siswaId => ({
        kelompokId: kelompokId,
        siswaId: parseInt(siswaId)
      }));
      await db.insert(anggotaTahfizh).values(values);
    }
    
    revalidatePath("/dashboard/admin/halaqah");
    return { success: true };
  } catch (error) {
    console.error("Error saveAnggotaHalaqah:", error);
    return { success: false, error: "Gagal menyimpan daftar anggota." };
  }
}
