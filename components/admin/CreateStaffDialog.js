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
import { createStaff } from '@/app/actions/staffActions'

export function CreateStaffDialog({ daftarRoles = [] }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    // UI state
    const [selectedRole, setSelectedRole] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        const formData = new FormData(e.currentTarget)
        const res = await createStaff(formData)

        if (res.success) {
            setSuccess(res.message)
            setTimeout(() => {
                setOpen(false)
                setSuccess('')
                router.refresh()
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
                    Tambah Staf Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Pendaftaran Staf & Guru</DialogTitle>
                        <DialogDescription>
                            Masukkan detail akun staf baru. Password *default* akan disetel sama dengan alamat Email.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="text-sm font-bold text-slate-800 border-b pb-2">Data Pengguna</div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="namaLengkap" className="text-right">
                                Nama Lengkap
                            </Label>
                            <Input
                                id="namaLengkap"
                                name="namaLengkap"
                                placeholder="Ahmad S.Pd"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email Pribadi
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="ahmad@madrasah.com"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="roleId" className="text-right">
                                Peran (Role)
                            </Label>
                            <select 
                                name="roleId" 
                                id="roleId"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="col-span-3 flex h-10 w-full rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                required
                            >
                                <option value="">Pilih Role...</option>
                                {daftarRoles.map(r => (
                                    <option key={r.id} value={r.id}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tampilkan kolom tambahan jika role adalah Guru */}
                        {daftarRoles.find(r => r.id.toString() === selectedRole)?.namaRole === 'guru' && (
                            <>
                                <div className="text-sm font-bold text-slate-800 border-b pb-2 mt-4">Detail Guru</div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="nip" className="text-right">
                                        NIP / NUPTK
                                    </Label>
                                    <Input
                                        id="nip"
                                        name="nip"
                                        placeholder="198001012010011001"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="noHp" className="text-right">
                                        No. HP
                                    </Label>
                                    <Input
                                        id="noHp"
                                        name="noHp"
                                        type="tel"
                                        placeholder="081234567890"
                                        className="col-span-3"
                                    />
                                </div>
                            </>
                        )}
                        
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                            <input 
                                type="checkbox" 
                                id="isOrangTua" 
                                name="isOrangTua" 
                                value="true"
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                            />
                            <Label htmlFor="isOrangTua" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Pengguna ini sekaligus merupakan Orang Tua / Wali Murid
                            </Label>
                        </div>

                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        {success && <p className="text-emerald-600 text-sm mt-2 font-medium">{success}</p>}
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                            {loading ? 'Menyimpan...' : 'Simpan Akun'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
