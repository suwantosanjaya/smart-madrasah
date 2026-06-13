"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  BookOpen,
  Users,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const initialJadwalData = [
  { id: 1, hari: "Senin", jamMulai: "07:30", jamSelesai: "09:00", mapel: "Matematika", kelas: "3A", ruangan: "Ruang 301", tingkat: 3 },
  { id: 2, hari: "Senin", jamMulai: "09:15", jamSelesai: "10:45", mapel: "Matematika", kelas: "4B", ruangan: "Ruang 402", tingkat: 4 },
  { id: 3, hari: "Selasa", jamMulai: "07:30", jamSelesai: "09:00", mapel: "Matematika", kelas: "2A", ruangan: "Ruang 201", tingkat: 2 },
];

const colorByTingkat = {
  1: "bg-pink-50 border-pink-200 text-pink-700",
  2: "bg-blue-50 border-blue-200 text-blue-700",
  3: "bg-emerald-50 border-emerald-200 text-emerald-700",
  4: "bg-amber-50 border-amber-200 text-amber-700",
  5: "bg-purple-50 border-purple-200 text-purple-700",
  6: "bg-rose-50 border-rose-200 text-rose-700",
};

const dotColorByTingkat = {
  1: "bg-pink-400",
  2: "bg-blue-400",
  3: "bg-emerald-400",
  4: "bg-amber-400",
  5: "bg-purple-400",
  6: "bg-rose-400",
};

