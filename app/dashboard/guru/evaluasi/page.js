"use client";

import { useState } from "react";
import { Plus, Sparkles, CalendarDays, FileText, Users, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const initialData = [
  { id: 1, judul: "Ulangan Harian 1: Penjumlahan & Pengurangan", jenis: "UH", kelas: "3A", mapel: "Matematika", tanggal: "2026-06-15", aiGenerated: true },
  { id: 2, judul: "Tugas: Pecahan Sederhana", jenis: "Tugas", kelas: "3B", mapel: "Matematika", tanggal: "2026-06-12", aiGenerated: false },
  { id: 3, judul: "Kuis Perkalian", jenis: "Kuis", kelas: "4A", mapel: "Matematika", tanggal: "2026-06-01", aiGenerated: true },
];

export default function EvaluasiPage() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    judul: "",
    jenis: "UH",
    kelas: "3A",
    mapel: "Matematika",
    tanggal: "",
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ judul: "", jenis: "UH", kelas: "3A", mapel: "Matematika", tanggal: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setData(data.map(item => item.id === editingItem.id ? { ...formData, id: item.id, aiGenerated: item.aiGenerated } : item));
    } else {
      setData([...data, { ...formData, id: Date.now(), aiGenerated: false }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setData(data.filter(item => item.id !== deletingId));
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Evaluasi & Ujian</h1>
          <p className="text-slate-500 mt-1">Kelola UH, UTS, UAS, Tugas, dan Kuis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-1 text-amber-500" /> Buat Soal AI
          </Button>
          <Button size="sm" onClick={handleOpenAdd}><Plus className="w-4 h-4 mr-1" /> Evaluasi Baru</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map(ev => (
          <Card key={ev.id} className="border-slate-100 transition-all cursor-default relative group hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <Badge variant={ev.jenis === "UH" ? "destructive" : ev.jenis === "Tugas" ? "default" : "secondary"}>
                  {ev.jenis}
                </Badge>
                <div className="flex items-center gap-2">
                  {ev.aiGenerated && <Sparkles className="w-4 h-4 text-amber-500" title="AI Generated" />}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" onClick={() => handleOpenEdit(ev)}><Edit className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => handleOpenDelete(ev.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{ev.judul}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-slate-500"><Users className="w-3.5 h-3.5 mr-2" /> Kelas {ev.kelas}</div>
                <div className="flex items-center text-xs text-slate-500"><FileText className="w-3.5 h-3.5 mr-2" /> {ev.mapel}</div>
                <div className="flex items-center text-xs text-slate-500"><CalendarDays className="w-3.5 h-3.5 mr-2" /> {ev.tanggal || "Belum ditentukan"}</div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <Button variant="outline" size="sm" className="w-full text-xs">Kelola Soal</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Evaluasi" : "Buat Evaluasi Baru"}</DialogTitle>
            <DialogDescription>Isi detail jadwal evaluasi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Evaluasi</Label>
              <Input 
                value={formData.judul} 
                onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                placeholder="Misal: Ulangan Harian 2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis Evaluasi</Label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={formData.jenis}
                  onChange={(e) => setFormData({...formData, jenis: e.target.value})}
                >
                  <option value="UH">Ulangan Harian</option>
                  <option value="UTS">UTS</option>
                  <option value="UAS">UAS</option>
                  <option value="Tugas">Tugas</option>
                  <option value="Kuis">Kuis</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Kelas</Label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={formData.kelas}
                  onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                >
                  <option>3A</option>
                  <option>3B</option>
                  <option>4A</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={formData.mapel}
                  onChange={(e) => setFormData({...formData, mapel: e.target.value})}
                >
                  <option>Matematika</option>
                  <option>IPA</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input 
                  type="date"
                  value={formData.tanggal} 
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Evaluasi</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin membatalkan dan menghapus jadwal evaluasi ini?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={confirmDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
