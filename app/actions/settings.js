"use server";

import { db } from "@/lib/db";
import { pengaturanSistem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Mengambil semua pengaturan ke dalam bentuk object { kunci: nilai }
export async function getSettings() {
  try {
    const rows = await db.select().from(pengaturanSistem);
    const settingsMap = {};
    rows.forEach(row => {
      settingsMap[row.kunci] = row.nilai;
    });
    return { success: true, data: settingsMap };
  } catch (error) {
    console.error("Error getSettings:", error);
    return { success: false, error: "Gagal mengambil pengaturan" };
  }
}

// Menyimpan atau memperbarui pengaturan (menerima array of objects [{kunci, nilai, deskripsi}])
export async function updateSettings(settingsArray) {
  try {
    for (const item of settingsArray) {
      if (!item.kunci) continue;
      
      const existing = await db.select().from(pengaturanSistem).where(eq(pengaturanSistem.kunci, item.kunci));
      
      if (existing.length > 0) {
        await db.update(pengaturanSistem)
          .set({ nilai: item.nilai, deskripsi: item.deskripsi, updatedAt: new Date().toISOString() })
          .where(eq(pengaturanSistem.kunci, item.kunci));
      } else {
        await db.insert(pengaturanSistem).values({
          kunci: item.kunci,
          nilai: item.nilai,
          deskripsi: item.deskripsi,
        });
      }
    }
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updateSettings:", error);
    return { success: false, error: "Gagal memperbarui pengaturan" };
  }
}
