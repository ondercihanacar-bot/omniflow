import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, X, Volume2, VolumeX, ArrowRight,
  Building2, Calendar, Clock, ExternalLink, Globe, Play, Shield, Users, Mail
} from 'lucide-react';
import {
  getDaysRemaining, getLicenseStatus, playAlertChime,
  playCriticalLicenseAlarm, announceCriticalLicenseVoice,
  getSoundEnabled, setSoundEnabled
} from '../utils/licenseAlerts';

export default function LicenseAlertModal({
  isOpen,
  onClose,
  licenses = [],
  firewalls = [],
  onSelectLicense,
  onSelectFirewall
}) {
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [filter, setFilter] = useState('urgent'); // 'urgent', 'firewall', 'antivirus', 'all'

  // Global ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    setSoundEnabled(nextVal);
  };

  const handleTestSound = () => {
    playAlertChime();
  };

  // Combine items: prefer licenses array, fallback to firewalls
  const sourceList = (licenses && licenses.length > 0)
    ? licenses
    : (firewalls || []).map(f => ({ ...f, type: 'firewall' }));

  // Process and sort all licenses by remaining days
  const processed = sourceList
    .map(item => {
      const days = getDaysRemaining(item.license_expiry);
      const status = getLicenseStatus(days);
      const itemType = item.type || (item.product_name ? 'antivirus' : 'firewall');
      return { ...item, type: itemType, daysRemaining: days, status };
    })
    .sort((a, b) => {
      // Prioritize expired and nearest days
      const daysA = a.daysRemaining !== null ? a.daysRemaining : 99999;
      const daysB = b.daysRemaining !== null ? b.daysRemaining : 99999;
      return daysA - daysB;
    });

  const urgentList = processed.filter(p => p.status.isUrgent);
  const firewallList = processed.filter(p => p.type === 'firewall');
  const antivirusList = processed.filter(p => p.type === 'antivirus');
  const mailList = processed.filter(p => p.type === 'mail');

  const displayedList =
    filter === 'urgent'
      ? urgentList
      : filter === 'firewall'
      ? firewallList
      : filter === 'antivirus'
      ? antivirusList
      : filter === 'mail'
      ? mailList
      : processed;

  const handleNavigate = (item) => {
    if (onSelectLicense) {
      onSelectLicense(item.customer_id, item.type, item.id);
    } else if (onSelectFirewall) {
      onSelectFirewall(item.customer_id, item.id);
    }
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              {urgentList.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Lisans & Güvenlik Takip Merkezi</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  {urgentList.length} Acil / Biten
                </span>
              </div>
              <p className="text-xs text-slate-400">
                15 gün veya daha az süresi kalan Firewall ve Antivirüs lisans bildirimleri
              </p>
            </div>
          </div>

          {/* Sound Controls & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              title={soundOn ? 'Sesli Uyarı Açık (Tıklayınca Sessize Alır)' : 'Sesli Uyarı Kapalı (Tıklayınca Açar)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                soundOn
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">{soundOn ? 'Ses Açık' : 'Sessiz'}</span>
            </button>

            <button
              onClick={handleTestSound}
              title="Uyarı Sesini Önizle / Dinle"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter('urgent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'urgent'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>🚨 Acil & Bitenler</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                {urgentList.length}
              </span>
            </button>

            <button
              onClick={() => setFilter('firewall')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'firewall'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span>Firewall ({firewallList.length})</span>
            </button>

            <button
              onClick={() => setFilter('antivirus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'antivirus'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Antivirüs ({antivirusList.length})</span>
            </button>

            <button
              onClick={() => setFilter('mail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'mail'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Mail &amp; Exchange ({mailList.length})</span>
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Tüm Lisanslar ({processed.length})
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Uyarı: &le;30 Gün • Kritik Alarm: &le;15 Gün</span>
          </div>
        </div>

        {/* Modal Body / Cards List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {urgentList.length > 0 && filter === 'urgent' && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-bold">Önemli Güvenlik Bildirimi:</span> Aşağıda listelenen{' '}
                <strong>{urgentList.length}</strong> lisans son 30 gün içindedir (15 gün kala daha belirgin ve sesli alarm tetiklenir).
                Lisans yenilenmediğinde antivirüs koruma imzaları veya firewall güvenlik filtreleri devre dışı kalabilir.
              </div>
            </div>
          )}

          {displayedList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Bu Kategori Altında Kayıt Yok</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {filter === 'urgent'
                  ? 'Tebrikler! Bitişine 15 gün veya daha az kalan acil bir lisans bulunmuyor.'
                  : 'Bu kategoride kayıtlı lisans bulunmuyor.'}
              </p>
            </div>
          ) : (
            displayedList.map((item) => {
              const isAV = item.type === 'antivirus';
              const isMail = item.type === 'mail';
              const portalLink = isAV ? item.portal_url : (isMail ? item.access_info : item.management_ip);
              const formattedUrl = portalLink
                ? (portalLink.startsWith('http') ? portalLink : `https://${portalLink}`)
                : null;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`p-4 rounded-xl border bg-slate-950/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    item.status.isUrgent
                      ? 'border-rose-600/50 hover:border-rose-500 bg-rose-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    {/* Customer, Type & Branch */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        isAV
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : isMail
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-orange-950 text-orange-300 border-orange-800'
                      }`}>
                        {isAV ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : isMail ? <Mail className="w-3 h-3 text-blue-400" /> : <Shield className="w-3 h-3 text-orange-400" />}
                        {isAV ? 'Antivirüs' : isMail ? 'Kurumsal Mail' : 'Firewall'}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                        <Building2 className="w-3 h-3" />
                        {item.customer_name}
                      </span>

                      {item.branch_name && (
                        <span className="text-[11px] text-cyan-400 font-medium">
                          🏢 {item.branch_name}
                        </span>
                      )}

                      {(isAV || isMail) && item.user_count && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          <Users className="w-2.5 h-2.5 text-blue-400" />
                          {item.user_count} Kullanıcı / Lisans
                        </span>
                      )}
                    </div>

                    {/* Product / Device Name */}
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-white">
                        {isAV ? (item.product_name || item.brand) : isMail ? (item.name || 'Kurumsal Mail') : item.device_name}
                      </h5>
                      <span className="text-xs text-slate-400">
                        {isAV
                          ? (item.license_term ? `(${item.brand} - ${item.license_term})` : `(${item.brand})`)
                          : isMail
                          ? `(${item.model || 'Abonelik'})`
                          : `(${item.brand} ${item.model || ''})`
                        }
                      </span>
                    </div>

                    {/* Date & Countdown Status */}
                    <div className="flex items-center gap-2.5 text-xs flex-wrap">
                      <div className="flex items-center gap-1 text-slate-300 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Bitiş: {item.license_expiry || 'Bilinmiyor'}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[11px] border font-mono ${item.status.badgeClass}`}
                      >
                        {item.status.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-stretch sm:self-center justify-end shrink-0">
                    {formattedUrl && (
                      <a
                        href={formattedUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={isAV ? 'Antivirüs Yönetim Panelini Aç' : 'Firewall Yönetim Arayüzünü Aç'}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleNavigate(item)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                        item.status.isUrgent
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <span>Kayda Git</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Canlı Lisans Uyarı Sistemi (&le;15 Gün Bildirimi)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Kapat (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}
