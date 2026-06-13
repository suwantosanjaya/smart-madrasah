"use client";

import { useState, useEffect, useTransition } from "react";
import {
  FileText,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  User,
  MessageSquare,
  ChevronLeft,
  Printer,
  XCircle,
  BookOpen,
} from "lucide-react";
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
import { giveRevision, approveRpp } from "@/app/actions/rpp";

const statusConfig = {
  submitted: { label: "Menunggu Persetujuan", variant: "info", icon: Clock },
  approved: { label: "Disetujui", variant: "success", icon: CheckCircle2 },
  revision: { label: "Direvisi", variant: "warning", icon: AlertCircle },
};

export default function ApprovalClient({ initialData }) {
  const [data, setData] = useState(initialData || []);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [revisingItem, setRevisingItem] = useState(null);
  const [catatan, setCatatan] = useState("");
  const [printData, setPrintData] = useState(null);

  const filteredRpp = data.filter((r) => {
    const matchSearch = r.judul.toLowerCase().includes(search.toLowerCase()) || 
                        (r.guruNama && r.guruNama.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = (id) => {
    setData(data.map(item => item.id === id ? { ...item, status: "approved", catatanRevisi: null } : item));
    startTransition(() => {
      approveRpp(id);
    });
  };

  const handleOpenRevise = (item) => {
    setRevisingItem(item);
    setCatatan(item.catatanRevisi || "");
    setIsReviseOpen(true);
  };

  const submitRevision = () => {
    if (!catatan.trim()) {
      alert("Catatan revisi tidak boleh kosong.");
      return;
    }
    setData(data.map(item => item.id === revisingItem.id ? { ...item, status: "revision", catatanRevisi: catatan } : item));
    startTransition(() => {
      giveRevision(revisingItem.id, catatan);
    });
    setIsReviseOpen(false);
  };

  if (printData) {
    return (
      <div className="bg-slate-100 min-h-screen -m-4 sm:-m-8 p-4 sm:p-8 font-serif text-black relative z-50">
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
            <h1 className="text-xl font-bold text-center underline mb-8 uppercase">RENCANA PELAKSANAAN PEMBELAJARAN (RPP)</h1>
            
            <table className="w-full mb-8 text-[15px]">
              <tbody>
                <tr><td className="w-48 py-1.5 font-semibold">Satuan Pendidikan</td><td className="w-4">:</td><td>MI Tahfizh Cendekia</td></tr>
                <tr><td className="py-1.5 font-semibold">Mata Pelajaran</td><td>:</td><td>{printData.mapel}</td></tr>
                <tr><td className="py-1.5 font-semibold">Materi Pokok</td><td>:</td><td>{printData.judul}</td></tr>
                <tr><td className="py-1.5 font-semibold">Kelas / Fase</td><td>:</td><td>{printData.tingkat}</td></tr>
                <tr><td className="py-1.5 font-semibold">Semester</td><td>:</td><td>{printData.semester}</td></tr>
                <tr><td className="py-1.5 font-semibold">Alokasi Waktu</td><td>:</td><td>{printData.alokasiWaktu}</td></tr>
              </tbody>
            </table>

            <div className="space-y-6 text-[15px] leading-relaxed">
              <div>
                <h2 className="font-bold mb-2">A. Tujuan Pembelajaran</h2>
                <div className="pl-4 whitespace-pre-wrap">{printData.tujuan}</div>
              </div>
              
              <div>
                <h2 className="font-bold mb-2">B. Kegiatan Pembelajaran</h2>
                <div className="pl-4 space-y-4">
                  <div>
                    <h3 className="font-semibold italic mb-1">1. Pendahuluan</h3>
                    <div className="pl-4 whitespace-pre-wrap">{printData.pendahuluan}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold italic mb-1">2. Kegiatan Inti</h3>
                    <div className="pl-4 whitespace-pre-wrap">{printData.inti}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold italic mb-1">3. Penutup</h3>
                    <div className="pl-4 whitespace-pre-wrap">{printData.penutup}</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-bold mb-2">C. Penilaian Pembelajaran (Asesmen)</h2>
                <div className="pl-4 whitespace-pre-wrap">{printData.penilaian}</div>
              </div>
            </div>

            <div className="mt-16 flex justify-between">
              <div className="text-center w-64">
                <p>Mengetahui,</p>
                <p>Kepala Madrasah</p>
                <div className="h-24"></div>
                <p className="font-bold underline">Melia Asnita, S.Pd., M.Pd</p>
                <p>NIP. 198001012005011001</p>
              </div>
              <div className="text-center w-64">
                <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Guru Mata Pelajaran</p>
                <div className="h-24"></div>
                <p className="font-bold underline">{printData.guruNama || "Siti Rahmah, S.Pd"}</p>
                <p>NIP. -</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Persetujuan RPP</h1>
          <p className="text-slate-500 mt-1">Tinjau dan setujui RPP / Modul Ajar yang diajukan oleh guru</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari RPP atau nama guru..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "submitted", "approved", "revision"].map((s) => (
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

      <div className="space-y-4">
        {filteredRpp.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Tidak ada RPP yang perlu ditinjau</p>
          </div>
        ) : (
          filteredRpp.map((rpp) => {
            const statusCfg = statusConfig[rpp.status] || statusConfig.submitted;
            return (
              <Card key={rpp.id} className="border-slate-200 hover:shadow-md transition-all">
                <CardContent className="p-5 flex flex-col md:flex-row items-start gap-5">
                  
                  {/* Left Column: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{rpp.judul}</h3>
                      <Badge variant={statusCfg.variant} className="ml-2">
                        <statusCfg.icon className="w-3.5 h-3.5 mr-1" />
                        {statusCfg.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        Oleh: <span className="font-semibold text-slate-800 ml-1">{rpp.guruNama || "Guru Mata Pelajaran"}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                        Mapel: <span className="text-slate-800 ml-1">{rpp.mapel}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <FileText className="w-4 h-4 mr-2 text-slate-400" />
                        Tingkat: <span className="text-slate-800 ml-1">{rpp.tingkat} - Smt {rpp.semester}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        Waktu: <span className="text-slate-800 ml-1">{rpp.alokasiWaktu}</span>
                      </div>
                    </div>

                    {rpp.status === "revision" && rpp.catatanRevisi && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold block mb-0.5">Catatan Revisi Anda:</span>
                          {rpp.catatanRevisi}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setPrintData(rpp)}>
                      <Eye className="w-4 h-4 mr-2 text-slate-500" /> Tinjau / Cetak
                    </Button>
                    
                    {rpp.status === "submitted" && (
                      <>
                        <Button 
                          className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white" 
                          onClick={() => handleApprove(rpp.id)}
                          disabled={isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 md:flex-none text-amber-600 hover:bg-amber-50 border-amber-200" 
                          onClick={() => handleOpenRevise(rpp)}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" /> Minta Revisi
                        </Button>
                      </>
                    )}
                  </div>
                  
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Revisi */}
      <Dialog open={isReviseOpen} onOpenChange={setIsReviseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Berikan Catatan Revisi</DialogTitle>
            <DialogDescription>
              Catatan ini akan dikirimkan ke guru yang bersangkutan untuk diperbaiki sebelum RPP disetujui.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>RPP: {revisingItem?.judul}</Label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 resize-y"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Tolong tambahkan metode pembelajaran yang lebih interaktif pada Kegiatan Inti..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviseOpen(false)}>Batal</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={submitRevision} disabled={isPending}>
              {isPending ? "Mengirim..." : "Kirim Revisi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
