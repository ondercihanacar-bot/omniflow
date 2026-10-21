import React, { useState } from 'react';
import {
  Building2, Server, Cloud, Laptop, Shield, Database,
  Plus, Search, ArrowLeft, Terminal, Cpu, CheckCircle2,
  Activity, Sparkles
} from 'lucide-react';
import SeamlessVideo from './SeamlessVideo';
import { useLanguage } from '../context/LanguageContext';

export default function HomeHeroScreen({
  customers = [],
  stats = null,
  onSelectCustomer,
  onAddCustomer,
  onOpenSearch
}) {
  const { t, language } = useLanguage();
  const [videoError, setVideoError] = useState(false);

  const totalCustomers = stats?.customers ?? customers.length;
  const totalServers = stats?.servers ?? 0;
  const totalVMs = stats?.vms ?? 0;
  const totalPCs = stats?.pcs ?? 0;
  const totalFirewalls = stats?.firewalls ?? 0;
  const totalBackups = stats?.backups ?? 0;

  const statCards = [
    {
      label: language === 'tr' ? 'Müşteri' : 'Customers',
      value: totalCustomers,
      icon: Building2,
      color: 'from-blue-600/20 to-cyan-600/20 text-blue-400 border-blue-500/30'
    },
    {
      label: language === 'tr' ? 'Fiziki Sunucu' : 'Servers',
      value: totalServers,
      icon: Server,
      color: 'from-indigo-600/20 to-blue-600/20 text-indigo-400 border-indigo-500/30'
    },
    {
      label: language === 'tr' ? 'Sanal Makine' : 'VMs',
      value: totalVMs,
      icon: Cloud,
      color: 'from-purple-600/20 to-pink-600/20 text-purple-400 border-purple-500/30'
    },
    {
      label: language === 'tr' ? 'Kullanıcı PC' : 'Computers',
      value: totalPCs,
      icon: Laptop,
      color: 'from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30'
    },
    {
      label: language === 'tr' ? 'Güvenlik & FW' : 'Firewall',
      value: totalFirewalls,
      icon: Shield,
      color: 'from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/30'
    },
    {
      label: language === 'tr' ? 'Yedekleme & NAS' : 'Backup & NAS',
      value: totalBackups,
      icon: Database,
      color: 'from-cyan-600/20 to-blue-600/20 text-cyan-400 border-cyan-500/30'
    }
  ];

  return (
    <div className="w-full h-full max-h-full flex-1 flex flex-col justify-between items-center p-2.5 sm:p-3.5 lg:p-4 bg-slate-950 relative overflow-hidden select-none">
      {/* Ambient background glow behind the entire screen */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-blue-600/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-6 right-8 w-[450px] h-[350px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar / Status Badge */}
      <div className="shrink-0 z-10 pt-0.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-medium text-slate-300 shadow-md backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 tracking-wide uppercase text-[10px]">OMNIFlow v2.4</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-[11px]">
            {language === 'tr' ? 'Merkezi Altyapı & Bilişim Platformu' : 'Central IT Infrastructure Platform'}
          </span>
        </div>
      </div>

      {/* Center Hero Area - Automatically fills all remaining vertical space without overflowing */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative overflow-hidden my-0 sm:my-1 z-10">
        <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
          {/* Subtle radiating ambient light behind the infinity logo */}
          <div className="absolute w-[65%] h-[65%] bg-blue-600/15 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-[70px] pointer-events-none" />

          {!videoError ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent">
              <SeamlessVideo
                src="/logo.mp4"
                fadeDuration={0.8}
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain object-center scale-110 sm:scale-115 lg:scale-120 transition-transform duration-700"
                containerClassName="relative w-full h-full flex items-center justify-center bg-transparent"
                style={{
                  imageRendering: '-webkit-optimize-contrast',
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                  mixBlendMode: 'screen'
                }}
                videoStyle={{
                  filter: 'brightness(0.88) contrast(1.35)',
                  mixBlendMode: 'screen'
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-2">
                <Terminal className="w-14 h-14" />
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-wide">OMNIFlow</h3>
              <p className="text-xs text-slate-400 mt-0.5">IT Altyapı & Bilişim Yönetimi</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Area - Fully pinned and visible on any screen resolution without scrolling */}
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-2 sm:gap-2.5 shrink-0 z-10 pb-0.5">
        {/* Floating Guidance Banner */}
        <div className="w-full max-w-xl px-4 py-1.5 rounded-full bg-slate-900/80 border border-blue-500/30 text-center shadow-lg shadow-blue-950/20 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 text-blue-300 font-medium text-xs">
            <span className="p-1 rounded-full bg-blue-500/20 text-blue-400 animate-pulse">
              <ArrowLeft className="w-3 h-3 hidden sm:inline" />
              <Activity className="w-3 h-3 sm:hidden inline" />
            </span>
            <span className="text-[11px] sm:text-xs">
              {language === 'tr'
                ? 'İşlem yapmak ve cihaz envanterini görüntülemek için sol menüden bir müşteri seçiniz.'
                : 'Select a customer from the left sidebar to manage infrastructure and devices.'}
            </span>
          </div>
        </div>

        {/* Global Statistics Grid (Compact cards) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 rounded-xl p-2.5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm group"
              >
                <div>
                  <span className="text-[10px] font-medium text-slate-400 block line-clamp-1 group-hover:text-slate-300 transition-colors">
                    {card.label}
                  </span>
                  <span className="text-base sm:text-lg font-black text-white tracking-tight">
                    {card.value}
                  </span>
                </div>
                <div className={`p-1.5 rounded-lg border bg-gradient-to-br ${card.color} shrink-0 ml-2`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Customer Switcher + Actions in a single compact row */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 pt-0.5 border-t border-slate-800/60">
          {/* Quick Customers */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center md:justify-start">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
              <Building2 className="w-3 h-3 text-blue-400" />
              {language === 'tr' ? 'Hızlı Seçim:' : 'Quick Select:'}
            </span>
            {customers.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCustomer(c.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/10 text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer shadow-sm truncate max-w-[140px]"
                title={c.name}
              >
                {c.name}
              </button>
            ))}
            {customers.length > 6 && (
              <span className="text-[10px] text-slate-400">
                +{customers.length - 6} {language === 'tr' ? 'daha (solda)' : 'more'}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onAddCustomer && (
              <button
                onClick={onAddCustomer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'tr' ? 'Yeni Müşteri' : 'New Customer'}</span>
              </button>
            )}

            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Ctrl+K</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
