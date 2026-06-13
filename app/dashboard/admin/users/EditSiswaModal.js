"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiswaDanOrangTua } from "@/app/actions/siswaActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function EditSiswaModal({ siswa, daftarKelas, onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await updateSiswaDanOrangTua(siswa.id, formData);

    if (res.success) {
      router.refresh();
      onClose();
    } else {
      setError(res.error || "Gagal memperbarui data.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Edit Data Siswa & Orang Tua</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4">
          <form id="edit-form" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="text-sm font-bold text-slate-800 border-b pb-2">Data Siswa</div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="namaSiswa" className="text-right">Nama Siswa</Label>
                <Input id="namaSiswa" name="namaSiswa" defaultValue={siswa.namaSiswa} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nis" className="text-right">NIS (Lokal)</Label>
                <Input id="nis" name="nis" defaultValue={siswa.nis || ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nisn" className="text-right">NISN</Label>
                <Input id="nisn" name="nisn" defaultValue={siswa.nisn || ""} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jenisKelamin" className="text-right">Jenis Kelamin</Label>
                <select 
                  name="jenisKelamin" 
                  id="jenisKelamin"
                  defaultValue={siswa.jenisKelamin || ""}
                  className="col-span-3 flex h-10 w-full rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tempatLahir" className="text-right">Tempat Lahir</Label>
                <Input id="tempatLahir" name="tempatLahir" defaultValue={siswa.tempatLahir || ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tanggalLahir" className="text-right">Tanggal Lahir</Label>
                <Input id="tanggalLahir" name="tanggalLahir" type="date" defaultValue={siswa.tanggalLahir || ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alamat" className="text-right">Alamat</Label>
                <Input id="alamat" name="alamat" defaultValue={siswa.alamat || ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kelasId" className="text-right">Kelas</Label>
                <select 
                  name="kelasId" 
                  id="kelasId"
                  defaultValue={siswa.kelasId || ""}
                  className="col-span-3 flex h-10 w-full rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Belum ditentukan</option>
                  {daftarKelas.map(k => (
                    <option key={k.id} value={k.id}>{k.namaKelas} - Tingkat {k.tingkat}</option>
                  ))}
                </select>
              </div>

              <div className="text-sm font-bold text-slate-800 border-b pb-2 mt-4">Data Orang Tua</div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="noHp" className="text-right">No. HP</Label>
                <Input id="noHp" name="noHp" type="tel" defaultValue={siswa.noHpOrtu || ""} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="namaOrtu" className="text-right">Nama Orang Tua</Label>
                <Input id="namaOrtu" name="namaOrtu" defaultValue={siswa.namaOrtu || ""} className="col-span-3" required />
              </div>
              
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button type="submit" form="edit-form" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
