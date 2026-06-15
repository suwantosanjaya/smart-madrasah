"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  XCircle,
  BookOpen,
  Loader2,
  Printer,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import { useEffect, useTransition } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { createRpp, updateRpp, deleteRpp, updateRppStatus } from "@/app/actions/rpp";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false, 
  loading: () => <div className="h-24 bg-slate-50 animate-pulse rounded-md border border-slate-200" /> 
});
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

const statusConfig = {
  draft: { label: "Draf", variant: "secondary", icon: Clock },
  submitted: { label: "Diajukan", variant: "info", icon: Send },
  approved: { label: "Disetujui", variant: "success", icon: CheckCircle2 },
  revision: { label: "Revisi", variant: "warning", icon: AlertCircle },
};

const getTaksonomiLabel = (val) => {
  if (!val) return "C3 - Mengaplikasikan (MOTS)";
  if (val.includes("-")) return val; // Sudah full format
  
  const map = {
    "C1": "C1 - Mengingat (LOTS)",
    "C2": "C2 - Memahami (LOTS)",
    "C3": "C3 - Mengaplikasikan (MOTS)",
    "C4": "C4 - Menganalisis (HOTS)",
    "C5": "C5 - Mengevaluasi (HOTS)",
    "C6": "C6 - Mencipta (HOTS)"
  };
  return map[val] || val;
};

const renderHTML = (content) => {
  if (!content) return { __html: "" };
  if (content.includes('<p>') || content.includes('<ul>') || content.includes('<ol>')) {
    return { __html: content };
  }
  return { __html: content.replace(/\n/g, '<br/>') };
};

