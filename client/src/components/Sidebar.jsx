import React, { useState } from 'react';
import {
  Building2, Plus, Search, Globe, ChevronLeft,
  Server, Database, Shield, Laptop, BookOpen, Wifi, Mail, Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({
  customers = [],
  selectedCustomerId,
  onSelectCustomer,
  onOpenNewCustomerModal,
  isKBView = false,
  onSelectKBView,
  isOpen = true,
  onToggle,
  canAccessKB = true,
  canEdit = true
}) {
  const { t, language } = useLanguage();
  const [customerSearch, setCustomerSearch] = useState('');

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q) ||
      (c.external_ip || '').toLowerCase().includes(q) ||
      (c.contact_person || '').toLowerCase().includes(q)
    );
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 md:static md:z-auto h-full w-72 md:w-64 lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl md:shadow-none transition-all duration-300">
      {/* Sidebar Header & Controls */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              {t('sidebar.customers')} ({customers.length})
            </h2>
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              title={t('navbar.toggleSidebarHide')}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ana Ekran / Hareketli Logo Ekranı Butonu */}
        <button
          onClick={() => onSelectCustomer(null)}
          title={language === 'tr' ? 'Ana Sayfa (Hareketli Logo Ekranı)' : 'Home (Animated Logo Screen)'}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            !isKBView && !selectedCustomerId
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md shadow-blue-950/40 ring-1 ring-blue-400/30'
              : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-blue-400 border-slate-800 hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <Home className={`w-3.5 h-3.5 ${!isKBView && !selectedCustomerId ? 'text-white' : 'text-blue-400'}`} />
            <span>{language === 'tr' ? 'Ana Sayfa (Logo)' : 'Home (Logo)'}</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
            !isKBView && !selectedCustomerId
              ? 'bg-blue-800/80 text-blue-100 border border-blue-400/40'
              : 'bg-blue-950 text-blue-300 border border-blue-800'
          }`}>
            OMNI
          </span>
        </button>

        {/* Knowledge Base Navigation Button */}
        {canAccessKB && (
          <button
            onClick={onSelectKBView}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isKBView
                ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/40'
                : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('sidebar.kbButton')}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-950 text-amber-300 border border-amber-800">
              {t('sidebar.kbShort')}
            </span>
          </button>
        )}

        {/* Add Customer Button */}
        {canEdit && (
          <button
            onClick={onOpenNewCustomerModal}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('sidebar.addCustomer')}</span>
          </button>
        )}

        {/* Search Customers Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('sidebar.searchCustomer')}
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Compact Customer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredCustomers.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            {customerSearch ? t('sidebar.noCustomerFound') : t('sidebar.noCustomerYet')}
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const isSelected = selectedCustomerId === cust.id;
            const totalDevices =
              (cust.server_count || 0) +
              (cust.vm_count || 0) +
              (cust.pc_count || 0) +
              (cust.firewall_count || 0) +
              (cust.backup_count || 0);

            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust.id)}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                {/* Row 1: Code, Name & Total Device Badge */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {cust.code && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-blue-400 border border-slate-700 shrink-0">
                        {cust.code}
                      </span>
                    )}
                    <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {cust.name}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold shrink-0 ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {totalDevices} {t('sidebar.deviceBadge')}
                  </span>
                </div>

                {/* Row 2: External IP snippet */}
                {cust.external_ip && (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-1 truncate">
                    <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate">{cust.external_ip.split(' ')[0]}</span>
                  </div>
                )}

                {/* Row 3: Device mini counts preview (fitted compactly) */}
                <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span title={t('sidebar.serverTooltip')} className="flex items-center gap-0.5">
                    <Server className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                    <span>{cust.server_count || 0}</span>
                  </span>
                  <span title={t('sidebar.vmTooltip')} className="flex items-center gap-0.5">
                    <span className="text-purple-400 font-sans text-[10px] font-semibold">VM:</span>
                    <span>{cust.vm_count || 0}</span>
                  </span>
                  <span title={t('sidebar.pcTooltip')} className="flex items-center gap-0.5">
                    <Laptop className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>{cust.pc_count || 0}</span>
                  </span>
                  <span title={t('sidebar.fwTooltip')} className="flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                    <span>{cust.firewall_count || 0}</span>
                  </span>
                  <span title={t('sidebar.nasTooltip')} className="flex items-center gap-0.5">
                    <Database className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span>{cust.backup_count || 0}</span>
                  </span>
                  {(cust.wifi_ap_count || 0) > 0 && (
                    <span title={t('sidebar.wifiTooltip')} className="flex items-center gap-0.5">
                      <Wifi className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                      <span>{cust.wifi_ap_count}</span>
                    </span>
                  )}
                  {(cust.mail_account_count || 0) > 0 && (
                    <span title={t('sidebar.mailTooltip')} className="flex items-center gap-0.5">
                      <Mail className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                      <span>{cust.mail_account_count}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer Credit */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 text-center shrink-0">
        <p className="text-[11px] text-slate-400">
          Designed &amp; Developed by
        </p>
        <p className="text-xs font-semibold text-blue-400 tracking-wide mt-0.5">
          Önder Cihan ACAR
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
          &copy; 2026. All Rights Reserved.
        </p>
      </div>
    </aside>
  );
}
