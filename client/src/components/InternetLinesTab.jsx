import React, { useState } from 'react';
import {
  Globe, Plus, Search, Edit2, Trash2, MapPin, Radio, Key,
  ExternalLink, CheckCircle2, Shield, Network, Server, ArrowRight
} from 'lucide-react';
import CopyButton from './CopyButton';
import PasswordEye from './PasswordEye';

export default function InternetLinesTab({ lines = [], onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('');

  const filtered = lines.filter(l => {
    const q = search.toLowerCase();
    return (
      (l.branch_name || '').toLowerCase().includes(q) ||
      (l.line_type || '').toLowerCase().includes(q) ||
      (l.isp || '').toLowerCase().includes(q) ||
      (l.circuit_number || '').toLowerCase().includes(q) ||
      (l.static_ip || '').toLowerCase().includes(q) ||
      (l.gateway || '').toLowerCase().includes(q) ||
      (l.pppoe_user || '').toLowerCase().includes(q) ||
      (l.modem_ip || '').toLowerCase().includes(q) ||
      (l.modem_brand_model || '').toLowerCase().includes(q) ||
      (l.location_address || '').toLowerCase().includes(q)
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
            placeholder="Şube adı, Statik IP, Gateway, PPPoE kullanıcı adı veya İSS ile filtrele..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Şube / İnternet Hattı Ekle</span>
        </button>
      </div>

      {/* Grid of Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
            <Globe className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            {search ? 'Aramanıza uygun internet hattı veya şube bulunamadı.' : 'Henüz bu müşteriye ait internet hattı veya şube kaydı eklenmemiş.'}
          </div>
        ) : (
          filtered.map((line) => {
            const isFiber = (line.line_type || '').includes('Fiber') || (line.line_type || '').includes('Metro');
            const isVdsl = (line.line_type || '').includes('VDSL') || (line.line_type || '').includes('ADSL');

            return (
              <div
                key={line.id}
                className="bg-slate-900/85 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          line.is_primary
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {line.is_primary ? 'ANA HAT' : 'YEDEK HAT'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isFiber
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : isVdsl
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}>
                          {line.line_type}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                        {line.branch_name}
                      </h4>

                      <div className="text-xs text-slate-400 mt-0.5 font-medium">
                        {line.isp || 'İSS Belirtilmedi'}
                        {line.circuit_number && (
                          <span className="font-mono text-slate-300 ml-1.5">
                            • Devre No: <strong>{line.circuit_number}</strong>
                          </span>
                        )}
                        {line.speed_info && (
                          <span className="text-emerald-400 ml-1.5">
                            ({line.speed_info})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(line)}
                        title="Düzenle"
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(line)}
                        title="Sil"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Section A: Static IP & Subnet & Gateway */}
                  {(line.static_ip || line.gateway || line.subnet_mask) && (
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 text-xs space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        Statik IP & Ağ Yapılandırması
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Statik IP (WAN):</span>
                          <span className="font-bold text-white flex items-center gap-1">
                            {line.static_ip || '-'}
                            {line.static_ip && <CopyButton text={line.static_ip} />}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px]">Subnet Mask:</span>
                          <span className="text-slate-300 flex items-center gap-1">
                            {line.subnet_mask || '-'}
                            {line.subnet_mask && <CopyButton text={line.subnet_mask} />}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px]">Ağ Geçidi (Gateway):</span>
                          <span className="text-amber-300 font-semibold flex items-center gap-1">
                            {line.gateway || '-'}
                            {line.gateway && <CopyButton text={line.gateway} />}
                          </span>
                        </div>
                      </div>

                      {line.dns_servers && (
                        <div className="text-[10px] text-slate-400 border-t border-slate-900 pt-1 font-mono">
                          <span className="text-slate-500">DNS Sunucuları: </span>
                          <span className="text-slate-300">{line.dns_servers}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section B: VDSL / PPPoE & Modem Web UI */}
                  {(line.pppoe_user || line.pppoe_password || line.modem_ip || line.modem_brand_model) && (
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 text-xs space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5" />
                        VDSL / PPPoE Bilgileri & Modem Arayüzü
                      </div>

                      {/* PPPoE User & Password */}
                      {(line.pppoe_user || line.pppoe_password) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">PPPoE Kullanıcı:</span>
                            <span className="text-amber-300 font-bold">{line.pppoe_user || '-'}</span>
                            {line.pppoe_user && <CopyButton text={line.pppoe_user} />}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Şifre:</span>
                            <PasswordEye password={line.pppoe_password} placeholder="Yok" />
                          </div>
                        </div>
                      )}

                      {/* Modem Info */}
                      {(line.modem_ip || line.modem_brand_model) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="text-slate-300 font-medium">
                            <span className="text-slate-500 text-[10px] block">Modem Cihazı:</span>
                            <span>{line.modem_brand_model || 'Modem modeli belirtilmedi'}</span>
                          </div>

                          <div>
                            <span className="text-slate-500 text-[10px] block">Modem Arayüz Girişi:</span>
                            <div className="flex items-center gap-1 font-mono text-slate-200">
                              <span>{line.modem_ip || '-'}</span>
                              {line.modem_ip && (
                                <>
                                  <CopyButton text={line.modem_ip} />
                                  {line.modem_ip.startsWith('http') && (
                                    <a
                                      href={line.modem_ip}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-slate-400 hover:text-white"
                                      title="Modem Arayüzünü Aç"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                            {(line.modem_user || line.modem_password) && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                <span>u: {line.modem_user || 'admin'}</span>
                                {line.modem_password && <PasswordEye password={line.modem_password} />}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location Address */}
                  {line.location_address && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{line.location_address}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {line.notes && (
                    <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                      <span className="font-semibold text-slate-300">Notlar: </span>
                      {line.notes}
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