export default function RPPClient({ initialData, initialMapel }) {
  const [data, setData] = useState(initialData || []);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeMapel, setActiveMapel] = useState("Semua");

  const uniqueMapels = ["Semua", ...new Set(data.map(item => item.mapel))];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printData, setPrintData] = useState(null);

  const [formData, setFormData] = useState({
    judul: "",
    mapelId: initialMapel?.[0]?.id || "",
    tingkat: "Kelas 3 (Fase B)",
    semester: "Ganjil",
    alokasiWaktu: "2 x 35 Menit",
    tujuan: "",
    pendahuluan: "",
    inti: "",
    penutup: "",
    penilaian: "",
    targetKognitif: "C3",
    status: "draft",
  });

  const filteredRpp = data.filter((r) => {
    const matchSearch = r.judul.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchMapel = activeMapel === "Semua" || r.mapel === activeMapel;
    return matchSearch && matchStatus && matchMapel;
  });

  const groupedRpp = filteredRpp.reduce((acc, rpp) => {
    if (!acc[rpp.mapel]) acc[rpp.mapel] = [];
    acc[rpp.mapel].push(rpp);
    return acc;
  }, {});

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsReadOnly(false);
    setFormData({
      judul: "",
      mapelId: initialMapel?.[0]?.id || "",
      tingkat: "Kelas 3 (Fase B)",
      semester: "Ganjil",
      alokasiWaktu: "2 x 35 Menit",
      tujuan: "",
      pendahuluan: "",
      inti: "",
      penutup: "",
      penilaian: "",
      targetKognitif: "C3",
      status: "draft",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item, readOnly = false) => {
    setEditingItem(item);
    setFormData(item);
    setIsReadOnly(readOnly);
    setIsModalOpen(true);
  };

  const handleAjukan = (id) => {
    setData(data.map(item => item.id === id ? { ...item, status: "submitted" } : item));
    startTransition(() => {
      updateRppStatus(id, "submitted");
    });
  };

  const handleBatalAjukan = (id) => {
    setData(data.map(item => item.id === id ? { ...item, status: "draft" } : item));
    startTransition(() => {
      updateRppStatus(id, "draft");
    });
  };

  const handleAIGenerate = async () => {
    if (!formData.judul || !formData.mapelId) {
      alert("Mohon isi Materi Pokok dan Mata Pelajaran terlebih dahulu agar AI bisa bekerja.");
      return;
    }
    
    const selectedMapel = initialMapel?.find(m => m.id == formData.mapelId)?.nama || "Mata Pelajaran";

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-rpp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: formData.judul,
          mapel: selectedMapel,
          tingkat: formData.tingkat,
          semester: formData.semester,
          targetKognitif: formData.targetKognitif,
        })
      });
      const aiData = await res.json();
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          tujuan: aiData.tujuan || prev.tujuan,
          pendahuluan: aiData.pendahuluan || prev.pendahuluan,
          inti: aiData.inti || prev.inti,
          penutup: aiData.penutup || prev.penutup,
          penilaian: aiData.penilaian || prev.penilaian,
          alokasiWaktu: aiData.alokasiWaktu || prev.alokasiWaktu,
          aiGenerated: true,
        }));
      } else {
        alert("Gagal men-generate RPP: " + aiData.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat menghubungi AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const selectedMapelName = initialMapel?.find(m => m.id === formData.mapelId)?.nama || "Mata Pelajaran";
    const dataToSave = { ...formData, mapel: selectedMapelName };

    if (editingItem) {
      setData(data.map(item => item.id === editingItem.id ? { ...dataToSave, id: item.id, updatedAt: new Date().toISOString() } : item));
      startTransition(() => {
        updateRpp(editingItem.id, dataToSave);
      });
    } else {
      const tempId = Date.now();
      setData([...data, { ...dataToSave, id: tempId, aiGenerated: dataToSave.aiGenerated || false, updatedAt: new Date().toISOString() }]);
      startTransition(() => {
        createRpp(dataToSave);
      });
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setData(data.filter(item => item.id !== deletingId));
    startTransition(() => {
      deleteRpp(deletingId);
    });
    setIsDeleteOpen(false);
  };

  if (printData) {
    return (
      <div className="bg-slate-100 min-h-screen -m-4 sm:-m-8 p-4 sm:p-8 font-serif text-black relative z-50 print:bg-transparent print:m-0 print:p-0">
        <style>{`
          @media print {
            body, html, main { background-color: white !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}</style>
        <div className="max-w-4xl mx-auto">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6 print:hidden bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <Button variant="outline" onClick={() => setPrintData(null)}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" /> Cetak RPP
              </Button>
            </div>
          </div>
          
          {/* A4 Paper Container */}
          <div className="bg-white p-8 sm:p-12 sm:pt-16 shadow-xl print:shadow-none print:p-0 min-h-[297mm]">
            
            {/* Kop Surat */}
            <div className="flex items-center border-b-4 border-double border-slate-900 pb-4 mb-6">
              <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                {/* Logo Placeholder */}
                <div className="w-20 h-20 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-slate-800" />
                </div>
              </div>
              <div className="flex-1 text-center pr-24">
                <h3 className="text-lg font-bold uppercase tracking-wider">Kementerian Agama Republik Indonesia</h3>
                <h2 className="text-2xl font-extrabold uppercase mt-1 mb-1">MI Tahfizh Cendekia Pekanbaru</h2>
                <p className="text-sm">Jl. Pendidikan No. 123, Kota Pekanbaru, Riau 28292</p>
                <p className="text-sm">Email: info@mitahfizhcendekia.sch.id | Telp: (0761) 1234567</p>
              </div>
            </div>

            <h1 className="text-xl font-bold text-center underline mb-8 uppercase">RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</h1>
            
            <table className="w-full mb-8 text-[15px]">
              <tbody>
                <tr><td className="w-48 py-1.5 font-semibold">Satuan Pendidikan</td><td className="w-4">:</td><td>MI Tahfizh Cendekia</td></tr>
                <tr><td className="py-1.5 font-semibold">Mata Pelajaran</td><td>:</td><td>{printData.mapel}</td></tr>
                <tr><td className="py-1.5 font-semibold">Materi Pokok</td><td>:</td><td>{printData.judul}</td></tr>
                <tr><td className="py-1.5 font-semibold">Kelas / Fase</td><td>:</td><td>{printData.tingkat}</td></tr>
                <tr><td className="py-1.5 font-semibold">Semester</td><td>:</td><td>{printData.semester}</td></tr>
                <tr><td className="py-1.5 font-semibold">Alokasi Waktu</td><td>:</td><td>{printData.alokasiWaktu}</td></tr>
                <tr><td className="py-1.5 font-semibold">Target Kognitif</td><td>:</td><td className="font-bold">{getTaksonomiLabel(printData.targetKognitif)}</td></tr>
              </tbody>
            </table>

            <div className="space-y-6 text-[15px] leading-relaxed">
              <div>
                <h2 className="font-bold mb-2">A. Tujuan Pembelajaran</h2>
                <div className="pl-4 ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={renderHTML(printData.tujuan)} />
              </div>
              
              <div>
                <h2 className="font-bold mb-2">B. Kegiatan Pembelajaran</h2>
                <div className="pl-4 space-y-4">
                  <div>
                    <h3 className="font-semibold italic mb-1">1. Pendahuluan</h3>
                    <div className="pl-4 ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={renderHTML(printData.pendahuluan)} />
                  </div>
                  <div>
                    <h3 className="font-semibold italic mb-1">2. Kegiatan Inti</h3>
                    <div className="pl-4 ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={renderHTML(printData.inti)} />
                  </div>
                  <div>
                    <h3 className="font-semibold italic mb-1">3. Penutup</h3>
                    <div className="pl-4 ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={renderHTML(printData.penutup)} />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-bold mb-2">C. Penilaian Pembelajaran (Asesmen)</h2>
                <div className="pl-4 ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={renderHTML(printData.penilaian)} />
              </div>
            </div>

            <div className="mt-16 flex justify-between">
              <div className="text-center w-64">
                <p>Mengetahui,</p>
                <p>Kepala Madrasah</p>
                <div className="h-24"></div>
                <p className="font-bold underline">Ahmad Fulan, S.Pd.I</p>
                <p>NIP. 198001012005011001</p>
              </div>
              <div className="text-center w-64">
                <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Guru Mata Pelajaran</p>
                <div className="h-24"></div>
                <p className="font-bold underline">Siti Rahmah, S.Pd</p>
                <p>NIP. 199002022015042002</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">RPP / Modul Ajar</h1>
          <p className="text-slate-500 mt-1">Kelola Rencana Pelaksanaan Pembelajaran Standar Nasional</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { handleOpenAdd(); alert("Silakan isi Materi Pokok lalu klik tombol 'AI Generate Konten' di dalam form."); }}>
            <Sparkles className="w-4 h-4 mr-1 text-amber-500" /> AI Generate
          </Button>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1" /> Buat Baru
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari RPP berdasarkan materi pokok..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "draft", "submitted", "approved", "revision"].map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "Semua" : statusConfig[s]?.label || s}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0 border-b border-slate-200">
        {uniqueMapels.map(mapel => (
          <button 
             key={mapel}
             onClick={() => setActiveMapel(mapel)}
             className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-[2px] ${activeMapel === mapel ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            {mapel}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {Object.entries(groupedRpp).length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Tidak ada RPP ditemukan</p>
          </div>
        ) : (
          Object.entries(groupedRpp).map(([mapel, rpps]) => (
            <div key={mapel} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{mapel}</h2>
                <Badge variant="secondary" className="ml-2">{rpps.length} Modul</Badge>
              </div>
              {rpps.map((rpp) => {
                const statusCfg = statusConfig[rpp.status] || statusConfig.draft;
                return (
                  <Card key={rpp.id} className="border-slate-100 hover:shadow-md transition-all">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-1">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{rpp.judul}</h3>
                          {rpp.aiGenerated === 1 || rpp.aiGenerated === true ? (
                            <Badge variant="warning" className="text-[10px]">
                              <Sparkles className="w-3 h-3 mr-1" /> AI
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1 mb-2">Tujuan: {rpp.tujuan}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <Badge variant="outline">{rpp.mapel}</Badge>
                          <Badge variant="secondary">{rpp.tingkat} - Smt {rpp.semester}</Badge>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            Taksonomi: {getTaksonomiLabel(rpp.targetKognitif)}
                          </Badge>
                          <Badge variant={statusCfg.variant}>
                            <statusCfg.icon className="w-3 h-3 mr-1" />
                            {statusCfg.label}
                          </Badge>
                        </div>
                        {rpp.status === "revision" && rpp.catatanRevisi && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-semibold block mb-0.5">Catatan Revisi dari Kepala Madrasah:</span>
                              {rpp.catatanRevisi}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {(rpp.status === "draft" || rpp.status === "revision") ? (
                          <>
                            <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={() => handleAjukan(rpp.id)}>
                              <Send className="w-3.5 h-3.5 mr-1" /> Ajukan
                            </Button>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(rpp)}><Edit className="w-4 h-4 text-slate-500" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(rpp.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </div>
                          </>
                        ) : (
                          <>
                            {rpp.status === "submitted" && (
                              <Button variant="outline" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={() => handleBatalAjukan(rpp.id)}>
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Batal Ajukan
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(rpp, true)}>
                              <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> Lihat Detail
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPrintData(rpp)}>
                              <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" /> Cetak
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Modal CRUD RPP */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{editingItem ? (isReadOnly ? "Detail RPP" : "Edit RPP") : "Tambah RPP (Standar Nasional)"}</DialogTitle>
              {!isReadOnly && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  {isGenerating ? "Menganalisis..." : "AI Generate Konten"}
                </Button>
              )}
            </div>
            <DialogDescription>
              {isReadOnly ? "Dokumen ini sudah diajukan atau disetujui sehingga terkunci." : "Isi judul dan mata pelajaran, lalu klik 'AI Generate' untuk mempercepat penyusunan."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Materi Pokok / Judul</Label>
                <Input 
                  value={formData.judul} 
                  onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                  placeholder="Misal: Teks Deskripsi"
                />
              </div>
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <select 
                  value={formData.mapelId}
                  onChange={(e) => setFormData({...formData, mapelId: parseInt(e.target.value)})}
                  disabled={isReadOnly}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:bg-slate-50"
                >
                  {initialMapel?.map(m => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kelas / Fase</Label>
                <select 
                  value={formData.tingkat}
                  onChange={(e) => setFormData({...formData, tingkat: e.target.value})}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all duration-200"
                >
                  <option value="Kelas 1 (Fase A)">Kelas 1 (Fase A)</option>
                  <option value="Kelas 2 (Fase A)">Kelas 2 (Fase A)</option>
                  <option value="Kelas 3 (Fase B)">Kelas 3 (Fase B)</option>
                  <option value="Kelas 4 (Fase B)">Kelas 4 (Fase B)</option>
                  <option value="Kelas 5 (Fase C)">Kelas 5 (Fase C)</option>
                  <option value="Kelas 6 (Fase C)">Kelas 6 (Fase C)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <select 
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all duration-200"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Alokasi Waktu</Label>
                <Input 
                  value={formData.alokasiWaktu} 
                  onChange={(e) => setFormData({...formData, alokasiWaktu: e.target.value})} 
                  placeholder="Misal: 2 x 35 Menit"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Taksonomi Bloom</Label>
                <select 
                  value={formData.targetKognitif}
                  onChange={(e) => setFormData({...formData, targetKognitif: e.target.value})}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all duration-200"
                >
                  <option value="C1 - Mengingat">C1 - Mengingat (LOTS)</option>
                  <option value="C2 - Memahami">C2 - Memahami (LOTS)</option>
                  <option value="C3 - Mengaplikasikan">C3 - Mengaplikasikan (MOTS)</option>
                  <option value="C4 - Menganalisis">C4 - Menganalisis (HOTS)</option>
                  <option value="C5 - Mengevaluasi">C5 - Mengevaluasi (HOTS)</option>
                  <option value="C6 - Mencipta">C6 - Mencipta (HOTS)</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100 my-2" />

            <div className="space-y-2">
              <Label className="font-semibold text-slate-800">A. Tujuan Pembelajaran</Label>
              <ReactQuill 
                theme="snow"
                value={formData.tujuan}
                onChange={(val) => setFormData({...formData, tujuan: val})}
                placeholder="Setelah mengikuti proses pembelajaran, peserta didik diharapkan dapat..."
                className="bg-white rounded-lg [&_.ql-editor]:min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="font-semibold text-slate-800">B. Kegiatan Pembelajaran</Label>
              <div className="pl-4 border-l-2 border-emerald-100 space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">1. Pendahuluan (Apersepsi, Motivasi)</Label>
                  <ReactQuill 
                    theme="snow"
                    value={formData.pendahuluan}
                    onChange={(val) => setFormData({...formData, pendahuluan: val})}
                    placeholder="Contoh: Guru membuka kelas dengan salam..."
                    className="bg-white rounded-lg [&_.ql-editor]:min-h-[100px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">2. Kegiatan Inti (Pemberian rangsangan, Pembuktian)</Label>
                  <ReactQuill 
                    theme="snow"
                    value={formData.inti}
                    onChange={(val) => setFormData({...formData, inti: val})}
                    placeholder="Contoh: Siswa mengamati video, lalu berdiskusi..."
                    className="bg-white rounded-lg [&_.ql-editor]:min-h-[150px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">3. Penutup (Refleksi, Tindak Lanjut)</Label>
                  <ReactQuill 
                    theme="snow"
                    value={formData.penutup}
                    onChange={(val) => setFormData({...formData, penutup: val})}
                    placeholder="Contoh: Guru bersama siswa menyimpulkan..."
                    className="bg-white rounded-lg [&_.ql-editor]:min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-slate-800">C. Penilaian Pembelajaran (Asesmen)</Label>
              <ReactQuill 
                theme="snow"
                value={formData.penilaian}
                onChange={(val) => setFormData({...formData, penilaian: val})}
                placeholder="Contoh: Sikap (Observasi), Pengetahuan (Tes Tertulis), Keterampilan (Unjuk Kerja)"
                className="bg-white rounded-lg [&_.ql-editor]:min-h-[100px]"
              />
            </div>

          </div>
          <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Tutup</Button>
            {!isReadOnly && <Button onClick={handleSave} disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan RPP"}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus RPP ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
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
