import { db } from "@/lib/db";
import { rpp, mapel } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import RPPClient from "./RPPClient";

export const metadata = {
  title: "RPP / Modul Ajar | Smart Madrasah",
};

export default async function Page() {
  // Ambil data dari database secara real-time
  const rppData = await db.select().from(rpp).orderBy(desc(rpp.updatedAt));
  const mapelData = await db.select().from(mapel);

  return <RPPClient initialData={rppData} initialMapel={mapelData} />;
}
