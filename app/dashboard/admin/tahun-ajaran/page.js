import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tahunAjaran } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import TahunAjaranClient from "./TahunAjaranClient";

export const metadata = {
  title: "Kelola Tahun Ajaran | Smart Madrasah",
};

export default async function TahunAjaranPage() {
  const session = await auth();
  
  if (!session || !session.user || session.user.activeRole !== "admin") {
    redirect("/login");
  }

  const data = await db.select().from(tahunAjaran).orderBy(desc(tahunAjaran.tanggalMulai));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Tahun Ajaran</h1>
        <p className="text-slate-500 mt-1">Kelola data tahun akademik dan semester untuk sistem madrasah.</p>
      </div>

      <TahunAjaranClient initialData={data} />
    </div>
  );
}