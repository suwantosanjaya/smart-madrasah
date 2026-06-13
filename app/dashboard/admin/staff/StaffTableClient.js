"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, ShieldOff, ShieldCheck, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleStatusStaff, deleteStaff } from "@/app/actions/staffActions";

// Dialog/Modal UI Kustom
function CustomDialog({ isOpen, title, message, onConfirm, onCancel, type = "danger", isLoading = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className={`text-lg font-bold mb-2 ${type === "danger" ? "text-red-600" : type === "warning" ? "text-amber-600" : "text-emerald-600"}`}>
            {title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
          {!isLoading && <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>}
          {type !== "info" && (
            <button 
              onClick={onConfirm} 
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                type === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Memproses..." : "Ya, Lanjutkan"}
            </button>
          )}
          {type === "info" && (
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors">Tutup</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StaffTableClient({ daftarStaff, currentUserRole, currentUserId }) {
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  
  // Table features state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "namaLengkap", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Custom Dialog States
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", action: null });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const handleToggleStatus = async (userId, currentStatus) => {
    setOpenDropdownId(null);
    setLoadingId(userId);
    try {
      const res = await toggleStatusStaff(userId, currentStatus);
      if (!res.success) {
        setAlertDialog({ isOpen: true, title: "Gagal", message: res.error || "Gagal mengubah status", type: "danger" });
      } else {
        router.refresh();
      }
    } catch (err) {
      setAlertDialog({ isOpen: true, title: "Error", message: "Terjadi kesalahan jaringan.", type: "danger" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleHardDelete = async (userId, isActive) => {
    setOpenDropdownId(null);
    
    if (isActive === 1) {
      setAlertDialog({ 
        isOpen: true, 
        title: "Tindakan Ditolak", 
        message: "Akun staf masih aktif! Nonaktifkan akun terlebih dahulu sebelum menghapus.", 
        type: "danger" 
      });
      return;
    }
    
    setConfirmDialog({
      isOpen: true,
      title: "Hapus Permanen Akun Staf",
      message: "Data staf dan detail terkait akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      action: async () => {
        setLoadingId(userId);
        try {
          const res = await deleteStaff(userId);
          if (!res.success) {
            setAlertDialog({ isOpen: true, title: "Gagal", message: res.error || "Gagal menghapus", type: "danger" });
          } else {
            router.refresh();
          }
        } catch (err) {
          setAlertDialog({ isOpen: true, title: "Error", message: "Kesalahan jaringan", type: "danger" });
        } finally {
          setLoadingId(null);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // 1. Filtering
  const filteredData = daftarStaff.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.namaLengkap || "").toLowerCase().includes(term) ||
      (item.email || "").toLowerCase().includes(term) ||
      (item.labelRole || "").toLowerCase().includes(term) ||
      (item.nip || "").toLowerCase().includes(term)
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
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari nama, email, nip..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">Total: {filteredData.length} Staf</div>
      </div>
      
      <div className="overflow-x-auto" style={{ minHeight: "300px" }}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('namaLengkap')}>Nama Lengkap {sortConfig.key === 'namaLengkap' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('email')}>Email / NIP {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('labelRole')}>Peran (Role) {sortConfig.key === 'labelRole' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('isActive')}>Status {sortConfig.key === 'isActive' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th className="px-4 py-3 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? paginatedData.map((item) => (
                <tr key={`${item.id}-${item.namaRole}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.namaLengkap}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-900">{item.email}</div>
                    {item.nip && <div className="text-xs text-slate-500 mt-0.5">NIP: {item.nip}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.namaRole === 'guru' ? 'bg-emerald-100 text-emerald-800' : item.namaRole === 'admin' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                      {item.labelRole}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isActive === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {item.isActive === 1 ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    {loadingId === item.id ? (
                      <div className="w-8 h-8 mx-auto flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        {openDropdownId === item.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
                            <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                              {/* Cek Hak Akses untuk Semua Aksi */}
                              {(() => {
                                const isSelf = item.id === currentUserId;
                                const isTargetSuperAdmin = item.namaRole === 'super_admin';
                                const isTargetAdmin = item.namaRole === 'admin';
                                
                                // Aturan:
                                // 1. Tidak bisa edit/hapus diri sendiri lewat tabel ini (harus lewat profil)
                                // 2. Admin biasa tidak bisa edit/hapus super_admin atau sesama admin
                                const canModify = !isSelf && (
                                  currentUserRole === 'super_admin' || 
                                  (currentUserRole === 'admin' && !isTargetSuperAdmin && !isTargetAdmin)
                                );

                                if (!canModify) {
                                  return (
                                    <div className="px-4 py-3 text-xs text-slate-400 italic text-center bg-slate-50">
                                      {isSelf ? "Ini adalah akun Anda" : "Akses Terbatas"}
                                    </div>
                                  );
                                }

                                return (
                                  <>
                                    <button onClick={() => { setAlertDialog({isOpen:true, title:"Info", message:"Fitur edit staf sedang dikembangkan", type:"info"}); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors">
                                      <Edit className="w-4 h-4 text-slate-400" />
                                      <span className="font-medium">Edit Profil</span>
                                    </button>
                                    
                                    <button 
                                      onClick={() => handleToggleStatus(item.id, item.isActive)}
                                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors"
                                    >
                                      {item.isActive === 1 ? <ShieldOff className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                      <span className="font-medium">{item.isActive === 1 ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}</span>
                                    </button>
                                    
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    
                                    <button 
                                      onClick={() => handleHardDelete(item.id, item.isActive)}
                                      disabled={item.isActive === 1}
                                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${item.isActive === 1 ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' : 'hover:bg-red-50 text-red-700'}`}
                                    >
                                      <Trash2 className={`w-4 h-4 ${item.isActive === 1 ? 'text-slate-400' : 'text-red-600'}`} />
                                      <span className="font-medium">Hapus Permanen</span>
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              )) : (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500 bg-slate-50/50">Tidak ada data staf ditemukan</td></tr>
            )}
          </tbody>
        </table>
        {/* Tambahkan ruang kosong di bawah agar dropdown baris terakhir tidak terpotong (clipped) */}
        <div className="h-32 bg-transparent"></div>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Tampilkan</span>
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-slate-200 bg-white text-slate-700 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
          </select>
          <span className="text-sm text-slate-500">baris</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">Halaman <span className="font-medium text-slate-700">{currentPage}</span> dari <span className="font-medium text-slate-700">{Math.max(1, totalPages)}</span></div>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages || totalPages === 0} className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages || totalPages === 0} className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <CustomDialog 
        isOpen={confirmDialog.isOpen} 
        title={confirmDialog.title} 
        message={confirmDialog.message} 
        onConfirm={confirmDialog.action} 
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} 
        type="danger" 
        isLoading={loadingId !== null} 
      />
      <CustomDialog 
        isOpen={alertDialog.isOpen} 
        title={alertDialog.title} 
        message={alertDialog.message} 
        onCancel={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))} 
        type={alertDialog.type} 
      />
    </div>
  );
}
