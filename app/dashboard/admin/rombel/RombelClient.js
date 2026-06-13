"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Search, Users, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { updateKelasSiswaMassal } from "@/app/actions/siswaActions";
import { useRouter } from "next/navigation";

export default function RombelClient({ daftarTahunAjaran, daftarKelas, daftarSiswa }) {
  const router = useRouter();
  
  // State Filter Kiri (Kelas Asal)
  const [asalTahunAjaranId, setAsalTahunAjaranId] = useState("");
  const [asalKelasId, setAsalKelasId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State Filter Kanan (Kelas Tujuan)
  const [tujuanTahunAjaranId, setTujuanTahunAjaranId] = useState("");
  const [tujuanKelasId, setTujuanKelasId] = useState("");
  
  // State Seleksi
  const [selectedSiswaIds, setSelectedSiswaIds] = useState([]);
  
  // State Loading & Notifikasi
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Derivasi Data: Kelas berdasarkan Tahun Ajaran yang dipilih
  const kelasAsalTersedia = daftarKelas.filter(k => k.tahunAjaranId === parseInt(asalTahunAjaranId));
  const kelasTujuanTersedia = daftarKelas.filter(k => k.tahunAjaranId === parseInt(tujuanTahunAjaranId));

  // Derivasi Data: Siswa yang tampil di tabel kiri
  const siswaTampil = useMemo(() => {
    let filtered = daftarSiswa;
    
    // Filter berdasarkan kelas asal
    if (asalKelasId === "belum_ada") {
      filtered = filtered.filter(s => s.kelasId === null);
    } else if (asalKelasId) {
      filtered = filtered.filter(s => s.kelasId === parseInt(asalKelasId));
    }
    
    // Filter berdasarkan pencarian
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.namaLengkap.toLowerCase().includes(q) || 
        (s.nisn && s.nisn.includes(q))
      );
    }
    
    return filtered;
  }, [daftarSiswa, asalKelasId, searchQuery]);

  // Handler Select All
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSiswaIds(siswaTampil.map(s => s.id));
    } else {
      setSelectedSiswaIds([]);
    }
  };

  // Handler Individual Checkbox
  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedSiswaIds(prev => [...prev, id]);
    } else {
      setSelectedSiswaIds(prev => prev.filter(sId => sId !== id));
    }
  };

  // Proses Pindah Kelas
  const handlePindahKelas = async () => {
    if (selectedSiswaIds.length === 0) {
      setMessage({ type: "error", text: "Pilih minimal 1 siswa untuk dipindahkan." });
      return;
    }
    if (!tujuanKelasId) {
      setMessage({ type: "error", text: "Pilih Kelas Tujuan terlebih dahulu." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await updateKelasSiswaMassal(selectedSiswaIds, parseInt(tujuanKelasId));
      if (res.success) {
        setMessage({ type: "success", text: `${selectedSiswaIds.length} siswa berhasil dipindahkan ke kelas baru!` });
        setSelectedSiswaIds([]); // Reset seleksi
        router.refresh(); // Refresh data dari server
      } else {
        setMessage({ type: "error", text: res.error || "Gagal memindahkan siswa." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Kolom Kiri: Sumber Siswa */}
      <Card className="lg:col-span-7 border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Sumber Siswa (Kelas Asal)
          </CardTitle>
          <CardDescription>Pilih siswa yang ingin dipindahkan</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          
          {/* Filter Bar Kiri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <Label className="text-xs mb-1.5 block text-slate-500">Tahun Ajaran Asal</Label>
              <select 
                className="w-full text-sm border-slate-200 rounded-lg h-9 px-3"
                value={asalTahunAjaranId}
                onChange={(e) => {
                  setAsalTahunAjaranId(e.target.value);
                  setAsalKelasId("");
                  setSelectedSiswaIds([]);
                }}
              >
                <option value="">Pilih Tahun Ajaran</option>
                {daftarTahunAjaran.map(t => (
                  <option key={t.id} value={t.id}>{t.nama} - {t.semester}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block text-slate-500">Kelas Asal</Label>
              <select 
                className="w-full text-sm border-slate-200 rounded-lg h-9 px-3 disabled:bg-slate-100"
                value={asalKelasId}
                onChange={(e) => {
                  setAsalKelasId(e.target.value);
                  setSelectedSiswaIds([]);
                }}
                disabled={!asalTahunAjaranId && asalKelasId !== "belum_ada"}
              >
                <option value="">Pilih Kelas</option>
                <option value="belum_ada" className="font-semibold text-amber-600">-- Siswa Baru (Belum ada kelas) --</option>
                {kelasAsalTersedia.map(k => (
                  <option key={k.id} value={k.id}>Tingkat {k.tingkat} - {k.namaKelas}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari nama atau NISN..." 
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabel Siswa */}
          <div className="border border-slate-200 rounded-xl overflow-hidden h-[400px] flex flex-col">
            <div className="bg-slate-100 px-4 py-2 flex items-center gap-3 border-b border-slate-200">
              <input 
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                checked={siswaTampil.length > 0 && selectedSiswaIds.length === siswaTampil.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                disabled={siswaTampil.length === 0}
              />
              <span className="text-xs font-semibold text-slate-600">Pilih Semua ({siswaTampil.length} siswa)</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
              {siswaTampil.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-400 text-center px-4">
                  Tidak ada siswa yang ditemukan di kelas ini.
                </div>
              ) : (
                siswaTampil.map(siswa => (
                  <label key={siswa.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-colors shadow-sm">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedSiswaIds.includes(siswa.id)}
                      onChange={(e) => handleSelectOne(e.target.checked, siswa.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{siswa.namaLengkap}</p>
                      <p className="text-[11px] text-slate-500">NISN: {siswa.nisn || "-"} • NIS: {siswa.nis || "-"}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Kolom Kanan: Tujuan & Aksi */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Card Tujuan */}
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-emerald-600" />
              Kelas Tujuan
            </CardTitle>
            <CardDescription>Pilih tujuan rombel untuk {selectedSiswaIds.length} siswa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div>
              <Label className="text-sm font-semibold mb-1.5 block text-slate-700">Tahun Ajaran Tujuan</Label>
              <select 
                className="w-full text-sm border-slate-200 rounded-lg h-10 px-3 focus:border-emerald-500 focus:ring-emerald-500"
                value={tujuanTahunAjaranId}
                onChange={(e) => {
                  setTujuanTahunAjaranId(e.target.value);
                  setTujuanKelasId("");
                }}
              >
                <option value="">Pilih Tahun Ajaran</option>
                {daftarTahunAjaran.map(t => (
                  <option key={t.id} value={t.id}>{t.nama} - {t.semester}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label className="text-sm font-semibold mb-1.5 block text-slate-700">Kelas Tujuan</Label>
              <select 
                className="w-full text-sm border-slate-200 rounded-lg h-10 px-3 disabled:bg-slate-100 focus:border-emerald-500 focus:ring-emerald-500"
                value={tujuanKelasId}
                onChange={(e) => setTujuanKelasId(e.target.value)}
                disabled={!tujuanTahunAjaranId}
              >
                <option value="">Pilih Kelas</option>
                {kelasTujuanTersedia.map(k => (
                  <option key={k.id} value={k.id}>Tingkat {k.tingkat} - {k.namaKelas}</option>
                ))}
              </select>
            </div>

          </CardContent>
        </Card>

        {/* Panel Aksi & Status */}
        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-6">
            
            {message.text && (
              <div className={`p-3 rounded-lg flex items-start gap-2 mb-4 text-sm ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <p>{message.text}</p>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-center">
              <p className="text-3xl font-black text-blue-600 mb-1">{selectedSiswaIds.length}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Siswa Terpilih</p>
            </div>

            <Button 
              className="w-full h-12 text-base font-semibold shadow-lg"
              size="lg"
              onClick={handlePindahKelas}
              disabled={selectedSiswaIds.length === 0 || !tujuanKelasId || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sedang Memproses...
                </>
              ) : (
                <>
                  Pindahkan {selectedSiswaIds.length > 0 ? selectedSiswaIds.length : ""} Siswa Sekarang
                </>
              )}
            </Button>
            
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
