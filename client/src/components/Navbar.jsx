import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal, Search, Server, Cloud, Laptop,
  Shield, Database, Users, ShieldAlert, ShieldCheck, BookOpen,
  PanelLeftClose, PanelLeft, Settings, LogOut, UserCircle, ChevronDown, HelpCircle
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  stats,
  onOpenSearch,
  urgentLicenseCount = 0,
  criticalLicenseCount = 0,
  warningLicenseCount = 0,
  onOpenLicenseAlerts,
  isKBView = false,
  onToggleKBView,
  kbCount = 0,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenSettings,
  onOpenHelp,
  isAdminLoggedIn = false,
  currentUser = null,
  onLogout,
  canExport = true,
  canAccessKB = true,
  onOpenOmniHubLicense
}) {
  const { t, language } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState(null);
  const userMenuRef = useRef(null);

  // Load license status from OmniHub integration
  useEffect(() => {
    const fetchLic = async () => {
      try {
        const res = await fetch('/api/license/status');
        const data = await res.json();
        if (data.license) setLicenseStatus(data.license);
      } catch (_) {}
    };
    fetchLic();
    const interval = setInterval(fetchLic, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-30 pr-3 sm:pr-5">
      {/* Left Cluster: Brand (Yellow Box) + Narrow Search Omnibox (Red Box) */}
      <div className="flex items-center gap-3 shrink-0 h-full">
        {/* Brand & Sidebar Toggle (Fluid width on mobile/tablet, aligned on desktop) */}
        <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 h-full transition-all duration-300 ${
          isSidebarOpen
            ? 'w-auto md:w-64 lg:w-72 border-r border-slate-800 px-1.5 sm:px-2.5'
            : 'w-auto md:w-64 lg:w-72 border-r border-slate-800/80 px-1.5 sm:px-2'
        }`}>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={isSidebarOpen ? t('navbar.toggleSidebarHide') : t('navbar.toggleSidebarShow')}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-800/80 shrink-0 z-10"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-blue-400" />
              ) : (
                <PanelLeft className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          )}

          {/* Beveled, beautifully integrated video logo */}
          <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
            <BrandLogo size="banner" />
          </div>
        </div>

        {/* Global Search Omnibox (Collapses neatly to icon on mobile, expands on tablet/desktop) */}
        <div className="w-9 sm:w-44 md:w-56 lg:w-64 shrink-0 pl-0.5 sm:pl-1">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between p-2 sm:px-3 sm:py-1.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 transition-all cursor-pointer shadow-inner group"
            title={t('navbar.searchTooltip')}
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-blue-400 shrink-0 group-hover:text-blue-300 transition-colors" />
              <span className="hidden sm:inline truncate text-[11px] sm:text-xs">{t('navbar.searchPlaceholder')}</span>
            </div>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded shrink-0">
              {t('navbar.searchKbd')}
            </kbd>
          </button>
        </div>
      </div>

      {/* Right Side: Alerts, Stats, Export Actions & Settings */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Knowledge Base Navigation Button */}
        {canAccessKB && (
          <button
            onClick={onToggleKBView}
            title={isKBView ? t('navbar.kbTooltipToCustomer') : t('navbar.kbTooltipToKB')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isKBView
                ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/40'
                : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">{isKBView ? t('navbar.customersButton') : t('navbar.kbButton')}</span>
            {kbCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                {kbCount}
              </span>
            )}
          </button>
        )}

        {/* NOC License Alert Beacon: 30 gün uyarı (Amber) vs 15 gün kritik & sesli alarm (Pulsing Rose) */}
        {criticalLicenseCount > 0 ? (
          <button
            onClick={onOpenLicenseAlerts}
            title={`🚨 ${criticalLicenseCount} Kritik Lisans (15 gün veya daha az kaldı!) - Toplam ${urgentLicenseCount} bildirim`}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-500 text-rose-200 text-xs font-bold transition-all shadow-lg shadow-rose-950/50 cursor-pointer animate-pulse"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-mono">{urgentLicenseCount}</span>
            <span className="hidden sm:inline">{t('navbar.licenseBadge')}</span>
          </button>
        ) : (warningLicenseCount > 0 || urgentLicenseCount > 0) ? (
          <button
            onClick={onOpenLicenseAlerts}
            title={`⚠️ ${warningLicenseCount || urgentLicenseCount} Lisans Uyarısı (Son 30 gün içinde dolacak)`}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-500 text-amber-200 text-xs font-bold transition-all shadow-md shadow-amber-950/40 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono">{urgentLicenseCount || warningLicenseCount}</span>
            <span className="hidden sm:inline">Lisans</span>
          </button>
        ) : (
          <button
            onClick={onOpenLicenseAlerts}
            title={t('navbar.licensesOk')}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 text-xs font-medium transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden 2xl:inline text-[11px]">{t('navbar.licensesOkShort')}</span>
          </button>
        )}

        {/* Quick Global Stats summary pills (Streamlined) */}
        {stats && (
          <div className="hidden xl:flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/80 text-[11px] font-mono">
            <span className="px-1 py-0.5 rounded text-blue-300 flex items-center gap-1" title={t('navbar.statCustomers')}>
              <Users className="w-3 h-3 text-blue-400" />
              <span>{stats.customers}</span>
              <span className="hidden 2xl:inline text-[10px]">{t('navbar.statCustomers')}</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="px-1 py-0.5 rounded text-indigo-300 flex items-center gap-1" title={t('navbar.statServers')}>
              <Server className="w-3 h-3 text-indigo-400" />
              <span>{stats.servers}</span>
              <span className="hidden 2xl:inline text-[10px]">{t('navbar.statServers')}</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="px-1 py-0.5 rounded text-purple-300 flex items-center gap-1" title={t('navbar.statVMs')}>
              <Cloud className="w-3 h-3 text-purple-400" />
              <span>{stats.vms}</span>
              <span className="text-[10px]">{t('navbar.statVMs')}</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="px-1 py-0.5 rounded text-emerald-300 flex items-center gap-1" title={t('navbar.statPCs')}>
              <Laptop className="w-3 h-3 text-emerald-400" />
              <span>{stats.pcs}</span>
              <span className="text-[10px]">{t('navbar.statPCs')}</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="px-1 py-0.5 rounded text-rose-300 flex items-center gap-1" title={t('navbar.statFWs')}>
              <Shield className="w-3 h-3 text-rose-400" />
              <span>{stats.firewalls}</span>
              <span className="text-[10px]">{t('navbar.statFWs')}</span>
            </span>
          </div>
        )}

        {/* Language Selector in Navbar */}
        <LanguageSelector variant="navbar" />

        {/* OmniHub Protected License Badge */}
        <button
          type="button"
          onClick={onOpenOmniHubLicense}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer ${
            licenseStatus?.status === 'active'
              ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-900'
              : licenseStatus?.status === 'demo'
              ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-900'
              : 'bg-rose-950/80 border-rose-500/70 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse hover:bg-rose-900'
          }`}
          title="OMNIFlow Lisansı ve Aktivasyon (OmniHub)"
        >
          <ShieldCheck className="w-4 h-4 text-current shrink-0" />
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>
              {licenseStatus?.status === 'active'
                ? (typeof licenseStatus?.days_remaining === 'number' ? `${licenseStatus.days_remaining} GÜN` : 'LİSANSLI')
                : licenseStatus?.status === 'demo'
                ? `DEMO (${licenseStatus?.days_remaining ?? 0}G)`
                : 'LİSANSSIZ'}
            </span>
          </div>
        </button>

        {/* User Guide & Help Button (?) between Language and User Profile */}
        <button
          type="button"
          onClick={onOpenHelp}
          title={language === 'en' ? 'User Guide & Help Center (F1)' : 'Kullanım Kılavuzu & Yardım (F1)'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold transition-all cursor-pointer shadow-sm group"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden xl:inline text-xs">{language === 'en' ? 'Help' : 'Yardım'}</span>
        </button>

        {/* User Profile & Actions Dropdown */}
        {currentUser ? (
          <div className="relative pl-1 border-l border-slate-800" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer group shadow-sm ${
                isUserMenuOpen
                  ? 'bg-slate-800 border-blue-500/80 ring-2 ring-blue-500/20 text-white'
                  : 'bg-slate-950/70 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
              title={`${currentUser.full_name || currentUser.username} (${currentUser.role === 'admin' ? t('navbar.adminRole') : t('navbar.restrictedRole')})`}
              aria-expanded={isUserMenuOpen}
              aria-label={t('navbar.userMenu')}
            >
              {/* User Avatar */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                {(currentUser.full_name || currentUser.username || 'U').charAt(0).toUpperCase()}
              </div>

              {/* User Text Info */}
              <div className="text-left hidden sm:block">
                <div className="text-white font-semibold text-xs tracking-tight truncate max-w-[110px] md:max-w-[150px]">
                  {currentUser.full_name || currentUser.username}
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 leading-tight">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentUser.role === 'admin' ? 'bg-purple-400 animate-pulse' : 'bg-blue-400'}`}></span>
                  <span className={currentUser.role === 'admin' ? 'text-purple-300 font-medium' : 'text-blue-300'}>
                    {currentUser.role === 'admin' ? t('navbar.adminRole') : t('navbar.restrictedRole')}
                  </span>
                </div>
              </div>

              {/* Chevron Indicator */}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 shrink-0 ${
                isUserMenuOpen ? 'rotate-180 text-blue-400' : ''
              }`} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="p-3.5 bg-gradient-to-b from-slate-800/90 to-slate-900/60 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 ring-2 ring-blue-500/30">
                      {(currentUser.full_name || currentUser.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-bold text-sm truncate">
                        {currentUser.full_name || currentUser.username}
                      </div>
                      <div className="text-slate-400 text-xs font-mono truncate">
                        {currentUser.username}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          currentUser.role === 'admin'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                            : 'bg-blue-950/80 text-blue-300 border-blue-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${currentUser.role === 'admin' ? 'bg-purple-400 animate-pulse' : 'bg-blue-400'}`}></span>
                          {currentUser.role === 'admin' ? t('navbar.adminRole') : t('navbar.restrictedRole')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Actions */}
                <div className="p-1.5 space-y-1">
                  {/* Sistem Ayarları Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenSettings?.();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-slate-200 hover:text-white transition-all text-left cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shrink-0">
                      <Settings className="w-4 h-4 transition-transform group-hover:rotate-45" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center justify-between">
                        <span>{t('navbar.systemSettings')}</span>
                        {isAdminLoggedIn && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Admin"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {t('navbar.systemSettingsDesc')}
                      </div>
                    </div>
                  </button>

                  {/* OMNIFlow Lisansı & Aktivasyon (OmniHub) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenOmniHubLicense?.();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-slate-200 hover:text-white transition-all text-left cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500 transition-all shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center justify-between">
                        <span>OMNIFlow Lisans & Aktivasyon</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          {licenseStatus?.status === 'active' ? 'Aktif' : 'Lisanssız'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        OmniHub lisans anahtarı ve kalan gün takibi
                      </div>
                    </div>
                  </button>

                  {/* Yardım & Kullanım Kılavuzu Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenHelp?.();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/90 text-slate-200 hover:text-white transition-all text-left cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500 transition-all shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center justify-between">
                        <span>{language === 'en' ? 'Help & Documentation' : 'Yardım & Kullanım Kılavuzu'}</span>
                        <kbd className="px-1.5 py-0.2 bg-slate-800 border border-slate-700 rounded text-[9px] font-mono text-cyan-300">F1</kbd>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {language === 'en' ? 'Step-by-step user manual' : 'Modül rehberi ve adım adım kullanım'}
                      </div>
                    </div>
                  </button>

                  <div className="border-t border-slate-800 my-1"></div>

                  {/* Oturumu Kapat Button */}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 transition-all text-left cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-950/70 border border-rose-800/60 flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-500 transition-all shrink-0">
                        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-rose-300 group-hover:text-rose-200">
                          {t('navbar.logout')}
                        </div>
                        <div className="text-[11px] text-rose-400/70 truncate">
                          {t('navbar.logoutDesc')}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('navbar.settings')}</span>
          </button>
        )}
      </div>
    </header>
  );
}
