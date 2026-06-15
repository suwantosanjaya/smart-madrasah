"use server";

import { db } from "@/lib/db";
import { tahunAjaran } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTahunAjaran(data) {
  try {
    // Jika tahun ini diset aktif, nonaktifkan yang lain dulu
    if (data.isActive === 1) {
      await db.update(tahunAjaran).set({ isActive: 0 });
    }

    await db.insert(tahunAjaran).values({
      nama: data.nama,
      semester: data.semester,
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: data.tanggalSelesai,
      isActive: data.isActive || 0,
    });
    
    revalidatePath("/dashboard/admin/tahun-ajaran");
    return { success: true };
  } catch (error) {
    console.error("Error createTahunAjaran:", error);
    return { success: false, error: "Gagal membuat tahun ajaran." };
  }
}

export async function updateTahunAjaran(id, data) {
  try {
    // Jika tahun ini diset aktif, nonaktifkan yang lain dulu
    if (data.isActive === 1) {
      await db.update(tahunAjaran).set({ isActive: 0 });
    }

    await db.update(tahunAjaran).set({
      nama: data.nama,
      semester: data.semester,
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: data.tanggalSelesai,
      isActive: data.isActive || 0,
    }).where(eq(tahunAjaran.id, id));
    
    revalidatePath("/dashboard/admin/tahun-ajaran");
    return { success: true };
  } catch (error) {
    console.error("Error updateTahunAjaran:", error);
    return { success: false, error: "Gagal memperbarui tahun ajaran." };
  }
}

export async function deleteTahunAjaran(id) {
  try {
    // Pastikan tidak menghapus tahun ajaran yang sedang aktif jika ada
    const [target] = await db.select().from(tahunAjaran).where(eq(tahunAjaran.id, id)).limit(1);
    if (target && target.isActive === 1) {
      return { success: false, error: "Tidak dapat menghapus tahun ajaran yang sedang aktif." };
    }

    await db.delete(tahunAjaran).where(eq(tahunAjaran.id, id));
    revalidatePath("/dashboard/admin/tahun-ajaran");
    return { success: true };
  } catch (error) {
    console.error("Error deleteTahunAjaran:", error);
    return { success: false, error: "Gagal menghapus tahun ajaran karena masih terikat dengan data kelas/jadwal." };
  }
}
