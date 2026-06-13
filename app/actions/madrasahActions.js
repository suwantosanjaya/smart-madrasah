"use server";

import { db } from "@/lib/db";
import { madrasah } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateMadrasah(formData) {
  try {
    const session = await auth();
    // Allow either super_admin or admin
    if (!session || !["super_admin", "admin"].includes(session.user.activeRole)) {
      return { success: false, error: "Akses ditolak. Anda tidak memiliki izin." };
    }

    const data = {
      nama: formData.get("nama"),
      npsn: formData.get("npsn"),
      alamat: formData.get("alamat"),
      kota: formData.get("kota"),
      provinsi: formData.get("provinsi"),
      telepon: formData.get("telepon"),
      email: formData.get("email"),
      kepalaMadrasah: formData.get("kepalaMadrasah"),
      visi: formData.get("visi"),
      misi: formData.get("misi"),
    };

    if (!data.nama) {
      return { success: false, error: "Nama madrasah wajib diisi." };
    }

    // Check if a madrasah record exists
    const existing = await db.select().from(madrasah).limit(1);

    if (existing && existing.length > 0) {
      await db.update(madrasah).set(data);
    } else {
      await db.insert(madrasah).values(data);
    }

    revalidatePath("/dashboard/admin/madrasah");
    return { success: true, message: "Profil madrasah berhasil diperbarui." };

  } catch (error) {
    console.error("Error updating madrasah:", error);
    return { success: false, error: "Terjadi kesalahan saat menyimpan profil madrasah." };
  }
}
