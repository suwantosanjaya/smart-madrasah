import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { madrasah, guru, kelas, kelompokTahfizh } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session?.user?.mustChangePassword === 1) {
    redirect("/ganti-password");
  }

  // Fetch the current madrasah name
  let madrasahName = "Smart Madrasah";
  try {
    const [madrasahData] = await db.select({ nama: madrasah.nama }).from(madrasah).limit(1);
    if (madrasahData && madrasahData.nama) {
      madrasahName = madrasahData.nama;
    }
  } catch (e) {
    console.error("Error fetching madrasah name for layout:", e);
  }

  let teacherAccess = { isWaliKelas: false, isGuruTahfizh: false };

  if (session?.user?.activeRole === "guru" && session?.user?.id) {
    try {
      const [guruRecord] = await db.select({ id: guru.id }).from(guru).where(eq(guru.userId, parseInt(session.user.id))).limit(1);
      if (guruRecord) {
        const [waliKelas] = await db.select({ id: kelas.id }).from(kelas).where(eq(kelas.waliKelasId, guruRecord.id)).limit(1);
        if (waliKelas) teacherAccess.isWaliKelas = true;
        
        const [tahfizhJadwal] = await db.select({ id: kelompokTahfizh.id })
          .from(kelompokTahfizh)
          .where(eq(kelompokTahfizh.guruId, guruRecord.id))
          .limit(1);
        if (tahfizhJadwal) teacherAccess.isGuruTahfizh = true;
      }
    } catch (e) {
      console.error("Error fetching teacher access:", e);
    }
  }

  return (
    <DashboardLayoutClient session={session} madrasahName={madrasahName} teacherAccess={teacherAccess}>
      {children}
    </DashboardLayoutClient>
  );
}
