import React, { useState, useEffect } from 'react';
import {
  MapPin, Plus, Trash2, Edit2, Check, X, Building2, AlertTriangle,
  Server, Monitor, Shield, Radio, Globe, Layers, ArrowRight, Loader2
} from 'lucide-react';
import { api } from '../api';

export default function BranchManagerModal({
  isOpen,
  onClose,
  customer,
  onUpdate,
  showToast
}) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchNotes, setNewBranchNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null); // { oldName, currentName }
  const [deletingBranch, setDeletingBranch] = useState(null); // branch object
  const [migrateTarget, setMigrateTarget] = useState('Merkez Ofis');

  const loadBranches = async () => {
    if (!customer?.id) return;
    setLoading(true);
    try {
      const data = await api.getCustomerBranches(customer.id);
      setBranches(data || []);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Şubeler yüklenirken hata oluştu: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customer?.id) {
      loadBranches();
      setNewBranchName('');
      setNewBranchNotes('');
      setEditingBranch(null);
      setDeletingBranch(null);
    }
  }, [isOpen, customer?.id]);

  if (!isOpen || !customer) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newBranchName.trim();
    if (!name) {
      if (showToast) showToast('Lütfen bir şube adı girin.', 'error');
      return;
    }

    if (branches.some(b => b.branch_name.toLowerCase() === name.toLowerCase())) {
      if (showToast) showToast(`"${name}" şubesi zaten mevcut.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createCustomerBranch(customer.id, { branch_name: name, notes: newBranchNotes.trim() });
      if (showToast) showToast(`"${name}" şubesi başarıyla eklendi.`, 'success');
      setNewBranchName('');
      setNewBranchNotes('');
      await loadBranches();
      if (onUpdate) onUpdate();
    } catch (err) {
      if (showToast) showToast('Şube eklenemedi: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartRename = (b) => {
    setEditingBranch({ oldName: b.branch_name, currentName: b.branch_name });
  };

  const handleSaveRename = async () => {
    if (!editingBranch) return;
    const oldName = editingBranch.oldName;
    const newName = editingBranch.currentName.trim();

    if (!newName) {
      if (showToast) showToast('Şube adı boş olamaz.', 'error');
      return;
    }

    if (oldName.toLowerCase() === newName.toLowerCase()) {
      setEditingBranch(null);
      return;
    }

    if (branches.some(b => b.branch_name.toLowerCase() === newName.toLowerCase())) {
      if (showToast) showToast(`"${newName}" adında başka bir şube zaten var.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.renameCustomerBranch(customer.id, oldName, newName);
      if (showToast) showToast(res.message || `Şube adı "${newName}" olarak güncellendi.`, 'success');
      setEditingBranch(null);
      await loadBranches();
      if (onUpdate) onUpdate();
    } catch (err) {
      if (showToast) showToast('Yeniden adlandırma başarısız: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBranch) return;
    const branchName = deletingBranch.branch_name;

    setIsSubmitting(true);
    try {
      const res = await api.deleteCustomerBranch(customer.id, branchName, migrateTarget);
      if (showToast) showToast(res.message || `"${branchName}" şubesi silindi.`, 'success');
      setDeletingBranch(null);
      await loadBranches();
      if (onUpdate) onUpdate();
    } catch (err) {
      if (showToast) showToast('Şube silinemedi: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Şube & Lokasyon Yönetimi
              </h3>
              <p className="text-xs text-slate-400">
                {customer.name} — Cihaz, hat ve ağ lokasyonlarını yönetin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Info Banner */}
          <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-3 text-xs text-blue-300">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Nasıl Çalışır?</strong> Şubeler; Sunucular, VM'ler, Kullanıcı Bilgisayarları, Güvenlik Duvarı, Wi-Fi ve Hatlar için ortak lokasyon havuzudur. Bir şube silindiğinde oradaki tüm cihazlar otomatik olarak <strong>Merkez Ofis</strong> lokasyonuna aktarılır.
            </div>
          </div>

          {/* Add New Branch Form */}
          <form onSubmit={handleCreate} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              Yeni Şube / Lokasyon Ekle
            </h4>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="Örn: Gebze Fabrika, Bursa Depo, Ankara Ofis..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newBranchName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Şube Ekle</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Branches List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Tanımlı Şubeler ({branches.length})</span>
              <span>Bağlı Cihaz / Hat Sayısı</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-xs">Şubeler yükleniyor...</span>
              </div>
            ) : branches.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-slate-950/30 rounded-xl border border-slate-800/60 text-xs">
                Kayıtlı şube bulunamadı.
              </div>
            ) : (
              branches.map((b) => {
                const isEditing = editingBranch?.oldName === b.branch_name;
                const isDefault = b.is_default || b.branch_name === 'Merkez Ofis';
                const hasDevices = b.total_devices > 0;

                return (
                  <div
                    key={b.branch_name}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDefault
                        ? 'bg-slate-950/70 border-slate-800'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Name / Edit Mode */}
                      <div className="flex-1 flex items-center gap-2.5">
                        <MapPin className={`w-4 h-4 shrink-0 ${isDefault ? 'text-emerald-400' : 'text-blue-400'}`} />

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <input
                              type="text"
                              value={editingBranch.currentName}
                              onChange={(e) =>
                                setEditingBranch({ ...editingBranch, currentName: e.target.value })
                              }
                              autoFocus
                              className="bg-slate-900 border border-blue-500 rounded px-2.5 py-1 text-xs text-white focus:outline-none w-full"
                            />
                            <button
                              onClick={handleSaveRename}
                              disabled={isSubmitting}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer transition-colors"
                              title="Kaydet"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingBranch(null)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
                              title="İptal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">
                              {b.branch_name}
                            </span>
                            {isDefault && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Varsayılan Ana Lokasyon
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Device breakdown & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        {/* Breakdown pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {b.total_devices > 0 ? (
                            Object.entries(b.details || {}).map(([type, count]) => (
                              <span
                                key={type}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {count} {type}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              Cihaz atanmadı (0)
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        {!isDefault && !isEditing && (
                          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                            <button
                              onClick={() => handleStartRename(b)}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                              title="Şube Adını Değiştir"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingBranch(b);
                                setMigrateTarget('Merkez Ofis');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                              title="Şubeyi Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {deletingBranch && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              "{deletingBranch.branch_name}" Şubesini Silmek İstiyor musunuz?
            </h4>
            <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
              {deletingBranch.total_devices > 0 ? (
                <>
                  Bu şubede toplam <strong className="text-white font-bold">{deletingBranch.total_devices} adet</strong> kayıt/cihaz bulunmaktadır. Şube silindiğinde bu kayıtlar otomatik olarak aşağıdaki lokasyona aktarılacaktır:
                </>
              ) : (
                'Bu şubeye bağlı herhangi bir cihaz bulunmamaktadır. Güvenle silebilirsiniz.'
              )}
            </p>

            {deletingBranch.total_devices > 0 && (
              <div className="w-full max-w-xs mb-5 text-left">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Cihazların Aktarılacağı Lokasyon:
                </label>
                <select
                  value={migrateTarget}
                  onChange={(e) => setMigrateTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {branches
                    .filter((b) => b.branch_name !== deletingBranch.branch_name)
                    .map((b) => (
                      <option key={b.branch_name} value={b.branch_name}>
                        {b.branch_name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingBranch(null)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Şubeyi Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>Toplam {branches.length} şube tanımlı</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
