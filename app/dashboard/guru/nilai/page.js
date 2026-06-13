"use client";

import { useState } from "react";
import { Search, Save, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const siswaData = [
  { id: 1, nama: "Ahmad Fauzan", nis: "26001", nilai: "85", catatan: "" },
  { id: 2, nama: "Budi Santoso", nis: "26002", nilai: "90", catatan: "" },
  { id: 3, nama: "Citra Kirana", nis: "26003", nilai: "78", catatan: "" },
  { id: 4, nama: "Deni Rahman", nis: "26004", nilai: "92", catatan: "Sangat baik" },
  { id: 5, nama: "Eka Putri", nis: "26005", nilai: "88", catatan: "" },
];

export default function NilaiPage() {
  const [search, setSearch] = useState("");
  const [nilai, setNilai] = useState(siswaData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleNilaiChange = (id, newNilai) => {
    setNilai(nilai.map(s => s.id === id ? { ...s, nilai: newNilai } : s));
  };

  const handleCatatanChange = (id, newCatatan) => {
    setNilai(nilai.map(s => s.id === id ? { ...s, catatan: newCatatan } : s));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage("");
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Nilai berhasil disimpan!");
      setTimeout(() => setSaveMessage(""), 3000);
    }, 800);
  };

  const filtered = nilai.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Penilaian</h1>
          <p className="text-slate-500 mt-1">Input nilai UH, UTS, UAS, dan Tugas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" /> Export Excel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-1" /> {isSaving ? "Menyimpan..." : "Simpan Nilai"}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{saveMessage}</span>
        </div>
      )}

      <Card className="border-slate-100">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <select className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-md text-sm">
                <option>Kelas 3A</option>
                <option>Kelas 4B</option>
              </select>
              <select className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-md text-sm">
                <option>UH 1: Penjumlahan</option>
                <option>Tugas 1</option>
                <option>UTS</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Cari siswa..." className="pl-10 h-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-4 font-medium">No</th>
                  <th className="p-4 font-medium">NIS</th>
                  <th className="p-4 font-medium">Nama Siswa</th>
                  <th className="p-4 font-medium w-32">Nilai</th>
                  <th className="p-4 font-medium">Catatan (Opsional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((siswa, index) => (
                  <tr key={siswa.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500">{index + 1}</td>
                    <td className="p-4 text-slate-500">{siswa.nis}</td>
                    <td className="p-4 font-medium text-slate-900">{siswa.nama}</td>
                    <td className="p-4">
                      <Input 
                        type="number" 
                        min="0" max="100" 
                        className={`h-8 w-20 text-center font-semibold ${Number(siswa.nilai) < 75 ? 'text-red-600 border-red-200' : 'text-emerald-700'}`} 
                        value={siswa.nilai}
                        onChange={(e) => handleNilaiChange(siswa.id, e.target.value)}
                      />
                    </td>
                    <td className="p-4">
                      <Input 
                        placeholder="Tambahkan catatan..." 
                        className="h-8" 
                        value={siswa.catatan}
                        onChange={(e) => handleCatatanChange(siswa.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
