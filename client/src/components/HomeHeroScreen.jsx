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
      label: language === 'tr' ? 'Kayıtlı Müşteri' : 'Registered Customers',
      value: totalCustomers,
      icon: Building2,
      color: 'from-blue-600/20 to-cyan-600/20 text-blue-400 border-blue-500/30'
    },
    {
      label: language === 'tr' ? 'Fiziki Sunucu' : 'Physical Servers',
      value: totalServers,
      icon: Server,
      color: 'from-indigo-600/20 to-blue-600/20 text-indigo-400 border-indigo-500/30'
    },
    {
      label: language === 'tr' ? 'Sanal Makine (VM)' : 'Virtual Machines (VM)',
      value: totalVMs,
      icon: Cloud,
      color: 'from-purple-600/20 to-pink-600/20 text-purple-400 border-purple-500/30'
    },
    {
      label: language === 'tr' ? 'Kullanıcı PC' : 'User Computers',
      value: totalPCs,
      icon: Laptop,
      color: 'from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30'
    },
    {
      label: language === 'tr' ? 'Güvenlik & FW' : 'Firewall & Security',
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
    <div className="flex-1 w-full min-h-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col items-center justify-center py-4 z-10 space-y-6">

        {/* Live Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 shadow-md backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 tracking-wide uppercase text-[11px]">OMNIFlow v2.4</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{language === 'tr' ? 'Merkezi Altyapı & Bilişim Platformu' : 'Central IT Infrastructure Platform'}</span>
        </div>

        {/* High-Tech Animated Video Logo Widget */}
        <div className="relative group w-full max-w-[560px] sm:max-w-[620px] md:max-w-[700px]">
          {/* Glowing border backdrop */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-cyan-500/30 rounded-3xl blur-md opacity-60 group-hover:opacity-90 transition duration-1000 group-hover:duration-200"></div>

          {/* Card Container */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-slate-950/80 p-2 sm:p-3 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Corner Tech Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400/60 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400/60 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400/60 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400/60 rounded-br-lg pointer-events-none" />

            {/* Video Player */}
            {!videoError ? (
              <div className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                <SeamlessVideo
                  src="/logo.mp4"
                  fadeDuration={0.8}
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl"
                  containerClassName="relative w-full h-full overflow-hidden rounded-xl sm:rounded-2xl flex items-center justify-center"
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden'
                  }}
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center border border-slate-800/50 p-6 text-center">
                <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-3">
                  <Terminal className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">OMNIFlow</h3>
                <p className="text-xs text-slate-400 mt-1">IT Altyapı & Bilişim Yönetimi</p>
              </div>
            )}
          </div>
        </div>

        {/* Guidance / Call-to-action Banner */}
        <div className="w-full max-w-2xl px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-slate-900/40 border border-blue-500/30 text-center shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-center gap-2.5 text-blue-300 font-medium text-xs sm:text-sm">
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-400 animate-pulse">
              <ArrowLeft className="w-4 h-4 hidden sm:inline" />
              <Activity className="w-4 h-4 sm:hidden inline" />
            </span>
            <span>
              {language === 'tr'
                ? 'İşlem yapmak ve cihaz envanterini görüntülemek için sol menüden bir müşteri seçiniz.'
                : 'Select a customer from the left sidebar to manage infrastructure and devices.'}
            </span>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-2">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-400 line-clamp-1">{card.label}</span>
                  <div className={`p-1.5 rounded-lg border bg-gradient-to-br ${card.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {card.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fast Customer Switcher Pills (First few customers) */}
        {customers.length > 0 && (
          <div className="w-full flex flex-col items-center gap-2 pt-2">
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
              {language === 'tr' ? 'Hızlı Müşteri Seçimi' : 'Quick Customer Selection'}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
              {customers.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCustomer(c.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/10 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm group"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  <span className="max-w-[150px] truncate">{c.name}</span>
                </button>
              ))}
              {customers.length > 6 && (
                <span className="text-xs text-slate-500 self-center">
                  +{customers.length - 6} {language === 'tr' ? 'daha (sol menüde)' : 'more (in sidebar)'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {onAddCustomer && (
            <button
              onClick={onAddCustomer}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-900/30 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'tr' ? 'Yeni Müşteri Ekle' : 'Add New Customer'}</span>
            </button>
          )}

          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>{language === 'tr' ? 'Hızlı Arama (Ctrl+K)' : 'Quick Search (Ctrl+K)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
