"use server";

import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createKelas(data) {
  try {
    await db.insert(kelas).values({
      namaKelas: data.namaKelas,
      tingkat: data.tingkat,
      tahunAjaranId: data.tahunAjaranId,
      waliKelasId: data.waliKelasId || null,
      kapasitas: data.kapasitas || 30,
    });
    revalidatePath("/dashboard/admin/kelas");
    return { success: true };
  } catch (error) {
    console.error("Error createKelas:", error);
    return { success: false, error: "Gagal membuat kelas." };
  }
}

export async function updateKelas(id, data) {
  try {
    await db.update(kelas).set({
      namaKelas: data.namaKelas,
      tingkat: data.tingkat,
      tahunAjaranId: data.tahunAjaranId,
      waliKelasId: data.waliKelasId || null,
      kapasitas: data.kapasitas || 30,
    }).where(eq(kelas.id, id));
    revalidatePath("/dashboard/admin/kelas");
    // Also revalidate the guru layout so the sidebar updates if needed
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updateKelas:", error);
    return { success: false, error: "Gagal memperbarui kelas." };
  }
}

export async function deleteKelas(id) {
  try {
    await db.delete(kelas).where(eq(kelas.id, id));
    revalidatePath("/dashboard/admin/kelas");
    return { success: true };
  } catch (error) {
    console.error("Error deleteKelas:", error);
    return { success: false, error: "Gagal menghapus kelas. Mungkin masih ada siswa di dalamnya." };
  }
}
