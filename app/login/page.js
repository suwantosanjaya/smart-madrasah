import { db } from "@/lib/db";
import { madrasah } from "@/lib/db/schema";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Login - Smart Madrasah",
  description: "Sistem Informasi Pembelajaran Cerdas berbasis AI",
};

export default async function LoginPage() {
  const [profil] = await db.select().from(madrasah).limit(1);
  return <LoginClient profil={profil} />;
}
