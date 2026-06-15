"use server";

import { db } from "@/lib/db";
import { hafalan } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

export async function saveHafalan(data) {
  try {
    await db.insert(hafalan).values({
      siswaId: data.siswaId,
      guruId: data.guruId,
      surah: data.surah,
      juz: parseInt(data.juz),
      ayatMulai: parseInt(data.ayatMulai) || 0,
      ayatSelesai: parseInt(data.ayatSelesai) || 0,
      status: data.status,
      nilaiTajwid: parseFloat(data.nilaiTajwid) || 0,
      nilaiKelancaran: parseFloat(data.nilaiKelancaran) || 0,
      nilaiMakhorijul: parseFloat(data.nilaiMakhorijul) || 0,
      catatan: data.catatan,
      tanggalSetor: new Date().toISOString().split("T")[0],
    });

    revalidatePath("/dashboard/guru/tahfizh");
    return { success: true, message: "Setoran hafalan berhasil disimpan!" };
  } catch (error) {
    console.error("Error saveHafalan:", error);
    return { success: false, error: "Gagal menyimpan setoran hafalan." };
  }
}
