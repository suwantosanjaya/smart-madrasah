"use client";

import { useState } from "react";
import { BookOpen, Plus, Search, Sparkles, FileText, Video, HelpCircle, FileDown, Eye, Edit, Trash2 } from "lucide-react";
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
  { id: 1, judul: "Materi: Penjumlahan Bilangan Cacah", jenis: "materi", mapel: "Matematika", aiGenerated: true, tanggal: "2026-06-05" },
  { id: 2, judul: "Video Pembelajaran: Pecahan", jenis: "video", mapel: "Matematika", aiGenerated: false, tanggal: "2026-06-03" },
  { id: 3, judul: "Latihan Soal Cerita Matematika", jenis: "worksheet", mapel: "Matematika", aiGenerated: true, tanggal: "2026-06-10" },
];

const iconMap = {
  materi: FileText,
  video: Video,
  quiz: HelpCircle,
  worksheet: FileDown,
};

export default function BahanAjarPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    judul: "",
    jenis: "materi",
    mapel: "Matematika",
  });

  const filtered = data.filter(b => b.judul.toLowerCase().includes(search.toLowerCase()));

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ judul: "", jenis: "materi", mapel: "Matematika" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setData(data.map(item => item.id === editingItem.id ? { ...formData, id: item.id, aiGenerated: item.aiGenerated, tanggal: item.tanggal } : item));
    } else {
      setData([...data, { ...formData, id: Date.now(), aiGenerated: false, tanggal: new Date().toISOString().split('T')[0] }]);
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
          <h1 className="text-2xl font-bold text-slate-900">Bahan Ajar</h1>
          <p className="text-slate-500 mt-1">Kelola materi, video, dan modul pembelajaran</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-1 text-amber-500" /> AI Generate
          </Button>
          <Button size="sm" onClick={handleOpenAdd}><Plus className="w-4 h-4 mr-1" /> Upload Baru</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Cari bahan ajar..." className="pl-10 max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(bahan => {
          const Icon = iconMap[bahan.jenis] || FileText;
          return (
            <Card key={bahan.id} className="border-slate-100 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  {bahan.aiGenerated && (
                    <Badge variant="warning" className="text-[10px]"><Sparkles className="w-3 h-3 mr-1" /> AI Generated</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{bahan.judul}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-[10px]">{bahan.mapel}</Badge>
                  <span className="text-xs text-slate-400">{bahan.tanggal}</span>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => handleOpenEdit(bahan)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleOpenDelete(bahan.id)}><Trash2 className="w-3 h-3 mr-1" /> Hapus</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Tidak ada bahan ajar ditemukan</p>
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Bahan Ajar" : "Tambah Bahan Ajar"}</DialogTitle>
            <DialogDescription>Isi detail bahan ajar di bawah ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul Materi</Label>
              <Input 
                value={formData.judul} 
                onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                placeholder="Misal: Modul Pembagian"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis File</Label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={formData.jenis}
                  onChange={(e) => setFormData({...formData, jenis: e.target.value})}
                >
                  <option value="materi">Dokumen (PDF/Word)</option>
                  <option value="video">Video</option>
                  <option value="worksheet">Lembar Kerja (Worksheet)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={formData.mapel}
                  onChange={(e) => setFormData({...formData, mapel: e.target.value})}
                >
                  <option>Matematika</option>
                  <option>Bahasa Indonesia</option>
                  <option>IPA</option>
                </select>
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
            <DialogTitle>Hapus Bahan Ajar</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus materi ini?</DialogDescription>
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
