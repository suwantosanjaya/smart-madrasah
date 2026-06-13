"use client";

import { useState } from "react";
import { Users, CheckCircle2, XCircle, AlertCircle, Clock, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const siswaData = [
  { id: 1, nama: "Ahmad Fauzan", nis: "26001", status: "hadir" },
  { id: 2, nama: "Budi Santoso", nis: "26002", status: "sakit" },
  { id: 3, nama: "Citra Kirana", nis: "26003", status: "izin" },
  { id: 4, nama: "Deni Rahman", nis: "26004", status: "hadir" },
  { id: 5, nama: "Eka Putri", nis: "26005", status: "alpha" },
];

export default function AbsensiPage() {
  const [absensi, setAbsensi] = useState(siswaData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const updateStatus = (id, status) => {
    setAbsensi(absensi.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage("");
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Absensi berhasil disimpan!");
      setTimeout(() => setSaveMessage(""), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Absensi Kelas</h1>
          <p className="text-slate-500 mt-1">Input kehadiran siswa hari ini</p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-md text-sm">
            <option>Kelas 3A - Matematika</option>
            <option>Kelas 4B - Matematika</option>
          </select>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-1" /> {isSaving ? "Menyimpan..." : "Simpan Absensi"}
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold">Daftar Siswa (Kelas 3A)</CardTitle>
            <span className="text-sm text-slate-500">{new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {absensi.map((siswa) => (
              <div key={siswa.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="mb-3 sm:mb-0">
                  <p className="font-medium text-slate-900">{siswa.nama}</p>
                  <p className="text-xs text-slate-500">NIS: {siswa.nis}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant={siswa.status === "hadir" ? "default" : "outline"}
                    className={siswa.status === "hadir" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    onClick={() => updateStatus(siswa.id, "hadir")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Hadir
                  </Button>
                  <Button 
                    size="sm" 
                    variant={siswa.status === "sakit" ? "default" : "outline"}
                    className={siswa.status === "sakit" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    onClick={() => updateStatus(siswa.id, "sakit")}
                  >
                    <Clock className="w-4 h-4 mr-1" /> Sakit
                  </Button>
                  <Button 
                    size="sm" 
                    variant={siswa.status === "izin" ? "default" : "outline"}
                    className={siswa.status === "izin" ? "bg-amber-500 hover:bg-amber-600" : ""}
                    onClick={() => updateStatus(siswa.id, "izin")}
                  >
                    <AlertCircle className="w-4 h-4 mr-1" /> Izin
                  </Button>
                  <Button 
                    size="sm" 
                    variant={siswa.status === "alpha" ? "default" : "outline"}
                    className={siswa.status === "alpha" ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => updateStatus(siswa.id, "alpha")}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Alpha
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
