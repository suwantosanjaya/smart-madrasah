"use client";

import { useState, useTransition, useEffect } from "react";
import { BookOpen, Plus, Search, Sparkles, FileText, Video, HelpCircle, FileDown, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBahanAjar, updateBahanAjar, deleteBahanAjar } from "@/app/actions/bahan-ajar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const iconMap = {
  materi: FileText,
  video: Video,
  quiz: HelpCircle,
  worksheet: FileDown,
};

export default function BahanAjarClient({ initialData, mapelData, rppData }) {
  const [data, setData] = useState(initialData || []);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    judul: "",
    jenis: "materi",
    mapelId: mapelData?.[0]?.id || "",
    rppId: "",
    konten: "",
    fileUrl: "",
  });

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  const filtered = data.filter(b => b.judul.toLowerCase().includes(search.toLowerCase()));

  // Filter RPPs based on selected mapelId
  const availableRpps = rppData.filter(r => r.mapelId == formData.mapelId);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ judul: "", jenis: "materi", mapelId: mapelData?.[0]?.id || "", rppId: "", konten: "", fileUrl: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      judul: item.judul,
      jenis: item.jenis,
      mapelId: item.mapelId || "",
      rppId: item.rppId || "",
      konten: item.konten || "",
      fileUrl: item.fileUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const dataToSave = { ...formData };
    
    const mapelObj = mapelData.find(m => m.id == formData.mapelId);
    const rppObj = rppData.find(r => r.id == formData.rppId);
    const optimisticItem = {
      ...dataToSave,
      mapelNama: mapelObj?.nama || "Mata Pelajaran",
      rppJudul: rppObj?.judul || null,
      createdAt: new Date().toISOString(),
    };

    if (editingItem) {
      setData(data.map(item => item.id === editingItem.id ? { ...optimisticItem, id: item.id, aiGenerated: item.aiGenerated } : item));
      startTransition(() => {
        updateBahanAjar(editingItem.id, dataToSave);
      });
    } else {
      setData([{ ...optimisticItem, id: Date.now(), aiGenerated: 0 }, ...data]);
      startTransition(() => {
        createBahanAjar(dataToSave);
      });
    }
    setIsModalOpen(false);
  };

  const handleAIGenerateKonten = async () => {
    if (!formData.rppId || !formData.judul) {
      setErrorMessage("Judul Materi dan Tautan RPP harus diisi untuk menggunakan AI.");
      return;
    }

    setIsLoadingAI(true);
    setErrorMessage("");

    try {
      const selectedRpp = rppData.find(r => r.id == formData.rppId);
      if (!selectedRpp) {
        setErrorMessage("Data RPP tidak ditemukan.");
        setIsLoadingAI(false);
        return;
      }

      const res = await fetch("/api/ai/generate-materi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judulMateri: formData.judul,
          rppJudul: selectedRpp.judul,
          rppTujuan: selectedRpp.tujuan,
          rppInti: selectedRpp.inti
        }),
      });

      const aiData = await res.json();

      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          konten: aiData.konten || prev.konten,
        }));
      } else {
        setErrorMessage("Gagal men-generate Bahan Ajar: " + aiData.error);
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan sistem saat menghubungi AI.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setData(data.filter(item => item.id !== deletingId));
    startTransition(() => {
      deleteBahanAjar(deletingId);
    });
    setIsDeleteOpen(false);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bahan Ajar / Modul</h1>
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
                  {bahan.aiGenerated === 1 && (
                    <Badge variant="warning" className="text-[10px]"><Sparkles className="w-3 h-3 mr-1" /> AI Generated</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{bahan.judul}</h3>
                
                {bahan.rppJudul && (
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                    <BookOpen className="inline w-3 h-3 mr-1" />
                    RPP: {bahan.rppJudul}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-[10px]">{bahan.mapelNama}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(bahan.createdAt)}</span>
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
            <DialogDescription>Isi detail bahan ajar dan tautkan ke RPP terkait.</DialogDescription>
          </DialogHeader>
          
          {/* Custom Error Banner */}
          <Dialog open={!!errorMessage} onOpenChange={() => setErrorMessage("")}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">Peringatan</DialogTitle>
                <DialogDescription className="text-slate-700 py-2">
                  {errorMessage}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setErrorMessage("")} variant="outline">Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  value={formData.mapelId}
                  onChange={(e) => setFormData({...formData, mapelId: e.target.value, rppId: ""})} // Reset RPP if Mapel changes
                >
                  {mapelData.map(m => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tautkan ke RPP / Modul (Opsional)</Label>
              <select 
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                value={formData.rppId}
                onChange={(e) => setFormData({...formData, rppId: e.target.value})}
              >
                <option value="">-- Pilih RPP --</option>
                {availableRpps.map(r => (
                  <option key={r.id} value={r.id}>{r.judul}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Pilih RPP agar bahan ajar ini otomatis berfokus pada materi tersebut.</p>
            </div>

            {formData.jenis === "materi" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <Label>Isi Konten Pembelajaran</Label>
                  {formData.rppId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button" 
                      onClick={handleAIGenerateKonten}
                      disabled={isLoadingAI}
                      className="h-7 text-[10px] border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isLoadingAI ? "AI Sedang Berpikir..." : "AI Generate dari RPP"}
                    </Button>
                  )}
                </div>
                <ReactQuill 
                  theme="snow"
                  value={formData.konten}
                  onChange={(val) => setFormData(prev => ({...prev, konten: val}))}
                  placeholder="Tuliskan materi pembelajaran di sini..."
                  className="bg-white rounded-lg [&_.ql-editor]:min-h-[200px]"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{formData.jenis === "video" ? "URL Video (YouTube)" : "URL File (Google Drive / PDF)"}</Label>
                <Input 
                  value={formData.fileUrl} 
                  onChange={(e) => setFormData({...formData, fileUrl: e.target.value})} 
                  placeholder={formData.jenis === "video" ? "https://youtube.com/watch?v=..." : "https://drive.google.com/..."}
                />
              </div>
            )}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan"}</Button>
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
