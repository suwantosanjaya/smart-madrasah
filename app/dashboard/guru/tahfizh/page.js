"use client";

import { useState } from "react";
import { BookMarked, Search, Plus, Save, History, Star, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const initialData = [
  { id: 1, nama: "Ahmad Fauzan", nis: "26001", surahTerakhir: "Al-Mulk", ayat: "1-10", status: "Lancar", nilai: 90 },
  { id: 2, nama: "Budi Santoso", nis: "26002", surahTerakhir: "An-Naba", ayat: "1-40", status: "Perlu Murojaah", nilai: 75 },
  { id: 3, nama: "Citra Kirana", nis: "26003", surahTerakhir: "Al-Waqiah", ayat: "1-20", status: "Lancar", nilai: 95 },
];

export default function TahfizhPage() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nis: "",
    surahTerakhir: "",
    ayat: "",
    status: "Lancar",
    nilai: 0,
  });

  const filtered = data.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search));

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ nama: "", nis: "", surahTerakhir: "", ayat: "", status: "Lancar", nilai: 80 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleOpenSetor = (item) => {
    setEditingItem(item);
    setFormData({ ...item, surahTerakhir: "", ayat: "", status: "Lancar", nilai: 85 });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem && formData.nis === editingItem.nis) {
      // Editing existing student
      setData(data.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item));
    } else {
      // Adding new student record
      setData([...data, { ...formData, id: Date.now() }]);
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
          <h1 className="text-2xl font-bold text-slate-900">Monitoring Tahfizh</h1>
          <p className="text-slate-500 mt-1">Catat progress hafalan santri</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-1" /> Riwayat
          </Button>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1" /> Santri Baru
          </Button>
        </div>
      </div>

      <Card className="border-slate-100">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <select className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-md text-sm">
              <option>Kelompok Halaqoh 1</option>
              <option>Kelompok Halaqoh 2</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Cari santri atau NIS..." className="pl-10 h-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-4 font-medium">Santri</th>
                  <th className="p-4 font-medium">Setoran Terakhir</th>
                  <th className="p-4 font-medium">Ayat</th>
                  <th className="p-4 font-medium">Kualitas Hafalan</th>
                  <th className="p-4 font-medium">Nilai</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{siswa.nama}</p>
                      <p className="text-xs text-slate-500">{siswa.nis}</p>
                    </td>
                    <td className="p-4 font-medium text-emerald-700">{siswa.surahTerakhir}</td>
                    <td className="p-4 text-slate-600">{siswa.ayat}</td>
                    <td className="p-4">
                      <Badge variant={siswa.status === "Lancar" ? "success" : "warning"}>{siswa.status}</Badge>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{siswa.nilai}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleOpenSetor(siswa)}>
                          <Plus className="w-4 h-4 mr-1" /> Setor
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => handleOpenEdit(siswa)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleOpenDelete(siswa.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">Santri tidak ditemukan.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Input Setoran Tahfizh" : "Tambah Santri Baru"}</DialogTitle>
            <DialogDescription>Masukkan detail setoran hafalan santri.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Santri</Label>
                <Input 
                  value={formData.nama} 
                  onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                  placeholder="Misal: Ahmad Fauzan"
                  disabled={editingItem !== null}
                />
              </div>
              <div className="space-y-2">
                <Label>NIS</Label>
                <Input 
                  value={formData.nis} 
                  onChange={(e) => setFormData({...formData, nis: e.target.value})} 
                  placeholder="Misal: 26001"
                  disabled={editingItem !== null}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Surah</Label>
                <Input 
                  value={formData.surahTerakhir} 
                  onChange={(e) => setFormData({...formData, surahTerakhir: e.target.value})} 
                  placeholder="Misal: Al-Baqarah"
                />
              </div>
              <div className="space-y-2">
                <Label>Ayat</Label>
                <Input 
                  value={formData.ayat} 
                  onChange={(e) => setFormData({...formData, ayat: e.target.value})} 
                  placeholder="Misal: 1-5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kualitas Hafalan</Label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Lancar">Lancar</option>
                  <option value="Perlu Murojaah">Perlu Murojaah</option>
                  <option value="Terbata-bata">Terbata-bata</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nilai</Label>
                <Input 
                  type="number"
                  min="0" max="100"
                  value={formData.nilai} 
                  onChange={(e) => setFormData({...formData, nilai: Number(e.target.value)})} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Setoran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Data Santri</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus data tahfizh santri ini?</DialogDescription>
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
