'use server'

import { db } from "@/lib/db";
import { users, orangtua, siswa, userRoles, roles } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createSiswaDanOrangTua(formData) {
  try {
    const namaSiswa = formData.get('namaSiswa');
    const nis = formData.get('nis');
    const nisn = formData.get('nisn');
    const kelasId = formData.get('kelasId');
    const jenisKelamin = formData.get('jenisKelamin');
    const tempatLahir = formData.get('tempatLahir');
    const tanggalLahir = formData.get('tanggalLahir');
    const alamat = formData.get('alamat');
    
    const namaOrtu = formData.get('namaOrtu');
    const noHp = formData.get('noHp');

    if (!namaSiswa || !nisn || !namaOrtu || !noHp) {
      return { success: false, error: "Semua field wajib diisi." };
    }

    // 1. Cek apakah orang tua dengan No HP ini sudah ada
    const existingOrangTua = await db.select()
      .from(orangtua)
      .where(eq(orangtua.noHp, noHp))
      .limit(1);

    let orangTuaId;

    if (existingOrangTua.length > 0) {
      // Skenario: Orang tua sudah terdaftar (punya anak lain)
      orangTuaId = existingOrangTua[0].id;
    } else {
      // Skenario: Orang tua belum terdaftar, buat akun User dan profil Orang Tua baru
      
      const dummyEmail = `${noHp}@ortu.madrasah.id`;
      
      const passwordHash = await bcrypt.hash(noHp, 10); 

      // Dapatkan role orangtua
      const roleParent = await db.select().from(roles).where(eq(roles.namaRole, 'orangtua')).limit(1);
      const roleId = roleParent.length > 0 ? roleParent[0].id : 5; // Default ke 5 (Orang Tua) jika tidak ketemu

      const [newUser] = await db.insert(users).values({
        namaLengkap: namaOrtu,
        email: dummyEmail, 
        passwordHash: passwordHash,
        isActive: 1,
      }).returning({ id: users.id });

      await db.insert(userRoles).values({
        userId: newUser.id,
        roleId: roleId 
      });

      const [newOrangTua] = await db.insert(orangtua).values({
        userId: newUser.id,
        namaAyah: namaOrtu, 
        noHp: noHp,
      }).returning({ id: orangtua.id });

      orangTuaId = newOrangTua.id;
    }

    // 2. Buat data Siswa dan hubungkan dengan orangTuaId
    await db.insert(siswa).values({
      namaLengkap: namaSiswa,
      nis: nis || null,
      nisn: nisn,
      jenisKelamin: jenisKelamin || null,
      tempatLahir: tempatLahir || null,
      tanggalLahir: tanggalLahir || null,
      alamat: alamat || null,
      kelasId: kelasId ? parseInt(kelasId) : null,
      orangtuaId: orangTuaId, 
      status: "aktif"
    });

    revalidatePath('/dashboard/admin/users');
    return { success: true, message: "Siswa dan Orang Tua berhasil didaftarkan!" };

  } catch (error) {
    console.error("Error creating siswa:", error);
    if (error.message && (error.message.includes("unique") || error.message.includes("duplicate key"))) {
      return { success: false, error: "NISN sudah terdaftar!" };
    }
    return { success: false, error: error.message || "Gagal menyimpan data." };
  }
}

