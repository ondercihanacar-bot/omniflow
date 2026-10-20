import React, { useState } from 'react';
import {
  Shield, Plus, Globe, ExternalLink, User, Lock, Users,
  Calendar, Clock, Key, Edit, Trash2, LayoutGrid, Table,
  AlertCircle, ShieldCheck, ShieldAlert, Copy, Eye, EyeOff
} from 'lucide-react';
import CopyButton from './CopyButton';
import { getDaysRemaining, getLicenseStatus } from '../utils/licenseAlerts';

export default function AntivirusTab({
  licenses = [],
  onAdd,
  onEdit,
  onDelete
}) {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('itmanager_view_mode_antivirus') || 'cards';
  });

  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('itmanager_view_mode_antivirus', mode);
  };

  const totalSeats = licenses.reduce((sum, item) => sum + (Number(item.user_count) || 1), 0);
  const urgentCount = licenses.filter(item => {
    const days = getDaysRemaining(item.license_expiry);
    return getLicenseStatus(days).isUrgent;
  }).length;

  const getBrandBadge = (brand) => {
    const b = (brand || '').toLowerCase();
    if (b.includes('kaspersky')) {
      return {
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        dotClass: 'bg-emerald-400'
      };
    }
    if (b.includes('sophos')) {
      return {
        badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
        dotClass: 'bg-blue-400'
      };
    }
    if (b.includes('eset')) {
      return {
        badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        dotClass: 'bg-cyan-400'
      };
    }
    if (b.includes('defender')) {
      return {
        badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
        dotClass: 'bg-indigo-400'
      };
    }
    if (b.includes('bitdefender')) {
      return {
        badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
        dotClass: 'bg-rose-400'
      };
    }
    return {
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      dotClass: 'bg-slate-400'
    };
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">Antivirüs &amp; EDR Lisansları</h3>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                {licenses.length} Paket
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-purple-950/80 text-purple-300 border border-purple-800">
                {totalSeats} Toplam Kullanıcı / Koltuk
              </span>
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {urgentCount} Lisans Bitişi Yaklaştı!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bulut yönetim konsolu adresleri, yetkili giriş bilgileri ve lisans süre takibi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* Dual View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleToggleView('cards')}
              title="Kartlar Görünümü"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kartlar</span>
            </button>
            <button
              onClick={() => handleToggleView('table')}
              title="Detaylı Tablo Görünümü"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablo</span>
            </button>
          </div>

          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Lisans Ekle</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {licenses.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="p-3 bg-slate-950 text-slate-600 w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Henüz Antivirüs Lisansı Eklenmedi</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Bu müşteri için Kaspersky, Sophos veya diğer antivirüs yönetim paneli girişlerini ve lisans bitiş sürelerini kaydedin.
          </p>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer"
          >
            İlk Antivirüs Lisansını Ekle
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {licenses.map((av) => {
            const days = getDaysRemaining(av.license_expiry);
            const status = getLicenseStatus(days);
            const brandStyle = getBrandBadge(av.brand);
            const isPasswordVisible = visiblePasswords[av.id];

            return (
              <div
                key={av.id}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-emerald-500/50 hover:shadow-lg ${
                  status.isUrgent ? 'border-rose-600/80 shadow-rose-950/20 shadow-md' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Top: Brand badge & Seats */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${brandStyle.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${brandStyle.dotClass}`}></span>
                      {av.brand || 'Antivirüs'}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-950/70 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-400" />
                      {av.user_count || 1} Koltuk
                    </span>
                  </div>

                  {/* Title & Branch */}
                  <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {av.product_name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kapsam: <span className="text-slate-300 font-medium">{av.branch_name || 'Merkez Ofis'}</span>
                  </p>

                  {/* Portal URL Box */}
                  {av.portal_url && (
                    <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-xs text-slate-300 truncate font-mono">{av.portal_url}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <CopyButton text={av.portal_url} title="Panel Adresini Kopyala" />
                        <a
                          href={av.portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Yönetim Panelini Aç"
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Credentials (Username & Password) */}
                  <div className="mt-3 bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                    {av.username && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Kullanıcı:</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-200 font-medium">{av.username}</span>
                          <CopyButton text={av.username} title="Kullanıcı Adını Kopyala" />
                        </div>
                      </div>
                    )}

                    {av.password && (
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Parola:</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-slate-200 font-medium">
                            {isPasswordVisible ? av.password : '••••••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(av.id)}
                            title={isPasswordVisible ? 'Gizle' : 'Göster'}
                            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <CopyButton text={av.password} title="Parolayı Kopyala" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* License Expiry Status Banner */}
                  <div className="mt-3 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{av.license_term || '1 Yıllık'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-mono text-slate-200">{av.license_expiry || 'Süresiz'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${status.badgeClass}`}>
                        {status.shortLabel}
                      </span>
                    </div>
                  </div>

                  {/* License Key */}
                  {av.license_key && (
                    <div className="mt-2.5 text-xs flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/60 font-mono text-slate-400">
                      <span className="truncate text-[11px]">Anahtar: {av.license_key}</span>
                      <CopyButton text={av.license_key} title="Lisans Anahtarını Kopyala" />
                    </div>
                  )}

                  {/* Notes */}
                  {av.notes && (
                    <p className="mt-2 text-[11px] text-slate-400 italic line-clamp-2">
                      {av.notes}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(av)}
                    title="Düzenle"
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(av)}
                    title="Sil"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 sticky left-0 bg-slate-950 z-10">Antivirüs Ürünü &amp; Marka</th>
                  <th className="px-4 py-3">Şube</th>
                  <th className="px-4 py-3">Web Paneli</th>
                  <th className="px-4 py-3">Kullanıcı / Parola</th>
                  <th className="px-4 py-3 text-center">Kullanıcı (Koltuk)</th>
                  <th className="px-4 py-3 text-center">Süre</th>
                  <th className="px-4 py-3">Lisans Bitiş &amp; Durum</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {licenses.map((av) => {
                  const days = getDaysRemaining(av.license_expiry);
                  const status = getLicenseStatus(days);
                  const brandStyle = getBrandBadge(av.brand);
                  const isPasswordVisible = visiblePasswords[av.id];

                  return (
                    <tr key={av.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Product Name (Sticky Left Column) */}
                      <td className="px-4 py-3 font-sans font-bold text-white sticky left-0 bg-slate-900 z-10">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${brandStyle.badgeClass}`}>
                            {av.brand}
                          </span>
                          <span>{av.product_name}</span>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="px-4 py-3 font-sans text-slate-400">
                        {av.branch_name || 'Merkez Ofis'}
                      </td>

                      {/* Web Portal */}
                      <td className="px-4 py-3">
                        {av.portal_url ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={av.portal_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline max-w-[160px] truncate"
                            >
                              {av.portal_url.replace(/^https?:\/\//, '')}
                            </a>
                            <CopyButton text={av.portal_url} title="Kopyala" />
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Username & Password */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {av.username && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-300">
                              <span>{av.username}</span>
                              <CopyButton text={av.username} title="Kopyala" />
                            </div>
                          )}
                          {av.password && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <span>{isPasswordVisible ? av.password : '••••••'}</span>
                              <button
                                onClick={() => togglePasswordVisibility(av.id)}
                                className="p-0.5 text-slate-500 hover:text-slate-300"
                              >
                                {isPasswordVisible ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                              </button>
                              <CopyButton text={av.password} title="Kopyala" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Seat Count */}
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-purple-300 font-bold bg-purple-950/70 border border-purple-800">
                          {av.user_count || 1}
                        </span>
                      </td>

                      {/* Term */}
                      <td className="px-4 py-3 text-center font-sans text-slate-400">
                        {av.license_term || '1 Yıllık'}
                      </td>

                      {/* Expiry & Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-200">{av.license_expiry || 'Süresiz'}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${status.badgeClass}`}>
                            {status.shortLabel}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(av)}
                            title="Düzenle"
                            className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(av)}
                            title="Sil"
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
