"use client";

import { useState, useTransition } from "react";
import { Plus, Edit, Trash2, Users, Search } from "lucide-react";
import { createKelas, updateKelas, deleteKelas } from "@/app/actions/kelasActions";
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

export default function KelasClient({ initialKelas, daftarGuru, daftarTahun }) {
  const [kelasData, setKelasData] = useState(initialKelas || []);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  const [formData, setFormData] = useState({
    namaKelas: "",
    tingkat: 1,
    kapasitas: 30,
    tahunAjaranId: daftarTahun?.[0]?.id || "",
    waliKelasId: "",
  });

  const filteredKelas = kelasData.filter(k => 
    k.namaKelas.toLowerCase().includes(search.toLowerCase()) ||
    (k.waliKelasNama && k.waliKelasNama.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      namaKelas: "",
      tingkat: 1,
      kapasitas: 30,
      tahunAjaranId: daftarTahun?.[0]?.id || "",
      waliKelasId: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      namaKelas: item.namaKelas,
      tingkat: item.tingkat,
      kapasitas: item.kapasitas || 30,
      tahunAjaranId: item.tahunAjaranId || "",
      waliKelasId: item.waliKelasId || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      tahunAjaranId: parseInt(formData.tahunAjaranId),
      waliKelasId: formData.waliKelasId ? parseInt(formData.waliKelasId) : null,
      kapasitas: parseInt(formData.kapasitas),
      tingkat: parseInt(formData.tingkat),
    };

    if (editingItem) {
      startTransition(async () => {
        const res = await updateKelas(editingItem.id, dataToSave);
        if (res.success) {
          const guruName = daftarGuru.find(g => g.id === dataToSave.waliKelasId)?.namaLengkap;
          const tahunName = daftarTahun.find(t => t.id === dataToSave.tahunAjaranId)?.nama;
          
          setKelasData(prev => prev.map(item => 
            item.id === editingItem.id ? { 
              ...item, ...dataToSave, waliKelasNama: guruName, tahunAjaranNama: tahunName 
            } : item
          ));
          setIsModalOpen(false);
        } else {
          alert(res.error);
        }
      });
    } else {
      startTransition(async () => {
        const res = await createKelas(dataToSave);
        if (res.success) {
          // A full refresh is better here to get the generated ID, but we mock it for optimistic UI
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
      const res = await deleteKelas(confirmDeleteId);
      if (res.success) {
        setKelasData(prev => prev.filter(k => k.id !== confirmDeleteId));
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
            placeholder="Cari kelas atau nama wali kelas..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Tambah Kelas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKelas.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Tidak ada data kelas.</p>
          </div>
        ) : (
          filteredKelas.map((item) => (
            <Card key={item.id} className="border-slate-200 hover:shadow-md transition-all group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                      {item.namaKelas}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Kelas {item.namaKelas}</h3>
                      <p className="text-xs text-slate-500">Tingkat {item.tingkat} • {item.tahunAjaranNama}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" onClick={() => handleOpenEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-4">
                  <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Wali Kelas</div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className={item.waliKelasNama ? "text-slate-900 font-medium" : "text-slate-400 italic"}>
                      {item.waliKelasNama || "Belum Ditugaskan"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-500 flex justify-between">
                  <span>Kapasitas</span>
                  <span className="font-medium text-slate-700">{item.kapasitas} Siswa</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Kelas" : "Tambah Kelas"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Kelas</Label>
                <Input 
                  placeholder="Misal: 1A" 
                  value={formData.namaKelas} 
                  onChange={(e) => setFormData({...formData, namaKelas: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Tingkat</Label>
                <Input 
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Misal: 1, 7, atau 10"
                  value={formData.tingkat} 
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (val > 12) val = 12;
                    if (val < 1) val = 1;
                    setFormData({...formData, tingkat: val || ""});
                  }} 
                />
              </div>
            </div>

            <div className="space-y-2">
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
              <Label>Wali Kelas</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.waliKelasId || ""} 
                onChange={(e) => setFormData({...formData, waliKelasId: e.target.value})}
              >
                <option value="">-- Belum Ditugaskan --</option>
                {daftarGuru.map(g => (
                  <option key={g.id} value={g.id}>{g.namaLengkap}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Kapasitas Siswa</Label>
              <Input 
                type="number"
                value={formData.kapasitas} 
                onChange={(e) => setFormData({...formData, kapasitas: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Kelas"
        description="Yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi data siswa yang ada di dalamnya."
        onConfirm={executeDelete}
        confirmText="Ya, Hapus"
        isDestructive={true}
        isPending={isPending}
      />
    </div>
  );
}
