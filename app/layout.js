import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Smart Madrasah — MI Tahfizh Cendekia Pekanbaru",
  description:
    "Sistem Informasi Pembelajaran Cerdas berbasis AI untuk MI Tahfizh Cendekia Pekanbaru. Kelola RPP, bahan ajar, evaluasi, absensi, dan tahfizh secara digital.",
  keywords: "smart madrasah, MI Tahfizh Cendekia, Pekanbaru, AI, pendidikan, kurikulum merdeka",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
