"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Edit, Trash2, ShieldOff, ShieldCheck,
  KeyRound, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  User, Mail, AlertTriangle, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { toggleAdminStatus, deleteAdmin, resetAdminPassword, updateAdmin } from "@/app/actions/adminActions";

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, type = "danger", isLoading = false }) {
  if (!isOpen) return null;
  const colors = {
    danger: { title: "text-red-600", btn: "bg-red-600 hover:bg-red-700" },
    warning: { title: "text-amber-600", btn: "bg-amber-600 hover:bg-amber-700" },
    success: { title: "text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700" },
    info: { title: "text-blue-600", btn: "bg-slate-800 hover:bg-slate-900" },
  };
  const c = colors[type] || colors.danger;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className={`text-lg font-bold mb-2 ${c.title}`}>{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
          {!isLoading && (
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              {onConfirm ? "Batal" : "Tutup"}
            </button>
          )}
          {onConfirm && (
            <button onClick={onConfirm} disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${c.btn} disabled:opacity-50 disabled:cursor-not-allowed`}>
              {isLoading ? "Memproses..." : "Ya, Lanjutkan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditAdminDialog({ isOpen, admin, onClose, onSave, isLoading }) {
  if (!isOpen || !admin) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edit Administrator</h3>
              <p className="text-slate-300 text-xs mt-0.5">Perbarui data profil administrator</p>
            </div>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(admin.id, new FormData(e.currentTarget)); }}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input name="namaLengkap" defaultValue={admin.namaLengkap} required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input name="email" type="email" defaultValue={admin.email} required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTableClient({ daftarAdmin, currentUserId }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "namaLengkap", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", action: null, type: "danger" });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const [editDialog, setEditDialog] = useState({ isOpen: false, admin: null });

  const showAlert = (title, message, type = "info") => setAlertDialog({ isOpen: true, title, message, type });

  const handleToggleStatus = (admin) => {
    if (String(admin.id) === String(currentUserId)) {
      return showAlert("Ditolak", "Anda tidak dapat mengubah status akun sendiri.", "danger");
    }
    const action = admin.isActive === 1 ? "menonaktifkan" : "mengaktifkan";
    setConfirmDialog({
      isOpen: true, type: admin.isActive === 1 ? "warning" : "success",
      title: `${admin.isActive === 1 ? "Nonaktifkan" : "Aktifkan"} Administrator`,
      message: `Anda akan ${action} akun "${admin.namaLengkap}". ${admin.isActive === 1 ? "Admin tidak akan bisa login setelah dinonaktifkan." : "Admin akan dapat login kembali."}`,
      action: async () => {
        setLoadingId(admin.id);
        const res = await toggleAdminStatus(admin.id);
        if (res.success) { router.refresh(); showAlert("Berhasil", res.message, "success"); }
        else showAlert("Gagal", res.error, "danger");
        setLoadingId(null);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleResetPassword = (admin) => {
    setConfirmDialog({
      isOpen: true, type: "warning",
      title: "Reset Password",
      message: `Password akun "${admin.namaLengkap}" akan direset ke default (= alamat email). Lanjutkan?`,
      action: async () => {
        setLoadingId(admin.id);
        const res = await resetAdminPassword(admin.id);
        if (res.success) showAlert("Berhasil", res.message, "success");
        else showAlert("Gagal", res.error, "danger");
        setLoadingId(null);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDelete = (admin) => {
    if (String(admin.id) === String(currentUserId)) {
      return showAlert("Ditolak", "Anda tidak dapat menghapus akun sendiri.", "danger");
    }
    if (admin.isActive === 1) {
      return showAlert("Tindakan Ditolak", "Nonaktifkan akun terlebih dahulu sebelum menghapus.", "danger");
    }
    setConfirmDialog({
      isOpen: true, type: "danger",
      title: "Hapus Permanen",
      message: `Akun "${admin.namaLengkap}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
      action: async () => {
        setLoadingId(admin.id);
        const res = await deleteAdmin(admin.id);
        if (res.success) { router.refresh(); showAlert("Berhasil", res.message, "success"); }
        else showAlert("Gagal", res.error, "danger");
        setLoadingId(null);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleEdit = (admin) => {
    setEditDialog({ isOpen: true, admin });
  };

  const handleSaveEdit = async (userId, formData) => {
    setLoadingId(userId);
    const res = await updateAdmin(userId, formData);
    if (res.success) { router.refresh(); setEditDialog({ isOpen: false, admin: null }); showAlert("Berhasil", res.message, "success"); }
    else showAlert("Gagal", res.error, "danger");
    setLoadingId(null);
  };

  // Filter, Sort, Paginate
  const filtered = daftarAdmin.filter(item => {
    const t = searchTerm.toLowerCase();
    return (item.namaLengkap || "").toLowerCase().includes(t) || (item.email || "").toLowerCase().includes(t);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aV = a[sortConfig.key] || "", bV = b[sortConfig.key] || "";
    if (typeof aV === "string") aV = aV.toLowerCase();
    if (typeof bV === "string") bV = bV.toLowerCase();
    if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
    if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
  const arrow = (key) => sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : "";

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try { return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return "-"; }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Cari nama atau email..." value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-rose-50 text-rose-700 rounded-lg px-3 py-1.5 text-xs font-semibold border border-rose-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            {filtered.length} Administrator
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ minHeight: "280px" }}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("namaLengkap")}>
                Nama Lengkap{arrow("namaLengkap")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("email")}>
                Email{arrow("email")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("isActive")}>
                Status{arrow("isActive")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort("createdAt")}>
                Terdaftar{arrow("createdAt")}
              </th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length > 0 ? paginated.map((item) => {
              const isSelf = String(item.id) === String(currentUserId);
              return (
                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${isSelf ? "bg-rose-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${item.isActive === 1 ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                        {(item.namaLengkap || "A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{item.namaLengkap}</div>
                        {isSelf && <span className="text-[10px] text-rose-500 font-semibold">ANDA</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.isActive === 1 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                      {item.isActive === 1 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.isActive === 1 ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {loadingId === item.id ? (
                      <div className="w-8 h-8 mx-auto flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(item)} title="Edit Profil"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleResetPassword(item)} title="Reset Password"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(item)}
                          title={item.isActive === 1 ? "Nonaktifkan" : "Aktifkan"}
                          className={`p-1.5 rounded-lg transition-colors ${item.isActive === 1 ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>
                          {item.isActive === 1 ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(item)} title="Hapus Permanen"
                          disabled={item.isActive === 1}
                          className={`p-1.5 rounded-lg transition-colors ${item.isActive === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center text-slate-400">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-500">Tidak ada administrator ditemukan</p>
                  <p className="text-xs mt-1">Coba ubah kata kunci pencarian</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Tampilkan</span>
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="text-sm border border-slate-200 bg-white text-slate-700 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500">
            <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
          </select>
          <span className="text-sm text-slate-500">baris</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Halaman <span className="font-medium text-slate-700">{currentPage}</span> dari <span className="font-medium text-slate-700">{Math.max(1, totalPages)}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages || totalPages === 0} className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages || totalPages === 0} className="p-1.5 border border-slate-200 bg-white text-slate-600 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message}
        onConfirm={confirmDialog.action} onCancel={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
        type={confirmDialog.type} isLoading={loadingId !== null} />
      <ConfirmDialog isOpen={alertDialog.isOpen} title={alertDialog.title} message={alertDialog.message}
        onCancel={() => setAlertDialog(p => ({ ...p, isOpen: false }))} type={alertDialog.type} />
      <EditAdminDialog isOpen={editDialog.isOpen} admin={editDialog.admin}
        onClose={() => setEditDialog({ isOpen: false, admin: null })}
        onSave={handleSaveEdit} isLoading={loadingId !== null} />
    </div>
  );
}
