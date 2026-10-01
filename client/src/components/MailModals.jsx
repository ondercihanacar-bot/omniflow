import React, { useState, useEffect } from 'react';
import {
  X, Mail, Globe, ExternalLink, User, Lock, Key, Shield, ShieldCheck,
  Calendar, Clock, Server, Check, Copy, RefreshCw, AlertCircle, Building2,
  Database, Radio, Sparkles
} from 'lucide-react';
import CopyButton from './CopyButton';

// ============================================================================
// 1. MAIL SERVICE & PANEL MODAL (Microsoft 365, Exchange, Google, cPanel)
// ============================================================================
export function MailServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
  customerId,
  branches = []
}) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    service_name: '',
    service_type: 'Microsoft 365 / Exchange',
    domain_name: '',
    admin_panel_url: 'https://admin.microsoft.com',
    admin_username: '',
    admin_password: '',
    portal_notes: '',
    is_exchange_or_subscription: 1,
    license_type: 'Microsoft 365 Business Standard',
    license_count: 10,
    license_start_date: '',
    license_expiry: '',
    reseller_partner: '',
    incoming_server: 'outlook.office365.com (Port: 993 SSL)',
    outgoing_server: 'smtp.office365.com (Port: 587 STARTTLS)',
    dns_records_status: '',
    notes: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        customer_id: service.customer_id || customerId,
        service_name: service.service_name || '',
        service_type: service.service_type || 'Microsoft 365 / Exchange',
        domain_name: service.domain_name || '',
        admin_panel_url: service.admin_panel_url || '',
        admin_username: service.admin_username || '',
        admin_password: service.admin_password || '',
        portal_notes: service.portal_notes || '',
        is_exchange_or_subscription: service.is_exchange_or_subscription !== undefined ? Number(service.is_exchange_or_subscription) : 1,
        license_type: service.license_type || '',
        license_count: service.license_count !== undefined ? Number(service.license_count) : 1,
        license_start_date: service.license_start_date || '',
        license_expiry: service.license_expiry || '',
        reseller_partner: service.reseller_partner || '',
        incoming_server: service.incoming_server || '',
        outgoing_server: service.outgoing_server || '',
        dns_records_status: service.dns_records_status || '',
        notes: service.notes || ''
      });
    } else {
      setFormData({
        customer_id: customerId,
        service_name: 'Microsoft 365 & Exchange Online',
        service_type: 'Microsoft 365 / Exchange',
        domain_name: '',
        admin_panel_url: 'https://admin.microsoft.com',
        admin_username: '',
        admin_password: '',
        portal_notes: '',
        is_exchange_or_subscription: 1,
        license_type: 'Microsoft 365 Business Standard',
        license_count: 10,
        license_start_date: new Date().toISOString().slice(0, 10),
        license_expiry: '',
        reseller_partner: '',
        incoming_server: 'outlook.office365.com (Port: 993 SSL)',
        outgoing_server: 'smtp.office365.com (Port: 587 STARTTLS)',
        dns_records_status: '',
        notes: ''
      });
    }
    setShowPassword(false);
  }, [service, customerId, isOpen]);

  // Handle Preset templates for fast configuration
  const handleServiceTypeChange = (type) => {
    let panelUrl = formData.admin_panel_url;
    let inServer = formData.incoming_server;
    let outServer = formData.outgoing_server;
    let defaultLicense = formData.license_type;

    if (type === 'Microsoft 365 / Exchange') {
      panelUrl = 'https://admin.microsoft.com';
      inServer = 'outlook.office365.com (Port: 993 SSL)';
      outServer = 'smtp.office365.com (Port: 587 STARTTLS)';
      defaultLicense = 'Microsoft 365 Business Standard';
    } else if (type === 'Google Workspace') {
      panelUrl = 'https://admin.google.com';
      inServer = 'imap.gmail.com (Port: 993 SSL)';
      outServer = 'smtp.gmail.com (Port: 465 SSL)';
      defaultLicense = 'Google Workspace Business Starter';
    } else if (type === 'Yandex 360') {
      panelUrl = 'https://admin.yandex.ru';
      inServer = 'imap.yandex.com (Port: 993 SSL)';
      outServer = 'smtp.yandex.com (Port: 465 SSL)';
      defaultLicense = 'Yandex 360 Kurumsal Standart';
    } else if (type === 'cPanel / Webmail') {
      panelUrl = formData.domain_name ? `https://${formData.domain_name}:2096` : 'https://cpanel.domain.com:2083';
      inServer = formData.domain_name ? `mail.${formData.domain_name} (Port: 993 SSL)` : 'mail.domain.com (Port: 993 SSL)';
      outServer = formData.domain_name ? `mail.${formData.domain_name} (Port: 465 SSL)` : 'mail.domain.com (Port: 465 SSL)';
      defaultLicense = 'Hosting Dahili Webmail (Süresiz)';
    }

    setFormData(prev => ({
      ...prev,
      service_type: type,
      admin_panel_url: panelUrl,
      incoming_server: inServer,
      outgoing_server: outServer,
      license_type: defaultLicense
    }));
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full my-6 flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {service ? 'Mail Servisi & Panel Bilgilerini Düzenle' : 'Yeni Kurumsal Mail / Exchange Servisi Ekle'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Yönetim paneli erişim bilgileri, yıllık lisans süresi ve sunucu yapılandırması
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Servis Başlığı ve Türü */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Servis Başlığı / Tanım <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Microsoft 365 & Exchange Online"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/90 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mail Altyapı / Servis Türü
              </label>
              <select
                value={formData.service_type}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/90 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Microsoft 365 / Exchange">Microsoft 365 / Exchange Online</option>
                <option value="Google Workspace">Google Workspace (Gmail Kurumsal)</option>
                <option value="Yandex 360">Yandex 360 Kurumsal</option>
                <option value="cPanel / Webmail">cPanel / DirectAdmin / Webmail</option>
                <option value="Zimbra / Özel Sunucu">Zimbra / On-Premise Exchange</option>
                <option value="Diğer">Diğer Kurumsal Mail Sağlayıcı</option>
              </select>
            </div>
          </div>

          {/* Domain & Panel URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alan Adı (Domain)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="firma.com.tr"
                  value={formData.domain_name}
                  onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/90 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Yönetim Paneli / Webmail Giriş URL
              </label>
              <div className="relative">
                <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="https://admin.microsoft.com"
                  value={formData.admin_panel_url}
                  onChange={(e) => setFormData({ ...formData, admin_panel_url: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/90 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Admin Kullanıcı Adı ve Parola */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Yönetici / Panel Giriş Kimlik Bilgileri</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Yönetici (Admin) Kullanıcı Adı
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="admin@firma.com.tr"
                    value={formData.admin_username}
                    onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Yönetici (Admin) Parolası
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Panel parolası"
                    value={formData.admin_password}
                    onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                    className="w-full pl-9 pr-20 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                      title={showPassword ? 'Gizle' : 'Göster'}
                    >
                      {showPassword ? 'Gizle' : 'Göster'}
                    </button>
                    {formData.admin_password && (
                      <CopyButton text={formData.admin_password} title="Parolayı Kopyala" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                2FA / Kurtarma Notu &amp; Güvenlik Bilgisi
              </label>
              <input
                type="text"
                placeholder="Örn: 2FA Microsoft Authenticator ile aktif. Kurtarma kodu kasada."
                value={formData.portal_notes}
                onChange={(e) => setFormData({ ...formData, portal_notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lisans ve Yıllık Abonelik Takibi (Microsoft Exchange / M365) */}
          <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-blue-950/30 border border-indigo-500/30 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                  Yıllık Lisans &amp; Abonelik Zaman Takibi (Exchange / M365)
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-200">
                <input
                  type="checkbox"
                  checked={formData.is_exchange_or_subscription === 1}
                  onChange={(e) => setFormData({ ...formData, is_exchange_or_subscription: e.target.checked ? 1 : 0 })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold">Lisans Takibi Aktif</span>
              </label>
            </div>

            {formData.is_exchange_or_subscription === 1 && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Lisans Paketi / Plan Adı
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Microsoft 365 Business Standard"
                      value={formData.license_type}
                      onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Toplam Lisans Adedi
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.license_count}
                      onChange={(e) => setFormData({ ...formData, license_count: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Lisans Başlangıç Tarihi
                    </label>
                    <input
                      type="text"
                      placeholder="GG.AA.YYYY veya YYYY-MM-DD"
                      value={formData.license_start_date}
                      onChange={(e) => setFormData({ ...formData, license_start_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-400 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Lisans Bitiş / Yenileme Tarihi *</span>
                    </label>
                    <input
                      type="text"
                      required={formData.is_exchange_or_subscription === 1}
                      placeholder="GG.AA.YYYY veya YYYY-MM-DD"
                      value={formData.license_expiry}
                      onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-rose-500/60 rounded-xl text-xs text-rose-200 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 font-mono font-bold"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      💡 Sistem lisans bitimine 30 gün kala uyarı vermeye başlar.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Lisans Satıcısı / İş Ortağı (Bayi / Reseller)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Microsoft CSP - Arena / DorukNet / Logo vb."
                    value={formData.reseller_partner}
                    onChange={(e) => setFormData({ ...formData, reseller_partner: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gelen / Giden Sunucu & DNS Yapılandırması */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Protokol &amp; Sunucu Bilgileri (İstemci Kurulumu İçin)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Gelen Sunucu (IMAP / POP3)
                </label>
                <input
                  type="text"
                  placeholder="outlook.office365.com (Port: 993 SSL)"
                  value={formData.incoming_server}
                  onChange={(e) => setFormData({ ...formData, incoming_server: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Giden Sunucu (SMTP)
                </label>
                <input
                  type="text"
                  placeholder="smtp.office365.com (Port: 587 STARTTLS)"
                  value={formData.outgoing_server}
                  onChange={(e) => setFormData({ ...formData, outgoing_server: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                DNS Kayıtları Durumu (MX, SPF, DKIM, DMARC)
              </label>
              <input
                type="text"
                placeholder="Örn: MX: outlook.com, SPF: include:spf.protection.outlook.com -all, DKIM: Aktif"
                value={formData.dns_records_status}
                onChange={(e) => setFormData({ ...formData, dns_records_status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Genel Notlar &amp; Açıklama
              </label>
              <textarea
                rows={2}
                placeholder="Şirket e-posta politikaları veya önemli hatırlatmalar..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{service ? 'Değişiklikleri Kaydet' : 'Servisi Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. MAIL ACCOUNT MODAL (User Mailbox, Name, Email, Password, Quota)
// ============================================================================
export function MailAccountModal({
  isOpen,
  onClose,
  onSave,
  account,
  customerId,
  mailServices = [],
  branches = []
}) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    mail_service_id: mailServices[0]?.id || '',
    full_name: '',
    email_address: '',
    password: '',
    department: 'Genel',
    branch_name: 'Merkez Ofis',
    mailbox_type: 'Kullanıcı',
    license_type: 'M365 Business Standard',
    quota_limit: '50 GB',
    phone_or_recovery: '',
    is_mfa_active: 1,
    status: 'Aktif',
    notes: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        customer_id: account.customer_id || customerId,
        mail_service_id: account.mail_service_id || (mailServices[0]?.id || ''),
        full_name: account.full_name || '',
        email_address: account.email_address || '',
        password: account.password || '',
        department: account.department || 'Genel',
        branch_name: account.branch_name || 'Merkez Ofis',
        mailbox_type: account.mailbox_type || 'Kullanıcı',
        license_type: account.license_type || '',
        quota_limit: account.quota_limit || '50 GB',
        phone_or_recovery: account.phone_or_recovery || '',
        is_mfa_active: account.is_mfa_active !== undefined ? (account.is_mfa_active ? 1 : 0) : 1,
        status: account.status || 'Aktif',
        notes: account.notes || ''
      });
    } else {
      setFormData({
        customer_id: customerId,
        mail_service_id: mailServices[0]?.id || '',
        full_name: '',
        email_address: '',
        password: '',
        department: 'Genel',
        branch_name: branches[0] || 'Merkez Ofis',
        mailbox_type: 'Kullanıcı',
        license_type: mailServices[0]?.license_type || 'M365 Business Standard',
        quota_limit: '50 GB',
        phone_or_recovery: '',
        is_mfa_active: 1,
        status: 'Aktif',
        notes: ''
      });
    }
    setShowPassword(false);
  }, [account, customerId, mailServices, branches, isOpen]);

  // Generate strong random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pwd }));
    setShowPassword(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-xl w-full my-6 flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {account ? 'Kullanıcı E-Posta Hesabını Düzenle' : 'Yeni Kullanıcı E-Posta Hesabı Ekle'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kullanıcı adı soyadı, e-posta adresi, parola ve posta kutusu ayarları
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Bağlı Servis & Posta Kutusu Türü */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bağlı Mail Servisi / Alan Adı
              </label>
              <select
                value={formData.mail_service_id}
                onChange={(e) => setFormData({ ...formData, mail_service_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {mailServices.length === 0 ? (
                  <option value="">Varsayılan Mail Servisi</option>
                ) : (
                  mailServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.service_name} ({s.domain_name || s.service_type})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Posta Kutusu Türü
              </label>
              <select
                value={formData.mailbox_type}
                onChange={(e) => setFormData({ ...formData, mailbox_type: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Kullanıcı">Kullanıcı Posta Kutusu</option>
                <option value="Paylaşılan (Shared)">Paylaşılan Posta Kutusu (Shared Mailbox)</option>
                <option value="Dağıtım Grubu">Dağıtım Grubu (Distribution List)</option>
                <option value="Alias / Yönlendirme">Alias / Takma Ad / Yönlendirme</option>
              </select>
            </div>
          </div>

          {/* İsim Soyisim & E-Posta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kullanıcı Adı Soyadı <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-Posta Adresi <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ahmet.yilmaz@firma.com"
                  value={formData.email_address}
                  onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Parola & Üretici */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                E-Posta Parolası
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Rastgele Güçlü Parola Üret</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Hesap parolası (Shared mailbox için boş bırakılabilir)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-24 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
                {formData.password && (
                  <CopyButton text={formData.password} title="Parolayı Kopyala" />
                )}
              </div>
            </div>
          </div>

          {/* Departman & Şube */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Departman
              </label>
              <input
                type="text"
                placeholder="Örn: Muhasebe, Satış, Yönetim..."
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Şube / Lokasyon
              </label>
              <input
                type="text"
                placeholder="Merkez Ofis"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Lisans, Kota, MFA & Durum */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kullanıcı Lisansı
              </label>
              <input
                type="text"
                placeholder="M365 Business Standard"
                value={formData.license_type}
                onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Posta Kotası
              </label>
              <input
                type="text"
                placeholder="50 GB"
                value={formData.quota_limit}
                onChange={(e) => setFormData({ ...formData, quota_limit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hesap Durumu
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              >
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
                <option value="Askıda">Askıda / İzinli</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Telefon / Kurtarma İletişimi
              </label>
              <input
                type="text"
                placeholder="+90 5XX XXX XX XX"
                value={formData.phone_or_recovery}
                onChange={(e) => setFormData({ ...formData, phone_or_recovery: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.is_mfa_active === 1}
                  onChange={(e) => setFormData({ ...formData, is_mfa_active: e.target.checked ? 1 : 0 })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-emerald-400">2FA / MFA Güvenlik Doğrulaması Aktif</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notlar / Zimmet Bilgisi
            </label>
            <input
              type="text"
              placeholder="Örn: PC-MUH-01 ve cep telefonunda kurulu."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{account ? 'Değişiklikleri Kaydet' : 'Hesabı Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
