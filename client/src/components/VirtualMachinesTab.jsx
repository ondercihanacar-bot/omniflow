import React, { useState } from 'react';
import {
  Cloud, Plus, Search, Edit2, Trash2, Key, Cpu, HardDrive,
  CheckCircle2, Server, Table, LayoutGrid, Network, Info, Shield, Monitor, Zap
} from 'lucide-react';
import CopyButton from './CopyButton';
import PasswordEye from './PasswordEye';
import ComputerCollectorModal from './ComputerCollectorModal';
import { downloadRdpFile } from '../utils/launcher';

export default function VirtualMachinesTab({
  customer,
  branches = [],
  vms = [],
  physicalServers = [],
  canEdit = true,
  canDelete = true,
  onAdd,
  onEdit,
  onDelete,
  onReloadCustomer
}) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('vm_view_mode') || 'table';
  });
  const [isCollectorModalOpen, setIsCollectorModalOpen] = useState(false);

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('vm_view_mode', mode);
  };

  const filtered = vms.filter(v => {
    const q = search.toLowerCase();
    return (
      (v.vm_name || '').toLowerCase().includes(q) ||
      (v.role_description || '').toLowerCase().includes(q) ||
      (v.ip_address || '').toLowerCase().includes(q) ||
      (v.mac_address || '').toLowerCase().includes(q) ||
      (v.os_version || '').toLowerCase().includes(q) ||
      (v.os_license_key || '').toLowerCase().includes(q) ||
      (v.office_version || '').toLowerCase().includes(q) ||
      (v.office_license_key || '').toLowerCase().includes(q) ||
      (v.local_admin_user || '').toLowerCase().includes(q) ||
      (v.physical_server_name || '').toLowerCase().includes(q)
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
              placeholder="VM adı, IP, MAC, Windows/Office lisans anahtarı veya rol ile filtrele..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* View Mode Switcher: Table vs Cards */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => handleSetViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-purple-600 text-white shadow-sm'
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
                  ? 'bg-purple-600 text-white shadow-sm'
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
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/40 hover:to-pink-600/40 text-purple-200 text-xs font-bold rounded-lg border border-purple-500/40 transition-colors cursor-pointer shrink-0 shadow-sm"
              title="PowerShell ile bu Sanal Makinenin (VM) Hypervisor, vCPU, RAM, Disk, Lisans ve IP/MAC bilgilerini tek tıkla çekin"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>⚡ Otomatik VM Toplayıcı</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={onAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Sanal Makine (VM) Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* CONTENT: Either Card Grid OR Extended Table */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-12 text-center text-slate-500 shadow-sm">
          <Cloud className="w-9 h-9 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-400">
            {search ? 'Aramanıza uygun sanal makine bulunamadı.' : 'Henüz sanal makine kaydı eklenmemiş.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARD VIEW (Zero Horizontal Scroll) ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((v) => (
            <div
              key={v.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-purple-950/20 flex flex-col justify-between space-y-3"
            >
              {/* Card Header: VM Name, Status & Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0 mt-0.5">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white font-mono text-sm leading-tight truncate" title={v.vm_name}>
                      {v.vm_name}
                    </div>
                    {v.role_description ? (
                      <p className="text-xs text-purple-300 font-medium mt-0.5 line-clamp-2" title={v.role_description}>
                        {v.role_description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic mt-0.5">Rol belirtilmedi</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    v.status === 'Aktif'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {v.status === 'Aktif' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {v.status}
                  </span>
                  <button
                    onClick={() => onEdit(v)}
                    title="Düzenle"
                    className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(v)}
                    title="Sil"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Host Server Ribbon */}
              <div className="flex items-center justify-between gap-2 text-xs bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Server className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">Sunucu:</span>
                  <span className="font-semibold text-white truncate">{v.physical_server_name || 'Bağımsız / Bulut'}</span>
                </div>
                {v.hypervisor && (
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {v.hypervisor}
                  </span>
                )}
              </div>

              {/* Hardware Specs & Network Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Hardware */}
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-purple-400" /> Donanım
                  </div>
                  <div className="font-mono text-slate-200 text-xs font-bold">
                    {v.vcpu ? `${v.vcpu} vCPU` : '-'} • {v.ram || '-'}
                  </div>
                  {v.disk ? (
                    <div className="font-mono text-[11px] text-amber-300/90 truncate" title={v.disk}>
                      💾 {v.disk}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 italic">Disk belirtilmedi</div>
                  )}
                </div>

                {/* Network */}
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Network className="w-3 h-3 text-blue-400" /> Ağ (IP & MAC)
                  </div>
                  {v.ip_address ? (
                    <div className="flex items-center justify-between font-mono text-xs text-white">
                      <span className="font-bold text-blue-300">{v.ip_address}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => downloadRdpFile(v.ip_address, v.local_admin_user, v.vm_name)}
                          className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-blue-600/50 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          title="RDP dosyasını indirip MSTSC ile doğrudan bağlan"
                        >
                          <span>💻 RDP</span>
                        </button>
                        <CopyButton text={v.ip_address} title="IP Kopyala" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic">IP Yok</span>
                  )}
                  {v.mac_address && (
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span className="truncate">{v.mac_address}</span>
                      <CopyButton text={v.mac_address} title="MAC Kopyala" />
                    </div>
                  )}
                </div>
              </div>

              {/* Licenses Section: Windows & Office */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/70 text-xs">
                {/* Windows OS & Key */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-medium truncate max-w-[150px]" title={v.os_version}>
                    🪟 {v.os_version || 'Windows Sürümü'}
                  </span>
                  {v.os_license_key ? (
                    <div className="flex items-center gap-1 font-mono text-[10px] text-blue-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      <Key className="w-2.5 h-2.5 text-blue-400" />
                      <span className="font-bold truncate max-w-[130px]" title={v.os_license_key}>{v.os_license_key}</span>
                      <CopyButton text={v.os_license_key} title="Windows Lisans Key Kopyala" />
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[10px] italic">Key girilmedi</span>
                  )}
                </div>

                {/* Office & Key */}
                {((v.office_version && v.office_version !== 'N/A') || v.office_license_key) && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 font-medium truncate max-w-[150px]" title={v.office_version}>
                      📑 {v.office_version || 'Office'}
                    </span>
                    {v.office_license_key ? (
                      <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                        <Key className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="font-bold truncate max-w-[130px]" title={v.office_license_key}>{v.office_license_key}</span>
                        <CopyButton text={v.office_license_key} title="Office Lisans Key Kopyala" />
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px] italic">Key girilmedi</span>
                    )}
                  </div>
                )}
              </div>

              {/* Local Admin (İşletim Sistemi) */}
              <div className="pt-2 border-t border-slate-800/70 text-xs flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  Local Admin:
                </span>
                {(v.local_admin_user || v.local_admin_password) ? (
                  <div className="flex items-center gap-2 font-mono">
                    {v.local_admin_user && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30">
                          {v.local_admin_user}
                        </span>
                        <CopyButton text={v.local_admin_user} title="Kullanıcı Adı Kopyala" />
                      </div>
                    )}
                    {v.local_admin_password && (
                      <PasswordEye password={v.local_admin_password} />
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-[11px]">Belirtilmedi</span>
                )}
              </div>

              {/* Notes */}
              {v.notes && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{v.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ================= EXPANDED TABLE VIEW (Full-Width Optimized) ================= */
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5 sticky left-0 bg-slate-950 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)] min-w-[200px]">
                    Sanal Makine Adı & Rol
                  </th>
                  <th className="py-3 px-3.5 min-w-[160px]">Bağlı Sunucu & Hypervisor</th>
                  <th className="py-3 px-3.5 min-w-[150px]">Donanım (vCPU/RAM/Disk)</th>
                  <th className="py-3 px-3.5 min-w-[160px]">Ağ (IP & MAC)</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Local Admin (OS)</th>
                  <th className="py-3 px-3.5 min-w-[190px]">Windows & Lisans Key</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Office & Lisans Key</th>
                  <th className="py-3 px-3 text-center min-w-[80px]">Durum</th>
                  <th className="py-3 px-3.5 text-right min-w-[80px]">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* VM Name & Role (Sticky Left) */}
                    <td className="py-3 px-3.5 sticky left-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                      <div className="font-bold text-white font-mono text-sm">
                        {v.vm_name}
                      </div>
                      <div className="text-xs text-purple-300 font-medium mt-0.5 max-w-xs truncate" title={v.role_description}>
                        {v.role_description || 'Rol belirtilmedi'}
                      </div>
                      {v.notes && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs" title={v.notes}>
                          ℹ️ {v.notes}
                        </div>
                      )}
                    </td>

                    {/* Host Server & Hypervisor */}
                    <td className="py-3 px-3.5 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                        <Server className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{v.physical_server_name || 'Bağımsız / Bulut'}</span>
                      </div>
                      {v.hypervisor && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          {v.hypervisor}
                        </div>
                      )}
                    </td>

                    {/* Specs */}
                    <td className="py-3 px-3.5 font-mono space-y-0.5 text-slate-300">
                      <div className="font-bold">{v.vcpu ? `${v.vcpu} vCPU` : '-'} / {v.ram || '-'}</div>
                      {v.disk && (
                        <div className="text-[11px] text-amber-300/90 truncate" title={v.disk}>💾 {v.disk}</div>
                      )}
                    </td>

                    {/* Network IP & MAC */}
                    <td className="py-3 px-3.5 font-mono">
                      {v.ip_address ? (
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <span className="text-slate-400 text-[11px]">IP:</span>
                          <span className="font-bold text-blue-300">{v.ip_address}</span>
                          <button
                            onClick={() => downloadRdpFile(v.ip_address, v.local_admin_user, v.vm_name)}
                            className="px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-blue-600/50 text-[9px] font-bold cursor-pointer"
                            title="RDP bağlantı dosyasını indir ve MSTSC ile aç"
                          >
                            💻 RDP
                          </button>
                          <CopyButton text={v.ip_address} title="IP Kopyala" />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">IP Yok</span>
                      )}
                      {v.mac_address && (
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                          <span className="text-slate-500">MAC:</span>
                          <span className="truncate">{v.mac_address}</span>
                          <CopyButton text={v.mac_address} title="MAC Kopyala" />
                        </div>
                      )}
                    </td>

                    {/* Local Admin (OS) */}
                    <td className="py-3 px-3.5 space-y-1">
                      {(v.local_admin_user || v.local_admin_password) ? (
                        <div>
                          {v.local_admin_user && (
                            <div className="flex items-center gap-1 font-mono">
                              <span className="text-slate-500 text-[11px]">u:</span>
                              <span className="text-amber-300 font-medium text-[11px]">{v.local_admin_user}</span>
                              <CopyButton text={v.local_admin_user} title="Kullanıcı Adı Kopyala" />
                            </div>
                          )}
                          {v.local_admin_password && (
                            <div className="flex items-center gap-1 pt-0.5">
                              <PasswordEye password={v.local_admin_password} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Windows OS & Key */}
                    <td className="py-3 px-3.5">
                      <div className="text-slate-200 font-medium text-xs truncate max-w-[190px]" title={v.os_version}>
                        {v.os_version || '-'}
                      </div>
                      {v.os_license_key ? (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-blue-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 mt-1 max-w-fit">
                          <Key className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                          <span className="truncate max-w-[130px]" title={v.os_license_key}>{v.os_license_key}</span>
                          <CopyButton text={v.os_license_key} title="Windows Key Kopyala" />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px] italic">Lisans key yok</span>
                      )}
                    </td>

                    {/* Office & Key */}
                    <td className="py-3 px-3.5">
                      <div className="text-slate-200 text-xs truncate max-w-[170px]" title={v.office_version}>
                        {v.office_version && v.office_version !== 'N/A' ? v.office_version : '-'}
                      </div>
                      {v.office_license_key ? (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 mt-1 max-w-fit">
                          <Key className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[130px]" title={v.office_license_key}>{v.office_license_key}</span>
                          <CopyButton text={v.office_license_key} title="Office Key Kopyala" />
                        </div>
                      ) : (
                        v.office_version && v.office_version !== 'N/A' && <span className="text-slate-500 text-[10px] italic">Key girilmedi</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        v.status === 'Aktif'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {v.status === 'Aktif' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {v.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(v)}
                          title="Düzenle"
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(v)}
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

      {/* Collector Modal for Virtual Machines */}
      {customer && (
        <ComputerCollectorModal
          isOpen={isCollectorModalOpen}
          onClose={() => setIsCollectorModalOpen(false)}
          onSuccess={() => {
            if (onReloadCustomer) onReloadCustomer();
          }}
          customer={customer}
          branches={branches}
          initialTargetType="vm"
        />
      )}
    </div>
  );
}
