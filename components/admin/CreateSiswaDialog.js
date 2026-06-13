'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSiswaDanOrangTua, searchOrangTuaByHp } from '@/app/actions/siswaActions'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export function CreateSiswaDialog({ kelasList = [] }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    // Auto-fill state
    const [noHp, setNoHp] = useState('')
    const [namaOrtu, setNamaOrtu] = useState('')
    const [foundOrtu, setFoundOrtu] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    // Debounced search for Orang Tua
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (noHp.length >= 10) {
                setIsSearching(true)
                const result = await searchOrangTuaByHp(noHp)
                if (result) {
                    setNamaOrtu(result.namaAyah || result.namaIbu || '')
                    setFoundOrtu(true)
                } else {
                    setFoundOrtu(false)
                }
                setIsSearching(false)
            } else {
                setFoundOrtu(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [noHp])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        const formData = new FormData(e.currentTarget)
        
        const res = await createSiswaDanOrangTua(formData)

        if (res.success) {
            setSuccess(res.message)
            setTimeout(() => {
                setOpen(false)
                setSuccess('')
                router.refresh() // Memperbarui data tabel (menjalankan ulang server component)
            }, 1500)
        } else {
            setError(res.error || 'Gagal membuat data')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Siswa & Orang Tua
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Pendaftaran Siswa Baru</DialogTitle>
                        <DialogDescription>
                            Masukkan data siswa dan nomor HP orang tua. Jika nomor HP sudah terdaftar, sistem akan otomatis menghubungkan siswa ke akun orang tua tersebut.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="text-sm font-bold text-slate-800 border-b pb-2">Data Siswa</div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="namaSiswa" className="text-right">
                                Nama Siswa
                            </Label>
                            <Input
                                id="namaSiswa"
                                name="namaSiswa"
                                placeholder="Budi Santoso"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nis" className="text-right">
                                NIS (Lokal)
                            </Label>
                            <Input
                                id="nis"
                                name="nis"
                                placeholder="1234"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nisn" className="text-right">
                                NISN
                            </Label>
                            <Input
                                id="nisn"
                                name="nisn"
                                placeholder="0012345678"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="jenisKelamin" className="text-right">
                                Jenis Kelamin
                            </Label>
                            <select 
                                name="jenisKelamin" 
                                id="jenisKelamin"
                                className="col-span-3 flex h-10 w-full rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                            >
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tempatLahir" className="text-right">
                                Tempat Lahir
                            </Label>
                            <Input
                                id="tempatLahir"
                                name="tempatLahir"
                                placeholder="Jakarta"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tanggalLahir" className="text-right">
                                Tanggal Lahir
                            </Label>
                            <Input
                                id="tanggalLahir"
                                name="tanggalLahir"
                                type="date"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="alamat" className="text-right">
                                Alamat
                            </Label>
                            <Input
                                id="alamat"
                                name="alamat"
                                placeholder="Jl. Raya No. 1"
                                className="col-span-3"
                            />
                        </div>
                        {kelasList.length > 0 && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="kelasId" className="text-right">
                                    Kelas
                                </Label>
                                <select 
                                    name="kelasId" 
                                    id="kelasId"
                                    className="col-span-3 flex h-10 w-full rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                >
                                    <option value="">Pilih Kelas</option>
                                    {kelasList.map(k => (
                                        <option key={k.id} value={k.id}>{k.namaKelas} - Tingkat {k.tingkat}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="text-sm font-bold text-slate-800 border-b pb-2 mt-4">Data Orang Tua</div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="noHp" className="text-right">
                                No. HP
                            </Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="noHp"
                                    name="noHp"
                                    type="tel"
                                    placeholder="081234567890"
                                    required
                                    value={noHp}
                                    onChange={(e) => setNoHp(e.target.value)}
                                />
                                {isSearching && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mencari data...
                                    </p>
                                )}
                                {foundOrtu && (
                                    <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium bg-emerald-50 p-1.5 rounded-md border border-emerald-100">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> 
                                        Data ditemukan! Siswa akan ditautkan ke akun ini.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="namaOrtu" className="text-right">
                                Nama Orang Tua
                            </Label>
                            <Input
                                id="namaOrtu"
                                name="namaOrtu"
                                placeholder="Ahmad Santoso"
                                required
                                value={namaOrtu}
                                onChange={(e) => setNamaOrtu(e.target.value)}
                                readOnly={foundOrtu}
                                className={`col-span-3 ${foundOrtu ? "bg-slate-50 text-slate-500 font-medium" : ""}`}
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground text-center mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            No. HP ini akan digunakan sebagai Username login orang tua. <br/> Password default adalah No. HP itu sendiri.
                        </p>
                        
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        {success && <p className="text-green-600 text-sm mt-2 font-medium">{success}</p>}
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
