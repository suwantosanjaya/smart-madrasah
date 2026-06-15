"use client";

import { useState, useTransition } from "react";
import { Search, Plus, History, Edit, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { saveHafalan } from "@/app/actions/tahfizhActions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const juzToSurahs = {
  1: [{id: 1, name: "Al-Fatihah"}, {id: 2, name: "Al-Baqarah"}],
  2: [{id: 2, name: "Al-Baqarah"}],
  3: [{id: 2, name: "Al-Baqarah"}, {id: 3, name: "Ali 'Imran"}],
  4: [{id: 3, name: "Ali 'Imran"}, {id: 4, name: "An-Nisa'"}],
  5: [{id: 4, name: "An-Nisa'"}],
  6: [{id: 4, name: "An-Nisa'"}, {id: 5, name: "Al-Ma'idah"}],
  7: [{id: 5, name: "Al-Ma'idah"}, {id: 6, name: "Al-An'am"}],
  8: [{id: 6, name: "Al-An'am"}, {id: 7, name: "Al-A'raf"}],
  9: [{id: 7, name: "Al-A'raf"}, {id: 8, name: "Al-Anfal"}],
  10: [{id: 8, name: "Al-Anfal"}, {id: 9, name: "At-Taubah"}],
  11: [{id: 9, name: "At-Taubah"}, {id: 10, name: "Yunus"}, {id: 11, name: "Hud"}],
  12: [{id: 11, name: "Hud"}, {id: 12, name: "Yusuf"}],
  13: [{id: 12, name: "Yusuf"}, {id: 13, name: "Ar-Ra'd"}, {id: 14, name: "Ibrahim"}],
  14: [{id: 15, name: "Al-Hijr"}, {id: 16, name: "An-Nahl"}],
  15: [{id: 17, name: "Al-Isra'"}, {id: 18, name: "Al-Kahf"}],
  16: [{id: 18, name: "Al-Kahf"}, {id: 19, name: "Maryam"}, {id: 20, name: "Taha"}],
  17: [{id: 21, name: "Al-Anbiya'"}, {id: 22, name: "Al-Hajj"}],
  18: [{id: 23, name: "Al-Mu'minun"}, {id: 24, name: "An-Nur"}, {id: 25, name: "Al-Furqan"}],
  19: [{id: 25, name: "Al-Furqan"}, {id: 26, name: "Asy-Syu'ara'"}, {id: 27, name: "An-Naml"}],
  20: [{id: 27, name: "An-Naml"}, {id: 28, name: "Al-Qasas"}, {id: 29, name: "Al-'Ankabut"}],
  21: [{id: 29, name: "Al-'Ankabut"}, {id: 30, name: "Ar-Rum"}, {id: 31, name: "Luqman"}, {id: 32, name: "As-Sajdah"}, {id: 33, name: "Al-Ahzab"}],
  22: [{id: 33, name: "Al-Ahzab"}, {id: 34, name: "Saba'"}, {id: 35, name: "Fatir"}, {id: 36, name: "Ya Sin"}],
  23: [{id: 36, name: "Ya Sin"}, {id: 37, name: "As-Saffat"}, {id: 38, name: "Sad"}, {id: 39, name: "Az-Zumar"}],
  24: [{id: 39, name: "Az-Zumar"}, {id: 40, name: "Ghafir"}, {id: 41, name: "Fussilat"}],
  25: [{id: 41, name: "Fussilat"}, {id: 42, name: "Asy-Syura"}, {id: 43, name: "Az-Zukhruf"}, {id: 44, name: "Ad-Dukhan"}, {id: 45, name: "Al-Jasiyah"}],
  26: [{id: 46, name: "Al-Ahqaf"}, {id: 47, name: "Muhammad"}, {id: 48, name: "Al-Fath"}, {id: 49, name: "Al-Hujurat"}, {id: 50, name: "Qaf"}, {id: 51, name: "Az-Zariyat"}],
  27: [{id: 51, name: "Az-Zariyat"}, {id: 52, name: "At-Tur"}, {id: 53, name: "An-Najm"}, {id: 54, name: "Al-Qamar"}, {id: 55, name: "Ar-Rahman"}, {id: 56, name: "Al-Waqi'ah"}, {id: 57, name: "Al-Hadid"}],
  28: [{id: 58, name: "Al-Mujadilah"}, {id: 59, name: "Al-Hasyr"}, {id: 60, name: "Al-Mumtahanah"}, {id: 61, name: "As-Saff"}, {id: 62, name: "Al-Jumu'ah"}, {id: 63, name: "Al-Munafiqun"}, {id: 64, name: "At-Tagabun"}, {id: 65, name: "At-Talaq"}, {id: 66, name: "At-Tahrim"}],
  29: [{id: 67, name: "Al-Mulk"}, {id: 68, name: "Al-Qalam"}, {id: 69, name: "Al-Haqqah"}, {id: 70, name: "Al-Ma'arij"}, {id: 71, name: "Nuh"}, {id: 72, name: "Al-Jinn"}, {id: 73, name: "Al-Muzzammil"}, {id: 74, name: "Al-Muddassir"}, {id: 75, name: "Al-Qiyamah"}, {id: 76, name: "Al-Insan"}, {id: 77, name: "Al-Mursalat"}],
  30: [{id: 78, name: "An-Naba'"}, {id: 79, name: "An-Nazi'at"}, {id: 80, name: "'Abasa"}, {id: 81, name: "At-Takwir"}, {id: 82, name: "Al-Infitar"}, {id: 83, name: "Al-Mutaffifin"}, {id: 84, name: "Al-Insyiqaq"}, {id: 85, name: "Al-Buruj"}, {id: 86, name: "At-Tariq"}, {id: 87, name: "Al-A'la"}, {id: 88, name: "Al-Gasyiyah"}, {id: 89, name: "Al-Fajr"}, {id: 90, name: "Al-Balad"}, {id: 91, name: "Asy-Syams"}, {id: 92, name: "Al-Lail"}, {id: 93, name: "Ad-Duha"}, {id: 94, name: "Asy-Syarh"}, {id: 95, name: "At-Tin"}, {id: 96, name: "Al-'Alaq"}, {id: 97, name: "Al-Qadr"}, {id: 98, name: "Al-Bayyinah"}, {id: 99, name: "Az-Zalzalah"}, {id: 100, name: "Al-'Adiyat"}, {id: 101, name: "Al-Qari'ah"}, {id: 102, name: "At-Takasur"}, {id: 103, name: "Al-'Asr"}, {id: 104, name: "Al-Humazah"}, {id: 105, name: "Al-Fil"}, {id: 106, name: "Quraisy"}, {id: 107, name: "Al-Ma'un"}, {id: 108, name: "Al-Kausar"}, {id: 109, name: "Al-Kafirun"}, {id: 110, name: "An-Nasr"}, {id: 111, name: "Al-Lahab"}, {id: 112, name: "Al-Ikhlas"}, {id: 113, name: "Al-Falaq"}, {id: 114, name: "An-Nas"}]
};

