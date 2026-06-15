"use client";

import { useState, useTransition } from "react";
import { Plus, Edit, Trash2, CalendarDays, Search, Clock, MapPin, User, BookOpen, Layers } from "lucide-react";
import { createJadwal, updateJadwal, deleteJadwal } from "@/app/actions/jadwalActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function JadwalClient({ initialData, daftarGuru, daftarMapel, daftarKelas, daftarTahun }) {
  const [data, setData] = useState(initialData || []);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  const [formData, setFormData] = useState({
    guruId: "",
    mapelId: "",
    kelasId: "",
    tahunAjaranId: daftarTahun?.[0]?.id || "",
    hari: "Senin",
    jamMulai: "07:30",
    jamSelesai: "09:00",
    ruangan: "",
  });

  const filteredData = data.filter(item => 
    (item.guruNama && item.guruNama.toLowerCase().includes(search.toLowerCase())) ||
    (item.mapelNama && item.mapelNama.toLowerCase().includes(search.toLowerCase())) ||
    (item.kelasNama && item.kelasNama.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      guruId: "",
      mapelId: "",
      kelasId: "",
      tahunAjaranId: daftarTahun?.[0]?.id || "",
      hari: "Senin",
      jamMulai: "07:30",
      jamSelesai: "09:00",
      ruangan: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      guruId: item.guruId || "",
      mapelId: item.mapelId || "",
      kelasId: item.kelasId || "",
      tahunAjaranId: item.tahunAjaranId || "",
      hari: item.hari || "Senin",
      jamMulai: item.jamMulai || "07:30",
      jamSelesai: item.jamSelesai || "09:00",
      ruangan: item.ruangan || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.guruId || !formData.mapelId || !formData.kelasId) {
      alert("Guru, Mapel, dan Kelas wajib diisi!");
      return;
    }

    if (editingItem) {
      startTransition(async () => {
        const res = await updateJadwal(editingItem.id, formData);
        if (res.success) {
          window.location.reload(); 
        } else {
          alert(res.error);
        }
      });
    } else {
      startTransition(async () => {
        const res = await createJadwal(formData);
        if (res.success) {
          window.location.reload(); 
        } else {
          alert(res.error);
        }
      });
    }
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = () => {
    if (!confirmDeleteId) return;
    startTransition(async () => {
      const res = await deleteJadwal(confirmDeleteId);
      if (res.success) {
        setData(prev => prev.filter(k => k.id !== confirmDeleteId));
        setConfirmDeleteId(null);
      } else {
        alert(res.error);
        setConfirmDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari guru, mapel, atau kelas..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Tambah Penugasan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada data penugasan jadwal.</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <Card key={item.id} className="border-slate-200 hover:shadow-md transition-all group">
              <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{item.mapelNama}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-emerald-600" onClick={() => handleOpenEdit(item)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">{item.guruNama}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span>Kelas <span className="font-bold text-slate-800">{item.kelasNama}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{item.hari}, {item.jamMulai} - {item.jamSelesai}</span>
                    </div>
                    {item.ruangan && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Ruang {item.ruangan}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Penugasan & Jadwal" : "Tambah Penugasan & Jadwal"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            
            <div className="space-y-2 col-span-full">
              <Label>Tahun Ajaran</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.tahunAjaranId} 
                onChange={(e) => setFormData({...formData, tahunAjaranId: e.target.value})}
              >
                {daftarTahun.map(ta => (
                  <option key={ta.id} value={ta.id}>{ta.nama} - Semester {ta.semester}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Guru Pengajar <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.guruId} 
                onChange={(e) => setFormData({...formData, guruId: e.target.value})}
              >
                <option value="">-- Pilih Guru --</option>
                {daftarGuru.map(g => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Mata Pelajaran <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.mapelId} 
                onChange={(e) => setFormData({...formData, mapelId: e.target.value})}
              >
                <option value="">-- Pilih Mapel --</option>
                {daftarMapel.map(m => (
                  <option key={m.id} value={m.id}>{m.nama}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 col-span-full">
              <Label>Kelas yang Diajar <span className="text-red-500">*</span></Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.kelasId} 
                onChange={(e) => setFormData({...formData, kelasId: e.target.value})}
              >
                <option value="">-- Pilih Kelas --</option>
                {daftarKelas.map(k => (
                  <option key={k.id} value={k.id}>Kelas {k.nama} (Tingkat {k.tingkat})</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Peringatan: Jika mapel adalah Tahfizh, maka guru ini otomatis akan mendapatkan hak akses menu Penilaian Tahfizh di dashboardnya.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Hari</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.hari} 
                onChange={(e) => setFormData({...formData, hari: e.target.value})}
              >
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Waktu (Jam Mulai - Jam Selesai)</Label>
              <div className="flex gap-2">
                <Input 
                  type="time" 
                  value={formData.jamMulai} 
                  onChange={(e) => setFormData({...formData, jamMulai: e.target.value})} 
                />
                <span className="flex items-center text-slate-500">-</span>
                <Input 
                  type="time" 
                  value={formData.jamSelesai} 
                  onChange={(e) => setFormData({...formData, jamSelesai: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2 col-span-full">
              <Label>Ruangan (Opsional)</Label>
              <Input 
                placeholder="Misal: Lab Komputer 1" 
                value={formData.ruangan} 
                onChange={(e) => setFormData({...formData, ruangan: e.target.value})} 
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Penugasan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Penugasan"
        description="Yakin ingin menghapus jadwal penugasan ini? Hak akses guru untuk mapel & kelas terkait juga akan tercabut."
        onConfirm={executeDelete}
        confirmText="Ya, Hapus"
        isDestructive={true}
        isPending={isPending}
      />
    </div>
  );
}
