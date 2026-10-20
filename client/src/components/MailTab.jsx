import React, { useState, useMemo } from 'react';
import {
  Mail, Globe, ExternalLink, User, Lock, Users,
  Calendar, Clock, Key, Edit, Trash2, LayoutGrid, Table,
  AlertCircle, ShieldCheck, ShieldAlert, Copy, Eye, EyeOff,
  Plus, Search, Server, Building2, Check, RefreshCw, Sparkles,
  Inbox, Layers, ArrowUpRight, HelpCircle, X, FileText
} from 'lucide-react';
import CopyButton from './CopyButton';
import { getDaysRemaining, getLicenseStatus } from '../utils/licenseAlerts';
import { api } from '../api';
import MailBulkImportModal from './MailBulkImportModal';
import HandoverModal from './HandoverModal';

export default function MailTab({
  customer,
  mailServices = [],
  mailAccounts = [],
  branches = [],
  computers = [],
  currentUser = null,
  canEdit = true,
  canDelete = true,
  canViewPasswords = true,
  onAddService,
  onEditService,
  onDeleteService,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onQuickUpdateAccount,
  onReloadCustomer
}) {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('itmanager_view_mode_mail') || 'table';
  });

  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedServiceId, setSelectedServiceId] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverAccount, setHandoverAccount] = useState(null);

  const handleOpenHandover = (acc = null) => {
    setHandoverAccount(acc || (mailAccounts.length > 0 ? mailAccounts[0] : null));
    setIsHandoverModalOpen(true);
  };

  // Quick inline password edit state
  const [editingPassId, setEditingPassId] = useState(null);
  const [tempPass, setTempPass] = useState('');
  const [isSavingPass, setIsSavingPass] = useState(false);

  const startEditPassword = (acc) => {
    setEditingPassId(acc.id);
    setTempPass(acc.password || '');
  };

  const cancelEditPassword = () => {
    setEditingPassId(null);
    setTempPass('');
  };

  const saveInlinePassword = async (acc) => {
    if (isSavingPass) return;
    setIsSavingPass(true);
    try {
      const updated = { ...acc, password: tempPass };
      if (onQuickUpdateAccount) {
        await onQuickUpdateAccount(acc.id, updated);
      } else {
        await api.updateMailAccount(acc.id, updated);
      }
      setEditingPassId(null);
      setTempPass('');
    } catch (err) {
      console.error('Parola kaydedilemedi', err);
      alert('Parola kaydedilirken hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSavingPass(false);
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('itmanager_view_mode_mail', mode);
  };

  // Primary active mail service (usually the first or matching selected)
  const activeService = mailServices.length > 0 ? mailServices[0] : null;

  // Distinct branches
  const allBranches = useMemo(() => {
    const set = new Set(['Merkez Ofis']);
    branches.forEach(b => { if (b) set.add(b); });
    mailAccounts.forEach(a => { if (a.branch_name) set.add(a.branch_name); });
    return Array.from(set).filter(Boolean);
  }, [branches, mailAccounts]);

  // Distinct departments
  const allDepartments = useMemo(() => {
    const set = new Set();
    mailAccounts.forEach(a => { if (a.department) set.add(a.department); });
    return Array.from(set).filter(Boolean);
  }, [mailAccounts]);

  // Filtering Accounts
  const filteredAccounts = useMemo(() => {
    return mailAccounts.filter(acc => {
      const matchBranch = selectedBranch === 'ALL' || (acc.branch_name || 'Merkez Ofis') === selectedBranch;
      if (!matchBranch) return false;

      const matchDept = selectedDept === 'ALL' || (acc.department || 'Genel') === selectedDept;
      if (!matchDept) return false;

      const matchService = selectedServiceId === 'ALL' || String(acc.mail_service_id) === String(selectedServiceId);
      if (!matchService) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (acc.full_name || '').toLowerCase().includes(term) ||
        (acc.email_address || '').toLowerCase().includes(term) ||
        (acc.department || '').toLowerCase().includes(term) ||
        (acc.branch_name || '').toLowerCase().includes(term) ||
        (acc.mailbox_type || '').toLowerCase().includes(term) ||
        (acc.notes || '').toLowerCase().includes(term)
      );
    });
  }, [mailAccounts, selectedBranch, selectedDept, selectedServiceId, searchTerm]);

  // License Expiry calculations for exchange/subscription
  const expiringServices = mailServices.filter(s => s.is_exchange_or_subscription === 1 && s.license_expiry);
  const urgentCount = expiringServices.filter(s => {
    const days = getDaysRemaining(s.license_expiry);
    return getLicenseStatus(days).isUrgent;
  }).length;

  const totalSeats = mailServices.reduce((sum, s) => sum + (Number(s.license_count) || 0), 0);
  const mfaActiveCount = mailAccounts.filter(a => a.is_mfa_active === 1).length;

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Stat Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600/15 text-blue-400 border border-blue-500/30 rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.25)]">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Kurumsal Mail &amp; Exchange Yönetimi
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                {mailAccounts.length} Posta Kutusu
              </span>
              {totalSeats > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {totalSeats} Lisans Kontenjanı
                </span>
              )}
              {urgentCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {urgentCount} Abonelik Süresi Yaklaştı!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {customer?.name} — Mail paneli erişimleri, Exchange yıllık lisans takibi ve kullanıcı posta kutuları
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Dual View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleToggleView('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tablo Görünümü"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToggleView('cards')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {canEdit && (
            <>
              <button
                onClick={() => handleOpenHandover(mailAccounts.length > 0 ? mailAccounts[0] : null)}
                className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Seçili müşteride personele ait resmi Zimmet & Teslim Tutanağı oluştur (PDF / Yazdır)"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>📄 Zimmet Tutanağı</span>
              </button>

              <button
                onClick={onAddService}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Yeni Mail Servisi veya Panel Ekle"
              >
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Panel / Servis Ekle</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-sky-600/30 to-blue-600/30 hover:from-sky-600/40 hover:to-blue-600/40 text-sky-200 text-xs font-bold rounded-xl border border-sky-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Microsoft 365 / Exchange Kullanıcılarını API ile Çek veya Toplu İçe Aktar"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>M365 / Toplu Kullanıcı Çek</span>
              </button>

              <button
                onClick={onAddAccount}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni E-Posta Hesabı Ekle</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MAIL SERVICES & PANELS SECTION (MANAGEMENT CREDENTIALS & LICENSES)     */}
      {/* ===================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Mail Yönetim Panelleri &amp; Yıllık Lisans Takibi
            </h3>
            <span className="text-xs text-slate-400">({mailServices.length} Servis Tanımlı)</span>
          </div>
        </div>

        {mailServices.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
            <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Henüz Mail Yönetim Paneli Eklenmedi</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Microsoft 365, Exchange Online, Google Workspace veya cPanel yönetim panelinizi ekleyerek lisans takibi yapabilirsiniz.
            </p>
            {canEdit && (
              <button
                onClick={onAddService}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mail Paneli Ekle</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mailServices.map((srv) => {
              const daysRemaining = getDaysRemaining(srv.license_expiry);
              const licenseStatus = getLicenseStatus(daysRemaining);
              const isUrgent = licenseStatus.isUrgent;

              return (
                <div
                  key={srv.id}
                  className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                    isUrgent
                      ? 'border-rose-500/70 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-900'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top: Header & Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base text-white">{srv.service_name}</h4>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                            {srv.service_type}
                          </span>
                          {srv.domain_name && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 bg-slate-800 border border-slate-700">
                              @{srv.domain_name}
                            </span>
                          )}
                        </div>

                        {srv.admin_panel_url && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-400">
                            <Globe className="w-3.5 h-3.5" />
                            <a
                              href={srv.admin_panel_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1 font-mono truncate max-w-xs sm:max-w-md"
                            >
                              <span>{srv.admin_panel_url}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Edit / Delete */}
                      {canEdit && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onEditService(srv)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => onDeleteService(srv.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Admin Credentials Strip */}
                    <div className="mt-3.5 p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-500 font-medium">Admin:</span>
                          <span className="font-mono font-semibold text-slate-200 select-all">
                            {srv.admin_username || 'Belirtilmedi'}
                          </span>
                          {srv.admin_username && <CopyButton text={srv.admin_username} />}
                        </div>

                        {canViewPasswords && srv.admin_password && (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-500 font-medium">Şifre:</span>
                            <span className="font-mono text-slate-200">
                              {visiblePasswords[`srv_${srv.id}`] ? srv.admin_password : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(`srv_${srv.id}`)}
                              className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                              title={visiblePasswords[`srv_${srv.id}`] ? 'Gizle' : 'Göster'}
                            >
                              {visiblePasswords[`srv_${srv.id}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <CopyButton text={srv.admin_password} />
                          </div>
                        )}
                      </div>

                      {srv.portal_notes && (
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex items-start gap-1">
                          <span className="text-blue-400 font-medium shrink-0">Not:</span>
                          <span className="truncate">{srv.portal_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: License Tracking & Server Ports */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                    {/* License Expiry Section */}
                    {srv.is_exchange_or_subscription === 1 && srv.license_expiry ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Yıllık Yenileme:</span>
                          <strong className="text-slate-200 font-mono">{srv.license_expiry}</strong>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${licenseStatus.badgeClass}`}>
                          {licenseStatus.label}
                        </span>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs">
                        {srv.is_exchange_or_subscription === 1 ? 'Lisans tarihi girilmedi' : 'Süresiz / Standart Kurulum'}
                      </div>
                    )}

                    {srv.license_count > 0 && (
                      <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
                        Toplam Kontenjan: <strong className="text-blue-400">{srv.license_count} Adet</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* USER MAILBOXES & ACCOUNTS SECTION                                     */}
      {/* ===================================================================== */}
      <div className="space-y-4 pt-2">
        {/* Filter and Search Bar */}
        <div className="bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="İsim, e-posta adresi, departman veya şube ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Service filter */}
            {mailServices.length > 1 && (
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="px-2.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tüm Servisler</option>
                {mailServices.map(s => (
                  <option key={s.id} value={s.id}>{s.service_name}</option>
                ))}
              </select>
            )}

            {/* Department filter */}
            {allDepartments.length > 0 && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tüm Departmanlar</option>
                {allDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {/* Branch filter */}
            {allBranches.length > 1 && (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-2.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tüm Şubeler</option>
                {allBranches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}

            {/* Password show/hide all toggle */}
            {canViewPasswords && (
              <button
                onClick={() => setShowAllPasswords(!showAllPasswords)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  showAllPasswords
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Tüm şifreleri tek tıkla göster veya gizle"
              >
                {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllPasswords ? 'Şifreleri Gizle' : 'Tüm Şifreleri Göster'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div>
            Toplam <strong>{filteredAccounts.length}</strong> kullanıcı e-posta hesabı listeleniyor
            {searchTerm && ` ("${searchTerm}" araması)`}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{mfaActiveCount} Hesapta 2FA Aktif</span>
            </span>
          </div>
        </div>

        {/* Empty State */}
        {filteredAccounts.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Kayıtlı E-Posta Hesabı Bulunamadı</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Filtrelerinizi temizleyin veya yeni bir kullanıcı e-posta hesabı ve parolası ekleyin.
            </p>
            {canEdit && (
              <div className="mt-4 flex items-center justify-center gap-2.5 flex-wrap">
                <button
                  onClick={onAddAccount}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>İlk E-Posta Hesabını Ekle</span>
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Microsoft 365 / Toplu İçe Aktar</span>
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* ===================================================================== */
          /* TABLE VIEW                                                            */
          /* ===================================================================== */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Kullanıcı Adı Soyadı</th>
                    <th className="py-3 px-4">E-Posta Adresi</th>
                    <th className="py-3 px-4">Parola</th>
                    <th className="py-3 px-4">Departman &amp; Şube</th>
                    <th className="py-3 px-4">Tür &amp; Lisans</th>
                    <th className="py-3 px-4">Kota</th>
                    <th className="py-3 px-4">2FA / MFA</th>
                    <th className="py-3 px-4">Durum</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAccounts.map((acc) => {
                    const isPassVisible = showAllPasswords || visiblePasswords[acc.id];
                    const initials = (acc.full_name || 'U')
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors group">
                        {/* 1. Name & Avatar */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{acc.full_name}</div>
                              {acc.notes && (
                                <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                                  {acc.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Email Address */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-slate-200">
                            <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="select-all font-medium">{acc.email_address}</span>
                            <CopyButton text={acc.email_address} title="E-Postayı Kopyala" />
                          </div>
                        </td>

                        {/* 3. Password */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {editingPassId === acc.id ? (
                            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Yeni parola yazın..."
                                value={tempPass}
                                onChange={(e) => setTempPass(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveInlinePassword(acc);
                                  } else if (e.key === 'Escape') {
                                    cancelEditPassword();
                                  }
                                }}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400 w-36"
                              />
                              <button
                                type="button"
                                onClick={() => saveInlinePassword(acc)}
                                disabled={isSavingPass}
                                className="p-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs transition-colors cursor-pointer"
                                title="Kaydet (Enter)"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditPassword}
                                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded text-xs transition-colors cursor-pointer"
                                title="Vazgeç (Esc)"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : canViewPasswords && acc.password ? (
                            <div className="flex items-center gap-1.5 font-mono bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/80 w-fit group">
                              <span className="text-slate-200 select-all min-w-[70px]">
                                {isPassVisible ? acc.password : '••••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(acc.id)}
                                className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                                title={isPassVisible ? 'Gizle' : 'Göster'}
                              >
                                {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <CopyButton text={acc.password} title="Parolayı Kopyala" />
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => startEditPassword(acc)}
                                  className="text-slate-500 hover:text-emerald-400 p-0.5 cursor-pointer ml-0.5 transition-colors"
                                  title="Parolayı Düzenle"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 italic text-[11px]">
                                {acc.password ? 'Yetki yok' : 'Şifresiz'}
                              </span>
                              {canEdit && canViewPasswords && (
                                <button
                                  type="button"
                                  onClick={() => startEditPassword(acc)}
                                  className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 cursor-pointer"
                                  title="Bu kullanıcıya şifre yaz"
                                >
                                  <Plus className="w-3 h-3 stroke-[2.5]" />
                                  <span>Şifre Yaz</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 4. Department & Branch */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 w-fit">
                              {acc.department || 'Genel'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {acc.branch_name || 'Merkez Ofis'}
                            </span>
                          </div>
                        </td>

                        {/* 5. Mailbox Type & License */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-200 font-medium">
                              {acc.mailbox_type || 'Kullanıcı'}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-mono">
                              {acc.license_type || '-'}
                            </span>
                          </div>
                        </td>

                        {/* 6. Quota */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                          {acc.quota_limit || '50 GB'}
                        </td>

                        {/* 7. MFA */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {acc.is_mfa_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                              <ShieldCheck className="w-3 h-3" />
                              <span>2FA Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                              <span>Kapalı</span>
                            </span>
                          )}
                        </td>

                        {/* 8. Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            acc.status === 'Aktif'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {acc.status || 'Aktif'}
                          </span>
                        </td>

                        {/* 9. Actions */}
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenHandover(acc)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Bu personel ve mail hesabı için resmi Zimmet & Teslim Tutanağı oluştur"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => onEditAccount(acc)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Hesabı Düzenle"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => onDeleteAccount(acc.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Hesabı Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ===================================================================== */
          /* CARD VIEW                                                             */
          /* ===================================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAccounts.map((acc) => {
              const isPassVisible = showAllPasswords || visiblePasswords[acc.id];
              const initials = (acc.full_name || 'U')
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={acc.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{acc.full_name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{acc.department || 'Genel'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenHandover(acc)}
                          className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                          title="Bu personel için resmi Zimmet & Teslim Tutanağı oluştur"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onEditAccount(acc)}
                            className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDeleteAccount(acc.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Email Strip */}
                    <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-mono text-slate-200 truncate">
                          <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate select-all">{acc.email_address}</span>
                        </div>
                        <CopyButton text={acc.email_address} />
                      </div>

                      {canViewPasswords && (
                        <div className="pt-1.5 border-t border-slate-900">
                          {editingPassId === acc.id ? (
                            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30">
                              <input
                                type="text"
                                autoFocus
                                placeholder="Yeni parola yazın..."
                                value={tempPass}
                                onChange={(e) => setTempPass(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveInlinePassword(acc);
                                  } else if (e.key === 'Escape') {
                                    cancelEditPassword();
                                  }
                                }}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400 w-full"
                              />
                              <button
                                type="button"
                                onClick={() => saveInlinePassword(acc)}
                                disabled={isSavingPass}
                                className="p-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs transition-colors cursor-pointer shrink-0"
                                title="Kaydet"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditPassword}
                                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded text-xs transition-colors cursor-pointer shrink-0"
                                title="Vazgeç"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : acc.password ? (
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 font-mono text-slate-300">
                                <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="select-all">
                                  {isPassVisible ? acc.password : '••••••••••'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(acc.id)}
                                  className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                                  title={isPassVisible ? 'Gizle' : 'Göster'}
                                >
                                  {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <CopyButton text={acc.password} />
                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => startEditPassword(acc)}
                                    className="text-slate-400 hover:text-emerald-400 p-0.5 cursor-pointer transition-colors"
                                    title="Parolayı Düzenle"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : canEdit ? (
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="italic text-[11px]">Şifresiz</span>
                              <button
                                type="button"
                                onClick={() => startEditPassword(acc)}
                                className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Şifre Yaz</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {acc.quota_limit || '50 GB'}
                      </span>
                      {acc.is_mfa_active === 1 && (
                        <span className="text-emerald-400 flex items-center gap-0.5 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>2FA</span>
                        </span>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      acc.status === 'Aktif'
                        ? 'bg-emerald-950/80 text-emerald-300'
                        : 'bg-amber-950/80 text-amber-300'
                    }`}>
                      {acc.status || 'Aktif'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Microsoft 365 & Bulk Mail Account Import Modal */}
      <MailBulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          if (onReloadCustomer) onReloadCustomer();
        }}
        customerId={customer?.id}
        mailServices={mailServices}
        branches={branches}
      />

      {/* Personel Zimmet & Teslim Tutanağı Modalı */}
      <HandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        customer={customer}
        selectedMailAccount={handoverAccount}
        computers={computers}
        mailAccounts={mailAccounts}
        currentUser={currentUser}
      />
    </div>
  );
}
