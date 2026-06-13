import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { madrasah } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
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

  return (
    <DashboardLayoutClient session={session} madrasahName={madrasahName}>
      {children}
    </DashboardLayoutClient>
  );
}
