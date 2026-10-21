import React, { useState, useMemo } from 'react';
import { Database, Plus, Search, Edit2, Trash2, HardDrive, Calendar, ExternalLink, ShieldCheck, Building2 } from 'lucide-react';
import CopyButton from './CopyButton';
import PasswordEye from './PasswordEye';

export default function BackupUnitsTab({ backupUnits = [], branches = [], onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const distinctBranches = useMemo(() => {
    const set = new Set(['Merkez Ofis']);
    branches.forEach(b => { if (b) set.add(b); });
    backupUnits.forEach(b => { if (b.branch_name) set.add(b.branch_name); });
    return Array.from(set);
  }, [branches, backupUnits]);

  const filtered = backupUnits.filter(b => {
    const branchMatch = selectedBranch === 'ALL' || (b.branch_name || 'Merkez Ofis') === selectedBranch;
    if (!branchMatch) return false;

    const q = search.toLowerCase();
    return (
      (b.device_name || '').toLowerCase().includes(q) ||
      (b.branch_name || '').toLowerCase().includes(q) ||
      (b.location || '').toLowerCase().includes(q) ||
      (b.brand || '').toLowerCase().includes(q) ||
      (b.model || '').toLowerCase().includes(q) ||
      (b.management_ip || '').toLowerCase().includes(q) ||
      (b.username || '').toLowerCase().includes(q) ||
      (b.capacity || '').toLowerCase().includes(q) ||
      (b.backup_software || '').toLowerCase().includes(q) ||
      (b.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-1 items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cihaz adı, marka, model, IP veya yedekleme yazılımı ile filtrele..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Tüm Şubeler & Lokasyonlar ({backupUnits.length})</option>
              {distinctBranches.map(b => {
                const count = backupUnits.filter(u => (u.branch_name || 'Merkez Ofis') === b).length;
                return (
                  <option key={b} value={b}>
                    {b === 'Merkez Ofis' ? '🏢 Merkez Ofis' : `🏬 ${b}`} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Yedekleme Ünitesi Ekle</span>
        </button>
      </div>

      {/* Backup Units Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
            <Database className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            {search ? 'Aramanıza uygun yedekleme ünitesi bulunamadı.' : 'Henüz bu müşteriye ait yedekleme ünitesi eklenmemiş.'}
          </div>
        ) : (
          filtered.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">
                        {b.device_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs font-semibold text-amber-400">
                          {b.brand} {b.model}
                        </span>
                        {b.branch_name && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.2 rounded" title="Şube / Lokasyon">
                            <Building2 className="w-2.5 h-2.5" />
                            {b.branch_name}
                          </span>
                        )}
                        {b.location && (
                          <span className="text-[10px] text-slate-400" title="Kabin / Oda">
                            📍 {b.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(b)}
                      title="Düzenle"
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(b)}
                      title="Sil"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Credentials & Access Info */}
                <div className="mt-4 space-y-2.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                  {/* Management Web UI IP */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Arayüz IP / Link:</span>
                    <div className="flex items-center gap-1 font-mono text-white font-semibold">
                      <span>{b.management_ip || '-'}</span>
                      {b.management_ip && (
                        <>
                          <CopyButton text={b.management_ip} />
                          {b.management_ip.startsWith('http') && (
                            <a
                              href={b.management_ip}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-amber-300 p-0.5 ml-0.5"
                              title="Arayüzü Yeni Sekmede Aç"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kullanıcı Adı:</span>
                    <div className="flex items-center gap-1 font-mono text-slate-200">
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-semibold">
                        {b.username || '-'}
                      </span>
                      {b.username && <CopyButton text={b.username} />}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Parolası:</span>
                    <PasswordEye password={b.password} />
                  </div>
                </div>

                {/* Capacity & Backup Plan */}
                <div className="mt-3 space-y-2 text-xs">
                  {b.capacity && (
                    <div className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                      <HardDrive className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Depolama & Disk:</span>
                        <span className="text-slate-200 font-mono">{b.capacity}</span>
                      </div>
                    </div>
                  )}

                  {(b.backup_software || b.backup_schedule) && (
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      {b.backup_software && (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 font-medium">{b.backup_software}</span>
                        </div>
                      )}
                      {b.backup_schedule && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Periyot: <strong className="text-slate-300 font-normal">{b.backup_schedule}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {b.notes && (
                    <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                      <span className="font-semibold text-slate-300">Notlar: </span>
                      {b.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
