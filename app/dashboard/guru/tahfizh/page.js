import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelompokTahfizh, anggotaTahfizh, siswa, hafalan, guru } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import TahfizhClient from "./TahfizhClient";

export const metadata = {
  title: "Penilaian Tahfizh | Smart Madrasah",
};

export default async function TahfizhPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Get Guru ID
  const guruData = await db.select().from(guru).where(eq(guru.userId, session.user.id)).limit(1);
  if (guruData.length === 0) {
    return <div className="p-8 text-center text-red-500">Profil guru tidak ditemukan. Hubungi Administrator.</div>;
  }
  const myGuruId = guruData[0].id;

  // 1. Fetch groups (Halaqah) assigned to this teacher
  const myGroups = await db.select().from(kelompokTahfizh).where(eq(kelompokTahfizh.guruId, myGuruId));

  if (myGroups.length === 0) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Kelompok Tahfizh</h2>
        <p className="text-slate-500">Anda belum ditugaskan sebagai Muhaffizh di kelompok halaqah mana pun. Silakan hubungi Administrator.</p>
      </div>
    );
  }

  // 2. Fetch all members and their latest hafalan for these groups
  const groupIds = myGroups.map(g => g.id);
  
  // We fetch members manually for simplicity
  const membersRaw = await db.select({
    kelompokId: anggotaTahfizh.kelompokId,
    siswaId: anggotaTahfizh.siswaId,
    namaSiswa: siswa.namaLengkap,
    nis: siswa.nis,
  })
  .from(anggotaTahfizh)
  .innerJoin(siswa, eq(anggotaTahfizh.siswaId, siswa.id));
  
  // Filter members that belong to my groups
  const myMembers = membersRaw.filter(m => groupIds.includes(m.kelompokId));
  const myMemberIds = myMembers.map(m => m.siswaId);

  // Fetch hafalan records for these members
  let allHafalan = [];
  if (myMemberIds.length > 0) {
    allHafalan = await db.select().from(hafalan).orderBy(desc(hafalan.tanggalSetor));
  }

  // Map latest hafalan to each member
  const santriList = myMembers.map(m => {
    const siswaHafalan = allHafalan.filter(h => h.siswaId === m.siswaId);
    const latest = siswaHafalan[0]; // because it's ordered by desc
    
    return {
      id: m.siswaId,
      kelompokId: m.kelompokId,
      nama: m.namaSiswa,
      nis: m.nis,
      surahTerakhir: latest ? latest.surah : "-",
      ayat: latest ? `${latest.ayatMulai}-${latest.ayatSelesai}` : "-",
      status: latest ? latest.status : "Belum Ada",
      nilai: latest ? ((latest.nilaiTajwid || 0) + (latest.nilaiKelancaran || 0) + (latest.nilaiMakhorijul || 0)) / 3 : 0,
    };
  });

  return (
    <TahfizhClient 
      kelompok={myGroups} 
      santriList={santriList}
      guruId={myGuruId}
    />
  );
}
