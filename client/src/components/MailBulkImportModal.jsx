import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Mail, Globe, Server, Check, Copy, RefreshCw, AlertCircle,
  Sparkles, Users, FileText, CheckCircle2, ShieldAlert, ArrowRight,
  Download, HelpCircle, Layers
} from 'lucide-react';
import { api } from '../api';

export default function MailBulkImportModal({
  isOpen,
  onClose,
  onSuccess,
  customerId,
  mailServices = [],
  branches = []
}) {
  const [activeTab, setActiveTab] = useState('m365'); // 'm365' | 'paste'

  // Selected Mail Service
  const [selectedServiceId, setSelectedServiceId] = useState('');

  // Tab 1: M365 API State
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isFetchingM365, setIsFetchingM365] = useState(false);
  const [m365Error, setM365Error] = useState(null);
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  // Tab 2: Clipboard / Text Paste State
  const [pasteText, setPasteText] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Initialize service & credentials
  useEffect(() => {
    if (mailServices.length > 0) {
      const defaultSrv = mailServices.find(s => s.service_type?.includes('Microsoft 365') || s.service_type?.includes('Exchange')) || mailServices[0];
      setSelectedServiceId(defaultSrv.id);
      if (defaultSrv.m365_tenant_id) setTenantId(defaultSrv.m365_tenant_id);
      if (defaultSrv.m365_client_id) setClientId(defaultSrv.m365_client_id);
      if (defaultSrv.m365_client_secret) setClientSecret(defaultSrv.m365_client_secret);
    }
  }, [mailServices, isOpen]);

  // When changing selected service
  const handleServiceChange = (srvId) => {
    setSelectedServiceId(srvId);
    const srv = mailServices.find(s => String(s.id) === String(srvId));
    if (srv) {
      if (srv.m365_tenant_id) setTenantId(srv.m365_tenant_id);
      if (srv.m365_client_id) setClientId(srv.m365_client_id);
      if (srv.m365_client_secret) setClientSecret(srv.m365_client_secret);
    }
  };

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // =========================================================================
  // TAB 1: FETCH FROM MICROSOFT 365 GRAPH API
  // =========================================================================
  const handleFetchM365 = async () => {
    if (!tenantId.trim() || !clientId.trim() || !clientSecret.trim()) {
      setM365Error('Lütfen Tenant ID, Client ID ve Client Secret alanlarını eksiksiz doldurun.');
      return;
    }

    setIsFetchingM365(true);
    setM365Error(null);
    try {
      const res = await api.fetchM365Users({
        tenant_id: tenantId.trim(),
        client_id: clientId.trim(),
        client_secret: clientSecret.trim()
      });

      if (res.users && res.users.length > 0) {
        setFetchedUsers(res.users);
        // Select all by default
        const allIds = new Set(res.users.map((_, idx) => idx));
        setSelectedUserIds(allIds);

        // If user has a selected service, save these credentials to that service automatically
        if (selectedServiceId) {
          const srv = mailServices.find(s => String(s.id) === String(selectedServiceId));
          if (srv) {
            api.updateMailService(selectedServiceId, {
              ...srv,
              m365_tenant_id: tenantId.trim(),
              m365_client_id: clientId.trim(),
              m365_client_secret: clientSecret.trim()
            }).catch(console.error);
          }
        }
      } else {
        setM365Error('Microsoft 365 hesabında e-posta adresi bulunan kullanıcı bulunamadı.');
      }
    } catch (err) {
      setM365Error(err.message || 'Microsoft 365 kullanıcıları çekilemedi');
    } finally {
      setIsFetchingM365(false);
    }
  };

  const toggleSelectAllM365 = () => {
    if (selectedUserIds.size === fetchedUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(fetchedUsers.map((_, idx) => idx)));
    }
  };

  const toggleUserSelection = (idx) => {
    const updated = new Set(selectedUserIds);
    if (updated.has(idx)) {
      updated.delete(idx);
    } else {
      updated.add(idx);
    }
    setSelectedUserIds(updated);
  };

  // =========================================================================
  // TAB 2: SMART CLIPBOARD / CSV PARSER
  // =========================================================================
  const parsedPasteUsers = useMemo(() => {
    if (!pasteText.trim()) return [];

    const lines = pasteText.split(/\r?\n/);
    const results = [];
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Skip header lines
      if (/ad(ı)?(\s)?soyad(ı)?/i.test(line) && /e-?(posta|mail)/i.test(line)) continue;

      const emailMatch = line.match(emailRegex);
      if (!emailMatch) continue;

      const email = emailMatch[1].toLowerCase();

      // Split line by Tab (\t), comma (,), semicolon (;), or pipe (|)
      let parts = [];
      if (line.includes('\t')) parts = line.split('\t');
      else if (line.includes(';')) parts = line.split(';');
      else if (line.includes(',')) parts = line.split(',');
      else if (line.includes('|')) parts = line.split('|');
      else parts = [line];

      parts = parts.map(p => p.trim()).filter(Boolean);

      // Guess Name & Department
      let fullName = '';
      let department = 'Genel';

      const emailPartIdx = parts.findIndex(p => p.toLowerCase().includes(email));

      if (parts.length >= 2) {
        if (emailPartIdx === 0) {
          // email first: email, name, dept
          fullName = parts[1] || '';
          department = parts[2] || 'Genel';
        } else if (emailPartIdx >= 1) {
          // name first: name, email, dept
          fullName = parts[0] || '';
          department = parts[emailPartIdx + 1] || 'Genel';
        }
      }

      // If full name couldn't be parsed or was equal to email, construct from email prefix
      if (!fullName || fullName.toLowerCase() === email) {
        const prefix = email.split('@')[0];
        fullName = prefix
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }

      // Avoid duplicates
      if (!results.some(r => r.email_address === email)) {
        results.push({
          full_name: fullName,
          email_address: email,
          department: department,
          mailbox_type: 'Kullanıcı',
          status: 'Aktif'
        });
      }
    }

    return results;
  }, [pasteText]);

  // =========================================================================
  // SUBMIT IMPORT TO DATABASE
  // =========================================================================
  const handleSaveImport = async () => {
    let accountsToSave = [];

    if (activeTab === 'm365') {
      accountsToSave = fetchedUsers.filter((_, idx) => selectedUserIds.has(idx)).map(u => ({
        full_name: u.full_name,
        email_address: u.email_address,
        department: u.department || 'Genel',
        mailbox_type: 'Kullanıcı',
        status: u.status || 'Aktif',
        phone_or_recovery: u.phone_or_recovery || '',
        branch_name: branches[0] || 'Merkez Ofis',
        is_mfa_active: 1
      }));
    } else {
      accountsToSave = parsedPasteUsers.map(u => ({
        ...u,
        branch_name: branches[0] || 'Merkez Ofis',
        is_mfa_active: 1
      }));
    }

    if (accountsToSave.length === 0) {
      alert('Lütfen içe aktarılacak en az bir kullanıcı seçin.');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await api.createMailAccountsBulk({
        customer_id: customerId,
        mail_service_id: selectedServiceId ? Number(selectedServiceId) : null,
        accounts: accountsToSave
      });

      alert(`✅ Başarılı: ${res.createdCount || 0} yeni kullanıcı eklendi, ${res.updatedCount || 0} kullanıcı güncellendi.\n\nArtık parolasını belirlemek istediğiniz kullanıcının yanındaki "[ + Şifre Yaz ]" butonuna basarak tek tıkla şifresini yazabilirsiniz!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Kullanıcılar kaydedilirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setSaveLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-4xl w-full my-8 text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-600/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Microsoft 365 &amp; Toplu E-Posta Kullanıcı Çekme</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Otomatik İçe Aktar
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Exchange Online / Microsoft 365 kullanıcılarını API ile doğrudan çekin veya Excel/Panodan yapıştırın.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Service Selection Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">Bağlanacak E-Posta Servisi:</span>
            {mailServices.length > 0 ? (
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {mailServices.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.service_name} ({srv.service_type || 'Genel'})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-amber-400 text-xs italic">Tanımlı servis yok (Doğrudan hesaba eklenecek)</span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Şifreler içe aktarımdan sonra tabloda tek tıkla yazılabilir</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('m365')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'm365'
                ? 'bg-slate-900 text-sky-400 border-slate-700 shadow-sm border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>1. Microsoft 365 Graph API (Otomatik)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'paste'
                ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-sm border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>2. Akıllı Pano / CSV Yapıştır (Hızlı &amp; API&apos;siz)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: MICROSOFT GRAPH API */}
          {activeTab === 'm365' && (
            <div className="space-y-4">
              <div className="bg-sky-950/20 border border-sky-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <Globe className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sky-300">Microsoft Graph API İle Kullanıcı Senkronizasyonu</div>
                  <p className="text-slate-300 leading-relaxed">
                    Azure Portal (<code className="text-sky-200 bg-sky-900/40 px-1 py-0.5 rounded">portal.azure.com</code> &gt; Microsoft Entra ID &gt; App Registrations) üzerinden oluşturduğunuz uygulamanın 3 bilgisini girin. Sistem tüm kullanıcı adlarını ve e-posta adreslerini tek tıkla çeker.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Gereken İzin: <strong className="text-white">User.Read.All</strong> (Application Permission + Grant admin consent).
                  </p>
                </div>
              </div>

              {/* API Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tenant ID (Kiracı Kimliği) *
                  </label>
                  <input
                    type="text"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Client ID (Uygulama Kimliği) *
                  </label>
                  <input
                    type="text"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Client Secret (Gizli Değer) *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleFetchM365}
                  disabled={isFetchingM365}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetchingM365 ? 'animate-spin' : ''}`} />
                  <span>{isFetchingM365 ? 'Microsoft 365\'e Bağlanılıyor...' : 'Microsoft 365\'ten Kullanıcıları Getir'}</span>
                </button>

                {fetchedUsers.length > 0 && (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{fetchedUsers.length} Kullanıcı Başarıyla Çekildi</span>
                  </div>
                )}
              </div>

              {/* Error Box */}
              {m365Error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Bağlantı Hatası:</div>
                    <div className="text-[11px] leading-relaxed">{m365Error}</div>
                  </div>
                </div>
              )}

              {/* Fetched Users Preview Table */}
              {fetchedUsers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400" />
                      <span>Aktarılacak Kullanıcılar ({selectedUserIds.size} / {fetchedUsers.length} Seçili)</span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleSelectAllM365}
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer hover:underline"
                    >
                      {selectedUserIds.size === fetchedUsers.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                    </button>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold">
                        <tr>
                          <th className="p-2.5 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.size === fetchedUsers.length && fetchedUsers.length > 0}
                              onChange={toggleSelectAllM365}
                              className="rounded border-slate-700 text-sky-600 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="p-2.5">Ad Soyad</th>
                          <th className="p-2.5">E-Posta Adresi</th>
                          <th className="p-2.5">Departman</th>
                          <th className="p-2.5">Ünvan</th>
                          <th className="p-2.5 text-center">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                        {fetchedUsers.map((u, idx) => {
                          const isSelected = selectedUserIds.has(idx);
                          return (
                            <tr
                              key={idx}
                              onClick={() => toggleUserSelection(idx)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-sky-950/20 text-white' : 'text-slate-400 hover:bg-slate-800/40'
                              }`}
                            >
                              <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleUserSelection(idx)}
                                  className="rounded border-slate-700 text-sky-600 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="p-2.5 font-bold text-slate-200">{u.full_name}</td>
                              <td className="p-2.5 font-mono text-sky-300">{u.email_address}</td>
                              <td className="p-2.5">{u.department || 'Genel'}</td>
                              <td className="p-2.5 text-slate-400">{u.job_title || '-'}</td>
                              <td className="p-2.5 text-center">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  u.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {u.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMART CLIPBOARD / CSV PASTE */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-emerald-300">Akıllı Pano / Tablo Yapıştırma (10 Saniyede Tamamlayın)</div>
                  <p className="text-slate-300 leading-relaxed">
                    Microsoft 365 Admin Center (<code className="text-emerald-200 bg-emerald-900/40 px-1 py-0.5 rounded">admin.microsoft.com</code> &gt; Aktif Kullanıcılar) ekranındaki tabloyu fareyle seçip kopyalayın, veya Excel / CSV dosyanızdaki sütunları buraya doğrudan yapıştırın. Sistem otomatik olarak Ad Soyad, E-Posta ve Departmanları algılar.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Kullanıcı Metni veya CSV Yapıştırın</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Format: Ad Soyad, mail@firma.com, Departman veya Tab ile ayrılmış tablo
                  </span>
                </label>
                <textarea
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Örnek 1 (Virgülle veya Noktalı Virgülle):\nAhmet Yılmaz, ahmet@firma.com, Muhasebe\nMehmet Demir, mehmet@firma.com, Satış\n\nÖrnek 2 (Excel / admin.microsoft.com kopyala-yapıştır):\nAhmet Yılmaz\tahmet@firma.com\tMuhasebe\tAktif`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Parsed Preview Table */}
              {parsedPasteUsers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{parsedPasteUsers.length} Kullanıcı Başarıyla Algılandı</span>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold">
                        <tr>
                          <th className="p-2.5">Ad Soyad</th>
                          <th className="p-2.5">E-Posta Adresi</th>
                          <th className="p-2.5">Departman</th>
                          <th className="p-2.5 text-center">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                        {parsedPasteUsers.map((u, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-2.5 font-bold text-slate-200">{u.full_name}</td>
                            <td className="p-2.5 font-mono text-emerald-300">{u.email_address}</td>
                            <td className="p-2.5 text-slate-300">{u.department}</td>
                            <td className="p-2.5 text-center">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-800/40 shrink-0">
          <div className="text-xs text-slate-400">
            {activeTab === 'm365' ? (
              <span>Seçilen: <strong className="text-white">{selectedUserIds.size}</strong> kullanıcı</span>
            ) : (
              <span>Algılanan: <strong className="text-white">{parsedPasteUsers.length}</strong> kullanıcı</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={handleSaveImport}
              disabled={
                saveLoading ||
                (activeTab === 'm365' && selectedUserIds.size === 0) ||
                (activeTab === 'paste' && parsedPasteUsers.length === 0)
              }
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {saveLoading
                  ? 'OMNIFlow\'a Aktarılıyor...'
                  : activeTab === 'm365'
                  ? `Seçilen ${selectedUserIds.size} Kullanıcıyı OMNIFlow'a Aktar`
                  : `${parsedPasteUsers.length} Kullanıcıyı OMNIFlow'a Aktar`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
