"use client";

import { useState } from "react";
import { UserPlus, MoreHorizontal, Edit, Trash2, ShieldOff, ShieldCheck, AlertTriangle, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleStatusSiswa, hapusSiswaPermanen } from "@/app/actions/siswaActions";
import { resetPassword } from "@/app/actions/userActions";
import EditSiswaModal from "./EditSiswaModal";
import { RefreshCcw } from "lucide-react";

export default function UsersTableClient({ daftarSiswa, daftarKelas }) {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [editingSiswa, setEditingSiswa] = useState(null);
  
  // Table features state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "namaSiswa", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Custom Dialog States
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", action: null });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const toggleDropdown = (id) => {
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  const handleToggleStatus = async (siswaId, statusSaatIni) => {
    const statusBaru = statusSaatIni === "aktif" ? "nonaktif" : "aktif";
    setOpenDropdownId(null);
    
    setConfirmDialog({
      isOpen: true,
      title: "Konfirmasi Perubahan Status",
      message: `Apakah Anda yakin ingin me-${statusBaru}kan siswa ini?`,
      action: async () => {
        setConfirmDialog({ isOpen: false });
        setLoadingId(siswaId);
        try {
          const res = await toggleStatusSiswa(siswaId, statusBaru);
          if (res.success) {
            router.refresh();
          } else {
            setAlertDialog({ isOpen: true, title: "Gagal", message: res.error, type: "error" });
          }
        } catch (err) {
          setAlertDialog({ isOpen: true, title: "Error Sistem", message: "Terjadi kesalahan sistem (jaringan/cache). Harap Refresh halaman (F5).", type: "error" });
        }
        setLoadingId(null);
      }
    });
  };

  const handleResetPassword = async (userId) => {
    setOpenDropdownId(null);
    if (!userId) {
      setAlertDialog({ isOpen: true, title: "Gagal", message: "ID User Orang Tua tidak ditemukan.", type: "error" });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "Reset Password",
      message: "Password akun orang tua akan direset menjadi '123456'. Pengguna akan diwajibkan mengganti password pada saat login berikutnya. Lanjutkan?",
      action: async () => {
        setConfirmDialog({ isOpen: false });
        setLoadingId(userId); 
        try {
          const res = await resetPassword(userId);
          if (res.success) {
            setAlertDialog({ isOpen: true, title: "Berhasil", message: res.message, type: "info" });
          } else {
            setAlertDialog({ isOpen: true, title: "Gagal", message: res.error, type: "error" });
          }
        } catch (err) {
          setAlertDialog({ isOpen: true, title: "Error Sistem", message: "Terjadi kesalahan sistem.", type: "error" });
        }
        setLoadingId(null);
      }
    });
  };

  const handleHardDelete = async (siswaId, statusSaatIni) => {
    setOpenDropdownId(null);
    
    if (statusSaatIni === 'aktif') {
      setAlertDialog({ 
        isOpen: true, 
        title: "Tindakan Ditolak", 
        message: "Siswa masih aktif! Anda harus menonaktifkan akun siswa ini terlebih dahulu sebelum dapat menghapusnya secara permanen.", 
        type: "error" 
      });
      return;
    }
    
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Permanen Data Siswa",
      message: "PERINGATAN: Anda akan menghapus data siswa ini secara permanen dari sistem beserta data orang tuanya jika tidak ada anak lain. Ini tidak dapat dibatalkan. Apakah Anda yakin?",
      action: async () => {
        setConfirmDialog({ isOpen: false });
        setLoadingId(siswaId);
        try {
          const res = await hapusSiswaPermanen(siswaId);
          if (res.success) {
            router.refresh();
          } else {
            setAlertDialog({ isOpen: true, title: "Gagal", message: res.error, type: "error" });
          }
        } catch (err) {
          setAlertDialog({ isOpen: true, title: "Error Sistem", message: "Terjadi kesalahan sistem (jaringan/cache). Harap Refresh halaman (F5).", type: "error" });
        }
        setLoadingId(null);
      }
    });
  };

  // 1. Filtering
  const filteredData = daftarSiswa.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.namaSiswa || "").toLowerCase().includes(term) ||
      (item.nisn || "").toLowerCase().includes(term) ||
      (item.namaKelas || "").toLowerCase().includes(term) ||
      (item.namaOrtu || "").toLowerCase().includes(term) ||
      (item.noHpOrtu || "").toLowerCase().includes(term)
    );
  });

  // 2. Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key] || "";
    let bValue = b[sortConfig.key] || "";
    
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();
    
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari nama, NISN, no HP..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Total: {filteredData.length} Data
        </div>
      </div>
      
      <div className="overflow-x-auto" style={{ minHeight: "300px" }}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('nisn')}>
                NISN {sortConfig.key === 'nisn' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('namaSiswa')}>
                Nama Siswa {sortConfig.key === 'namaSiswa' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('namaKelas')}>
                Kelas {sortConfig.key === 'namaKelas' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('namaOrtu')}>
                Orang Tua (Username Login) {sortConfig.key === 'namaOrtu' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('status')}>
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600">{item.nisn || '-'}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.namaSiswa}</td>
                  <td className="px-4 py-3">
                    {item.namaKelas ? (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                        {item.namaKelas}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Belum ada</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{item.namaOrtu || '-'}</span>
                      <span className="text-xs text-emerald-600 font-mono mt-0.5" title="Username/No HP Orang Tua">
                        {item.noHpOrtu || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                      item.status === 'aktif' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    <button 
                      onClick={() => toggleDropdown(item.id)}
                      disabled={loadingId === item.id}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                    >
                      {loadingId === item.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <MoreHorizontal className="w-5 h-5" />
                      )}
                    </button>

                    {/* Custom Dropdown Menu */}
                    {openDropdownId === item.id && (
                      <>
                        {/* Backdrop untuk menutup saat diklik di luar */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setOpenDropdownId(null)}
                        ></div>
                        <div className="absolute right-8 top-10 w-48 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden py-1">
                          
                          {/* Tombol Edit */}
                          <button 
                            onClick={() => {
                              setEditingSiswa(item);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700 font-medium">Edit Profil</span>
                          </button>
                          
                          {/* Tombol Reset Password */}
                          <button 
                            onClick={() => handleResetPassword(item.userIdOrtu)}
                            disabled={!item.userIdOrtu}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${!item.userIdOrtu ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-slate-50 text-amber-700'}`}
                          >
                            <RefreshCcw className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">Reset Password Ortu</span>
                          </button>
                          
                          {/* Tombol Nonaktifkan/Aktifkan */}
                          <button 
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            {item.status === "aktif" ? (
                              <><ShieldOff className="w-4 h-4 text-amber-600" /> <span className="text-amber-700 font-medium">Nonaktifkan Akun</span></>
                            ) : (
                              <><ShieldCheck className="w-4 h-4 text-emerald-600" /> <span className="text-emerald-700 font-medium">Aktifkan Akun</span></>
                            )}
                          </button>
                          
                          <div className="h-px bg-slate-100 my-1"></div>
                          
                          {/* Tombol Hapus Permanen */}
                          <button 
                            onClick={() => handleHardDelete(item.id, item.status)}
                            disabled={item.status === 'aktif'}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                              item.status === 'aktif' 
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' 
                                : 'hover:bg-red-50 text-red-700'
                            }`}
                            title={item.status === 'aktif' ? 'Nonaktifkan akun terlebih dahulu untuk menghapus permanen' : 'Hapus Permanen'}
                          >
                            <Trash2 className={`w-4 h-4 ${item.status === 'aktif' ? 'text-slate-400' : 'text-red-600'}`} />
                            <span className="font-medium">Hapus Permanen</span>
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <UserPlus className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="font-medium text-slate-600">Belum ada data siswa</p>
                    <p className="text-xs mt-1 text-slate-400">Silakan klik "Tambah Siswa & Orang Tua" untuk menambahkan data.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Tampilkan</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-sm border border-slate-200 bg-white text-slate-700 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-slate-500">baris</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Halaman <span className="font-medium text-slate-700">{currentPage}</span> dari <span className="font-medium text-slate-700">{Math.max(1, totalPages)}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {editingSiswa && (
        <EditSiswaModal 
          siswa={editingSiswa} 
          daftarKelas={daftarKelas} 
          onClose={() => setEditingSiswa(null)} 
        />
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-amber-50/50 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold">{confirmDialog.title}</h3>
            </div>
            <div className="p-5 text-slate-600 text-sm">
              {confirmDialog.message}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false })}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDialog.action}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Dialog */}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className={`p-4 border-b border-slate-100 flex items-center gap-3 ${alertDialog.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
              <h3 className="font-semibold">{alertDialog.title}</h3>
            </div>
            <div className="p-5 text-slate-600 text-sm text-center">
              {alertDialog.message}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
              <button 
                onClick={() => setAlertDialog({ isOpen: false })}
                className="px-6 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-900 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
