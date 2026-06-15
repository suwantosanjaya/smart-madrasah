"use server";

import { db } from "@/lib/db";
import { bahanAjar } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createBahanAjar(data) {
  try {
    await db.insert(bahanAjar).values({
      guruId: 1, // MOCK: Nantinya diganti ID guru yang aktif
      mapelId: data.mapelId ? parseInt(data.mapelId) : null,
      rppId: data.rppId ? parseInt(data.rppId) : null,
      judul: data.judul,
      jenis: data.jenis,
      konten: data.konten || "",
      fileUrl: data.fileUrl || null,
      aiGenerated: data.aiGenerated ? 1 : 0,
      createdAt: new Date().toISOString(),
    });
    revalidatePath("/dashboard/guru/bahan-ajar");
    return { success: true };
  } catch (error) {
    console.error("Error createBahanAjar:", error);
    return { success: false, error: "Gagal menyimpan Bahan Ajar" };
  }
}

export async function updateBahanAjar(id, data) {
  try {
    await db.update(bahanAjar).set({
      mapelId: data.mapelId ? parseInt(data.mapelId) : null,
      rppId: data.rppId ? parseInt(data.rppId) : null,
      judul: data.judul,
      jenis: data.jenis,
      konten: data.konten || "",
      fileUrl: data.fileUrl || null,
      aiGenerated: data.aiGenerated ? 1 : 0,
    }).where(eq(bahanAjar.id, id));
    
    revalidatePath("/dashboard/guru/bahan-ajar");
    return { success: true };
  } catch (error) {
    console.error("Error updateBahanAjar:", error);
    return { success: false, error: "Gagal memperbarui Bahan Ajar" };
  }
}

export async function deleteBahanAjar(id) {
  try {
    await db.delete(bahanAjar).where(eq(bahanAjar.id, id));
    revalidatePath("/dashboard/guru/bahan-ajar");
    return { success: true };
  } catch (error) {
    console.error("Error deleteBahanAjar:", error);
    return { success: false, error: "Gagal menghapus Bahan Ajar" };
  }
}
