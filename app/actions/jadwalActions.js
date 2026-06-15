"use server";

import { db } from "@/lib/db";
import { jadwalMengajar } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createJadwal(data) {
  try {
    await db.insert(jadwalMengajar).values({
      guruId: parseInt(data.guruId),
      mapelId: parseInt(data.mapelId),
      kelasId: parseInt(data.kelasId),
      tahunAjaranId: parseInt(data.tahunAjaranId),
      hari: data.hari,
      jamMulai: data.jamMulai,
      jamSelesai: data.jamSelesai,
      ruangan: data.ruangan,
    });
    revalidatePath("/dashboard/admin/jadwal");
    revalidatePath("/dashboard"); // to refresh sidebar dynamic features
    return { success: true };
  } catch (error) {
    console.error("Error createJadwal:", error);
    return { success: false, error: "Gagal menyimpan jadwal / penugasan." };
  }
}

export async function updateJadwal(id, data) {
  try {
    await db.update(jadwalMengajar).set({
      guruId: parseInt(data.guruId),
      mapelId: parseInt(data.mapelId),
      kelasId: parseInt(data.kelasId),
      tahunAjaranId: parseInt(data.tahunAjaranId),
      hari: data.hari,
      jamMulai: data.jamMulai,
      jamSelesai: data.jamSelesai,
      ruangan: data.ruangan,
    }).where(eq(jadwalMengajar.id, id));
    revalidatePath("/dashboard/admin/jadwal");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updateJadwal:", error);
    return { success: false, error: "Gagal memperbarui jadwal." };
  }
}

export async function deleteJadwal(id) {
  try {
    await db.delete(jadwalMengajar).where(eq(jadwalMengajar.id, id));
    revalidatePath("/dashboard/admin/jadwal");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleteJadwal:", error);
    return { success: false, error: "Gagal menghapus jadwal." };
  }
}
