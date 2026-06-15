"use server";

import { db } from "@/lib/db";
import { rpp } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createRpp(data) {
  try {
    await db.insert(rpp).values({
      guruId: 1, // MOCK: Nantinya diganti dengan ID sesi user aktif
      mapelId: data.mapelId,
      tingkat: data.tingkat,
      semester: data.semester,
      judul: data.judul,
      alokasiWaktu: data.alokasiWaktu,
      tujuan: data.tujuan,
      pendahuluan: data.pendahuluan,
      inti: data.inti,
      penutup: data.penutup,
      penilaian: data.penilaian,
      targetKognitif: data.targetKognitif || "C3",
      status: data.status || "draft",
      aiGenerated: data.aiGenerated ? 1 : 0,
      updatedAt: new Date().toISOString(),
    });
    revalidatePath("/dashboard/guru/rpp");
    return { success: true };
  } catch (error) {
    console.error("Error createRpp:", error);
    return { success: false, error: "Gagal menyimpan RPP" };
  }
}

export async function updateRpp(id, data) {
  try {
    await db.update(rpp).set({
      mapelId: data.mapelId,
      tingkat: data.tingkat,
      semester: data.semester,
      judul: data.judul,
      alokasiWaktu: data.alokasiWaktu,
      tujuan: data.tujuan,
      pendahuluan: data.pendahuluan,
      inti: data.inti,
      penutup: data.penutup,
      penilaian: data.penilaian,
      targetKognitif: data.targetKognitif || "C3",
      status: data.status,
      aiGenerated: data.aiGenerated ? 1 : 0,
      updatedAt: new Date().toISOString(),
    }).where(eq(rpp.id, id));
    
    revalidatePath("/dashboard/guru/rpp");
    return { success: true };
  } catch (error) {
    console.error("Error updateRpp:", error);
    return { success: false, error: "Gagal memperbarui RPP" };
  }
}

export async function deleteRpp(id) {
  try {
    await db.delete(rpp).where(eq(rpp.id, id));
    revalidatePath("/dashboard/guru/rpp");
    return { success: true };
  } catch (error) {
    console.error("Error deleteRpp:", error);
    return { success: false, error: "Gagal menghapus RPP" };
  }
}

export async function updateRppStatus(id, status) {
  try {
    await db.update(rpp).set({ status, updatedAt: new Date().toISOString() }).where(eq(rpp.id, id));
    revalidatePath("/dashboard/guru/rpp");
    revalidatePath("/dashboard/kepala/approval-rpp");
    return { success: true };
  } catch (error) {
    console.error("Error updateRppStatus:", error);
    return { success: false, error: "Gagal memperbarui status RPP" };
  }
}

export async function giveRevision(id, catatanRevisi) {
  try {
    await db.update(rpp)
      .set({ status: "revision", catatanRevisi, updatedAt: new Date().toISOString() })
      .where(eq(rpp.id, id));
    revalidatePath("/dashboard/guru/rpp");
    revalidatePath("/dashboard/kepala/approval-rpp");
    return { success: true };
  } catch (error) {
    console.error("Error giveRevision:", error);
    return { success: false, error: "Gagal menyimpan catatan revisi" };
  }
}

export async function approveRpp(id) {
  try {
    await db.update(rpp)
      .set({ status: "approved", catatanRevisi: null, updatedAt: new Date().toISOString() })
      .where(eq(rpp.id, id));
    revalidatePath("/dashboard/guru/rpp");
    revalidatePath("/dashboard/kepala/approval-rpp");
    return { success: true };
  } catch (error) {
    console.error("Error approveRpp:", error);
    return { success: false, error: "Gagal menyetujui RPP" };
  }
}
