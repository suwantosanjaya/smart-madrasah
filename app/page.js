import { db } from "@/lib/db";
import { madrasah } from "@/lib/db/schema";
import LandingClient from "./LandingClient";

export default async function HomePage() {
  const [profil] = await db.select().from(madrasah).limit(1);
  return <LandingClient profil={profil} />;
}
