"use client";

import { useState, useTransition } from "react";
import { Plus, Edit, Trash2, CalendarDays, CheckCircle2 } from "lucide-react";
import { createTahunAjaran, updateTahunAjaran, deleteTahunAjaran } from "@/app/actions/tahunAjaranActions";
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

export default function TahunAjaranClient({ initialData }) {
  const [data, setData] = useState(initialData || []);
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, item: null });
  
  const [formData, setFormData] = useState({
    nama: "2026/2027",
    semester: "Ganjil",
    tanggalMulai: "",
    tanggalSelesai: "",
    isActive: 0,
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      nama: "",
      semester: "Ganjil",
      tanggalMulai: "",
      tanggalSelesai: "",
      isActive: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nama: item.nama,
      semester: item.semester,
      tanggalMulai: item.tanggalMulai,
      tanggalSelesai: item.tanggalSelesai,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.nama || !formData.tanggalMulai || !formData.tanggalSelesai) {
      alert("Lengkapi semua isian wajib!");
      return;
    }

    const dataToSave = {
      ...formData,
      isActive: parseInt(formData.isActive)
    };

    if (editingItem) {
      startTransition(async () => {
        const res = await updateTahunAjaran(editingItem.id, dataToSave);
        if (res.success) {
          window.location.reload(); 
        } else {
          alert(res.error);
        }
      });
    } else {
      startTransition(async () => {
        const res = await createTahunAjaran(dataToSave);
        if (res.success) {
          window.location.reload(); 
        } else {
          alert(res.error);
        }
      });
    }
  };

  const handleDelete = (id) => {
    setConfirmState({ isOpen: true, type: "delete", item: { id } });
  };

  const handleSetActive = (item) => {
    if (item.isActive === 1) return;
    setConfirmState({ isOpen: true, type: "activate", item });
  };

  const executeConfirm = () => {
    const { type, item } = confirmState;
    if (!item) return;

    if (type === "delete") {
      startTransition(async () => {
        const res = await deleteTahunAjaran(item.id);
        if (res.success) {
          setData(prev => prev.filter(k => k.id !== item.id));
          setConfirmState({ isOpen: false, type: null, item: null });
        } else {
          alert(res.error);
          setConfirmState({ isOpen: false, type: null, item: null });
        }
      });
    } else if (type === "activate") {
      startTransition(async () => {
        const res = await updateTahunAjaran(item.id, { ...item, isActive: 1 });
        if (res.success) {
          window.location.reload(); 
        } else {
          alert(res.error);
          setConfirmState({ isOpen: false, type: null, item: null });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Buat Tahun Ajaran Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Tidak ada data tahun ajaran.</p>
          </div>
        ) : (
          data.map((item) => (
            <Card 
              key={item.id} 
              className={`border-2 transition-all group ${
                item.isActive === 1 ? "border-emerald-500 shadow-md bg-emerald-50/30" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                      item.isActive === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {item.semester.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{item.nama}</h3>
                      <p className="text-xs text-slate-500">Semester {item.semester}</p>
                    </div>
                  </div>
                  
                  {item.isActive === 1 ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Aktif Sekarang</Badge>
                  ) : (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" onClick={() => handleSetActive(item)} title="Jadikan Aktif">
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleOpenEdit(item)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(item.id)} title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-slate-100 mt-4 text-sm text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Mulai:</span>
                    <span className="font-medium text-slate-900">{item.tanggalMulai}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selesai:</span>
                    <span className="font-medium text-slate-900">{item.tanggalSelesai}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <Label>Nama Tahun Ajaran</Label>
              <Input 
                placeholder="Misal: 2026/2027" 
                value={formData.nama} 
                onChange={(e) => setFormData({...formData, nama: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.semester} 
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input 
                  type="date"
                  value={formData.tanggalMulai} 
                  onChange={(e) => setFormData({...formData, tanggalMulai: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai</Label>
                <Input 
                  type="date"
                  value={formData.tanggalSelesai} 
                  onChange={(e) => setFormData({...formData, tanggalSelesai: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.isActive} 
                onChange={(e) => setFormData({...formData, isActive: e.target.value})}
              >
                <option value="0">Tidak Aktif (Draft/Arsip)</option>
                <option value="1">Aktifkan Sekarang</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Perhatian: Jika Anda mengaktifkan ini, tahun ajaran yang sedang aktif saat ini akan otomatis dinonaktifkan.
              </p>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending ? "Menyimpan..." : "Simpan Tahun Ajaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={confirmState.isOpen}
        onOpenChange={(open) => !open && setConfirmState({ isOpen: false, type: null, item: null })}
        title={confirmState.type === "delete" ? "Hapus Tahun Ajaran" : "Aktifkan Tahun Ajaran"}
        description={
          confirmState.type === "delete" 
            ? "Yakin ingin menghapus tahun ajaran ini? Data kelas atau jadwal yang terhubung mungkin akan error."
            : `Aktifkan tahun ajaran ${confirmState.item?.nama || ""} - Semester ${confirmState.item?.semester || ""}? Ini akan mengubah siklus seluruh sistem.`
        }
        onConfirm={executeConfirm}
        confirmText={confirmState.type === "delete" ? "Ya, Hapus" : "Ya, Aktifkan"}
        isDestructive={confirmState.type === "delete"}
        isPending={isPending}
      />
    </div>
  );
}
