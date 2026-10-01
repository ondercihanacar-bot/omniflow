import React from 'react';
import { Server, Cloud, Laptop, Shield, ShieldCheck, Database, Globe, Phone, Mail, MapPin, Key, User, FileText, Plus, Wifi, Radio, Router } from 'lucide-react';
import CopyButton from './CopyButton';
import { useLanguage } from '../context/LanguageContext';

export default function OverviewTab({ customer, onNavigateTab, onOpenAddModal, neonEnabled = true }) {
  const { t } = useLanguage();
  if (!customer) return null;

  const servers = customer.physical_servers || [];
  const vms = customer.virtual_machines || [];
  const pcs = customer.user_computers || [];
  const firewalls = customer.firewalls || [];
  const antiviruses = customer.antivirus_licenses || [];
  const backups = customer.backup_units || [];
  const lines = customer.internet_lines || [];
  const wifiControllers = customer.wifi_controllers || [];
  const wifiAPs = customer.wifi_access_points || [];
  const wifiNetworks = customer.wifi_networks || [];
  const mailServices = customer.mail_services || [];
  const mailAccounts = customer.mail_accounts || [];

  // Count licenses
  const windowsServerLicenses = vms.filter(v => v.os_license_key).length;
  const windowsPCLicenses = pcs.filter(p => p.os_license_key).length;
  const officeLicenses = pcs.filter(p => p.office_license_key).length + vms.filter(v => v.office_license_key).length;
  const totalAntivirusUsers = antiviruses.reduce((sum, a) => sum + (parseInt(a.user_count, 10) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stat Cards Row with Optional Neon Glow */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3.5">
        {/* 1. Fiziki Sunucu */}
        <div
          onClick={() => onNavigateTab('servers')}
          className="relative group cursor-pointer"
        >
          {neonEnabled && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300"></div>
          )}
          
          <div className={`relative bg-slate-900 border ${
            neonEnabled
              ? 'border-indigo-500/60 group-hover:border-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.25)] group-hover:shadow-[0_0_28px_rgba(99,102,241,0.55)]'
              : 'border-slate-800 group-hover:border-indigo-500/50 shadow-sm'
          } p-4 rounded-xl transition-all flex flex-col justify-between h-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-indigo-300">{t('overview.physicalServer')}</span>
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black text-white font-mono ${neonEnabled ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>{servers.length}</span>
              <span className="text-xs text-slate-400">{t('overview.unitQty')}</span>
            </div>
          </div>
        </div>

        {/* 2. Sanal Makine */}
        <div
          onClick={() => onNavigateTab('vms')}
          className="relative group cursor-pointer"
        >
          {neonEnabled && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300"></div>
          )}
          
          <div className={`relative bg-slate-900 border ${
            neonEnabled
              ? 'border-purple-500/60 group-hover:border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_28px_rgba(168,85,247,0.55)]'
              : 'border-slate-800 group-hover:border-purple-500/50 shadow-sm'
          } p-4 rounded-xl transition-all flex flex-col justify-between h-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-purple-300">{t('overview.virtualMachine')}</span>
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform">
                <Cloud className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black text-white font-mono ${neonEnabled ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''}`}>{vms.length}</span>
              <span className="text-xs text-slate-400">{t('overview.vmQty')}</span>
            </div>
          </div>
        </div>

        {/* 3. Kullanıcı PC */}
        <div
          onClick={() => onNavigateTab('pcs')}
          className="relative group cursor-pointer"
        >
          {neonEnabled && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300"></div>
          )}
          
          <div className={`relative bg-slate-900 border ${
            neonEnabled
              ? 'border-emerald-500/60 group-hover:border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.25)] group-hover:shadow-[0_0_28px_rgba(16,185,129,0.55)]'
              : 'border-slate-800 group-hover:border-emerald-500/50 shadow-sm'
          } p-4 rounded-xl transition-all flex flex-col justify-between h-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-emerald-300">{t('overview.userPc')}</span>
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
                <Laptop className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black text-white font-mono ${neonEnabled ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`}>{pcs.length}</span>
              <span className="text-xs text-slate-400">{t('overview.clientQty')}</span>
            </div>
          </div>
        </div>

        {/* 4. Firewall / Ağ */}
        <div
          onClick={() => onNavigateTab('firewalls')}
          className="relative group cursor-pointer"
        >
          {neonEnabled && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300"></div>
          )}
          
          <div className={`relative bg-slate-900 border ${
            neonEnabled
              ? 'border-rose-500/60 group-hover:border-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.25)] group-hover:shadow-[0_0_28px_rgba(244,63,94,0.55)]'
              : 'border-slate-800 group-hover:border-rose-500/50 shadow-sm'
          } p-4 rounded-xl transition-all flex flex-col justify-between h-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-rose-300">{t('overview.firewallDevice')}</span>
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)] group-hover:scale-110 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black text-white font-mono ${neonEnabled ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : ''}`}>{firewalls.length}</span>
              <span className="text-xs text-slate-400">{t('overview.deviceQty')}</span>
            </div>
          </div>
        </div>

        {/* 5. Antivirüs Lisansları */}
        <div
          onClick={() => onNavigateTab('antivirus')}
          className="relative group cursor-pointer"
        >
          {neonEnabled && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300"></div>
          )}
          
          <div className={`relative bg-slate-900 border ${
            neonEnabled
              ? 'border-teal-500/60 group-hover:border-teal-400 shadow-[0_0_18px_rgba(20,184,166,0.25)] group-hover:shadow-[0_0_28px_rgba(20,184,166,0.55)]'
              : 'border-slate-800 group-hover:border-teal-500/50 shadow-sm'
          } p-4 rounded-xl transition-all flex flex-col justify-between h-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-teal-300">{t('overview.antivirusLicenses')}</span>
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.3)] group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black text-white font-mono ${neonEnabled ? 'drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]' : ''}`}>{antiviruses.length}</span>
              <span className="text-xs text-slate-400">{totalAntivirusUsers > 0 ? `${totalAntivirusUsers} ${t('overview.unitUser')}` : t('overview.unitPackage')}</span>
            </div>
          </div>
        </div>

        {/* 6. Yedekleme NAS */}
        <div
          onClick={() => onNavigateTab('backups')}
          className="relative group cursor-pointer"
        >
          {neonEnabled && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300"></div>
          )}
          
          <div className={`relative bg-slate-900 border ${
            neonEnabled
              ? 'border-amber-500/60 group-hover:border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.25)] group-hover:shadow-[0_0_28px_rgba(245,158,11,0.55)]'
              : 'border-slate-800 group-hover:border-amber-500/50 shadow-sm'
          } p-4 rounded-xl transition-all flex flex-col justify-between h-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-300">{t('overview.backupUnits')}</span>
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black text-white font-mono ${neonEnabled ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}`}>{backups.length}</span>
              <span className="text-xs text-slate-400">{t('overview.unitNas')}</span>
            </div>
          </div>
        </div>

        {/* 7. Wi-Fi & AP */}
        <div
          onClick={() => onNavigateTab('wifi')}
          className="relative group cursor-pointer"
        >
          {neonEnabled && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300"></div>
          )}
          
          <div className={`relative bg-slate-900 border ${
            neonEnabled
              ? 'border-sky-500/60 group-hover:border-sky-400 shadow-[0_0_18px_rgba(14,165,233,0.25)] group-hover:shadow-[0_0_28px_rgba(14,165,233,0.55)]'
              : 'border-slate-800 group-hover:border-sky-500/50 shadow-sm'
          } p-4 rounded-xl transition-all flex flex-col justify-between h-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-sky-300">{t('overview.wifiInfra')}</span>
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_10px_rgba(14,165,233,0.3)] group-hover:scale-110 transition-transform">
                <Wifi className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black text-white font-mono ${neonEnabled ? 'drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]' : ''}`}>{wifiAPs.length}</span>
              <span className="text-xs text-slate-400">AP ({wifiNetworks.length} SSID)</span>
            </div>
          </div>
        </div>

        {/* 8. Kurumsal Mail */}
        <div
          onClick={() => onNavigateTab('mail')}
          className="relative group cursor-pointer"
        >
          {neonEnabled && (
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-300"></div>
          )}
          
          <div className={`relative bg-slate-900 border ${
            neonEnabled
              ? 'border-blue-500/60 group-hover:border-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.25)] group-hover:shadow-[0_0_28px_rgba(59,130,246,0.55)]'
              : 'border-slate-800 group-hover:border-blue-500/50 shadow-sm'
          } p-4 rounded-xl transition-all flex flex-col justify-between h-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-blue-300">{t('overview.mailAccounts') || 'Kurumsal Mail'}</span>
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black text-white font-mono ${neonEnabled ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`}>{mailAccounts.length}</span>
              <span className="text-xs text-slate-400">
                {mailServices[0] ? (mailServices[0].service_type.includes('Microsoft') ? 'M365' : (mailServices[0].service_type.includes('Google') ? 'Google' : 'Hesap')) : (t('overview.unitAccount') || 'Hesap')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* External IP & Quick Access Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: WAN IP & Network Highlights */}
        <div className="lg:col-span-2 space-y-4">
          {/* External Static IP & Branches Highlight Box */}
          <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Globe className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Şubeler & Dış Statik IP Hatları ({lines.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('lines')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  Tüm Hatları Gör →
                </button>
                <button
                  onClick={() => onOpenAddModal('line')}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  + Yeni Hat / Şube
                </button>
              </div>
            </div>

            {/* List all branch lines */}
            {lines.length === 0 ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs block">Genel Dış Statik IP (WAN):</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xl font-bold text-white font-mono">{customer.external_ip || 'Dış IP Tanımlanmadı'}</span>
                    {customer.external_ip && <CopyButton text={customer.external_ip} />}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lines.map((l) => (
                  <div key={l.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{l.branch_name}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                          l.is_primary ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {l.is_primary ? 'Ana Hat' : 'Yedek Hat'}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {l.line_type}
                        </span>
                      </div>

                      {/* Line parameters */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-300">
                        {l.static_ip && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Statik IP:</span>
                            <span className="font-bold text-blue-400">{l.static_ip}</span>
                            <CopyButton text={l.static_ip} />
                          </div>
                        )}
                        {l.subnet_mask && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Subnet:</span>
                            <span>{l.subnet_mask}</span>
                          </div>
                        )}
                        {l.gateway && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Gateway:</span>
                            <span className="text-amber-300">{l.gateway}</span>
                          </div>
                        )}
                        {l.pppoe_user && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">PPPoE:</span>
                            <span className="text-amber-300">{l.pppoe_user}</span>
                          </div>
                        )}
                        {l.modem_ip && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Modem IP:</span>
                            <span className="text-slate-200">{l.modem_ip}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('lines')}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded border border-slate-800 self-start sm:self-center shrink-0 cursor-pointer"
                    >
                      Detay / Düzenle
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick stats ribbon */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div>
                <span className="text-slate-500">Yetkili: </span>
                <span className="font-semibold text-slate-200">{customer.contact_person || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">Telefon: </span>
                <span className="font-mono text-slate-200">{customer.phone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500">E-posta: </span>
                <span className="text-blue-400">{customer.email || '-'}</span>
              </div>
            </div>
          </div>

          {/* Licenses Summary Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Key className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Kayıtlı Lisans Envanteri</h4>
              </div>
              <span className="text-xs text-slate-400">Windows & Office Lisans Key Kayıtları</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400">Sunucu Windows Lisansları</div>
                <div className="mt-1.5 text-xl font-bold text-white font-mono">{windowsServerLicenses} / {vms.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Sanal Sunucularda Tanımlı</div>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400">İstemci Windows Lisansları</div>
                <div className="mt-1.5 text-xl font-bold text-white font-mono">{windowsPCLicenses} / {pcs.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Kullanıcı Bilgisayarlarında</div>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400">Office Lisans Anahtarları</div>
                <div className="mt-1.5 text-xl font-bold text-white font-mono">{officeLicenses}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">PC & RDS Üzerinde Kayıtlı</div>
              </div>
              <div
                onClick={() => onNavigateTab('antivirus')}
                className="bg-slate-950/60 p-3.5 rounded-xl border border-teal-800/60 hover:border-teal-500 cursor-pointer transition-colors"
              >
                <div className="text-xs text-teal-400 flex items-center justify-between">
                  <span>Antivirüs Lisansları</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="mt-1.5 text-xl font-bold text-white font-mono">{antiviruses.length} <span className="text-xs font-normal text-slate-400">Paket</span></div>
                <div className="text-[11px] text-teal-400/80 mt-0.5">{totalAntivirusUsers} Kullanıcı Koruması</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Notes, Address & Quick Actions */}
        <div className="space-y-4">
          {/* Notes Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Müşteri Notları & Sözleşme</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 whitespace-pre-line">
              {customer.notes || 'Herhangi bir not girilmemiş.'}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-slate-300">{customer.address || 'Adres belirtilmedi'}</span>
              </div>
            </div>
          </div>

          {/* Quick Add Menu */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hızlı Cihaz Ekle</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenAddModal('server')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-indigo-600/20 hover:text-indigo-300 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors text-left cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>+ Fiziki Sunucu</span>
              </button>
              <button
                onClick={() => onOpenAddModal('vm')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-purple-600/20 hover:text-purple-300 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors text-left cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>+ Sanal Makine</span>
              </button>
              <button
                onClick={() => onOpenAddModal('pc')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-emerald-600/20 hover:text-emerald-300 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors text-left cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+ Kullanıcı PC</span>
              </button>
              <button
                onClick={() => onOpenAddModal('firewall')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-rose-600/20 hover:text-rose-300 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors text-left cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>+ Firewall</span>
              </button>
              <button
                onClick={() => onOpenAddModal('antivirus')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-teal-600/20 hover:text-teal-300 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors text-left cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>+ Antivirüs</span>
              </button>
              <button
                onClick={() => onOpenAddModal('backup')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-amber-600/20 hover:text-amber-300 text-xs font-medium text-slate-300 border border-slate-700/60 transition-colors text-left cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>+ Yedekleme NAS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
