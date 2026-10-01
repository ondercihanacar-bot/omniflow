import React, { useState } from 'react';
import {
  Globe, Shield, Server, Cloud, Laptop, Database, Network,
  Layers, ArrowDown, ChevronRight, User, Key, Wifi, Printer,
  Cpu, HardDrive, Filter, CheckCircle2, Sparkles
} from 'lucide-react';
import CopyButton from './CopyButton';
import StarTopologyView from './StarTopologyView';

export default function NetworkTopologyTab({ customer, onOpenReport }) {
  const [viewLayout, setViewLayout] = useState('star'); // 'star' (Yıldız / HUD Haritası) | 'tree' (Klasik Hiyerarşik Ağaç)
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, SERVERS, PCS
  const [selectedDept, setSelectedDept] = useState('ALL');

  if (!customer) return null;

  const servers = customer.physical_servers || [];
  const vms = customer.virtual_machines || [];
  const pcs = customer.user_computers || [];
  const firewalls = customer.firewalls || [];
  const backups = customer.backup_units || [];

  // Group PCs by Department
  const distinctDepts = Array.from(new Set(pcs.map(p => p.department || 'Genel'))).filter(Boolean);

  const filteredPCs = pcs.filter(p => {
    if (selectedDept === 'ALL') return true;
    return (p.department || 'Genel') === selectedDept;
  });

  const pcsByDept = filteredPCs.reduce((acc, pc) => {
    const dept = pc.department || 'Genel';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(pc);
    return acc;
  }, {});

  // Primary Gateway (Firewall or default)
  const primaryFirewall = firewalls.length > 0 ? firewalls[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Layout Switcher and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-md">
        
        {/* Layout Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-1 hidden sm:inline-block">Görünüm:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setViewLayout('star')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'star'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>Yıldız / HUD Haritası</span>
            </button>
            <button
              onClick={() => setViewLayout('tree')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'tree'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-300" />
              <span>Klasik Dikey Hiyerarşi</span>
            </button>
          </div>
        </div>

        {/* Tree filters (only active when in tree mode) */}
        {viewLayout === 'tree' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tam Topoloji
              </button>
              <button
                onClick={() => setFilterMode('SERVERS')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === 'SERVERS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sunucular
              </button>
              <button
                onClick={() => setFilterMode('PCS')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === 'PCS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                PC'ler
              </button>
            </div>

            {filterMode !== 'SERVERS' && distinctDepts.length > 0 && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tüm Departmanlar ({pcs.length} PC)</option>
                {distinctDepts.map(d => (
                  <option key={d} value={d}>
                    {d} ({pcs.filter(p => (p.department || 'Genel') === d).length} Cihaz)
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <button
          onClick={onOpenReport}
          className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4 text-blue-400" />
          <span>Topoloji & Envanter Raporunu Yazdır (PDF / Excel)</span>
        </button>
      </div>

      {/* ================= 1. STAR / CONSTELLATION HUD MAP VIEW ================= */}
      {viewLayout === 'star' && (
        <StarTopologyView customer={customer} onOpenReport={onOpenReport} />
      )}

      {/* ================= 2. CLASSIC TOPOLOGY DIAGRAM TREE VIEW ================= */}
      {viewLayout === 'tree' && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

        {/* 1. INTERNET / WAN LINES & BRANCHES NODE */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
          {(!customer.internet_lines || customer.internet_lines.length === 0) ? (
            <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/50 rounded-2xl px-6 py-3.5 shadow-xl flex items-center gap-3 backdrop-blur-md">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Globe className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">İnternet / WAN Hattı</div>
                <div className="text-sm sm:text-base font-extrabold text-white font-mono flex items-center gap-2">
                  <span>{customer.external_ip || 'Statik IP Yok'}</span>
                  {customer.external_ip && <CopyButton text={customer.external_ip} />}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="text-center mb-2.5">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                  🌐 Müşteri İnternet Hatları & Şubeleri ({customer.internet_lines.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {customer.internet_lines.map(line => {
                  const isFiber = (line.line_type || '').includes('Fiber') || (line.line_type || '').includes('Metro');
                  const isVdsl = (line.line_type || '').includes('VDSL') || (line.line_type || '').includes('ADSL');

                  return (
                    <div
                      key={line.id}
                      className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-3.5 shadow-lg space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            line.is_primary ? 'bg-blue-500/30 text-blue-200' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {line.is_primary ? 'Ana Hat' : 'Yedek Hat'}
                          </span>
                          <h4 className="font-bold text-white text-xs mt-1">{line.branch_name}</h4>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                          isFiber ? 'text-indigo-300 bg-indigo-950/60' : 'text-amber-300 bg-amber-950/60'
                        }`}>
                          {line.line_type}
                        </span>
                      </div>

                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] space-y-1">
                        {line.static_ip && (
                          <div className="flex items-center justify-between text-slate-200">
                            <span className="text-slate-500 text-[10px]">Statik IP:</span>
                            <span className="font-bold text-blue-400 flex items-center gap-1">
                              {line.static_ip}
                              <CopyButton text={line.static_ip} />
                            </span>
                          </div>
                        )}
                        {line.subnet_mask && (
                          <div className="flex items-center justify-between text-slate-300 text-[10px]">
                            <span className="text-slate-500">Subnet:</span>
                            <span>{line.subnet_mask}</span>
                          </div>
                        )}
                        {line.gateway && (
                          <div className="flex items-center justify-between text-slate-300 text-[10px]">
                            <span className="text-slate-500">Gateway:</span>
                            <span className="text-amber-300">{line.gateway}</span>
                          </div>
                        )}
                        {line.pppoe_user && (
                          <div className="flex items-center justify-between text-slate-300 text-[10px]">
                            <span className="text-slate-500">PPPoE:</span>
                            <span className="text-amber-300 font-semibold">{line.pppoe_user}</span>
                          </div>
                        )}
                        {line.modem_ip && (
                          <div className="flex items-center justify-between text-slate-300 text-[10px]">
                            <span className="text-slate-500">Modem IP:</span>
                            <span>{line.modem_ip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connector Line */}
          <div className="w-0.5 h-8 bg-blue-500/40 my-1"></div>
          <ArrowDown className="w-4 h-4 text-blue-400 -mt-2.5 mb-1" />
        </div>

        {/* 2. FIREWALL & GATEWAY LAYER */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
          <div className="w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Ağ Güvenlik Duvarı (Firewall / Gateway)</div>
                <div className="text-sm font-bold text-white">
                  {primaryFirewall ? `${primaryFirewall.brand} ${primaryFirewall.model} (${primaryFirewall.device_name})` : 'Varsayılan Ağ Geçidi'}
                </div>
                {primaryFirewall?.management_ip && (
                  <div className="text-xs font-mono text-slate-300 mt-0.5 flex items-center gap-1">
                    <span className="text-slate-500">Gateway IP:</span>
                    <span>{primaryFirewall.management_ip}</span>
                    <CopyButton text={primaryFirewall.management_ip} />
                  </div>
                )}
              </div>
            </div>

            {primaryFirewall?.ssl_vpn_portal && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800">
                SSL-VPN Aktif
              </span>
            )}
          </div>

          {/* Connector Line */}
          <div className="w-0.5 h-8 bg-slate-700 my-1"></div>
          <ArrowDown className="w-4 h-4 text-slate-500 -mt-2.5 mb-1" />
        </div>

        {/* 3. CORE LAN SWITCH / SUBNET HUB */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-md">
          <div className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl px-5 py-3 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 text-blue-400 rounded-lg">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Merkez LAN Dağıtım Katmanı</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Toplam {servers.length + vms.length + pcs.length + backups.length} Bağlı Uç Nokta
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              1 Gbit / 10 Gbit
            </span>
          </div>

          {/* Branching Horizontal Bar */}
          <div className="w-full max-w-4xl h-0.5 bg-slate-700 mt-4 relative">
            {/* Markers */}
            <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-slate-900"></div>
            <div className="absolute left-[50%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 ring-4 ring-slate-900"></div>
            <div className="absolute left-[85%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-slate-900"></div>
          </div>
        </div>

        {/* 4. THREE BRANCHES: SERVERS, BACKUP, DEPARTMENTS */}
        <div className="relative z-10 w-full mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* BRANCH A: SERVERS (PHYSICAL + VIRTUAL) */}
          {(filterMode === 'ALL' || filterMode === 'SERVERS') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <Server className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Sunucu Odası / Kabinet ({servers.length} Fiziki, {vms.length} VM)
                  </h3>
                </div>
              </div>

              {servers.length === 0 ? (
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                  Fiziksel sunucu bulunamadı.
                </div>
              ) : (
                servers.map((srv) => {
                  // Find VMs assigned to this physical server
                  const childVMs = vms.filter(v => v.physical_server_id === srv.id);

                  return (
                    <div key={srv.id} className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 shadow-md space-y-3">
                      {/* Physical Server Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                            <Server className="w-4 h-4 text-indigo-400" />
                            {srv.server_name}
                          </div>
                          <div className="text-xs text-indigo-300 font-medium">
                            {srv.brand} {srv.model}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {srv.status}
                        </span>
                      </div>

                      {/* Server Specs & Network */}
                      <div className="text-[11px] space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 font-mono">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">IP:</span>
                          <span className="font-semibold text-white flex items-center gap-1">
                            {srv.ip_address || '-'}
                            {srv.ip_address && <CopyButton text={srv.ip_address} />}
                          </span>
                        </div>
                        {srv.management_ip && (
                          <div className="flex justify-between text-slate-300">
                            <span className="text-slate-500">iDRAC/iLO:</span>
                            <span className="text-indigo-300 flex items-center gap-1">
                              {srv.management_ip}
                              <CopyButton text={srv.management_ip} />
                            </span>
                          </div>
                        )}
                        {srv.cpu_info && (
                          <div className="text-slate-400 text-[10px] truncate" title={srv.cpu_info}>
                            CPU: {srv.cpu_info}
                          </div>
                        )}
                        {srv.ram_info && (
                          <div className="text-slate-400 text-[10px]">
                            RAM: {srv.ram_info}
                          </div>
                        )}
                      </div>

                      {/* Hosted Virtual Machines Tree Branch */}
                      {childVMs.length > 0 && (
                        <div className="pt-2 border-t border-slate-800">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1">
                            <Cloud className="w-3 h-3" />
                            Barındırılan Sanal Makineler ({childVMs.length})
                          </div>

                          <div className="space-y-2 pl-2 border-l-2 border-purple-500/40">
                            {childVMs.map(vm => (
                              <div key={vm.id} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white font-mono">{vm.vm_name}</span>
                                  <span className="text-[10px] text-purple-300 font-medium">{vm.vcpu} / {vm.ram}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{vm.role_description}</div>
                                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-900">
                                  <span className="text-slate-300">{vm.ip_address}</span>
                                  {vm.os_license_key ? (
                                    <span className="text-emerald-400 text-[10px] flex items-center gap-0.5">
                                      <Key className="w-2.5 h-2.5" /> Lisanslı
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 text-[10px]">Lisans Yok</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Standalone VMs (Not attached to a server) */}
              {vms.filter(v => !v.physical_server_id).length > 0 && (
                <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-4 shadow-md space-y-2">
                  <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" />
                    <span>Bağımsız / Bulut Sanal Sunucular</span>
                  </div>
                  <div className="space-y-1.5">
                    {vms.filter(v => !v.physical_server_id).map(vm => (
                      <div key={vm.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white font-mono">{vm.vm_name}</div>
                          <div className="text-[10px] text-slate-400">{vm.role_description}</div>
                        </div>
                        <span className="font-mono text-slate-300">{vm.ip_address}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BRANCH B: STORAGE & BACKUP NAS */}
          {(filterMode === 'ALL' || filterMode === 'SERVERS') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Depolama & Yedekleme ({backups.length} NAS)
                  </h3>
                </div>
              </div>

              {backups.length === 0 ? (
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                  Yedekleme ünitesi bulunamadı.
                </div>
              ) : (
                backups.map((bu) => (
                  <div key={bu.id} className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-md space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-amber-400" />
                          {bu.device_name}
                        </div>
                        <div className="text-xs text-amber-300 font-medium">
                          {bu.brand} {bu.model}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Erişim IP:</span>
                        <span className="font-semibold text-white flex items-center gap-1">
                          {bu.management_ip || '-'}
                          {bu.management_ip && <CopyButton text={bu.management_ip} />}
                        </span>
                      </div>
                      {bu.capacity && (
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-500">Kapasite:</span>
                          <span className="text-amber-300">{bu.capacity}</span>
                        </div>
                      )}
                      {bu.backup_software && (
                        <div className="text-slate-400 text-[10px]">
                          Yazılım: {bu.backup_software}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Network Topology Summary Note */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ağ Mimarisi Bilgisi</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Sunucular ve NAS üniteleri güvenli yerel ağda VLAN veya statik IP bloğunda çalışmaktadır. Yedekleme trafiği doğrudan sunucu datastore üzerinden NAS ünitesine aktarılır.
                </p>
              </div>
            </div>
          )}

          {/* BRANCH C: DEPARTMENT BASED WORKSTATIONS */}
          {(filterMode === 'ALL' || filterMode === 'PCS') && (
            <div className={`space-y-4 ${filterMode === 'PCS' ? 'lg:col-span-3' : ''}`}>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Departman Bazında Kullanıcı Bilgisayarları ({filteredPCs.length} PC)
                  </h3>
                </div>
              </div>

              {Object.keys(pcsByDept).length === 0 ? (
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                  Bu filtrede kullanıcı bilgisayarı bulunamadı.
                </div>
              ) : (
                Object.entries(pcsByDept).map(([dept, deptPCs]) => (
                  <div key={dept} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                    {/* Department Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <h4 className="text-xs font-bold text-white uppercase">
                          {dept} Departmanı
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                        {deptPCs.length} Cihaz
                      </span>
                    </div>

                    {/* PCs in this department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {deptPCs.map(pc => (
                        <div key={pc.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5 hover:border-emerald-500/40 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-white font-mono flex items-center gap-1.5">
                                <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                                {pc.computer_name}
                              </div>
                              <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                                <User className="w-3 h-3 text-slate-500" />
                                <span>{pc.assigned_user || 'Atanmadı'}</span>
                              </div>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {pc.device_type}
                            </span>
                          </div>

                          {/* IPs */}
                          <div className="pt-1.5 border-t border-slate-900 flex flex-col gap-1 font-mono text-[10px]">
                            {pc.ethernet_ip && (
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-500">Eth IP:</span>
                                <span className="font-semibold text-emerald-300 flex items-center gap-1">
                                  {pc.ethernet_ip}
                                  <CopyButton text={pc.ethernet_ip} />
                                </span>
                              </div>
                            )}
                            {pc.wifi_ip && (
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-500 flex items-center gap-0.5">
                                  <Wifi className="w-2.5 h-2.5 text-blue-400" /> Wi-Fi:
                                </span>
                                <span className="font-semibold text-blue-300 flex items-center gap-1">
                                  {pc.wifi_ip}
                                  <CopyButton text={pc.wifi_ip} />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
      )}
    </div>
  );
}
