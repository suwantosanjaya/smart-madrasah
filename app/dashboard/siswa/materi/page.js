"use client";

import { Construction } from "lucide-react";

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-emerald-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Halaman Materi</h1>
      <p className="text-slate-500 max-w-md mx-auto">
        Halaman ini sedang dalam tahap pengembangan (Fase 2). Fitur ini akan segera tersedia untuk Smart Madrasah.
      </p>
    </div>
  );
}