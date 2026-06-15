"use client";

import { useState, useTransition } from "react";
import { Plus, Edit, Trash2, Users, Search, UserCheck } from "lucide-react";
import { createHalaqah, updateHalaqah, deleteHalaqah, saveAnggotaHalaqah } from "@/app/actions/halaqahActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function HalaqahClient({ initialData, daftarGuru, daftarTahun, daftarSiswa }) {
  const [data, setData] = useState(initialData || []);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // State for Anggota Modal
  const [isAnggotaModalOpen, setIsAnggotaModalOpen] = useState(false);
  const [selectedHalaqah, setSelectedHalaqah] = useState(null);
  const [selectedSiswaIds, setSelectedSiswaIds] = useState([]);
  const [siswaSearch, setSiswaSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("");
  
  const [formData, setFormData] = useState({
    namaKelompok: "",
    guruId: "",
    tahunAjaranId: daftarTahun?.[0]?.id || "",
    deskripsi: "",
  });

  const filteredData = data.filter(item => 
    (item.namaKelompok && item.namaKelompok.toLowerCase().includes(search.toLowerCase())) ||
    (item.guruNama && item.guruNama.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      namaKelompok: "",
      guruId: "",
      tahunAjaranId: daftarTahun?.[0]?.id || "",
      deskripsi: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      namaKelompok: item.namaKelompok || "",
      guruId: item.guruId || "",
      tahunAjaranId: item.tahunAjaranId || "",
      deskripsi: item.deskripsi || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.namaKelompok || !formData.guruId) {
      alert("Nama Kelompok dan Guru Pembimbing wajib diisi!");
      return;
    }

    if (editingItem) {
      startTransition(async () => {
        const res = await updateHalaqah(editingItem.id, formData);
        if (res.success) {
          window.location.reload(); 
        } else {
          alert(res.error);
        }
      });
    } else {
      startTransition(async () => {
        const res = await createHalaqah(formData);
        if (res.success) {
          window.location.reload(); 
        } else {
          alert(res.error);
        }
      });
    }
  };

  const executeDelete = () => {
    if (!confirmDeleteId) return;
    startTransition(async () => {
      const res = await deleteHalaqah(confirmDeleteId);
      if (res.success) {
        setData(prev => prev.filter(k => k.id !== confirmDeleteId));
        setConfirmDeleteId(null);
      } else {
        alert(res.error);
        setConfirmDeleteId(null);
      }
    });
  };

  const handleOpenAnggota = (item) => {
    setSelectedHalaqah(item);
    setSelectedSiswaIds(item.anggota.map(a => a.siswaId.toString()));
    setSiswaSearch("");
    setKelasFilter("");
    setIsAnggotaModalOpen(true);
  };

  const handleSaveAnggota = () => {
    if (!selectedHalaqah) return;
    startTransition(async () => {
      const res = await saveAnggotaHalaqah(selectedHalaqah.id, selectedSiswaIds);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error);
      }
    });
  };

  const toggleSiswaSelection = (siswaId) => {
    const idStr = siswaId.toString();
    setSelectedSiswaIds(prev => 
      prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]
    );
  };

  // Filter students for the assignment modal
  const getFilteredSiswa = () => {
    let filtered = daftarSiswa;
    if (kelasFilter) {
      filtered = filtered.filter(s => s.kelasId?.toString() === kelasFilter);
    }
    if (siswaSearch) {
      filtered = filtered.filter(s => 
        s.namaLengkap.toLowerCase().includes(siswaSearch.toLowerCase())
      );
    }
    return filtered;
  };

  // Get unique classes for the filter dropdown
  const uniqueClasses = Array.from(new Set(daftarSiswa.map(s => s.kelasId).filter(Boolean)))
    .map(id => {
      const siswa = daftarSiswa.find(s => s.kelasId === id);
      return { id: siswa.kelasId, nama: siswa.kelasNama };
    })
    .sort((a, b) => a.nama.localeCompare(b.nama));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari halaqah atau guru..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Buat Kelompok Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada kelompok Tahfizh yang dibuat.</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <Card key={item.id} className="border-slate-200 hover:shadow-md transition-all group overflow-hidden">
              <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-emerald-900 leading-tight">{item.namaKelompok}</h3>
                  <p className="text-sm text-emerald-700 mt-1">{item.tahunAjaranNama}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100" onClick={() => handleOpenEdit(item)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setConfirmDeleteId(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Pembimbing</p>
                    <p className="font-medium text-slate-900">{item.guruNama}</p>
                  </div>
                </div>
                
                {item.deskripsi && (
                  <p className="text-sm text-slate-600 italic">"{item.deskripsi}"</p>
                )}
                
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600">
                    {item.anggota?.length || 0} Santri
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleOpenAnggota(item)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                    Kelola Anggota
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* MODAL KELOMPOK */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Kelompok Tahfizh" : "Buat Kelompok Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <Label>Nama Kelompok / Halaqah <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="Misal: Halaqah Abu Bakar (Juz 30)" 
                value={formData.namaKelompok} 
                onChange={(e) => setFormData({...formData, namaKelompok: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Guru Pembimbing (Muhaffizh) <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.guruId} 
                onChange={(e) => setFormData({...formData, guruId: e.target.value})}
              >
                <option value="">-- Pilih Guru Tahfizh --</option>
                {daftarGuru.map(g => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tahun Ajaran</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.tahunAjaranId} 
                onChange={(e) => setFormData({...formData, tahunAjaranId: e.target.value})}
              >
                {daftarTahun.map(ta => (
                  <option key={ta.id} value={ta.id}>{ta.nama} - Semester {ta.semester}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi / Target Hafalan (Opsional)</Label>
              <Input 
                placeholder="Misal: Target Ziyadah 2 halaman per pertemuan" 
                value={formData.deskripsi} 
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} 
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isPending ? "Menyimpan..." : "Simpan Kelompok"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ANGGOTA */}
      <Dialog open={isAnggotaModalOpen} onOpenChange={setIsAnggotaModalOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Kelola Anggota: {selectedHalaqah?.namaKelompok}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 py-4">
            {/* Kiri: Daftar Semua Siswa */}
            <div className="flex-1 flex flex-col border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 p-3 border-b border-slate-200 font-semibold text-sm">Pilih Santri</div>
              <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Cari nama santri..." 
                    value={siswaSearch} 
                    onChange={e => setSiswaSearch(e.target.value)} 
                    className="pl-9 h-9"
                  />
                </div>
                <select 
                  className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 focus:outline-none"
                  value={kelasFilter}
                  onChange={e => setKelasFilter(e.target.value)}
                >
                  <option value="">Semua Kelas Reguler</option>
                  {uniqueClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50">
                {getFilteredSiswa().length === 0 ? (
                  <p className="text-center text-slate-500 text-sm mt-4">Siswa tidak ditemukan.</p>
                ) : (
                  <div className="space-y-1">
                    {getFilteredSiswa().map(siswa => {
                      const isSelected = selectedSiswaIds.includes(siswa.id.toString());
                      return (
                        <div 
                          key={siswa.id}
                          onClick={() => toggleSiswaSelection(siswa.id)}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-colors ${
                            isSelected 
                              ? 'bg-emerald-50 border-emerald-200' 
                              : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <div className={`text-sm font-medium ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                              {siswa.namaLengkap}
                            </div>
                            <div className="text-xs text-slate-500">Kelas {siswa.kelasNama || '-'}</div>
                          </div>
                          {isSelected && <Badge className="bg-emerald-500 hover:bg-emerald-600 w-5 h-5 p-0 flex items-center justify-center rounded-full">✓</Badge>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Kanan: Terpilih */}
            <div className="w-full md:w-1/3 flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white">
              <div className="bg-emerald-50 p-3 border-b border-emerald-100 font-semibold text-sm flex justify-between items-center text-emerald-800">
                <span>Anggota Terpilih</span>
                <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700">{selectedSiswaIds.length}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {selectedSiswaIds.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm mt-8 flex flex-col items-center">
                    <Users className="w-8 h-8 text-slate-300 mb-2" />
                    <p>Belum ada santri dipilih.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {selectedSiswaIds.map(idStr => {
                      const siswa = daftarSiswa.find(s => s.id.toString() === idStr);
                      if (!siswa) return null;
                      return (
                        <div key={idStr} className="flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50">
                          <div>
                            <div className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{siswa.namaLengkap}</div>
                            <div className="text-xs text-slate-500">Kls: {siswa.kelasNama}</div>
                          </div>
                          <button 
                            onClick={() => toggleSiswaSelection(siswa.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-auto border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => setIsAnggotaModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveAnggota} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isPending ? "Menyimpan..." : `Simpan Anggota (${selectedSiswaIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Kelompok Tahfizh"
        description="Yakin ingin menghapus halaqah ini? Anggota yang sudah terhubung akan dilepaskan dari kelompok ini (data hafalan tidak akan terhapus)."
        onConfirm={executeDelete}
        confirmText="Ya, Hapus"
        isDestructive={true}
        isPending={isPending}
      />
    </div>
  );
}

// Tambahan ikon X untuk menghapus dari list terpilih
import { X } from "lucide-react";
