import React, { useState, useMemo } from 'react';
import {
  Wifi, Radio, Router, Plus, Search, Building2, MapPin, Key,
  ExternalLink, Copy, Check, Eye, EyeOff, Shield, Globe, Cpu,
  Edit, Trash2, Sliders, AlertCircle, Signal
} from 'lucide-react';

export default function WifiTab({
  controllers = [],
  accessPoints = [],
  networks = [],
  branches = [],
  onAddController,
  onEditController,
  onDeleteController,
  onAddAP,
  onEditAP,
  onDeleteAP,
  onAddNetwork,
  onEditNetwork,
  onDeleteNetwork
}) {
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Distinct branches from lines and devices
  const allBranchOptions = useMemo(() => {
    const set = new Set(['Merkez Ofis']);
    branches.forEach(b => { if (b) set.add(b); });
    controllers.forEach(c => { if (c.branch_name) set.add(c.branch_name); });
    accessPoints.forEach(a => { if (a.branch_name) set.add(a.branch_name); });
    networks.forEach(n => { if (n.branch_name && n.branch_name !== 'Tüm Şubeler') set.add(n.branch_name); });
    return Array.from(set);
  }, [branches, controllers, accessPoints, networks]);

  // Filtering Controllers
  const filteredControllers = useMemo(() => {
    return controllers.filter(c => {
      const matchBranch = selectedBranch === 'ALL' || (c.branch_name || 'Merkez Ofis') === selectedBranch;
      if (!matchBranch) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (c.controller_name || '').toLowerCase().includes(term) ||
        (c.management_ip || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.username || '').toLowerCase().includes(term) ||
        (c.branch_name || '').toLowerCase().includes(term)
      );
    });
  }, [controllers, selectedBranch, searchTerm]);

  // Filtering Networks (SSIDs)
  const filteredNetworks = useMemo(() => {
    return networks.filter(n => {
      const matchBranch = selectedBranch === 'ALL' ||
        n.branch_name === 'Tüm Şubeler' ||
        (n.branch_name || 'Merkez Ofis') === selectedBranch;
      if (!matchBranch) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (n.ssid || '').toLowerCase().includes(term) ||
        (n.vlan_id || '').toLowerCase().includes(term) ||
        (n.branch_name || '').toLowerCase().includes(term) ||
        (n.notes || '').toLowerCase().includes(term)
      );
    });
  }, [networks, selectedBranch, searchTerm]);

  // Filtering Access Points
  const filteredAPs = useMemo(() => {
    return accessPoints.filter(a => {
      const matchBranch = selectedBranch === 'ALL' || (a.branch_name || 'Merkez Ofis') === selectedBranch;
      if (!matchBranch) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (a.ap_name || '').toLowerCase().includes(term) ||
        (a.brand || '').toLowerCase().includes(term) ||
        (a.model || '').toLowerCase().includes(term) ||
        (a.ip_address || '').toLowerCase().includes(term) ||
        (a.mac_address || '').toLowerCase().includes(term) ||
        (a.location || '').toLowerCase().includes(term) ||
        (a.branch_name || '').toLowerCase().includes(term)
      );
    });
  }, [accessPoints, selectedBranch, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-600/20 text-sky-400 rounded-lg border border-sky-500/30">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Kablosuz Ağ & UniFi Yönetimi</h2>
              <p className="text-xs text-slate-400">
                Merkez ve şubelerdeki UniFi / Omada Kontrol Panelleri, Erişim Noktaları (AP) ve Wi-Fi SSID Yayınları
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddController}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kontrolcü Ekle</span>
          </button>

          <button
            onClick={onAddNetwork}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni SSID Ekle</span>
          </button>

          <button
            onClick={onAddAP}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni AP (Anten) Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Kontrolcü, AP adı, Model (U7, U6), IP, MAC veya SSID ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Branch Filter */}
        <div className="relative md:col-span-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-400 font-semibold shrink-0">Şube / Lokasyon:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-transparent text-xs text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">🏢 Tüm Şubeler & Merkez</option>
              {allBranchOptions.map(b => (
                <option key={b} value={b} className="bg-slate-900 text-white">📍 {b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <Router className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Kontrol Paneli</div>
            <div className="text-lg font-bold text-white">{filteredControllers.length}</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Aktif SSID Yayını</div>
            <div className="text-lg font-bold text-white">{filteredNetworks.length}</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Erişim Noktası (AP)</div>
            <div className="text-lg font-bold text-white">{filteredAPs.length} Cihaz</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SECTION: WI-FI CONTROLLER PANELS (UNIFI / OMADA) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Router className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Wi-Fi Kontrol Panelleri (UniFi Cloud Key, UDM & Portal)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
              {filteredControllers.length} Panel
            </span>
          </div>
          <button
            onClick={onAddController}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kontrolcü Ekle</span>
          </button>
        </div>

        {filteredControllers.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            Bu kapsamda kayıtlı Wi-Fi kontrol paneli bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredControllers.map(c => {
              const passKey = `ctrl-${c.id}`;
              const isPassVisible = visiblePasswords[passKey];

              return (
                <div
                  key={c.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{c.controller_name}</span>
                        {c.branch_name && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                            🏢 {c.branch_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="font-medium text-slate-300">{c.controller_type}</span>
                        {c.version && (
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                            {c.version}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditController(c)}
                        className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteController(c)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Credentials & Access Info */}
                  <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800/80 space-y-2 text-xs">
                    {/* Management IP / URL */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-400" /> Arayüz URL / IP:
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-sky-300 font-semibold truncate">
                        <span>{c.management_ip || 'Belirtilmedi'}</span>
                        {c.management_ip && (
                          <>
                            <button
                              onClick={() => copyToClipboard(c.management_ip, `ip-${c.id}`)}
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Kopyala"
                            >
                              {copiedKey === `ip-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {c.management_ip.startsWith('http') && (
                              <a
                                href={c.management_ip}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 hover:text-sky-200 p-0.5"
                                title="Yeni Sekmede Aç"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    {c.email && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">UniFi Mail:</span>
                        <div className="flex items-center gap-1.5 font-mono text-slate-200">
                          <span>{c.email}</span>
                          <button
                            onClick={() => copyToClipboard(c.email, `mail-${c.id}`)}
                            className="text-slate-400 hover:text-white p-0.5"
                            title="Kopyala"
                          >
                            {copiedKey === `mail-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Username & Password */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                        <span className="text-slate-500">Kullanıcı:</span>
                        <strong className="text-white">{c.username || 'admin'}</strong>
                        {c.username && (
                          <button
                            onClick={() => copyToClipboard(c.username, `user-${c.id}`)}
                            className="text-slate-400 hover:text-white p-0.5"
                            title="Kopyala"
                          >
                            {copiedKey === `user-${c.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                        <span className="text-slate-500">Parola:</span>
                        <strong className="text-amber-300">
                          {c.password ? (isPassVisible ? c.password : '••••••••') : '-'}
                        </strong>
                        {c.password && (
                          <>
                            <button
                              onClick={() => togglePasswordVisibility(passKey)}
                              className="text-slate-400 hover:text-white p-0.5"
                              title={isPassVisible ? 'Gizle' : 'Göster'}
                            >
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(c.password, `pass-${c.id}`)}
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Şifreyi Kopyala"
                            >
                              {copiedKey === `pass-${c.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {c.notes && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/40 rounded px-2.5 py-1 border border-slate-800/50">
                      💬 {c.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION: WI-FI NETWORKS (SSIDS & PASSWORDS) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Yayınlanan Wi-Fi Ağları (SSID & Parolaları)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
              {filteredNetworks.length} SSID
            </span>
          </div>
          <button
            onClick={onAddNetwork}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni SSID Ekle</span>
          </button>
        </div>

        {filteredNetworks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            Bu kapsamda kayıtlı Wi-Fi ağı (SSID) bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredNetworks.map(n => {
              const passKey = `net-${n.id}`;
              const isPassVisible = visiblePasswords[passKey];

              return (
                <div
                  key={n.id}
                  className={`border rounded-xl p-3.5 transition-all flex flex-col justify-between ${
                    n.is_guest
                      ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${n.is_guest ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'}`}>
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white tracking-wide">{n.ssid}</div>
                          <div className="text-[10px] font-medium text-slate-400">
                            {n.branch_name || 'Tüm Şubeler'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => onEditNetwork(n)}
                          className="p-1 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNetwork(n)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Password Box */}
                    <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between gap-2 font-mono text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-slate-400">Şifre:</span>
                        <strong className="text-amber-300 truncate">
                          {n.password ? (isPassVisible ? n.password : '••••••••••••') : 'Açık / Şifresiz'}
                        </strong>
                      </div>

                      {n.password && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => togglePasswordVisibility(passKey)}
                            className="text-slate-400 hover:text-white p-0.5"
                            title={isPassVisible ? 'Gizle' : 'Göster'}
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(n.password, `net-pass-${n.id}`)}
                            className="text-slate-400 hover:text-white p-0.5"
                            title="Şifreyi Kopyala"
                          >
                            {copiedKey === `net-pass-${n.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Badges: Security, VLAN, Band */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {n.is_guest ? (
                        <span className="px-2 py-0.5 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> Misafir İzolasyonu
                        </span>
                      ) : null}

                      {n.vlan_id && (
                        <span className="px-2 py-0.5 rounded font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {n.vlan_id}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded font-medium bg-slate-900 text-slate-300 border border-slate-800">
                        {n.band || '2.4G & 5G'}
                      </span>

                      <span className="px-2 py-0.5 rounded font-mono text-[9px] text-slate-400 bg-slate-900 border border-slate-800">
                        {n.security_type || 'WPA2/WPA3'}
                      </span>
                    </div>

                    {n.notes && (
                      <p className="text-[11px] text-slate-400 pt-1 italic line-clamp-2">
                        {n.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTION: ACCESS POINTS (AP CİHAZLARI / ANTENLER) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Wi-Fi Cihazları & Erişim Noktaları (Access Points / AP)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              {filteredAPs.length} Cihaz
            </span>
          </div>
          <button
            onClick={onAddAP}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni AP Ekle</span>
          </button>
        </div>

        {filteredAPs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            Bu kapsamda kayıtlı Wi-Fi erişim noktası (AP) bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Cihaz (AP) Adı & Şube</th>
                  <th className="p-3">Marka & Model</th>
                  <th className="p-3">Bulunduğu Konum / Yer</th>
                  <th className="p-3">Ağ (IP & MAC)</th>
                  <th className="p-3">Kontrolcü</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filteredAPs.map(ap => (
                  <tr key={ap.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{ap.ap_name}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-medium flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>{ap.branch_name || 'Merkez Ofis'}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{ap.brand}</div>
                      <div className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-sky-300 border border-slate-700">
                        {ap.model || 'Belirtilmedi'}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{ap.location || '-'}</span>
                      </div>
                      {ap.notes && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {ap.notes}
                        </div>
                      )}
                    </td>

                    <td className="p-3 font-mono text-[11px]">
                      <div className="font-semibold text-emerald-300 flex items-center gap-1">
                        <span>{ap.ip_address || '-'}</span>
                        {ap.ip_address && (
                          <button
                            onClick={() => copyToClipboard(ap.ip_address, `ap-ip-${ap.id}`)}
                            className="text-slate-500 hover:text-white"
                            title="Kopyala"
                          >
                            {copiedKey === `ap-ip-${ap.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{ap.mac_address || '-'}</div>
                    </td>

                    <td className="p-3 text-[11px] text-slate-300">
                      {ap.controller_name ? (
                        <span className="font-medium text-sky-300">🔗 {ap.controller_name}</span>
                      ) : (
                        <span className="text-slate-500 italic">Bağımsız AP</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ap.status === 'Aktif'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : ap.status === 'Arızalı'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {ap.status || 'Aktif'}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditAP(ap)}
                          className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteAP(ap)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