export default function TahfizhClient({ kelompok, santriList, guruId }) {
  const [activeKelompokId, setActiveKelompokId] = useState(kelompok[0]?.id || null);
  const [search, setSearch] = useState("");
  
  const [isSetorOpen, setIsSetorOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [messageDialog, setMessageDialog] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const [formData, setFormData] = useState({
    surah: "",
    juz: "",
    ayatMulai: "",
    ayatSelesai: "",
    status: "Lancar",
    nilaiTajwid: 80,
    nilaiKelancaran: 80,
    nilaiMakhorijul: 80,
    catatan: "",
  });

  const activeSantriList = santriList.filter(s => s.kelompokId === activeKelompokId);
  const filtered = activeSantriList.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()) || (s.nis && s.nis.includes(search)));

  const handleOpenSetor = (siswa) => {
    setSelectedSantri(siswa);
    setFormData({ 
      surah: "", juz: "", ayatMulai: "", ayatSelesai: "", 
      status: "Lancar", nilaiTajwid: 80, nilaiKelancaran: 80, nilaiMakhorijul: 80, catatan: "" 
    });
    setIsSetorOpen(true);
  };

  const handleSave = () => {
    if (!formData.juz || !formData.surah) {
      setMessageDialog({ isOpen: true, title: "Data Belum Lengkap", message: "Mohon pilih Juz dan Surah terlebih dahulu.", type: "error" });
      return;
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        siswaId: selectedSantri.id,
        guruId: guruId
      };
      
      const res = await saveHafalan(payload);
      if (res.success) {
        setIsSetorOpen(false);
        setMessageDialog({ isOpen: true, title: "Berhasil", message: res.message, type: "success" });
      } else {
        setMessageDialog({ isOpen: true, title: "Gagal", message: res.error, type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monitoring Tahfizh</h1>
          <p className="text-slate-500 mt-1">Catat progress hafalan santri di halaqah Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-1" /> Riwayat Lengkap
          </Button>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="w-full sm:w-auto min-w-[200px]">
              <select 
                className="h-10 w-full px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={activeKelompokId || ""}
                onChange={(e) => setActiveKelompokId(parseInt(e.target.value))}
              >
                {kelompok.map(k => (
                  <option key={k.id} value={k.id}>{k.namaKelompok}</option>
                ))}
              </select>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Cari santri..." 
                className="pl-10 h-10 w-full" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-4 font-medium">Santri</th>
                  <th className="p-4 font-medium">Setoran Terakhir</th>
                  <th className="p-4 font-medium">Ayat</th>
                  <th className="p-4 font-medium">Kualitas Hafalan</th>
                  <th className="p-4 font-medium">Rata-rata Nilai</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{siswa.nama}</p>
                      <p className="text-xs text-slate-500">NIS: {siswa.nis || "-"}</p>
                    </td>
                    <td className="p-4 font-medium text-emerald-700">{siswa.surahTerakhir}</td>
                    <td className="p-4 text-slate-600">{siswa.ayat}</td>
                    <td className="p-4">
                      <Badge className={
                        siswa.status === "Lancar" ? "bg-emerald-100 text-emerald-800" : 
                        siswa.status === "Belum Ada" ? "bg-slate-100 text-slate-500" :
                        "bg-amber-100 text-amber-800"
                      } variant="outline">
                        {siswa.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{siswa.nilai > 0 ? siswa.nilai.toFixed(1) : "-"}</td>
                    <td className="p-4 text-right">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleOpenSetor(siswa)}>
                        <Plus className="w-4 h-4 mr-1" /> Setor Baru
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-white">
                <p>Belum ada santri di kelompok halaqah ini.</p>
                <p className="text-xs mt-1">Admin perlu menambahkan anggota ke kelompok ini terlebih dahulu.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSetorOpen} onOpenChange={setIsSetorOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Catat Setoran Hafalan</DialogTitle>
            <DialogDescription>Santri: <strong className="text-slate-900">{selectedSantri?.nama}</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label>Juz <span className="text-red-500">*</span></Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.juz}
                  onChange={(e) => {
                    const newJuz = e.target.value;
                    const newSurah = newJuz && juzToSurahs[newJuz] ? juzToSurahs[newJuz][0].name : "";
                    setFormData({...formData, juz: newJuz, surah: newSurah});
                  }}
                >
                  <option value="">Pilih</option>
                  {Array.from({length: 30}, (_, i) => i + 1).map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-5 space-y-2">
                <Label>Surah <span className="text-red-500">*</span></Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
                  value={formData.surah}
                  onChange={(e) => setFormData({...formData, surah: e.target.value})}
                  disabled={!formData.juz}
                >
                  <option value="">-- Pilih Surah --</option>
                  {formData.juz && juzToSurahs[formData.juz]?.map((s) => (
                    <option key={s.id} value={s.name}>{s.id}. {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 space-y-2">
                <Label>Kualitas Hafalan</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Lancar">Lancar (Mumtaz)</option>
                  <option value="Perlu Murojaah">Perlu Murojaah (Jayyid)</option>
                  <option value="Terbata-bata">Terbata-bata (Maqbul)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ayat Mulai</Label>
                <Input 
                  type="number"
                  value={formData.ayatMulai} 
                  onChange={(e) => setFormData({...formData, ayatMulai: e.target.value})} 
                  placeholder="Misal: 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Ayat Selesai</Label>
                <Input 
                  type="number"
                  value={formData.ayatSelesai} 
                  onChange={(e) => setFormData({...formData, ayatSelesai: e.target.value})} 
                  placeholder="Misal: 10"
                />
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
              <Label className="text-emerald-800 font-semibold">Penilaian Rinci (0-100)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tajwid</Label>
                  <Input type="number" min="0" max="100" className="h-8 text-sm" value={formData.nilaiTajwid} onChange={e => setFormData({...formData, nilaiTajwid: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kelancaran</Label>
                  <Input type="number" min="0" max="100" className="h-8 text-sm" value={formData.nilaiKelancaran} onChange={e => setFormData({...formData, nilaiKelancaran: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Makhorijul H.</Label>
                  <Input type="number" min="0" max="100" className="h-8 text-sm" value={formData.nilaiMakhorijul} onChange={e => setFormData({...formData, nilaiMakhorijul: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Catatan Tambahan (Opsional)</Label>
              <Input 
                value={formData.catatan} 
                onChange={(e) => setFormData({...formData, catatan: e.target.value})} 
                placeholder="Misal: Perbaiki pelafalan huruf Dho"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSetorOpen(false)} disabled={isPending}>Batal</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Setoran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setMessageDialog(prev => ({ ...prev, isOpen: false }));
          if (messageDialog.type === "success") {
            window.location.reload();
          }
        }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center justify-center pt-4 pb-2 text-center">
            {messageDialog.type === "success" ? (
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <DialogTitle className="text-xl mb-2">{messageDialog.title}</DialogTitle>
            <DialogDescription className="text-slate-600 text-base">
              {messageDialog.message}
            </DialogDescription>
          </div>
          <DialogFooter className="sm:justify-center mt-2">
            <Button 
              onClick={() => {
                setMessageDialog(prev => ({ ...prev, isOpen: false }));
                if (messageDialog.type === "success") window.location.reload();
              }}
              className={messageDialog.type === "success" ? "bg-emerald-600 hover:bg-emerald-700 w-full" : "bg-slate-900 hover:bg-slate-800 w-full"}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