export async function updateSiswaDanOrangTua(siswaId, formData) {
  try {
    const namaSiswa = formData.get('namaSiswa');
    const nis = formData.get('nis');
    const nisn = formData.get('nisn');
    const kelasId = formData.get('kelasId');
    const jenisKelamin = formData.get('jenisKelamin');
    const tempatLahir = formData.get('tempatLahir');
    const tanggalLahir = formData.get('tanggalLahir');
    const alamat = formData.get('alamat');
    
    const namaOrtu = formData.get('namaOrtu');
    const noHp = formData.get('noHp');

    // Ambil orangtuaId saat ini
    const dataSiswa = await db.select().from(siswa).where(eq(siswa.id, siswaId)).limit(1);
    if (dataSiswa.length === 0) throw new Error("Siswa tidak ditemukan");
    
    const orangTuaId = dataSiswa[0].orangtuaId;

    // Update profil orang tua
    if (orangTuaId) {
      await db.update(orangtua)
        .set({
          namaAyah: namaOrtu,
          noHp: noHp
        })
        .where(eq(orangtua.id, orangTuaId));
        
      // Update data user auth (jika email/username pakai noHp)
      const dataOrtu = await db.select().from(orangtua).where(eq(orangtua.id, orangTuaId)).limit(1);
      if (dataOrtu.length > 0 && dataOrtu[0].userId) {
        await db.update(users)
          .set({
            namaLengkap: namaOrtu,
            email: `${noHp}@ortu.madrasah.id`
          })
          .where(eq(users.id, dataOrtu[0].userId));
      }
    }

    // Update siswa
    await db.update(siswa)
      .set({
        namaLengkap: namaSiswa,
        nis: nis || null,
        nisn: nisn,
        jenisKelamin: jenisKelamin || null,
        tempatLahir: tempatLahir || null,
        tanggalLahir: tanggalLahir || null,
        alamat: alamat || null,
        kelasId: kelasId ? parseInt(kelasId) : null,
      })
      .where(eq(siswa.id, siswaId));

    revalidatePath('/dashboard/admin/users');
    return { success: true, message: "Data berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating siswa:", error);
    if (error.message && (error.message.includes("unique") || error.message.includes("duplicate key"))) {
      return { success: false, error: "NISN sudah digunakan oleh siswa lain!" };
    }
    return { success: false, error: "Gagal memperbarui data." };
  }
}

export async function searchOrangTuaByHp(noHp) {
  if (!noHp || noHp.length < 5) return null;
  
  try {
    const result = await db.select()
      .from(orangtua)
      .where(eq(orangtua.noHp, noHp))
      .limit(1);
      
    if (result.length > 0) {
      return {
        id: result[0].id,
        namaAyah: result[0].namaAyah,
        namaIbu: result[0].namaIbu,
        noHp: result[0].noHp
      };
    }
    return null;
  } catch (error) {
    console.error("Error searching orang tua:", error);
    return null;
  }
}

export async function updateKelasSiswaMassal(siswaIds, tujuanKelasId) {
  try {
    if (!siswaIds || siswaIds.length === 0) {
      return { success: false, error: "Tidak ada siswa yang dipilih." };
    }
    
    // Perbarui kelasId untuk semua siswa yang dipilih
    await db.update(siswa)
      .set({ kelasId: tujuanKelasId })
      .where(inArray(siswa.id, siswaIds));

    revalidatePath('/dashboard/admin/rombel');
    revalidatePath('/dashboard/admin/users');
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating kelas:", error);
    return { success: false, error: "Terjadi kesalahan pada database saat memindahkan kelas." };
  }
}

export async function toggleStatusSiswa(siswaId, newStatus) {
  try {
    await db.update(siswa)
      .set({ status: newStatus })
      .where(eq(siswa.id, siswaId));
      
    revalidatePath('/dashboard/admin/users');
    return { success: true };
  } catch (error) {
    console.error("Error toggling status:", error);
    return { success: false, error: "Gagal merubah status siswa." };
  }
}

export async function hapusSiswaPermanen(siswaId) {
  try {
    // 1. Ambil data siswa untuk mendapatkan orangtuaId
    const dataSiswa = await db.select().from(siswa).where(eq(siswa.id, siswaId)).limit(1);
    if (dataSiswa.length === 0) return { success: false, error: "Siswa tidak ditemukan." };
    
    const orangTuaId = dataSiswa[0].orangtuaId;

    // 2. Hapus Siswa
    await db.delete(siswa).where(eq(siswa.id, siswaId));

    // 3. Cek apakah orang tua ini masih memiliki anak lain
    if (orangTuaId) {
      const anakLain = await db.select().from(siswa).where(eq(siswa.orangtuaId, orangTuaId));
      
      // Jika tidak ada anak lain, hapus orang tua dan user akunnya
      if (anakLain.length === 0) {
        const dataOrtu = await db.select().from(orangtua).where(eq(orangtua.id, orangTuaId)).limit(1);
        if (dataOrtu.length > 0 && dataOrtu[0].userId) {
          const userId = dataOrtu[0].userId;
          
          // Hapus entri orangtua
          await db.delete(orangtua).where(eq(orangtua.id, orangTuaId));
          
          // Hapus akun user
          const { users } = await import("@/lib/db/schema");
          await db.delete(users).where(eq(users.id, userId));
        }
      }
    }

    revalidatePath('/dashboard/admin/users');
    return { success: true };
  } catch (error) {
    console.error("Error hard deleting siswa:", error);
    return { success: false, error: "Gagal menghapus data siswa secara permanen." };
  }
}
