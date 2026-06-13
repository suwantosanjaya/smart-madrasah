import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { madrasah } from "@/lib/db/schema";
import { School } from "lucide-react";
import MadrasahForm from "./MadrasahForm";

export const metadata = {
  title: "Profil Madrasah | Smart Madrasah",
  description: "Kelola profil dan identitas Madrasah",
};

export default async function MadrasahPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (!["super_admin", "admin"].includes(session.user.activeRole)) {
    redirect("/dashboard");
  }

  // Ambil data madrasah (biasanya hanya ada 1 record)
  const madrasahData = await db.select().from(madrasah).limit(1);
  const data = madrasahData.length > 0 ? madrasahData[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <School className="w-5 h-5 text-white" />
          </div>
          Profil Madrasah
        </h1>
        <p className="text-slate-500 text-sm mt-1 ml-11">
          Kelola informasi identitas, kontak, serta visi dan misi madrasah.
        </p>
      </div>

      <MadrasahForm data={data} />
    </div>
  );
}