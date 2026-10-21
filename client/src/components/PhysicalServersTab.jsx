import React, { useState } from 'react';
import {
  Server, Plus, Search, Edit2, Trash2, Cpu, HardDrive, Network,
  Key, Layers, CheckCircle2, AlertCircle, Building2, Table, LayoutGrid, Shield, Globe, Zap
} from 'lucide-react';
import CopyButton from './CopyButton';
import PasswordEye from './PasswordEye';
import ComputerCollectorModal from './ComputerCollectorModal';
import { openWebPanel } from '../utils/launcher';

export default function PhysicalServersTab({
  customer,
  servers = [],
  branches = [],
  canEdit = true,
  canDelete = true,
  canViewPasswords = true,
  onAdd,
  onEdit,
  onDelete,
  onReloadCustomer
}) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('server_view_mode') || 'table';
  });
  const [isCollectorModalOpen, setIsCollectorModalOpen] = useState(false);

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('server_view_mode', mode);
  };

  const filtered = servers.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.server_name || '').toLowerCase().includes(q) ||
      (s.brand || '').toLowerCase().includes(q) ||
      (s.model || '').toLowerCase().includes(q) ||
      (s.ip_address || '').toLowerCase().includes(q) ||
      (s.mac_address || '').toLowerCase().includes(q) ||
      (s.serial_number || '').toLowerCase().includes(q) ||
      (s.management_ip || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/70 p-3.5 sm:p-4 rounded-xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sunucu adı, marka, model, IP, MAC veya seri no ile filtrele..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => handleSetViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Genişletilmiş Tablo Görünümü"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablo</span>
            </button>
            <button
              onClick={() => handleSetViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kart Görünümü (Yatay Kaydırma Olmadan Rahat Okuma)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kartlar (Sığdır)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customer && (
            <button
              onClick={() => setIsCollectorModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600/30 to-blue-600/30 hover:from-indigo-600/40 hover:to-blue-600/40 text-indigo-200 text-xs font-bold rounded-lg border border-indigo-500/40 transition-colors cursor-pointer shrink-0 shadow-sm"
              title="PowerShell ile bu sunucunun donanım, CPU, RAM, Disk ve IP/MAC bilgilerini tek tıkla çekin"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>⚡ Otomatik Sunucu Toplayıcı</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={onAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Fiziki Sunucu Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-12 text-center text-slate-500 shadow-sm">
          <Server className="w-9 h-9 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-400">
            {search ? 'Aramanıza uygun fiziki sunucu bulunamadı.' : 'Henüz bu müşteriye ait fiziki sunucu eklenmemiş.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= SERVER CARD VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-indigo-950/20 flex flex-col justify-between space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white font-mono text-sm leading-tight truncate">
                      {s.server_name}
                    </div>
                    <div className="text-xs text-indigo-300 font-medium mt-0.5">
                      {s.brand} {s.model}
                    </div>
                    {s.serial_number && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <span className="text-slate-500">S/N:</span> {s.serial_number}
                        <CopyButton text={s.serial_number} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    s.status === 'Aktif'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : s.status === 'Bakımda'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {s.status === 'Aktif' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {s.status}
                  </span>
                  <button
                    onClick={() => onEdit(s)}
                    title="Düzenle"
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(s)}
                    title="Sil"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Branch & Location Ribbon */}
              <div className="flex items-center justify-between gap-2 text-xs bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-medium text-white truncate">{s.branch_name || 'Merkez Ofis'}</span>
                </div>
                {s.location && (
                  <span className="text-[11px] text-slate-400 truncate">
                    📍 {s.location}
                  </span>
                )}
              </div>

              {/* Hardware & Network */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Hardware */}
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Donanım</div>
                  {s.cpu_info && (
                    <div className="text-slate-300 font-mono text-[11px] truncate" title={s.cpu_info}>
                      CPU: {s.cpu_info}
                    </div>
                  )}
                  {s.ram_info && (
                    <div className="text-slate-300 font-mono text-[11px] truncate" title={s.ram_info}>
                      RAM: {s.ram_info}
                    </div>
                  )}
                  {s.disk_info && (
                    <div className="text-amber-300/90 font-mono text-[11px] truncate" title={s.disk_info}>
                      Disk: {s.disk_info}
                    </div>
                  )}
                </div>

                {/* Network */}
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Ağ (IP & MAC)</div>
                  {s.ip_address ? (
                    <div className="flex items-center justify-between font-mono text-xs text-white">
                      <span className="font-bold text-blue-300">{s.ip_address}</span>
                      <CopyButton text={s.ip_address} title="IP Kopyala" />
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic">IP Belirtilmedi</span>
                  )}
                  {s.mac_address && (
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span className="truncate">{s.mac_address}</span>
                      <CopyButton text={s.mac_address} title="MAC Kopyala" />
                    </div>
                  )}
                </div>
              </div>

              {/* Management (iDRAC / iLO) */}
              <div className="pt-2 border-t border-slate-800/70 text-xs flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">iDRAC / iLO:</span>
                {s.management_ip ? (
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-indigo-300">{s.management_ip}</span>
                    <button
                      onClick={() => openWebPanel(s.management_ip, s.management_password, s.management_user)}
                      className="px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      title="iDRAC/iLO panelini yeni sekmede aç ve parolayı panoya kopyala"
                    >
                      <span>🌐 Panele Git</span>
                    </button>
                    <CopyButton text={s.management_ip} title="Yönetim IP" />
                    {s.management_user && (
                      <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                        {s.management_user}
                      </span>
                    )}
                    {s.management_password && (
                      <PasswordEye password={s.management_password} />
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">Yapılandırılmadı</span>
                )}
              </div>

              {/* Local Admin (İşletim Sistemi) */}
              <div className="pt-2 border-t border-slate-800/70 text-xs flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  Local Admin:
                </span>
                {(s.local_admin_user || s.local_admin_password) ? (
                  <div className="flex items-center gap-2 font-mono">
                    {s.local_admin_user && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30">
                          {s.local_admin_user}
                        </span>
                        <CopyButton text={s.local_admin_user} title="Kullanıcı Adı Kopyala" />
                      </div>
                    )}
                    {s.local_admin_password && (
                      <PasswordEye password={s.local_admin_password} />
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">Belirtilmedi</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= EXPANDED TABLE VIEW ================= */
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5 sticky left-0 bg-slate-950 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)] min-w-[200px]">
                    Sunucu Adı & Model
                  </th>
                  <th className="py-3 px-3.5 min-w-[220px]">Donanım (CPU / RAM / Disk)</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Ağ (IP & MAC)</th>
                  <th className="py-3 px-3.5 min-w-[180px]">Yönetim (iDRAC / iLO)</th>
                  <th className="py-3 px-3.5 min-w-[180px]">Local Admin (OS)</th>
                  <th className="py-3 px-3.5 min-w-[140px]">Durum & Konum</th>
                  <th className="py-3 px-3.5 text-right min-w-[80px]">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Server Name (Sticky Left) */}
                    <td className="py-3 px-3.5 sticky left-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                      <div className="font-bold text-white font-mono text-sm">
                        {s.server_name}
                      </div>
                      <div className="text-xs text-indigo-400 font-medium mt-0.5">
                        {s.brand} {s.model}
                      </div>
                      {s.serial_number && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <span className="text-slate-500">S/N:</span> {s.serial_number}
                          <CopyButton text={s.serial_number} />
                        </div>
                      )}
                    </td>

                    {/* Hardware Info */}
                    <td className="py-3 px-3.5 space-y-1">
                      {s.cpu_info && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={s.cpu_info}>{s.cpu_info}</span>
                        </div>
                      )}
                      {s.ram_info && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={s.ram_info}>{s.ram_info}</span>
                        </div>
                      )}
                      {s.disk_info && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-amber-300/90 font-mono text-[11px] max-w-[200px]" title={s.disk_info}>{s.disk_info}</span>
                        </div>
                      )}
                    </td>

                    {/* Network IP & MAC */}
                    <td className="py-3 px-3.5 font-mono">
                      {s.ip_address ? (
                        <div className="flex items-center gap-1 text-slate-200">
                          <span className="text-slate-400 text-[11px]">IP:</span>
                          <span className="font-semibold text-blue-300">{s.ip_address}</span>
                          <CopyButton text={s.ip_address} />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                      {s.mac_address && (
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                          <span className="text-slate-500">MAC:</span>
                          <span className="truncate max-w-[120px]">{s.mac_address}</span>
                          <CopyButton text={s.mac_address} />
                        </div>
                      )}
                    </td>

                    {/* Management iDRAC/iLO */}
                    <td className="py-3 px-3.5 space-y-1">
                      {s.management_ip ? (
                        <div className="flex items-center gap-1.5 font-mono text-indigo-300">
                          <span className="text-slate-500 text-[11px]">IP:</span>
                          <span className="font-medium">{s.management_ip}</span>
                          <button
                            onClick={() => openWebPanel(s.management_ip, s.management_password, s.management_user)}
                            className="px-1.5 py-0.2 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 text-[9px] font-bold cursor-pointer"
                            title="iDRAC/iLO panelini yeni sekmede aç ve parolayı kopyala"
                          >
                            🌐 Git
                          </button>
                          <CopyButton text={s.management_ip} />
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">-</span>
                      )}
                      {(s.management_user || s.management_password) && (
                        <div className="flex items-center gap-2 pt-0.5">
                          {s.management_user && (
                            <span className="text-[11px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                              u: {s.management_user}
                            </span>
                          )}
                          {s.management_password && (
                            <PasswordEye password={s.management_password} />
                          )}
                        </div>
                      )}
                    </td>

                    {/* Local Admin (OS) */}
                    <td className="py-3 px-3.5 space-y-1">
                      {(s.local_admin_user || s.local_admin_password) ? (
                        <div>
                          {s.local_admin_user && (
                            <div className="flex items-center gap-1 font-mono">
                              <span className="text-slate-500 text-[11px]">u:</span>
                              <span className="text-amber-300 font-medium text-[11px]">{s.local_admin_user}</span>
                              <CopyButton text={s.local_admin_user} title="Kullanıcı Adı Kopyala" />
                            </div>
                          )}
                          {s.local_admin_password && (
                            <div className="flex items-center gap-1 pt-0.5">
                              <PasswordEye password={s.local_admin_password} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Status & Location */}
                    <td className="py-3 px-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === 'Aktif'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : s.status === 'Bakımda'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {s.status === 'Aktif' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {s.status}
                      </span>
                      {s.branch_name && (
                        <div className="text-[11px] text-cyan-300 font-medium mt-1 flex items-center gap-1" title="Şube">
                          <Building2 className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{s.branch_name}</span>
                        </div>
                      )}
                      {s.location && (
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[130px]" title={s.location}>
                          📍 {s.location}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(s)}
                          title="Düzenle"
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(s)}
                          title="Sil"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Collector Modal for Physical Servers */}
      {customer && (
        <ComputerCollectorModal
          isOpen={isCollectorModalOpen}
          onClose={() => setIsCollectorModalOpen(false)}
          customer={customer}
          branches={branches}
          initialTargetType="server"
          onSuccess={() => {
            if (onReloadCustomer) onReloadCustomer();
          }}
        />
      )}
    </div>
  );
}
