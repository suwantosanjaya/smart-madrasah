'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStaff } from '@/app/actions/staffActions'

export function EditStaffDialog({ open, onOpenChange, staff, daftarRoles = [] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    // UI state
    const [selectedRole, setSelectedRole] = useState('')
    const [namaLengkap, setNamaLengkap] = useState('')
    const [email, setEmail] = useState('')
    const [nip, setNip] = useState('')
    const [noHp, setNoHp] = useState('')
    const [isOrangTua, setIsOrangTua] = useState(false)

    useEffect(() => {
        if (staff && open) {
            setNamaLengkap(staff.namaLengkap || '')
            setEmail(staff.email || '')
            setSelectedRole(staff.roleId?.toString() || '')
            setNip(staff.nip || '')
            setNoHp(staff.noHp || '')
            setIsOrangTua(staff.roleKeys?.includes('orangtua') || false)
            setError('')
            setSuccess('')
        }
    }, [staff, open])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        const formData = new FormData(e.currentTarget)
        const res = await updateStaff(staff.id, formData)

        if (res.success) {
            setSuccess(res.message)
            setTimeout(() => {
                onOpenChange(false)
                setSuccess('')
                router.refresh()
            }, 1000)
        } else {
            setError(res.error || 'Gagal menyimpan data')
        }
        setLoading(false)
    }

    const selectedRoleData = daftarRoles.find(r => r.id.toString() === selectedRole)
    const isTeacherRole = selectedRoleData && ['guru', 'kepala_madrasah'].includes(selectedRoleData.namaRole)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Profil Staf</DialogTitle>
                        <DialogDescription>
                            Perbarui detail informasi akun staf atau guru.
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
                                value={namaLengkap}
                                onChange={(e) => setNamaLengkap(e.target.value)}
                                placeholder="Ahmad S.Pd"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                        {/* Tampilkan kolom tambahan jika role adalah Guru atau Kepala Madrasah */}
                        {isTeacherRole && (
                            <>
                                <div className="text-sm font-bold text-slate-800 border-b pb-2 mt-4">Detail Tambahan</div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="nip" className="text-right">
                                        NIP / NUPTK
                                    </Label>
                                    <Input
                                        id="nip"
                                        name="nip"
                                        value={nip}
                                        onChange={(e) => setNip(e.target.value)}
                                        placeholder="198001012010011001"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="noHp" className="text-right">
                                        No. WhatsApp
                                    </Label>
                                    <Input
                                        id="noHp"
                                        name="noHp"
                                        type="tel"
                                        value={noHp}
                                        onChange={(e) => setNoHp(e.target.value)}
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
                                checked={isOrangTua} 
                                onChange={(e) => setIsOrangTua(e.target.checked)} 
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
