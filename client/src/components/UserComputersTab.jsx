import React, { useState } from 'react';
import {
  Laptop, Plus, Search, Edit2, Trash2, Key, Wifi, Network,
  User, Monitor, ShieldCheck, Building2, Filter, Table, LayoutGrid, Shield, Printer,
  Zap, FileText
} from 'lucide-react';
import CopyButton from './CopyButton';
import PasswordEye from './PasswordEye';
import ComputerCollectorModal from './ComputerCollectorModal';
import HandoverModal from './HandoverModal';

export default function UserComputersTab({
  customer,
  computers = [],
  branches = [],
  mailAccounts = [],
  currentUser = null,
  canEdit = true,
  canDelete = true,
  onAdd,
  onEdit,
  onDelete,
  onOpenReport,
  onReloadCustomer
}) {
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('pc_view_mode') || 'table';
  });
  const [isCollectorModalOpen, setIsCollectorModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverSelectedPC, setHandoverSelectedPC] = useState(null);

  const handleOpenHandover = (pc = null) => {
    setHandoverSelectedPC(pc || (computers.length > 0 ? computers[0] : null));
    setIsHandoverModalOpen(true);
  };

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('pc_view_mode', mode);
  };

  const distinctBranches = Array.from(new Set([
    'Merkez Ofis',
    ...branches,
    ...computers.map(c => c.branch_name)
  ].filter(Boolean)));

  const distinctDepts = Array.from(new Set(computers.map(c => c.department).filter(Boolean)));

  const filtered = computers.filter(c => {
    const q = search.toLowerCase();
    const branchMatch = selectedBranch === 'ALL' || (c.branch_name || 'Merkez Ofis') === selectedBranch;
    const deptMatch = selectedDept === 'ALL' || (c.department || '') === selectedDept;

    if (!branchMatch || !deptMatch) return false;

    return (
      (c.computer_name || '').toLowerCase().includes(q) ||
      (c.assigned_user || '').toLowerCase().includes(q) ||
      (c.branch_name || '').toLowerCase().includes(q) ||
      (c.department || '').toLowerCase().includes(q) ||
      (c.brand || '').toLowerCase().includes(q) ||
      (c.model || '').toLowerCase().includes(q) ||
      (c.serial_number || '').toLowerCase().includes(q) ||
      (c.ethernet_ip || '').toLowerCase().includes(q) ||
      (c.ethernet_mac || '').toLowerCase().includes(q) ||
      (c.wifi_ip || '').toLowerCase().includes(q) ||
      (c.wifi_mac || '').toLowerCase().includes(q) ||
      (c.os_version || '').toLowerCase().includes(q) ||
      (c.os_license_key || '').toLowerCase().includes(q) ||
      (c.office_version || '').toLowerCase().includes(q) ||
      (c.office_license_key || '').toLowerCase().includes(q) ||
      (c.local_admin_user || '').toLowerCase().includes(q) ||
      (c.remote_access_id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/70 p-3.5 sm:p-4 rounded-xl border border-slate-800">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="PC adı, personel, departman, IP, MAC veya AnyDesk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">Tüm Şubeler ({computers.length})</option>
              {distinctBranches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          {distinctDepts.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">Tüm Departmanlar</option>
              {distinctDepts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => handleSetViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
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
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kart Görünümü (Yatay Kaydırma Olmadan Rahat Okuma)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kartlar (Sığdır)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenHandover(computers.length > 0 ? computers[0] : null)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/40 transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Seçili müşteride personele ait resmi Zimmet & Teslim Tutanağı oluştur (PDF / Yazdır)"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>📄 Zimmet Tutanağı</span>
          </button>

          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/40 transition-colors cursor-pointer shrink-0"
              title="Kullanıcı & Zimmet Dökümü Al (PDF / Yazdır)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Kullanıcı Dökümü (PDF)</span>
            </button>
          )}

          <button
            onClick={() => setIsCollectorModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600/30 to-emerald-600/30 hover:from-amber-600/40 hover:to-emerald-600/40 text-amber-200 text-xs font-bold rounded-lg border border-amber-500/40 transition-colors cursor-pointer shrink-0 shadow-sm"
            title="PowerShell ile bu bilgisayarın tüm donanım ve lisansını tek tıkla çekin"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Otomatik PC Toplayıcı</span>
          </button>

          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kullanıcı Bilgisayarı Ekle</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-12 text-center text-slate-500 shadow-sm space-y-3">
          <Laptop className="w-9 h-9 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-400">
            {search ? 'Aramanıza uygun bilgisayar bulunamadı.' : 'Henüz bu müşteriye ait kullanıcı bilgisayarı eklenmemiş.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsCollectorModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>⚡ PowerShell ile Otomatik Topla</span>
            </button>
            <button
              onClick={onAdd}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Elle Ekle</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= PC CARD VIEW (Zero Horizontal Scroll) ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-emerald-950/20 flex flex-col justify-between space-y-3"
            >
              {/* Header: User, PC Name & Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{c.assigned_user || 'Atanmadı'}</span>
                    </div>
                    <div className="font-mono text-xs text-emerald-300 font-semibold mt-0.5 flex items-center gap-2">
                      <span>{c.computer_name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-sans">
                        {c.device_type || 'Masaüstü'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenHandover(c)}
                    title="Bu bilgisayar ve personel için resmi Zimmet Tutanağı oluştur"
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => onEdit(c)}
                    title="Düzenle"
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    title="Sil"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Branch & Department ribbon */}
              <div className="flex items-center justify-between gap-2 text-xs bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-medium text-white truncate">{c.branch_name || 'Merkez Ofis'}</span>
                </div>
                {c.department && (
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 shrink-0">
                    📂 {c.department}
                  </span>
                )}
              </div>

              {/* Hardware & Network */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Hardware */}
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Cihaz / Donanım</div>
                  <div className="font-semibold text-white text-xs truncate">
                    {c.brand} {c.model}
                  </div>
                  {c.hardware_specs && (
                    <div className="text-[11px] text-slate-400 truncate" title={c.hardware_specs}>
                      {c.hardware_specs}
                    </div>
                  )}
                  {c.serial_number && (
                    <div className="text-[10px] font-mono text-slate-500">
                      SN: {c.serial_number}
                    </div>
                  )}
                </div>

                {/* Network */}
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Ağ Bağlantısı</div>
                  {c.ethernet_ip ? (
                    <div className="flex items-center justify-between font-mono text-xs text-white">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Network className="w-3 h-3 shrink-0" /> {c.ethernet_ip}
                      </span>
                      <CopyButton text={c.ethernet_ip} title="Kablo IP" />
                    </div>
                  ) : null}
                  {c.wifi_ip ? (
                    <div className="flex items-center justify-between font-mono text-xs text-white">
                      <span className="flex items-center gap-1 text-blue-400">
                        <Wifi className="w-3 h-3 shrink-0" /> {c.wifi_ip}
                      </span>
                      <CopyButton text={c.wifi_ip} title="Wi-Fi IP" />
                    </div>
                  ) : null}
                  {!c.ethernet_ip && !c.wifi_ip && (
                    <span className="text-slate-500 text-[11px] italic">Statik IP yok</span>
                  )}
                </div>
              </div>

              {/* Licenses & Remote Access */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/70 text-xs">
                {/* Windows */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]" title={c.os_version}>
                    🪟 {c.os_version || 'Windows'}
                  </span>
                  {c.os_license_key ? (
                    <div className="flex items-center gap-1 font-mono text-[10px] text-blue-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      <Key className="w-2.5 h-2.5 text-blue-400" />
                      <span className="font-bold truncate max-w-[120px]" title={c.os_license_key}>{c.os_license_key}</span>
                      <CopyButton text={c.os_license_key} title="Windows Key" />
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[10px] italic">Lisans key yok</span>
                  )}
                </div>

                {/* Office */}
                {(c.office_version || c.office_license_key) && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]" title={c.office_version}>
                      📑 {c.office_version || 'Office'}
                    </span>
                    {c.office_license_key ? (
                      <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                        <Key className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="font-bold truncate max-w-[120px]" title={c.office_license_key}>{c.office_license_key}</span>
                        <CopyButton text={c.office_license_key} title="Office Key" />
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px] italic">Key girilmedi</span>
                    )}
                  </div>
                )}

                {/* Remote Access (AnyDesk / TeamViewer) */}
                {c.remote_access_id && (
                  <div className="flex items-center justify-between gap-2 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                    <span className="text-[10px] text-amber-400 font-semibold uppercase">Uzak Destek:</span>
                    <div className="flex items-center gap-1 font-mono text-xs text-amber-300 font-bold">
                      <span>{c.remote_access_id}</span>
                      <CopyButton text={c.remote_access_id} title="AnyDesk/Uzak ID Kopyala" />
                    </div>
                  </div>
                )}

                {/* Local Admin (İşletim Sistemi) */}
                <div className="pt-2 border-t border-slate-800/70 text-xs flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    Local Admin:
                  </span>
                  {(c.local_admin_user || c.local_admin_password) ? (
                    <div className="flex items-center gap-2 font-mono">
                      {c.local_admin_user && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30">
                            {c.local_admin_user}
                          </span>
                          <CopyButton text={c.local_admin_user} title="Kullanıcı Adı Kopyala" />
                        </div>
                      )}
                      {c.local_admin_password && (
                        <PasswordEye password={c.local_admin_password} />
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">Belirtilmedi</span>
                  )}
                </div>
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
                  <th className="py-3 px-3.5 sticky left-0 bg-slate-950 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)] min-w-[190px]">
                    Makina Adı & Tür
                  </th>
                  <th className="py-3 px-3.5 min-w-[170px]">Kullanıcı & Departman</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Donanım (Marka / Model)</th>
                  <th className="py-3 px-3.5 min-w-[150px]">Ethernet (Kablo)</th>
                  <th className="py-3 px-3.5 min-w-[150px]">Wi-Fi (Kablosuz)</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Local Admin (OS)</th>
                  <th className="py-3 px-3.5 min-w-[190px]">Windows & Lisans</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Office & Lisans</th>
                  <th className="py-3 px-3.5 min-w-[140px]">Uzak Erişim</th>
                  <th className="py-3 px-3.5 text-right min-w-[80px]">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* PC Name & Type (Sticky Left) */}
                    <td className="py-3 px-3.5 sticky left-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                      <div className="font-bold text-white font-mono text-sm">
                        {c.computer_name}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {c.device_type || 'Masaüstü'}
                      </span>
                      {c.serial_number && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          S/N: {c.serial_number}
                        </div>
                      )}
                    </td>

                    {/* Assigned User & Dept */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-white text-xs">
                        <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{c.assigned_user || 'Atanmadı'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                          <Building2 className="w-2.5 h-2.5" />
                          {c.branch_name || 'Merkez Ofis'}
                        </span>
                        {c.department && (
                          <span className="text-[11px] text-slate-400">
                            {c.department}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Hardware & Model */}
                    <td className="py-3 px-3.5">
                      <div className="text-slate-200 font-semibold text-xs">
                        {c.brand} {c.model}
                      </div>
                      {c.hardware_specs && (
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]" title={c.hardware_specs}>
                          {c.hardware_specs}
                        </div>
                      )}
                    </td>

                    {/* Ethernet Network */}
                    <td className="py-3 px-3.5 font-mono">
                      {c.ethernet_ip ? (
                        <div className="flex items-center gap-1 text-slate-200">
                          <Network className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="font-medium">{c.ethernet_ip}</span>
                          <CopyButton text={c.ethernet_ip} />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">-</span>
                      )}
                      {c.ethernet_mac && (
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                          <span className="truncate max-w-[120px]">{c.ethernet_mac}</span>
                          <CopyButton text={c.ethernet_mac} />
                        </div>
                      )}
                    </td>

                    {/* WiFi Network */}
                    <td className="py-3 px-3.5 font-mono">
                      {c.wifi_ip ? (
                        <div className="flex items-center gap-1 text-slate-200">
                          <Wifi className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="font-medium">{c.wifi_ip}</span>
                          <CopyButton text={c.wifi_ip} />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">-</span>
                      )}
                      {c.wifi_mac && (
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                          <span className="truncate max-w-[120px]">{c.wifi_mac}</span>
                          <CopyButton text={c.wifi_mac} />
                        </div>
                      )}
                    </td>

                    {/* Local Admin (OS) */}
                    <td className="py-3 px-3.5 space-y-1">
                      {(c.local_admin_user || c.local_admin_password) ? (
                        <div>
                          {c.local_admin_user && (
                            <div className="flex items-center gap-1 font-mono">
                              <span className="text-slate-500 text-[11px]">u:</span>
                              <span className="text-amber-300 font-medium text-[11px]">{c.local_admin_user}</span>
                              <CopyButton text={c.local_admin_user} title="Kullanıcı Adı Kopyala" />
                            </div>
                          )}
                          {c.local_admin_password && (
                            <div className="flex items-center gap-1 pt-0.5">
                              <PasswordEye password={c.local_admin_password} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Windows */}
                    <td className="py-3 px-3.5">
                      <div className="text-slate-200 text-[11px] font-medium truncate max-w-[180px]" title={c.os_version}>
                        {c.os_version || 'Windows'}
                      </div>
                      {c.os_license_key ? (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-blue-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 mt-0.5 max-w-fit">
                          <Key className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                          <span className="truncate max-w-[120px]" title={c.os_license_key}>{c.os_license_key}</span>
                          <CopyButton text={c.os_license_key} title="Windows Key" />
                        </div>
                      ) : null}
                    </td>

                    {/* Office */}
                    <td className="py-3 px-3.5">
                      <div className="text-slate-300 text-[11px] truncate max-w-[160px]" title={c.office_version}>
                        {c.office_version || '-'}
                      </div>
                      {c.office_license_key && (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 mt-0.5 max-w-fit">
                          <Key className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[120px]" title={c.office_license_key}>{c.office_license_key}</span>
                          <CopyButton text={c.office_license_key} title="Office Key" />
                        </div>
                      )}
                    </td>

                    {/* Remote Access */}
                    <td className="py-3 px-3.5">
                      {c.remote_access_id ? (
                        <div className="flex items-center gap-1 font-mono text-[11px] text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 max-w-fit">
                          <span className="truncate max-w-[110px]" title={c.remote_access_id}>{c.remote_access_id}</span>
                          <CopyButton text={c.remote_access_id} title="Uzak ID Kopyala" />
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenHandover(c)}
                          title="Bu bilgisayar ve personel için resmi Zimmet Tutanağı oluştur"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => onEdit(c)}
                          title="Düzenle"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(c)}
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

      {/* PowerShell Hardware & License Collector Modal */}
      <ComputerCollectorModal
        isOpen={isCollectorModalOpen}
        onClose={() => setIsCollectorModalOpen(false)}
        onSuccess={() => {
          if (onReloadCustomer) onReloadCustomer();
        }}
        customer={customer}
        branches={branches}
      />

      {/* Personel Zimmet & Teslim Tutanağı Modalı */}
      <HandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        customer={customer}
        selectedComputer={handoverSelectedPC}
        computers={computers}
        mailAccounts={mailAccounts}
        currentUser={currentUser}
      />
    </div>
  );
}