export default function JadwalMengajarPage() {
  const [view, setView] = useState("grid");
  const [jadwalData, setJadwalData] = useState(initialJadwalData);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    hari: "Senin",
    jamMulai: "07:30",
    jamSelesai: "09:00",
    mapel: "Matematika",
    kelas: "3A",
    ruangan: "Ruang 301",
    tingkat: 3,
  });

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });

  const totalJam = jadwalData.length;
  const totalKelas = [...new Set(jadwalData.map((j) => j.kelas))].length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      hari: "Senin",
      jamMulai: "07:30",
      jamSelesai: "09:00",
      mapel: "Matematika",
      kelas: "3A",
      ruangan: "Ruang 301",
      tingkat: 3,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setJadwalData(jadwalData.map(item => item.id === editingItem.id ? { ...formData, id: item.id } : item));
    } else {
      setJadwalData([...jadwalData, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (id, e) => {
    if (e) e.stopPropagation();
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setJadwalData(jadwalData.filter(item => item.id !== deletingId));
    setIsDeleteOpen(false);
  };

  // Helper to extract tingkat from kelas (e.g. "3A" -> 3)
  const handleKelasChange = (val) => {
    const t = parseInt(val.charAt(0)) || 1;
    setFormData({ ...formData, kelas: val, tingkat: t });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jadwal Mengajar</h1>
          <p className="text-slate-500 mt-1">Jadwal mengajar Anda pada semester ini</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
          >
            <CalendarDays className="w-4 h-4 mr-1" /> Mingguan
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            <Clock className="w-4 h-4 mr-1" /> Daftar
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="ml-2">
            <Plus className="w-4 h-4 mr-1" /> Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalJam}</p>
              <p className="text-sm text-slate-500">Total Jam/Minggu</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalKelas}</p>
              <p className="text-sm text-slate-500">Kelas Diampu</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">Matematika</p>
              <p className="text-sm text-slate-500">Mata Pelajaran</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Grid View */}
      {view === "grid" && (
        <Card className="border-slate-100 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Jadwal Mingguan</CardTitle>
            <CardDescription>Semester Ganjil — Tahun Ajaran 2026/2027</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 min-w-[800px]">
                {daysOfWeek.map((day) => (
                  <div key={day} className="border-r border-b border-slate-100 last:border-r-0">
                    <div className={`px-4 py-3 text-center font-semibold text-sm border-b border-slate-100 ${
                      today.toLowerCase().includes(day.toLowerCase())
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-50 text-slate-600"
                    }`}>
                      {day}
                      {today.toLowerCase().includes(day.toLowerCase()) && (
                        <span className="ml-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                          Hari Ini
                        </span>
                      )}
                    </div>
                    <div className="p-2 space-y-2 min-h-[200px]">
                      {jadwalData
                        .filter((j) => j.hari === day)
                        .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai))
                        .map((jadwal) => (
                          <div
                            key={jadwal.id}
                            onClick={() => handleOpenEdit(jadwal)}
                            className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer relative group ${colorByTingkat[jadwal.tingkat]}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={`w-2 h-2 rounded-full ${dotColorByTingkat[jadwal.tingkat]}`} />
                              <span className="text-xs font-bold">
                                {jadwal.jamMulai} - {jadwal.jamSelesai}
                              </span>
                            </div>
                            <p className="text-sm font-semibold">{jadwal.mapel}</p>
                            <p className="text-xs opacity-80">Kelas {jadwal.kelas}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                              <MapPin className="w-3 h-3" />
                              {jadwal.ruangan}
                            </div>
                            
                            {/* Hover Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => handleOpenDelete(jadwal.id, e)}
                                className="p-1 bg-white/50 hover:bg-white/80 rounded-md text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {view === "list" && (
        <Card className="border-slate-100">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {daysOfWeek.map((day) => {
                const daySchedules = jadwalData.filter((j) => j.hari === day).sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
                if (daySchedules.length === 0) return null;
                return (
                  <div key={day}>
                    <div className={`px-6 py-3 font-semibold text-sm ${
                      today.toLowerCase().includes(day.toLowerCase())
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-50 text-slate-600"
                    }`}>
                      {day}
                      {today.toLowerCase().includes(day.toLowerCase()) && (
                        <Badge className="ml-2" variant="default">Hari Ini</Badge>
                      )}
                    </div>
                    {daySchedules.map((jadwal) => (
                      <div
                        key={jadwal.id}
                        className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="text-center min-w-[80px]">
                          <p className="text-sm font-bold text-slate-800">
                            {jadwal.jamMulai}
                          </p>
                          <p className="text-xs text-slate-400">
                            {jadwal.jamSelesai}
                          </p>
                        </div>
                        <div className={`w-1 h-10 rounded-full ${dotColorByTingkat[jadwal.tingkat]}`} />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{jadwal.mapel}</p>
                          <p className="text-sm text-slate-500">Kelas {jadwal.kelas}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <MapPin className="w-4 h-4" />
                          {jadwal.ruangan}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(jadwal)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(jadwal.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Jadwal" : "Tambah Jadwal Mengajar"}</DialogTitle>
            <DialogDescription>Masukkan detail jadwal mengajar per mata pelajaran.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hari</Label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  value={formData.hari}
                  onChange={(e) => setFormData({...formData, hari: e.target.value})}
                >
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Input 
                  value={formData.kelas} 
                  onChange={(e) => handleKelasChange(e.target.value)} 
                  placeholder="Misal: 3A"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jam Mulai</Label>
                <Input 
                  type="time"
                  value={formData.jamMulai} 
                  onChange={(e) => setFormData({...formData, jamMulai: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Jam Selesai</Label>
                <Input 
                  type="time"
                  value={formData.jamSelesai} 
                  onChange={(e) => setFormData({...formData, jamSelesai: e.target.value})} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <Input 
                  value={formData.mapel} 
                  onChange={(e) => setFormData({...formData, mapel: e.target.value})} 
                  placeholder="Misal: Matematika"
                />
              </div>
              <div className="space-y-2">
                <Label>Ruangan</Label>
                <Input 
                  value={formData.ruangan} 
                  onChange={(e) => setFormData({...formData, ruangan: e.target.value})} 
                  placeholder="Misal: Ruang 301"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Jadwal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Jadwal</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus jadwal ini?</DialogDescription>
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
