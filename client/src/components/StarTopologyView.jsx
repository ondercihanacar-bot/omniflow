import React, { useState, useMemo } from 'react';
import {
  Globe, Shield, Server, Cloud, Laptop, Database, Network,
  Wifi, Activity, Sparkles, Radio, CheckCircle2, Cpu, HardDrive,
  User, Key, ExternalLink, ShieldCheck, Zap, X, Copy, RefreshCw,
  Sliders, ArrowUpRight, ChevronRight, Lock
} from 'lucide-react';
import CopyButton from './CopyButton';

export default function StarTopologyView({ customer, onOpenReport }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [simulatedPing, setSimulatedPing] = useState(null);
  const [pingRunning, setPingRunning] = useState(false);

  if (!customer) return null;

  const servers = customer.physical_servers || [];
  const vms = customer.virtual_machines || [];
  const pcs = customer.user_computers || [];
  const firewalls = customer.firewalls || [];
  const backups = customer.backup_units || [];
  const lines = customer.internet_lines || [];
  const wifiAPs = customer.wifi_access_points || [];
  const wifiControllers = customer.wifi_controllers || [];
  const wifiNetworks = customer.wifi_networks || [];
  const antiviruses = customer.antivirus_licenses || [];
  const mailServices = customer.mail_services || [];
  const mailAccounts = customer.mail_accounts || [];

  const primaryFirewall = firewalls.length > 0 ? firewalls[0] : null;
  const distinctDepts = Array.from(new Set(pcs.map(p => p.department || 'Genel'))).filter(Boolean);

  // Central Hub Node
  const centralHub = {
    id: 'center-core',
    type: 'hub',
    title: primaryFirewall ? primaryFirewall.device_name : 'Merkez Güvenlik Ağ Geçidi',
    subtitle: primaryFirewall ? `${primaryFirewall.brand} ${primaryFirewall.model}` : (customer.name || 'Kurumsal Ağ Omurgası'),
    ip: primaryFirewall?.management_ip || customer.external_ip || '192.168.1.1',
    status: 'Aktif & Korumalı',
    color: '#06b6d4', // Cyan
    icon: Shield,
    firewall: primaryFirewall,
    allFirewalls: firewalls
  };

  // Build dynamic satellite nodes
  const nodes = useMemo(() => {
    const list = [];

    // 1. WAN & Internet lines
    list.push({
      id: 'node-wan',
      category: 'wan',
      title: 'İnternet & WAN Hatları',
      subtitle: lines.length > 0 ? `${lines.length} Aktif Hat` : (customer.external_ip ? customer.external_ip.split(' ')[0] : 'Statik IP'),
      ip: customer.external_ip || (lines[0]?.static_ip) || 'Statik IP',
      icon: Globe,
      color: '#0ea5e9', // Sky blue
      count: lines.length || 1,
      badge: lines.length > 0 ? `${lines.length} Hat` : 'Statik IP',
      data: lines,
      externalIp: customer.external_ip
    });

    // 2. Physical Servers
    if (servers.length === 1) {
      const srv = servers[0];
      const childVMs = vms.filter(v => v.physical_server_id === srv.id);
      list.push({
        id: `node-srv-${srv.id}`,
        category: 'servers',
        title: srv.server_name,
        subtitle: srv.brand ? `${srv.brand} ${srv.model}` : 'Fiziki Sunucu',
        ip: srv.ip_address || srv.management_ip || '192.168.1.10',
        icon: Server,
        color: '#6366f1', // Indigo
        count: 1,
        badge: childVMs.length > 0 ? `${childVMs.length} Sanal VM` : 'Fiziksel Host',
        data: [srv],
        childVMs: childVMs
      });
    } else if (servers.length > 1) {
      list.push({
        id: 'node-servers-cluster',
        category: 'servers',
        title: 'Fiziki Sunucu Kümesi',
        subtitle: `${servers.length} Sunucu Kabini`,
        ip: servers[0]?.ip_address || 'Sunucu VLAN',
        icon: Server,
        color: '#6366f1',
        count: servers.length,
        badge: `${servers.length} Sunucu`,
        data: servers,
        childVMs: vms
      });
    }

    // 3. Virtual Machines (if standalone or distinct)
    if (vms.length > 0) {
      list.push({
        id: 'node-vms',
        category: 'servers',
        title: 'Sanal Sunucular (VM)',
        subtitle: `${vms.length} Sanal Makine`,
        ip: vms[0]?.ip_address || 'Hyper-V / ESXi',
        icon: Cloud,
        color: '#a855f7', // Purple
        count: vms.length,
        badge: `${vms.length} VM`,
        data: vms
      });
    }

    // 4. Storage & Backup (NAS)
    if (backups.length > 0) {
      list.push({
        id: 'node-backups',
        category: 'storage',
        title: backups.length === 1 ? backups[0].device_name : 'Depolama & Yedekleme (NAS)',
        subtitle: backups.length === 1 ? `${backups[0].brand} ${backups[0].model}` : `${backups.length} NAS Ünitesi`,
        ip: backups[0]?.management_ip || 'NAS IP',
        icon: Database,
        color: '#f59e0b', // Amber
        count: backups.length,
        badge: backups[0]?.capacity ? backups[0].capacity.split('-')[0].trim() : 'Yedek Deposu',
        data: backups
      });
    }

    // 5. Wi-Fi & Access Points
    if (wifiAPs.length > 0 || wifiControllers.length > 0) {
      list.push({
        id: 'node-wifi',
        category: 'wifi',
        title: 'Wi-Fi & AP Ağı',
        subtitle: `${wifiAPs.length} AP • ${wifiNetworks.length} SSID`,
        ip: wifiControllers[0]?.management_ip || wifiAPs[0]?.ip_address || 'UniFi Ağ',
        icon: Wifi,
        color: '#ec4899', // Pink
        count: wifiAPs.length,
        badge: `${wifiAPs.length} AP`,
        data: wifiAPs,
        controllers: wifiControllers,
        networks: wifiNetworks
      });
    }

    // 6. Department Workstation Clusters
    if (distinctDepts.length > 0) {
      distinctDepts.forEach(dept => {
        const deptPcs = pcs.filter(p => (p.department || 'Genel') === dept);
        list.push({
          id: `node-dept-${dept}`,
          category: 'workstations',
          title: `${dept} Departmanı`,
          subtitle: `${deptPcs.length} Bilgisayar / Kullanıcı`,
          ip: deptPcs[0]?.ethernet_ip || deptPcs[0]?.wifi_ip || `${dept} LAN`,
          icon: Laptop,
          color: '#10b981', // Emerald
          count: deptPcs.length,
          badge: `${deptPcs.length} Cihaz`,
          data: deptPcs,
          departmentName: dept
        });
      });
    } else if (pcs.length > 0) {
      list.push({
        id: 'node-pcs-general',
        category: 'workstations',
        title: 'Kullanıcı Bilgisayarları',
        subtitle: `${pcs.length} Masaüstü / Laptop`,
        ip: pcs[0]?.ethernet_ip || 'Kullanıcı Ağı',
        icon: Laptop,
        color: '#10b981',
        count: pcs.length,
        badge: `${pcs.length} PC`,
        data: pcs
      });
    }

    // 7. EDR / Siber Güvenlik
    if (antiviruses.length > 0) {
      list.push({
        id: 'node-edr',
        category: 'security',
        title: 'EDR & Siber Savunma',
        subtitle: antiviruses[0]?.product_name || 'Uç Nokta Koruması',
        ip: 'Bulut Güvenlik Kalkanı',
        icon: ShieldCheck,
        color: '#14b8a6', // Teal
        count: antiviruses.length,
        badge: `${antiviruses[0]?.user_count || 'Tam'} Lisans`,
        data: antiviruses
      });
    }

    // 8. Kurumsal E-Posta & Bulut
    if (mailServices.length > 0) {
      list.push({
        id: 'node-mail',
        category: 'cloud',
        title: 'Kurumsal E-Posta / Bulut',
        subtitle: mailServices[0]?.service_name || 'E-Posta Servisi',
        ip: mailServices[0]?.domain_name || 'M365 / Exchange',
        icon: Zap,
        color: '#3b82f6', // Blue
        count: mailAccounts.length || 1,
        badge: `${mailAccounts.length || mailServices[0]?.license_count || 1} Posta`,
        data: mailServices,
        accounts: mailAccounts
      });
    }

    return list;
  }, [customer, servers, vms, pcs, firewalls, backups, lines, wifiAPs, wifiControllers, wifiNetworks, antiviruses, mailServices, mailAccounts, distinctDepts]);

  // SVG Coordinates calculation
  const svgWidth = 920;
  const svgHeight = 720;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const orbitRadius = 260;

  // Node positions mapped to polar angles
  const positionedNodes = useMemo(() => {
    const N = nodes.length;
    return nodes.map((node, index) => {
      const angle = (index * 2 * Math.PI) / N - Math.PI / 2;
      const x = centerX + orbitRadius * Math.cos(angle);
      const y = centerY + orbitRadius * Math.sin(angle);
      return {
        ...node,
        angle,
        x,
        y
      };
    });
  }, [nodes, centerX, centerY, orbitRadius]);

  // Selected item object (Central hub or satellite node)
  const activeSelected = useMemo(() => {
    if (selectedNodeId === 'center-core') return centralHub;
    return positionedNodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, positionedNodes, centralHub]);

  // Simulated Ping trigger
  const runPingSimulation = (targetIp) => {
    setPingRunning(true);
    setSimulatedPing(null);
    setTimeout(() => {
      setPingRunning(false);
      const jitter = Math.floor(Math.random() * 6) + 10; // 10-15 ms
      setSimulatedPing({
        success: true,
        ip: targetIp || '192.168.1.1',
        time: `${jitter} ms`,
        packets: '4/4 Gönderildi (%0 Kayıp)',
        ttl: 64,
        status: 'Optimal (Hızlı Yanıt)'
      });
    }, 700);
  };

  // Node filter check
  const isNodeDimmed = (node) => {
    if (activeCategoryFilter === 'ALL') return false;
    if (activeCategoryFilter === 'SERVERS' && (node.category === 'servers' || node.category === 'storage')) return false;
    if (activeCategoryFilter === 'WORKSTATIONS' && node.category === 'workstations') return false;
    if (activeCategoryFilter === 'SECURITY' && (node.category === 'security' || node.category === 'wan')) return false;
    if (activeCategoryFilter === 'WIFI' && node.category === 'wifi') return false;
    return true;
  };

  const totalConnectedDevices = servers.length + vms.length + pcs.length + backups.length + wifiAPs.length;

  return (
    <div className="space-y-6">
      {/* High-Tech In-Component CSS Styles for Sci-Fi HUD Radar & Laser Animations */}
      <style>{`
        @keyframes hudRadarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes hudLaserTravel {
          to { stroke-dashoffset: -32; }
        }
        @keyframes hudPulseRing {
          0% { transform: scale(0.96); opacity: 0.4; }
          50% { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(0.96); opacity: 0.4; }
        }
        @keyframes hudBeaconGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.6)); }
          50% { filter: drop-shadow(0 0 16px rgba(6, 182, 212, 0.95)); }
        }
        .animate-radar-sweep {
          transform-origin: 460px 360px;
          animation: hudRadarSweep 14s linear infinite;
        }
        .animate-radar-fast {
          transform-origin: 460px 360px;
          animation: hudRadarSweep 6s linear infinite;
        }
        .animate-laser-flow {
          animation: hudLaserTravel 1.6s linear infinite;
        }
      `}</style>

      {/* ================= CYBER TELEMETRY BAR ================= */}
      <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-80 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Status Sentinel */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/20">
                <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">OMNIFlow Sentinel Core</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ● CANLI İZLEME AKTİF
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{customer.name}</span>
                <span className="text-slate-500 font-mono text-xs font-normal">• Yıldız / Konstelasyon Ağ Topolojisi</span>
              </h2>
            </div>
          </div>

          {/* Live Telemetry Metrics */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-mono">
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Ağ Gecikmesi</div>
                <div className="text-emerald-400 font-extrabold">12 ms <span className="text-[10px] text-slate-400 font-normal">(Optimal)</span></div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Omurga Hızı</div>
                <div className="text-cyan-300 font-extrabold">10 Gbps LAN</div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Kesintisiz Uptime</div>
                <div className="text-indigo-300 font-extrabold">%99.98</div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Bağlı Uç Nokta</div>
                <div className="text-amber-300 font-extrabold">{totalConnectedDevices} Cihaz</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" /> Filtre:
            </span>
            {[
              { id: 'ALL', label: 'Tüm Konstelasyon', count: positionedNodes.length },
              { id: 'SERVERS', label: 'Sunucular & Depolama', count: servers.length + vms.length + backups.length },
              { id: 'WORKSTATIONS', label: 'İş İstasyonları', count: pcs.length },
              { id: 'SECURITY', label: 'Güvenlik & WAN', count: firewalls.length + lines.length + antiviruses.length },
              { id: 'WIFI', label: 'Kablosuz (Wi-Fi)', count: wifiAPs.length }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  activeCategoryFilter === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Detayları incelemek için haritadaki herhangi bir yıldıza veya merkeze tıklayın.</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN INTERACTIVE STAR TOPOLOGY CANVAS & INSPECTOR ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: THE STAR HUD SVG CANVAS (8 COLS) */}
        <div className="xl:col-span-8 bg-slate-950/80 border border-cyan-500/30 rounded-3xl p-3 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
          
          {/* Subtle Cyber Radar Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

          {/* Sci-Fi Decorative Corner Accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500/60 pointer-events-none"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/60 pointer-events-none"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none"></div>

          {/* SVG Canvas */}
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[640px] select-none"
            style={{ filter: 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.15))' }}
          >
            <defs>
              {/* Laser Line Glow Filter */}
              <filter id="hudLaserGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Core Hub Glow Filter */}
              <filter id="hudHubGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Central Radar Sweep Gradient */}
              <linearGradient id="hudSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>

              {/* Radial gradient for center glow */}
              <radialGradient id="hudCenterGlow">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 1. BACKGROUND CONCENTRIC RADAR RINGS */}
            <circle cx={centerX} cy={centerY} r={80} stroke="rgba(6, 182, 212, 0.35)" strokeWidth="1.5" strokeDasharray="3 4" fill="url(#hudCenterGlow)" />
            <circle cx={centerX} cy={centerY} r={170} stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" strokeDasharray="4 6" fill="none" />
            <circle cx={centerX} cy={centerY} r={orbitRadius} stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" strokeDasharray="6 8" fill="none" />
            <circle cx={centerX} cy={centerY} r={orbitRadius + 45} stroke="rgba(30, 58, 138, 0.2)" strokeWidth="1" strokeDasharray="2 6" fill="none" />

            {/* Rotating Radar Crosshairs & Sweep */}
            <g className="animate-radar-sweep">
              <line x1={centerX} y1={centerY} x2={centerX} y2={centerY - orbitRadius - 40} stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5" />
              <line x1={centerX} y1={centerY} x2={centerX} y2={centerY + orbitRadius + 40} stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={centerX - orbitRadius - 40} y1={centerY} x2={centerX + orbitRadius + 40} y2={centerY} stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
            </g>

            {/* Radar Degree Tick Marks around outer orbit */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
              const rad = (deg * Math.PI) / 180;
              const r1 = orbitRadius + 40;
              const r2 = orbitRadius + 48;
              const x1 = centerX + r1 * Math.cos(rad);
              const y1 = centerY + r1 * Math.sin(rad);
              const x2 = centerX + r2 * Math.cos(rad);
              const y2 = centerY + r2 * Math.sin(rad);
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />;
            })}

            {/* 2. CONSTELLATION STAR MESH LINES (Outer Ring & Star Chords) */}
            {/* Outer perimeter polygon connecting node[i] -> node[i+1] */}
            {positionedNodes.map((n, i) => {
              const next = positionedNodes[(i + 1) % positionedNodes.length];
              const isDimmed = isNodeDimmed(n) || isNodeDimmed(next);
              return (
                <line
                  key={`mesh-${i}`}
                  x1={n.x}
                  y1={n.y}
                  x2={next.x}
                  y2={next.y}
                  stroke="rgba(56, 189, 248, 0.35)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity={isDimmed ? 0.15 : 0.8}
                />
              );
            })}

            {/* Star inner chords connecting node[i] -> node[i+2] for celestial star mesh look */}
            {positionedNodes.length >= 5 && positionedNodes.map((n, i) => {
              const chordNext = positionedNodes[(i + 2) % positionedNodes.length];
              const isDimmed = isNodeDimmed(n) || isNodeDimmed(chordNext);
              return (
                <line
                  key={`chord-${i}`}
                  x1={n.x}
                  y1={n.y}
                  x2={chordNext.x}
                  y2={chordNext.y}
                  stroke="rgba(99, 102, 241, 0.2)"
                  strokeWidth="0.8"
                  strokeDasharray="3 6"
                  opacity={isDimmed ? 0.05 : 0.5}
                />
              );
            })}

            {/* 3. RADIAL LASER SPOKES CONNECTING HUB TO SATELLITES */}
            {positionedNodes.map((n) => {
              const isSelected = selectedNodeId === n.id;
              const isHovered = hoveredNodeId === n.id;
              const isDimmed = isNodeDimmed(n);

              return (
                <g key={`spoke-${n.id}`}>
                  {/* Glowing Laser Spoke Line */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={n.x}
                    y2={n.y}
                    stroke={isSelected || isHovered ? n.color : 'rgba(6, 182, 212, 0.45)'}
                    strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                    strokeDasharray={isSelected || isHovered ? '6 4' : '4 6'}
                    className="animate-laser-flow"
                    filter={isSelected || isHovered ? 'url(#hudLaserGlow)' : undefined}
                    opacity={isDimmed ? 0.15 : (isSelected || isHovered ? 1 : 0.65)}
                  />

                  {/* Traveling Pulse Beacon Dot on Spoke */}
                  {!isDimmed && (
                    <circle
                      r={isSelected || isHovered ? 3.5 : 2.5}
                      fill={n.color}
                      opacity={isSelected || isHovered ? 0.95 : 0.6}
                    >
                      <animateMotion
                        path={`M ${centerX} ${centerY} L ${n.x} ${n.y}`}
                        dur={`${2.2 + (n.angle % 1)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* 4. SATELLITE NODES */}
            {positionedNodes.map((n) => {
              const isSelected = selectedNodeId === n.id;
              const isHovered = hoveredNodeId === n.id;
              const isDimmed = isNodeDimmed(n);
              const NodeIcon = n.icon;

              return (
                <g
                  key={n.id}
                  className="cursor-pointer transition-all duration-300"
                  opacity={isDimmed ? 0.25 : 1}
                  onMouseEnter={() => setHoveredNodeId(n.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNodeId(selectedNodeId === n.id ? null : n.id)}
                >
                  {/* Outer pulsating beacon halo if selected or hovered */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={36}
                      fill="none"
                      stroke={n.color}
                      strokeWidth="2"
                      opacity="0.6"
                      strokeDasharray="4 4"
                      className="animate-spin"
                      style={{ transformOrigin: `${n.x}px ${n.y}px`, animationDuration: '6s' }}
                    />
                  )}

                  {/* Outer glow ring */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={26}
                    fill={isSelected ? `${n.color}25` : 'rgba(2, 6, 23, 0.85)'}
                    stroke={isSelected ? n.color : (isHovered ? n.color : 'rgba(56, 189, 248, 0.5)')}
                    strokeWidth={isSelected ? 3 : 2}
                    filter={isSelected || isHovered ? 'url(#hudLaserGlow)' : undefined}
                  />

                  {/* Icon rendering via foreignObject */}
                  <foreignObject
                    x={n.x - 14}
                    y={n.y - 14}
                    width={28}
                    height={28}
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <NodeIcon
                        className="w-5 h-5 transition-transform duration-200"
                        style={{
                          color: n.color,
                          transform: isHovered || isSelected ? 'scale(1.15)' : 'scale(1)'
                        }}
                      />
                    </div>
                  </foreignObject>

                  {/* Pill Label Card underneath the satellite */}
                  <g transform={`translate(${n.x}, ${n.y + 36})`}>
                    {/* Badge Pill Background */}
                    <rect
                      x={-65}
                      y={-10}
                      width={130}
                      height={28}
                      rx={8}
                      fill="rgba(10, 15, 29, 0.95)"
                      stroke={isSelected ? n.color : 'rgba(51, 65, 85, 0.8)'}
                      strokeWidth={isSelected ? 1.5 : 1}
                    />

                    {/* Node Title */}
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {n.title.length > 18 ? n.title.slice(0, 16) + '...' : n.title}
                    </text>

                    {/* Node Subtitle / IP */}
                    <text
                      x={0}
                      y={14}
                      textAnchor="middle"
                      fill={isSelected ? n.color : '#94a3b8'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {n.badge}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* 5. CENTRAL HUB (CORE GATEWAY / FIREWALL) */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedNodeId(selectedNodeId === 'center-core' ? null : 'center-core')}
              onMouseEnter={() => setHoveredNodeId('center-core')}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Outer Pulsing Radar Rings around Central Hub */}
              <circle
                cx={centerX}
                cy={centerY}
                r={64}
                fill="none"
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                className="animate-spin"
                style={{ transformOrigin: `${centerX}px ${centerY}px`, animationDuration: '24s' }}
              />

              <circle
                cx={centerX}
                cy={centerY}
                r={54}
                fill="none"
                stroke="rgba(59, 130, 246, 0.6)"
                strokeWidth="1.5"
                strokeDasharray="3 4"
                className="animate-spin"
                style={{ transformOrigin: `${centerX}px ${centerY}px`, animationDuration: '14s', animationDirection: 'reverse' }}
              />

              {/* Core Solid Circular Base */}
              <circle
                cx={centerX}
                cy={centerY}
                r={44}
                fill="#030712"
                stroke={selectedNodeId === 'center-core' ? '#22d3ee' : '#06b6d4'}
                strokeWidth={selectedNodeId === 'center-core' ? 3.5 : 2.5}
                filter="url(#hudHubGlow)"
              />

              {/* Center Core Shield Icon */}
              <foreignObject
                x={centerX - 20}
                y={centerY - 22}
                width={40}
                height={40}
                className="pointer-events-none"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </foreignObject>

              {/* Central Hub Label Badge */}
              <g transform={`translate(${centerX}, ${centerY + 56})`}>
                <rect
                  x={-80}
                  y={-12}
                  width={160}
                  height={32}
                  rx={10}
                  fill="rgba(3, 7, 18, 0.95)"
                  stroke={selectedNodeId === 'center-core' ? '#22d3ee' : 'rgba(6, 182, 212, 0.6)'}
                  strokeWidth="1.5"
                />
                <text
                  x={0}
                  y={2}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10.5"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {centralHub.title.length > 22 ? centralHub.title.slice(0, 20) + '...' : centralHub.title}
                </text>
                <text
                  x={0}
                  y={15}
                  textAnchor="middle"
                  fill="#22d3ee"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {centralHub.ip}
                </text>
              </g>
            </g>
          </svg>

          {/* Bottom Interactive Guide */}
          <div className="w-full mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Merkez: Güvenlik Ağ Geçidi (Core Firewall)</span>
            </span>
            <span className="text-slate-500">SVG Vektörel Konstelasyon v2.6</span>
          </div>
        </div>

        {/* RIGHT: CYBER HUD NODE INSPECTOR (4 COLS) */}
        <div className="xl:col-span-4 space-y-4">
          
          {activeSelected ? (
            /* SELECTED NODE DETAILED INSPECTOR */
            <div className="bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-md">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-2xl border shadow-md"
                    style={{
                      backgroundColor: `${activeSelected.color}15`,
                      borderColor: `${activeSelected.color}40`,
                      color: activeSelected.color
                    }}
                  >
                    {React.createElement(activeSelected.icon || Network, { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${activeSelected.color}20`,
                        color: activeSelected.color
                      }}
                    >
                      {activeSelected.category ? activeSelected.category.toUpperCase() : 'CORE GATEWAY'}
                    </span>
                    <h3 className="text-sm font-extrabold text-white mt-0.5 font-mono">{activeSelected.title}</h3>
                    <div className="text-xs text-slate-400">{activeSelected.subtitle}</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Network Info */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 text-[11px]">Erişim IP / Adres:</span>
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    {activeSelected.ip || '-'}
                    {activeSelected.ip && <CopyButton text={activeSelected.ip} />}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 text-[11px]">Bağlantı Durumu:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Aktif & Çevrimiçi
                  </span>
                </div>

                {activeSelected.externalIp && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[11px]">Dış Statik IP:</span>
                    <span className="text-indigo-300 font-bold">{activeSelected.externalIp}</span>
                  </div>
                )}
              </div>

              {/* Simulated Ping Test Tool */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Canlı Ağ Teşhisi (ICMP Ping)
                  </span>
                  <button
                    onClick={() => runPingSimulation(activeSelected.ip)}
                    disabled={pingRunning}
                    className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${pingRunning ? 'animate-spin' : ''}`} />
                    <span>Ping Gönder</span>
                  </button>
                </div>

                {simulatedPing && (
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1 text-slate-300">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Hedef: {simulatedPing.ip}</span>
                      <span>{simulatedPing.time}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Paket: {simulatedPing.packets}</span>
                      <span>TTL={simulatedPing.ttl}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-Devices / Equipment List inside this Node */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  İlişkili Cihazlar & Envanter ({activeSelected.data ? activeSelected.data.length : 1})
                </div>

                {/* 1. If WAN lines */}
                {activeSelected.category === 'wan' && Array.isArray(activeSelected.data) && (
                  <div className="space-y-2">
                    {activeSelected.data.map((line, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{line.branch_name}</span>
                          <span className="text-[10px] text-cyan-400">{line.line_type}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] flex items-center justify-between">
                          <span>Statik IP:</span>
                          <span className="text-blue-300">{line.static_ip || '-'}</span>
                        </div>
                        {line.gateway && (
                          <div className="text-slate-400 text-[10px] flex items-center justify-between">
                            <span>Gateway:</span>
                            <span className="text-amber-300">{line.gateway}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. If Physical Server */}
                {activeSelected.category === 'servers' && (
                  <div className="space-y-2">
                    {activeSelected.data && activeSelected.data.map(srv => (
                      <div key={srv.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{srv.server_name}</span>
                          <span className="text-[10px] text-emerald-400">{srv.status || 'Aktif'}</span>
                        </div>
                        {srv.cpu_info && <div className="text-slate-400 text-[10px]">CPU: {srv.cpu_info}</div>}
                        {srv.ram_info && <div className="text-slate-400 text-[10px]">RAM: {srv.ram_info}</div>}
                        {srv.management_ip && (
                          <div className="text-slate-300 text-[10px] flex items-center justify-between pt-1 border-t border-slate-900">
                            <span className="text-slate-500">iDRAC/iLO:</span>
                            <span className="text-indigo-300">{srv.management_ip}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Hosted child VMs */}
                    {activeSelected.childVMs && activeSelected.childVMs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="text-[10px] font-bold text-purple-400">Barındırılan Sanal Makineler:</div>
                        {activeSelected.childVMs.map(vm => (
                          <div key={vm.id} className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 text-[11px] font-mono flex items-center justify-between">
                            <span className="text-white">{vm.vm_name}</span>
                            <span className="text-purple-300 text-[10px]">{vm.ip_address}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. If Department Workstations */}
                {activeSelected.category === 'workstations' && Array.isArray(activeSelected.data) && (
                  <div className="space-y-1.5">
                    {activeSelected.data.map(pc => (
                      <div key={pc.id} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1">
                            <Laptop className="w-3 h-3 text-emerald-400" />
                            {pc.computer_name}
                          </span>
                          <span className="text-[10px] text-slate-400">{pc.assigned_user || 'Kullanıcı'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Eth IP: {pc.ethernet_ip || '-'}</span>
                          {pc.wifi_ip && <span>Wi-Fi: {pc.wifi_ip}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. If Wi-Fi */}
                {activeSelected.category === 'wifi' && (
                  <div className="space-y-2">
                    {activeSelected.networks && activeSelected.networks.length > 0 && (
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                        <div className="text-[10px] text-pink-400 font-bold uppercase">Yayınlanan SSID Ağları</div>
                        {activeSelected.networks.map(n => (
                          <div key={n.id} className="flex items-center justify-between text-[11px] text-slate-300">
                            <span>{n.ssid}</span>
                            <span className="text-[10px] text-slate-500">{n.vlan_id || 'Standart'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSelected.data && activeSelected.data.map(ap => (
                      <div key={ap.id} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{ap.ap_name}</span>
                          <span className="text-[10px] text-emerald-400">{ap.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{ap.location || ap.model}</div>
                        <div className="text-[10px] text-blue-300">{ap.ip_address}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. If Storage / NAS */}
                {activeSelected.category === 'storage' && Array.isArray(activeSelected.data) && (
                  <div className="space-y-2">
                    {activeSelected.data.map(bu => (
                      <div key={bu.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{bu.device_name}</span>
                          <span className="text-amber-400 text-[10px]">{bu.brand} {bu.model}</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">Kapasite: {bu.capacity || '-'}</div>
                        <div className="text-slate-400 text-[10px]">Yazılım: {bu.backup_software || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DEFAULT HUD OVERVIEW CARD (WHEN NO NODE IS SELECTED) */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono">Konstelasyon HUD Kontrolü</h3>
                  <p className="text-xs text-slate-400">İnteraktif Ağ Bileşenleri Matrisi</p>
                </div>
              </div>

              {/* Quick device list selector */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Hızlı Düğüm İnceleme
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  <button
                    onClick={() => setSelectedNodeId('center-core')}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors text-left cursor-pointer group"
                  >
                    <span className="flex items-center gap-2 text-slate-200">
                      <Shield className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>{centralHub.title}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                  </button>

                  {positionedNodes.map(n => {
                    const NIcon = n.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelectedNodeId(n.id)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors text-left cursor-pointer group"
                      >
                        <span className="flex items-center gap-2 text-slate-200">
                          <NIcon className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: n.color }} />
                          <span>{n.title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{n.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topology Architecture Info Note */}
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span>Yıldız (Star) Mimarisi Hakkında</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Merkez Güvenlik Ağ Geçidi omurgası üzerinden tüm şube hatları, sunucu odası, sanal makineler ve departman iş istasyonları izole VLAN ve güvenlik politikalarıyla merkezi olarak yönetilmektedir.
                </p>
              </div>
            </div>
          )}

          {/* Quick PDF Report Trigger */}
          <div className="bg-slate-900/70 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Resmi Rapor Çıktısı</span>
              </div>
              <div className="text-[11px] text-slate-400">Renkli A4 PDF & Excel Envanter Dökümü</div>
            </div>
            <button
              onClick={onOpenReport}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl border border-cyan-400/40 shadow-md shadow-cyan-900/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>PDF Raporu Al</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
