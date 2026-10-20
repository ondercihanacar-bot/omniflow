import React, { useState } from 'react';
import { Shield, Plus, Search, Edit2, Trash2, Globe, ExternalLink, Key, Lock, CheckCircle2, Building2, ShieldAlert } from 'lucide-react';
import CopyButton from './CopyButton';
import PasswordEye from './PasswordEye';
import { getDaysRemaining, getLicenseStatus } from '../utils/licenseAlerts';
import { openWebPanel } from '../utils/launcher';

export default function FirewallsTab({ firewalls = [], onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('');

  const filtered = firewalls.filter(f => {
    const q = search.toLowerCase();
    return (
      (f.device_name || '').toLowerCase().includes(q) ||
      (f.branch_name || '').toLowerCase().includes(q) ||
      (f.brand || '').toLowerCase().includes(q) ||
      (f.model || '').toLowerCase().includes(q) ||
      (f.management_ip || '').toLowerCase().includes(q) ||
      (f.username || '').toLowerCase().includes(q) ||
      (f.external_ip || '').toLowerCase().includes(q) ||
      (f.ssl_vpn_portal || '').toLowerCase().includes(q) ||
      (f.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cihaz adı, marka, model, IP veya kullanıcı adı ile filtrele..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Firewall Ekle</span>
        </button>
      </div>

      {/* Firewalls Cards / Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
            <Shield className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            {search ? 'Aramanıza uygun firewall cihazı bulunamadı.' : 'Henüz firewall kaydı eklenmemiş.'}
          </div>
        ) : (
          filtered.map((f) => {
            const days = getDaysRemaining(f.license_expiry);
            const status = getLicenseStatus(days);

            return (
              <div
                key={f.id}
                className={`bg-slate-900/80 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                  status.isUrgent
                    ? 'border-rose-600/70 shadow-rose-950/40 hover:border-rose-500'
                    : 'border-slate-800 hover:border-rose-500/40'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${
                        status.isUrgent
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">
                          {f.device_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs font-semibold text-rose-400">
                            {f.brand} {f.model}
                          </span>
                          {f.branch_name && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.2 rounded" title="Şube / Lokasyon">
                              <Building2 className="w-2.5 h-2.5" />
                              {f.branch_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(f)}
                        title="Düzenle"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(f)}
                        title="Sil"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Urgent License Warning Alert Banner */}
                  {status.isUrgent && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/80 flex items-center justify-between text-xs text-rose-200">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-90"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="font-bold">Lisans Uyarısı:</span>
                        <span className="font-semibold text-rose-300">{status.label}</span>
                      </div>
                      <span className="font-mono text-[11px] text-rose-300 font-bold bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700/60">
                        {f.license_expiry}
                      </span>
                    </div>
                  )}

                  {/* Credentials & Access Info */}
                  <div className="mt-4 space-y-2.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                    {/* Management Web UI IP */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Arayüz IP / Link:</span>
                      <div className="flex items-center gap-1.5 font-mono text-white font-semibold">
                        <span>{f.management_ip || '-'}</span>
                        {f.management_ip && (
                          <>
                            <button
                              onClick={() => openWebPanel(f.management_ip, f.password, f.username)}
                              className="px-1.5 py-0.5 rounded bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:bg-rose-600/50 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Firewall panelini yeni sekmede aç ve parolayı panoya kopyala"
                            >
                              <span>🌐 Panele Git</span>
                            </button>
                            <CopyButton text={f.management_ip} />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Username */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Kullanıcı Adı:</span>
                      <div className="flex items-center gap-1 font-mono text-slate-200">
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-semibold">
                          {f.username || '-'}
                        </span>
                        {f.username && <CopyButton text={f.username} />}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Parolası:</span>
                      <PasswordEye password={f.password} />
                    </div>

                    {/* WAN External IP */}
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        Dış Statik IP (WAN):
                      </span>
                      <div className="flex items-center gap-1 font-mono text-blue-400 font-semibold">
                        <span>{f.external_ip || '-'}</span>
                        {f.external_ip && <CopyButton text={f.external_ip} />}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info (VPN, Firmware, Expiry) */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    {f.firmware_version && (
                      <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Firmware Sürümü:</span>
                        <span className="font-mono text-slate-200">{f.firmware_version}</span>
                      </div>
                    )}
                    {f.license_expiry && (
                      <div className={`p-2 rounded-lg border ${status.isUrgent ? 'bg-rose-950/30 border-rose-800/80' : 'bg-slate-800/40 border-slate-800'}`}>
                        <span className="text-slate-500 block">Lisans Bitişi:</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className={`font-medium ${status.isUrgent ? 'text-rose-300 font-bold' : 'text-amber-300'}`}>{f.license_expiry}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${status.badgeClass}`}>{status.shortLabel}</span>
                        </div>
                      </div>
                    )}
                  </div>

                {f.ssl_vpn_portal && (
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-800/30 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 text-[11px]">SSL VPN Portalı:</span>
                    <div className="flex items-center gap-1.5 text-rose-300">
                      <span>{f.ssl_vpn_portal}</span>
                      <button
                        onClick={() => openWebPanel(f.ssl_vpn_portal)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                        title="SSL VPN Portalını Yeni Sekmede Aç"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <CopyButton text={f.ssl_vpn_portal} />
                    </div>
                  </div>
                )}

                {f.notes && (
                  <div className="mt-3 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                    <span className="font-semibold text-slate-300">Notlar: </span>
                    {f.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
