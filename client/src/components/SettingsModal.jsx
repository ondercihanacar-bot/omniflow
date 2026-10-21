import React, { useState, useEffect } from 'react';
import {
  X, Settings, ShieldCheck, Lock, Unlock, Key, Volume2, VolumeX,
  Sparkles, Database, Download, FileJson, Check, AlertCircle,
  HardDrive, Info, Eye, EyeOff, BellRing, Sliders, ShieldAlert,
  Smartphone, QrCode, RefreshCw, Copy, Users, UserPlus, Trash2, Shield,
  Upload, Film, Globe, Server, Cloud, Laptop, Wifi, BookOpen, CheckSquare, Square,
  Play, Music, Languages, Image, KeyRound, Clock, Mail
} from 'lucide-react';
import { api } from '../api';
import CopyButton from './CopyButton';
import BrandLogo from './BrandLogo';
import LanguageSelector from './LanguageSelector';
import SeamlessVideo from './SeamlessVideo';
import { useLanguage } from '../context/LanguageContext';
import {
  playAlertChime, getSoundEnabled, setSoundEnabled,
  ALERT_SOUNDS, getSelectedSound, setSelectedSound, playSoundById
} from '../utils/licenseAlerts';
import { DEFAULT_PERMISSIONS, ADMIN_PERMISSIONS } from '../utils/permissions';

export const PERMISSION_MODULES = [
  { key: 'internet', label: 'Şubeler & Hatlar', desc: 'İnternet devreleri, IP ve modem bilgileri', icon: Globe, color: 'text-cyan-400', activeBg: 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300' },
  { key: 'servers', label: 'Fiziki Sunucular', desc: 'Fiziksel sunucu donanım ve iLO/iDRAC', icon: Server, color: 'text-indigo-400', activeBg: 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300' },
  { key: 'vms', label: 'Sanal Makineler (VM)', desc: 'VMware/Hyper-V sanal sunucular ve sistemler', icon: Cloud, color: 'text-purple-400', activeBg: 'bg-purple-950/40 border-purple-500/50 text-purple-300' },
  { key: 'computers', label: 'Kullanıcı PC', desc: 'Kullanıcı bilgisayarları ve donanım envanteri', icon: Laptop, color: 'text-emerald-400', activeBg: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' },
  { key: 'firewalls', label: 'Firewall & Güvenlik', desc: 'Güvenlik duvarı cihazları, VPN ve kuralları', icon: Shield, color: 'text-rose-400', activeBg: 'bg-rose-950/40 border-rose-500/50 text-rose-300' },
  { key: 'backups', label: 'Yedekleme (NAS)', desc: 'Synology, QNAP yedekleme üniteleri', icon: Database, color: 'text-amber-400', activeBg: 'bg-amber-950/40 border-amber-500/50 text-amber-300' },
  { key: 'wifi', label: 'Wi-Fi & AP Ağları', desc: 'Wi-Fi kontrolcüleri, AP ve SSID şifreleri', icon: Wifi, color: 'text-sky-400', activeBg: 'bg-sky-950/40 border-sky-500/50 text-sky-300' },
  { key: 'antivirus', label: 'Antivirüs Lisansları', desc: 'Kurumsal antivirüs lisansları ve takibi', icon: ShieldCheck, color: 'text-teal-400', activeBg: 'bg-teal-950/40 border-teal-500/50 text-teal-300' },
  { key: 'mail', label: 'Kurumsal Mail & Exchange', desc: 'Mail panel bilgileri, lisans takibi ve kullanıcı posta kutuları', icon: Mail, color: 'text-blue-400', activeBg: 'bg-blue-950/40 border-blue-500/50 text-blue-300' },
  { key: 'knowledge_base', label: 'IT Kütüphanesi (KB)', desc: 'Hata çözüm rehberleri ve bilgi bankası', icon: BookOpen, color: 'text-amber-300', activeBg: 'bg-amber-950/40 border-amber-500/50 text-amber-300' }
];

function PermissionCheckboxes({ role, setRole, perms, setPerms, isMainAdmin = false }) {
  const currentPerms = perms || DEFAULT_PERMISSIONS;

  const handleToggleModule = (modKey) => {
    setPerms(prev => ({
      ...prev,
      modules: {
        ...(prev.modules || {}),
        [modKey]: !((prev.modules || {})[modKey] !== false)
      }
    }));
  };

  const handleToggleAction = (actionKey) => {
    setPerms(prev => ({
      ...prev,
      [actionKey]: !prev[actionKey]
    }));
  };

  const applyPreset = (presetType) => {
    if (presetType === 'all') {
      const allMods = {};
      PERMISSION_MODULES.forEach(m => { allMods[m.key] = true; });
      setPerms({
        can_view_passwords: true,
        can_edit: true,
        can_delete: true,
        can_export: true,
        modules: allMods
      });
    } else if (presetType === 'readonly') {
      const allMods = {};
      PERMISSION_MODULES.forEach(m => { allMods[m.key] = true; });
      setPerms({
        can_view_passwords: false,
        can_edit: false,
        can_delete: false,
        can_export: true,
        modules: allMods
      });
    } else if (presetType === 'standard') {
      setPerms(DEFAULT_PERMISSIONS);
    } else if (presetType === 'none') {
      const allMods = {};
      PERMISSION_MODULES.forEach(m => { allMods[m.key] = false; });
      setPerms({
        can_view_passwords: false,
        can_edit: false,
        can_delete: false,
        can_export: false,
        modules: allMods
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Role Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">
          Kullanıcı Rolü &amp; Genel Statü
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isMainAdmin}
            onClick={() => {
              setRole('admin');
              setPerms(ADMIN_PERMISSIONS);
            }}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              role === 'admin'
                ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Yönetici (Admin)</div>
              <div className="text-[10px] text-slate-400">Tüm yetkiler ve şifreler açık</div>
            </div>
          </button>

          <button
            type="button"
            disabled={isMainAdmin}
            onClick={() => {
              setRole('user');
              if (role === 'admin') setPerms(DEFAULT_PERMISSIONS);
            }}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              role !== 'admin'
                ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm'
                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${role !== 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Kısıtlı Kullanıcı</div>
              <div className="text-[10px] text-slate-400">Kutucuklarla özel yetkilendirme</div>
            </div>
          </button>
        </div>
      </div>

      {role === 'admin' ? (
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/60 text-purple-200 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
          <span>
            <strong>Yönetici Hesabı:</strong> Bu kullanıcı tüm müşteri envanterlerine, hassas şifrelere, silme/düzenleme işlemlerine ve sistem ayarlarına sınırsız erişime sahiptir.
          </span>
        </div>
      ) : (
        <div className="space-y-4 pt-1 border-t border-slate-800/80">
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Hızlı Yetki Şablonları:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Tümünü Seç
              </button>
              <button
                type="button"
                onClick={() => applyPreset('standard')}
                className="px-2 py-1 rounded bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 text-blue-300 transition-colors cursor-pointer"
              >
                Standart Teknisyen
              </button>
              <button
                type="button"
                onClick={() => applyPreset('readonly')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Salt Okunur (İzleme)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('none')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white transition-colors cursor-pointer"
              >
                Temizle
              </button>
            </div>
          </div>

          {/* Group 1: Critical Security & Operation Permissions */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Kritik Şifre ve İşlem Yetkileri</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* can_view_passwords */}
              <div
                onClick={() => handleToggleAction('can_view_passwords')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  currentPerms.can_view_passwords
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  currentPerms.can_view_passwords ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  <Key className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Hassas Parolaları Görüntüle</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      currentPerms.can_view_passwords
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {currentPerms.can_view_passwords ? 'Açık' : 'Maskeli'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {currentPerms.can_view_passwords
                      ? 'Kullanıcı Sunucu, Firewall, Wi-Fi ve Yedekleme şifrelerini açık görebilir ve kopyalayabilir.'
                      : 'Şifreler "••••••••" olarak maskelenir, açık metin görünmez ve kopyalanamaz.'}
                  </p>
                </div>
              </div>

              {/* can_edit */}
              <div
                onClick={() => handleToggleAction('can_edit')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  currentPerms.can_edit
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  currentPerms.can_edit ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Kayıt Ekleme &amp; Düzenleme</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      currentPerms.can_edit
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {currentPerms.can_edit ? 'Yetkili' : 'Salt Okunur'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Yeni müşteri, sunucu, IP veya lisans ekleyebilir ve var olan kayıtları güncelleyebilir.
                  </p>
                </div>
              </div>

              {/* can_delete */}
              <div
                onClick={() => handleToggleAction('can_delete')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  currentPerms.can_delete
                    ? 'bg-rose-950/40 border-rose-500/60 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  currentPerms.can_delete ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Kayıt Silme Yetkisi</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      currentPerms.can_delete
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {currentPerms.can_delete ? 'Silme Açık' : 'Engelli'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Müşteri veya cihaz kayıtlarını sistemden kalıcı olarak silme yetkisi.
                  </p>
                </div>
              </div>

              {/* can_export */}
              <div
                onClick={() => handleToggleAction('can_export')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  currentPerms.can_export
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  currentPerms.can_export ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Rapor &amp; Dışa Aktarma</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      currentPerms.can_export
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {currentPerms.can_export ? 'Aktif' : 'Gizli'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Müşteri raporlarını PDF/Excel olarak indirme ve yedek dosyası alma yetkisi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Modular Access */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>2. Modül ve Menü Erişim Yetkileri</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {Object.values(currentPerms.modules || {}).filter(Boolean).length} / 9 Modül Açık
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {PERMISSION_MODULES.map(m => {
                const Icon = m.icon;
                const isEnabled = (currentPerms.modules || {})[m.key] !== false;
                return (
                  <div
                    key={m.key}
                    onClick={() => handleToggleModule(m.key)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isEnabled
                        ? m.activeBg + ' shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-60'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isEnabled ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                        <span className="text-xs font-semibold text-white truncate">{m.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsModal({
  isOpen,
  onClose,
  stats,
  isAdminLoggedIn,
  currentUser,
  onLoginAdmin,
  onLogoutAdmin,
  neonEnabled,
  onToggleNeon,
  onUpdateCurrentUser
}) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('auth'); // 'auth' | 'preferences' | 'database' | 'about'

  // Admin login inputs
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTotpCode, setLoginTotpCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginRequiresTotp, setLoginRequiresTotp] = useState(false);

  // Change password inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // 2FA Google Authenticator State
  const [isTotpEnabled, setIsTotpEnabled] = useState(false);
  const [isTotpLoading, setIsTotpLoading] = useState(false);
  const [totpSetupData, setTotpSetupData] = useState(null); // { secret, otpauthUrl, qrCode }
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpSuccess, setTotpSuccess] = useState('');
  const [isDisablingTotp, setIsDisablingTotp] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableToken, setDisableToken] = useState('');

  // Preference states
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled());
  const [selectedSound, setSelectedSoundState] = useState(() => getSelectedSound());
  const [playingSoundId, setPlayingSoundId] = useState(null);
  const [soundCategoryFilter, setSoundCategoryFilter] = useState('all');
  const [requireAdminForDelete, setRequireAdminForDelete] = useState(() => {
    const val = localStorage.getItem('itmanager_require_admin_delete');
    return val !== null ? val === 'true' : false;
  });
  const [licenseThresholdDays, setLicenseThresholdDays] = useState(() => {
    return localStorage.getItem('itmanager_license_threshold_days') || '30';
  });
  const [defaultViewMode, setDefaultViewMode] = useState(() => {
    return localStorage.getItem('itmanager_default_view_mode') || 'cards';
  });

  // User Management state
  const [usersList, setUsersList] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newRegFullName, setNewRegFullName] = useState('');
  const [newRegUsername, setNewRegUsername] = useState('');
  const [newRegPassword, setNewRegPassword] = useState('');
  const [newRegRole, setNewRegRole] = useState('user'); // 'user' | 'admin'
  const [newRegPerms, setNewRegPerms] = useState(DEFAULT_PERMISSIONS);
  const [userActionMsg, setUserActionMsg] = useState('');

  // 2FA for New User in Add User Modal
  const [newRegEnableTotp, setNewRegEnableTotp] = useState(false);
  const [newRegTotpData, setNewRegTotpData] = useState(null); // { secret, otpauthUrl, qrCode }
  const [newRegTotpLoading, setNewRegTotpLoading] = useState(false);

  // Dedicated User 2FA Modal for existing users
  const [userTotpModalUser, setUserTotpModalUser] = useState(null);
  const [userTotpData, setUserTotpData] = useState(null);
  const [userTotpLoading, setUserTotpLoading] = useState(false);
  const [userTotpVerifyCode, setUserTotpVerifyCode] = useState('');
  const [userTotpMsg, setUserTotpMsg] = useState({ error: '', success: '' });

  // Edit existing user permissions state
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('user');
  const [editPerms, setEditPerms] = useState(DEFAULT_PERMISSIONS);
  const [editSaving, setEditSaving] = useState(false);

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSuccess, setLogoSuccess] = useState('');
  const [logoError, setLogoError] = useState('');

  // Auth background upload state
  const [authBgUrl, setAuthBgUrl] = useState(() => {
    try {
      const saved = localStorage.getItem('itmanager_auth_bg_url');
      if (!saved || saved.includes('custom') || saved.includes('null') || saved.includes('undefined')) {
        return '/auth-bg.mp4';
      }
      return saved;
    } catch (e) {
      return '/auth-bg.mp4';
    }
  });
  const [authBgType, setAuthBgType] = useState(() => {
    try {
      return localStorage.getItem('itmanager_auth_bg_type') || 'video';
    } catch (e) {
      return 'video';
    }
  });
  const [authBgFile, setAuthBgFile] = useState(() => {
    try {
      return localStorage.getItem('itmanager_auth_bg_file') || '1.mp4';
    } catch (e) {
      return '1.mp4';
    }
  });
  const [authBgFolder, setAuthBgFolder] = useState('C:\\Users\\Onder\\Desktop\\itmanager\\Giris_Arka_Fon');
  const [authBgFiles, setAuthBgFiles] = useState([]);
  const [authBgSelecting, setAuthBgSelecting] = useState(null);
  const [authBgUploading, setAuthBgUploading] = useState(false);
  const [authBgSuccess, setAuthBgSuccess] = useState('');
  const [authBgError, setAuthBgError] = useState('');

  // Security Shield & Audit Logs State
  const [securityStatus, setSecurityStatus] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  // Auto Backup states
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [autoBackupInterval, setAutoBackupInterval] = useState('daily');
  const [autoBackupRetention, setAutoBackupRetention] = useState(14);
  const [autoBackupLastRun, setAutoBackupLastRun] = useState(null);
  const [autoBackupFolder, setAutoBackupFolder] = useState('C:\\Users\\Onder\\Desktop\\itmanager\\Otomatik_Yedekler');
  const [autoBackupList, setAutoBackupList] = useState([]);
  const [isAutoBackupLoading, setIsAutoBackupLoading] = useState(false);
  const [isAutoBackupRunning, setIsAutoBackupRunning] = useState(false);
  const [autoBackupMsg, setAutoBackupMsg] = useState({ success: '', error: '' });

  // Manual Backup States
  const [isDownloadingDb, setIsDownloadingDb] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [backupActionMsg, setBackupActionMsg] = useState('');

  const loadAutoBackupStatus = async () => {
    try {
      setIsAutoBackupLoading(true);
      const res = await api.getAutoBackupStatus();
      if (res) {
        setAutoBackupEnabled(res.enabled !== false);
        if (res.interval) setAutoBackupInterval(res.interval);
        if (res.retention) setAutoBackupRetention(res.retention);
        if (res.lastRun) setAutoBackupLastRun(res.lastRun);
        if (res.folderPath) setAutoBackupFolder(res.folderPath);
        if (res.backups) setAutoBackupList(res.backups);
      }
    } catch (e) {
      console.warn('Could not load auto backup status:', e);
    } finally {
      setIsAutoBackupLoading(false);
    }
  };

  const loadSecurityDetails = async () => {
    try {
      setIsSecurityLoading(true);
      const [status, logs] = await Promise.all([
        api.getSecurityStatus().catch(() => null),
        api.getSecurityLogs(10).catch(() => [])
      ]);
      if (status) setSecurityStatus(status);
      if (logs) setSecurityLogs(logs);
    } catch (e) {
      console.error('Security details error:', e);
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const loadBackgrounds = async () => {
    try {
      const res = await api.getBackgrounds();
      if (res && res.files) {
        setAuthBgFiles(res.files);
        if (res.activeFile) setAuthBgFile(res.activeFile);
        if (res.activeUrl) setAuthBgUrl(res.activeUrl);
        if (res.activeType) setAuthBgType(res.activeType);
        if (res.folderPath) setAuthBgFolder(res.folderPath);
      }
    } catch (e) {
      console.warn('Could not load backgrounds:', e);
    }
  };

  const loadAuthStatus = async () => {
    try {
      const data = await api.getAuthStatus();
      if (data) {
        setIsTotpEnabled(!!data.isTotpEnabled);
        setLoginRequiresTotp(!!data.isTotpEnabled);
        if (data.authBgFile) setAuthBgFile(data.authBgFile);
        if (data.authBgFolder) setAuthBgFolder(data.authBgFolder);
        if (data.authBgUrl) {
          setAuthBgUrl(data.authBgUrl);
          setAuthBgType(data.authBgType || 'video');
          try {
            localStorage.setItem('itmanager_auth_bg_url', data.authBgUrl);
            localStorage.setItem('itmanager_auth_bg_type', data.authBgType || 'video');
            if (data.authBgFile) localStorage.setItem('itmanager_auth_bg_file', data.authBgFile);
          } catch (e) {}
        }
      }
      loadBackgrounds();
    } catch (err) {
      console.error('Auth status error:', err);
    }
  };

  const loadUsersList = async () => {
    try {
      const list = await api.getUsers();
      setUsersList(list || []);
    } catch (err) {
      console.error('Users load error:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoginError('');
      setLoginSuccess('');
      setPwdError('');
      setPwdSuccess('');
      setTotpError('');
      setTotpSuccess('');
      setLoginPassword('');
      setLoginTotpCode('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTotpSetupData(null);
      setTotpVerifyCode('');
      setIsDisablingTotp(false);
      setDisablePassword('');
      setDisableToken('');
      setShowAddUserModal(false);
      setUserActionMsg('');
      setSoundOn(getSoundEnabled());
      loadAuthStatus();
      loadUsersList();
      loadSecurityDetails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Admin Login (Password + optional Google Authenticator 2FA)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    try {
      const res = await api.loginAdmin({
        password: loginPassword,
        totpCode: loginTotpCode
      });

      if (res.requireTotp) {
        setLoginRequiresTotp(true);
        setLoginError('Google Authenticator 6 haneli doğrulama kodunu girmeniz gerekiyor.');
        return;
      }

      onLoginAdmin();
      setLoginSuccess('Yönetici girişi başarılı! Tüm düzenleme yetkileri açıldı.');
      setLoginPassword('');
      setLoginTotpCode('');
      setTimeout(() => setLoginSuccess(''), 3000);
    } catch (err) {
      setLoginError(err.message || 'Hatalı yönetici parolası veya 2FA kodu!');
    }
  };

  // Handle Master Password Change
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!newPassword || newPassword.length < 4) {
      setPwdError('Yeni parola en az 4 karakter olmalıdır!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('Yeni parolalar birbiriyle eşleşmiyor!');
      return;
    }

    try {
      await api.changeAdminPassword({
        currentPassword,
        newPassword
      });

      localStorage.setItem('itmanager_admin_password', newPassword);
      setPwdSuccess('Yönetici parolası başarıyla güncellendi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(''), 3500);
    } catch (err) {
      setPwdError(err.message || 'Parola güncellenemedi!');
    }
  };

  // Start Google Authenticator Setup
  const handleStartTotpSetup = async () => {
    setIsTotpLoading(true);
    setTotpError('');
    setTotpSuccess('');
    try {
      const data = await api.setupTotp({
        userId: currentUser?.id,
        username: currentUser?.username || 'onder.cihan.acar@gmail.com'
      });
      setTotpSetupData(data);
    } catch (err) {
      setTotpError(err.message || '2FA kurulum QR kodu oluşturulamadı.');
    } finally {
      setIsTotpLoading(false);
    }
  };

  // Confirm Google Authenticator Code and Enable 2FA
  const handleConfirmEnableTotp = async (e) => {
    e.preventDefault();
    if (!totpVerifyCode || totpVerifyCode.trim().length !== 6) {
      setTotpError('Lütfen Google Authenticator uygulamasındaki 6 haneli kodu eksiksiz girin.');
      return;
    }

    setTotpError('');
    setTotpSuccess('');
    try {
      await api.enableTotp({
        userId: currentUser?.id,
        username: currentUser?.username,
        secret: totpSetupData.secret,
        token: totpVerifyCode.trim()
      });
      setIsTotpEnabled(true);
      setLoginRequiresTotp(true);
      setTotpSetupData(null);
      setTotpVerifyCode('');
      setTotpSuccess('Tebrikler! Google Authenticator ile İki Adımlı Doğrulama başarıyla aktifleştirildi.');
      loadUsersList();
      setTimeout(() => setTotpSuccess(''), 4000);
    } catch (err) {
      setTotpError(err.message || 'Girdiğiniz 6 haneli kod doğrulanamadı!');
    }
  };

  // Disable 2FA
  const handleDisableTotpSubmit = async (e) => {
    e.preventDefault();
    setTotpError('');
    setTotpSuccess('');
    try {
      await api.disableTotp({
        userId: currentUser?.id,
        username: currentUser?.username,
        password: disablePassword,
        token: disableToken
      });
      setIsTotpEnabled(false);
      setLoginRequiresTotp(false);
      setIsDisablingTotp(false);
      setDisablePassword('');
      setDisableToken('');
      setTotpSuccess('Google Authenticator iki adımlı doğrulaması kapatıldı.');
      loadUsersList();
      setTimeout(() => setTotpSuccess(''), 3500);
    } catch (err) {
      setTotpError(err.message || '2FA devre dışı bırakılamadı. Parolayı ve kodu kontrol edin.');
    }
  };

  // User Management Handlers
  const handleToggleNewRegTotp = async (enabled) => {
    setNewRegEnableTotp(enabled);
    if (enabled && !newRegTotpData) {
      try {
        setNewRegTotpLoading(true);
        const res = await api.setupTotp({ username: newRegUsername.trim() || 'yeni_kullanici' });
        setNewRegTotpData(res);
      } catch (e) {
        console.error('New user totp setup error:', e);
      } finally {
        setNewRegTotpLoading(false);
      }
    }
  };

  const handleRegenerateNewRegTotp = async () => {
    try {
      setNewRegTotpLoading(true);
      const res = await api.setupTotp({ username: newRegUsername.trim() || 'yeni_kullanici' });
      setNewRegTotpData(res);
    } catch (e) {
      console.error('New user totp setup error:', e);
    } finally {
      setNewRegTotpLoading(false);
    }
  };

  const handleOpenUserTotpModal = async (u) => {
    setUserTotpModalUser(u);
    setUserTotpMsg({ error: '', success: '' });
    setUserTotpVerifyCode('');
    try {
      setUserTotpLoading(true);
      const res = await api.setupTotp({ userId: u.id, username: u.username });
      setUserTotpData(res);
    } catch (e) {
      setUserTotpMsg({ error: e.message || '2FA kurulum bilgisi alınamadı', success: '' });
    } finally {
      setUserTotpLoading(false);
    }
  };

  const handleActivateUserTotp = async (adminBypass = false) => {
    if (!userTotpModalUser || !userTotpData) return;
    if (!adminBypass && !userTotpVerifyCode.trim()) {
      setUserTotpMsg({ error: 'Lütfen 6 haneli doğrulama kodunu girin.', success: '' });
      return;
    }
    try {
      setUserTotpLoading(true);
      setUserTotpMsg({ error: '', success: '' });
      await api.enableTotp({
        userId: userTotpModalUser.id,
        username: userTotpModalUser.username,
        secret: userTotpData.secret,
        token: userTotpVerifyCode.trim() || '000000',
        adminBypass
      });
      setUserTotpMsg({ error: '', success: 'Google Authenticator (2FA) başarıyla aktifleştirildi!' });
      loadUsersList();
      setTimeout(() => {
        setUserTotpModalUser(null);
      }, 1200);
    } catch (e) {
      setUserTotpMsg({ error: e.message || 'Doğrulama kodu hatalı!', success: '' });
    } finally {
      setUserTotpLoading(false);
    }
  };

  const handleResetUserTotp = async (userId) => {
    if (!window.confirm('Bu kullanıcının Google Authenticator (2FA) korumasını sıfırlamak istediğinize emin misiniz?')) {
      return;
    }
    try {
      setUserTotpLoading(true);
      await api.resetUserTotp(userId);
      setUserTotpMsg({ error: '', success: '2FA koruması sıfırlandı!' });
      loadUsersList();
      setTimeout(() => {
        setUserTotpModalUser(null);
      }, 1200);
    } catch (e) {
      setUserTotpMsg({ error: e.message || '2FA sıfırlanamadı', success: '' });
    } finally {
      setUserTotpLoading(false);
    }
  };

  const handleCreateNewUser = async (e) => {
    e.preventDefault();
    if (!newRegUsername.trim() || !newRegPassword) return;
    try {
      await api.registerUser({
        username: newRegUsername.trim(),
        email: newRegUsername.trim(),
        full_name: newRegFullName.trim() || newRegUsername.trim(),
        password: newRegPassword,
        role: newRegRole,
        permissions: newRegRole === 'admin' ? ADMIN_PERMISSIONS : newRegPerms,
        totp_secret: newRegEnableTotp && newRegTotpData ? newRegTotpData.secret : null,
        totp_enabled: newRegEnableTotp && newRegTotpData ? 1 : 0
      });
      setUserActionMsg(`Yeni ${newRegRole === 'admin' ? 'yönetici' : 'kullanıcı'} hesabı ${newRegEnableTotp ? '(2FA Korumalı) ' : ''}başarıyla eklendi!`);
      setNewRegFullName('');
      setNewRegUsername('');
      setNewRegPassword('');
      setNewRegRole('user');
      setNewRegPerms(DEFAULT_PERMISSIONS);
      setNewRegEnableTotp(false);
      setNewRegTotpData(null);
      setShowAddUserModal(false);
      loadUsersList();
      setTimeout(() => setUserActionMsg(''), 3500);
    } catch (err) {
      alert(err.message || 'Kullanıcı oluşturulamadı');
    }
  };

  const handleSaveUserPermissions = async (e) => {
    if (e) e.preventDefault();
    if (!editingUser) return;
    try {
      setEditSaving(true);
      await api.updateUserPermissions(editingUser.id, {
        role: editRole,
        permissions: editRole === 'admin' ? ADMIN_PERMISSIONS : editPerms
      });

      setUserActionMsg(`"${editingUser.username}" kullanıcısının yetkileri başarıyla güncellendi!`);

      // If editing current logged in user, refresh session
      if (currentUser && (currentUser.id === editingUser.id || currentUser.username === editingUser.username)) {
        const updatedUser = {
          ...currentUser,
          role: editRole,
          permissions: editRole === 'admin' ? ADMIN_PERMISSIONS : editPerms
        };
        try {
          const raw = sessionStorage.getItem('itmanager_user_session');
          if (raw) {
            const parsed = JSON.parse(raw);
            const newSession = { ...parsed, user: updatedUser };
            sessionStorage.setItem('itmanager_user_session', JSON.stringify(newSession));
          }
          localStorage.removeItem('itmanager_user_session');
          localStorage.removeItem('itmanager_admin_logged_in');
        } catch (e) {}
        if (typeof onUpdateCurrentUser === 'function') {
          onUpdateCurrentUser(updatedUser);
        }
      }

      setEditingUser(null);
      loadUsersList();
      setTimeout(() => setUserActionMsg(''), 3500);
    } catch (err) {
      alert(err.message || 'Yetkiler güncellenemedi');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`"${u.username}" kullanıcısını silmek istediğinize emin misiniz?`)) return;
    try {
      await api.deleteUser(u.id);
      loadUsersList();
    } catch (err) {
      alert(err.message || 'Kullanıcı silinemedi');
    }
  };

  const handleToggleSound = (checked) => {
    setSoundOn(checked);
    setSoundEnabled(checked);
  };

  const handleTestSound = (soundId = selectedSound) => {
    setPlayingSoundId(soundId);
    playSoundById(soundId);
    setTimeout(() => {
      setPlayingSoundId(null);
    }, 750);
  };

  const handleSelectSound = (soundId) => {
    setSelectedSoundState(soundId);
    setSelectedSound(soundId);
    handleTestSound(soundId);
  };

  const handleToggleRequireAdminForDelete = (checked) => {
    setRequireAdminForDelete(checked);
    localStorage.setItem('itmanager_require_admin_delete', String(checked));
  };

  const handleChangeThreshold = (val) => {
    setLicenseThresholdDays(val);
    localStorage.setItem('itmanager_license_threshold_days', val);
  };

  const handleChangeDefaultView = (val) => {
    setDefaultViewMode(val);
    localStorage.setItem('itmanager_default_view_mode', val);
    localStorage.setItem('itmanager_view_mode_vms', val);
    localStorage.setItem('itmanager_view_mode_pcs', val);
    localStorage.setItem('itmanager_view_mode_servers', val);
    localStorage.setItem('itmanager_view_mode_antivirus', val);
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setLogoError('Logo dosyası boyutu maksimum 50 MB olabilir.');
      return;
    }

    setLogoUploading(true);
    setLogoError('');
    setLogoSuccess('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        await api.uploadLogo(dataUrl, file.name);
        setLogoSuccess('Logo başarıyla yüklendi! Sistem yeni logo ile güncellendi.');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setLogoError(err.message || 'Logo yüklenemedi.');
      } finally {
        setLogoUploading(false);
      }
    };
    reader.onerror = () => {
      setLogoError('Dosya okunamadı.');
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAuthBgFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 60 * 1024 * 1024) {
      setAuthBgError(language === 'tr' ? 'Arka plan dosyası boyutu maksimum 60 MB olabilir.' : 'Background file size must be under 60 MB.');
      return;
    }

    setAuthBgUploading(true);
    setAuthBgError('');
    setAuthBgSuccess('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        const res = await api.uploadAuthBg(dataUrl, file.name);
        setAuthBgFile(res.activeFile || file.name);
        setAuthBgUrl(res.url);
        setAuthBgType(res.type);
        try {
          localStorage.setItem('itmanager_auth_bg_url', res.url);
          localStorage.setItem('itmanager_auth_bg_type', res.type);
          if (res.activeFile) localStorage.setItem('itmanager_auth_bg_file', res.activeFile);
        } catch (e) {}
        setAuthBgSuccess(`${res.activeFile || file.name} başarıyla yüklendi ve aktif arka plan yapıldı.`);
        loadBackgrounds();
        setTimeout(() => setAuthBgSuccess(''), 3500);
      } catch (err) {
        setAuthBgError(err.message || (language === 'tr' ? 'Arka plan yüklenemedi.' : 'Background could not be uploaded.'));
      } finally {
        setAuthBgUploading(false);
      }
    };
    reader.onerror = () => {
      setAuthBgError(language === 'tr' ? 'Dosya okunamadı.' : 'File could not be read.');
      setAuthBgUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleResetAuthBg = async () => {
    setAuthBgUploading(true);
    setAuthBgError('');
    setAuthBgSuccess('');
    try {
      const res = await api.resetAuthBg();
      setAuthBgFile(res.activeFile || '1.mp4');
      setAuthBgUrl(res.url);
      setAuthBgType(res.type);
      try {
        localStorage.setItem('itmanager_auth_bg_url', res.url);
        localStorage.setItem('itmanager_auth_bg_type', res.type);
        localStorage.setItem('itmanager_auth_bg_file', res.activeFile || '1.mp4');
      } catch (e) {}
      setAuthBgSuccess('Giriş ekranı arka planı 1 nolu hareketli resme (1.mp4) sıfırlandı.');
      loadBackgrounds();
      setTimeout(() => setAuthBgSuccess(''), 3500);
    } catch (err) {
      setAuthBgError(err.message || (language === 'tr' ? 'Arka plan sıfırlanamadı.' : 'Could not reset background.'));
    } finally {
      setAuthBgUploading(false);
    }
  };

  const handleSelectBackground = async (filename) => {
    try {
      setAuthBgSelecting(filename);
      setAuthBgError('');
      const res = await api.selectBackground(filename);
      setAuthBgFile(res.activeFile);
      setAuthBgUrl(res.url);
      setAuthBgType(res.type);
      try {
        localStorage.setItem('itmanager_auth_bg_url', res.url);
        localStorage.setItem('itmanager_auth_bg_type', res.type);
        localStorage.setItem('itmanager_auth_bg_file', res.activeFile);
      } catch (e) {}
      setAuthBgSuccess(`${filename} başarıyla aktif arka plan olarak seçildi.`);
      setTimeout(() => setAuthBgSuccess(''), 3500);
      loadBackgrounds();
    } catch (err) {
      setAuthBgError(err.message || 'Arka plan seçilemedi.');
    } finally {
      setAuthBgSelecting(null);
    }
  };

  // Auto-Backup Handlers
  const handleToggleAutoBackup = async (enabled) => {
    setAutoBackupEnabled(enabled);
    try {
      await api.saveAutoBackupSettings({
        enabled,
        interval: autoBackupInterval,
        retention: autoBackupRetention
      });
      setAutoBackupMsg({
        success: enabled ? 'Otomatik yedekleme etkinleştirildi.' : 'Otomatik yedekleme devre dışı bırakıldı.',
        error: ''
      });
      setTimeout(() => setAutoBackupMsg({ success: '', error: '' }), 3500);
    } catch (e) {
      setAutoBackupMsg({ success: '', error: 'Ayar kaydedilemedi' });
    }
  };

  const handleChangeAutoBackupConfig = async (key, val) => {
    if (key === 'interval') setAutoBackupInterval(val);
    if (key === 'retention') setAutoBackupRetention(val);
    try {
      await api.saveAutoBackupSettings({
        enabled: autoBackupEnabled,
        interval: key === 'interval' ? val : autoBackupInterval,
        retention: key === 'retention' ? val : autoBackupRetention
      });
      setAutoBackupMsg({ success: 'Yedekleme ayarı kaydedildi.', error: '' });
      setTimeout(() => setAutoBackupMsg({ success: '', error: '' }), 3500);
    } catch (e) {
      setAutoBackupMsg({ success: '', error: 'Ayar kaydedilemedi' });
    }
  };

  const handleRunAutoBackupNow = async () => {
    try {
      setIsAutoBackupRunning(true);
      setAutoBackupMsg({ success: '', error: '' });
      const res = await api.runAutoBackupNow();
      setAutoBackupMsg({ success: res.message || 'Otomatik veritabanı ve JSON yedeği başarıyla alındı!', error: '' });
      loadAutoBackupStatus();
      setTimeout(() => setAutoBackupMsg({ success: '', error: '' }), 4000);
    } catch (e) {
      setAutoBackupMsg({ success: '', error: e.message || 'Yedekleme sırasında hata oluştu' });
    } finally {
      setIsAutoBackupRunning(false);
    }
  };

  const handleDownloadAutoBackupFile = async (filename) => {
    try {
      await api.downloadAutoBackupFile(filename);
    } catch (e) {
      alert('Yedek dosyası indirilemedi: ' + e.message);
    }
  };

  // Manual Backup Handlers
  const handleDownloadDb = async () => {
    try {
      setIsDownloadingDb(true);
      setBackupActionMsg('');
      await api.downloadDbBackup();
      setBackupActionMsg('itmanager.db SQLite veritabanı başarıyla indirildi!');
      setTimeout(() => setBackupActionMsg(''), 4000);
    } catch (e) {
      alert('Veritabanı indirilemedi: ' + e.message);
    } finally {
      setIsDownloadingDb(false);
    }
  };

  const handleExportJson = async () => {
    try {
      setIsExportingJson(true);
      setBackupActionMsg('');
      await api.exportAllJson();
      setBackupActionMsg('Tüm sistem verileri JSON olarak başarıyla dışa aktarıldı!');
      setTimeout(() => setBackupActionMsg(''), 4000);
    } catch (e) {
      alert('JSON yedeği alınamadı: ' + e.message);
    } finally {
      setIsExportingJson(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Yönetici Girişi &amp; Sistem Ayarları</h3>
                {isAdminLoggedIn ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Yönetici Aktif
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Kilitli Mod
                  </span>
                )}
                {isTotpEnabled && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center gap-1">
                    <Smartphone className="w-2.5 h-2.5" />
                    2FA Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Sistem yetkileri, Google Authenticator (2FA), tercihler ve veritabanı yönetimi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('auth')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'auth'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Yönetici Girişi &amp; Güvenlik</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Arayüz &amp; Uyarı Tercihleri</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Veritabanı &amp; Yedekleme</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Sistem &amp; Lisans Bilgisi</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: AUTH & SECURITY */}
          {activeTab === 'auth' && (
            <div className="space-y-6">
              {/* Session Status Banner */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isAdminLoggedIn
                  ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isAdminLoggedIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isAdminLoggedIn ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{isAdminLoggedIn ? 'Yönetici Oturumu Açık' : 'Yönetici Girişi Yapılmadı'}</span>
                      {isTotpEnabled && (
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          Google Authenticator 2FA Aktif
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAdminLoggedIn
                        ? 'Tüm sistem yapılandırması, kayıt ekleme, düzenleme ve silme işlemleri için tam yetkilendirildiniz.'
                        : 'Sistem şu anda standart modda çalışıyor. Kritik işlemleri yönetmek için şifreniz ve varsa 2FA kodunuzla giriş yapın.'}
                    </p>
                  </div>
                </div>

                {isAdminLoggedIn && (
                  <button
                    onClick={onLogoutAdmin}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    Oturumu Kapat
                  </button>
                )}
              </div>

              {/* Login Form (if not logged in) */}
              {!isAdminLoggedIn && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-400" />
                    <span>Yönetici Girişi</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Varsayılan ilk yönetici parolası: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono">admin123</code>.
                    {isTotpEnabled && (
                      <span className="text-blue-400 ml-1 font-semibold">
                        (Google Authenticator iki adımlı doğrulama aktiftir, lütfen telefonunuzdaki 6 haneli kodu da girin).
                      </span>
                    )}
                  </p>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className={`grid grid-cols-1 ${isTotpEnabled ? 'sm:grid-cols-2' : ''} gap-3`}>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Yönetici Parolası
                        </label>
                        <div className="relative">
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Parolanızı girin..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-10"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Google Authenticator 2FA Token field during login */}
                      {isTotpEnabled && (
                        <div>
                          <label className="block text-xs font-medium text-blue-300 mb-1.5 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                            <span>Google Authenticator 6 Haneli Kod</span>
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={loginTotpCode}
                            onChange={(e) => setLoginTotpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="Örn: 123456"
                            className="w-full bg-slate-900 border border-blue-500/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono tracking-widest text-center focus:outline-none focus:border-blue-400"
                          />
                        </div>
                      )}
                    </div>

                    {loginError && (
                      <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {loginSuccess && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{loginSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Yönetici Olarak Giriş Yap</span>
                    </button>
                  </form>
                </div>
              )}

              {/* ================= GOOGLE AUTHENTICATOR (2FA) SECTION ================= */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Google Authenticator ile İki Adımlı Doğrulama (2FA)</span>
                        {isTotpEnabled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            Devre Dışı
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Yönetici girişlerinde telefonunuzdaki Google Authenticator veya Microsoft Authenticator uygulamasındaki 30 saniyelik şifreleri zorunlu kılarak güvenliği en üst seviyeye taşır.
                      </p>
                    </div>
                  </div>

                  {!isTotpEnabled ? (
                    <button
                      onClick={handleStartTotpSetup}
                      disabled={isTotpLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                    >
                      {isTotpLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Oluşturuluyor...</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Google Authenticator Kur</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsDisablingTotp(!isDisablingTotp)}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                    >
                      2FA'yı Devre Dışı Bırak
                    </button>
                  )}
                </div>

                {totpSuccess && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-900">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{totpSuccess}</span>
                  </div>
                )}

                {totpError && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-900">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{totpError}</span>
                  </div>
                )}

                {/* 2FA Setup Step-by-Step Card */}
                {totpSetupData && !isTotpEnabled && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-900 border border-blue-500/40 space-y-4 animate-fadeIn">
                    <div className="border-b border-slate-800 pb-3">
                      <h5 className="text-sm font-bold text-white flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-blue-400" />
                        <span>Google Authenticator Kurulum Sihirbazı</span>
                      </h5>
                      <p className="text-xs text-slate-400 mt-1">
                        1. Telefonunuzdaki <strong>Google Authenticator</strong> uygulamasını açın.<br />
                        2. <strong>+</strong> butonuna basıp <strong>QR Kodu Tara</strong> seçeneğini seçin ve aşağıdaki kodu kameranıza gösterin.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
                      {/* QR Code Display */}
                      <div className="p-3 bg-white rounded-2xl shadow-lg shrink-0">
                        <img
                          src={totpSetupData.qrCode}
                          alt="Google Authenticator QR Code"
                          className="w-44 h-44 block"
                        />
                      </div>

                      {/* Manual Code & Confirmation Form */}
                      <div className="flex-1 space-y-3.5 w-full">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Kameranız çalışmıyorsa bu gizli anahtarı elle ekleyebilirsiniz:
                          </span>
                          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 font-mono text-xs text-blue-300">
                            <span className="truncate tracking-wider font-bold">{totpSetupData.secret}</span>
                            <CopyButton text={totpSetupData.secret} title="Gizli Anahtarı Kopyala" />
                          </div>
                        </div>

                        <form onSubmit={handleConfirmEnableTotp} className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              3. Uygulamanızda beliren 6 haneli doğrulama kodunu girin:
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={totpVerifyCode}
                              onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="Örn: 582910"
                              className="w-full bg-slate-950 border border-blue-500/70 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest text-white focus:outline-none focus:border-blue-400"
                              autoFocus
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setTotpSetupData(null)}
                              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                            >
                              İptal
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Doğrula ve 2FA'yı Aktif Et</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2FA Disable Form */}
                {isDisablingTotp && isTotpEnabled && (
                  <form onSubmit={handleDisableTotpSubmit} className="mt-3 p-4 bg-slate-900 border border-rose-900/60 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-rose-300">Google Authenticator Korumasını Kapat</h5>
                    <p className="text-[11px] text-slate-400">
                      Güvenlik doğrulaması için mevcut yönetici parolanızı girin:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Yönetici parolası..."
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        required
                      />
                      <input
                        type="text"
                        maxLength={6}
                        value={disableToken}
                        onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
                        placeholder="Telefonunuzdaki 6 haneli kod..."
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-center focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsDisablingTotp(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow"
                      >
                        2FA'yı Kapat
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Password Change Form */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Yönetici Parolasını Değiştir</span>
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Sistem güvenliğiniz için varsayılan parolayı kendi belirleyeceğiniz güçlü bir parolayla değiştirmeniz önerilir.
                </p>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Mevcut Parola
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Mevcut parola..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Yeni Parola
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="En az 4 karakter..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Yeni Parola (Tekrar)
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Yeni parolayı onaylayın..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {pwdError && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pwdError}</span>
                    </div>
                  )}

                  {pwdSuccess && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{pwdSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    Parolayı Güncelle
                  </button>
                </form>
              </div>

              {/* Registered Users & Account Management */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Kayıtlı Kullanıcı Hesapları</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                          {usersList.length} Kullanıcı
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Sisteme kullanıcı adı ve şifreyle giriş yapabilecek yetkili yöneticilerin listesi.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(!showAddUserModal)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Yeni Kullanıcı Ekle</span>
                  </button>
                </div>

                {userActionMsg && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-900">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{userActionMsg}</span>
                  </div>
                )}

                {/* Add User Form Drawer / Card */}
                {showAddUserModal && (
                  <form onSubmit={handleCreateNewUser} className="p-4 sm:p-5 bg-slate-900 border border-blue-500/40 rounded-xl space-y-4 animate-fadeIn shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-blue-400" />
                        <span>Yeni Kullanıcı Hesabı &amp; Yetki Tanımlama</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Adı Soyadı
                        </label>
                        <input
                          type="text"
                          value={newRegFullName}
                          onChange={(e) => setNewRegFullName(e.target.value)}
                          placeholder="Örn: Mehmet Yılmaz"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Kullanıcı Adı / E-posta <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={newRegUsername}
                          onChange={(e) => setNewRegUsername(e.target.value)}
                          placeholder="Örn: mehmet.yilmaz@sirket.com"
                          required
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Giriş Parolası <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="password"
                          value={newRegPassword}
                          onChange={(e) => setNewRegPassword(e.target.value)}
                          placeholder="Parola belirleyin..."
                          required
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Modular & Action Permission Checkboxes */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-400" />
                        <span>Kullanıcı Erişim &amp; Menü Yetkileri</span>
                      </div>
                      <PermissionCheckboxes
                        role={newRegRole}
                        setRole={setNewRegRole}
                        perms={newRegPerms}
                        setPerms={setNewRegPerms}
                      />
                    </div>

                    {/* Google Authenticator (2FA) Initial Setup for New User */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${newRegEnableTotp ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>Google Authenticator (2FA) ile Koru</span>
                              {newRegEnableTotp ? (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-semibold">
                                  Aktif Edilecek
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                  İsteğe Bağlı
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Kullanıcı sisteme giriş yaparken akıllı telefonundaki Google veya Microsoft Authenticator kodunu girmek zorunda olur.
                            </p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newRegEnableTotp}
                            onChange={(e) => handleToggleNewRegTotp(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {newRegEnableTotp && (
                        <div className="pt-3 border-t border-slate-800/80 animate-fadeIn">
                          {newRegTotpLoading ? (
                            <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                              <span>Kullanıcıya özel 2FA anahtarı ve QR kod üretiliyor...</span>
                            </div>
                          ) : newRegTotpData ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-900/90 p-4 rounded-xl border border-emerald-900/40">
                              <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-lg border border-slate-200">
                                <img
                                  src={newRegTotpData.qrCode}
                                  alt="2FA QR Code"
                                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                                />
                                <span className="text-[10px] text-slate-700 font-bold mt-1">Google Authenticator</span>
                              </div>

                              <div className="sm:col-span-2 space-y-2.5">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Gizli Kurulum Anahtarı (Secret Key)</span>
                                  </label>
                                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                                    <code className="text-xs font-mono text-emerald-400 font-bold select-all tracking-wider break-all flex-1">
                                      {newRegTotpData.secret}
                                    </code>
                                    <CopyButton text={newRegTotpData.secret} />
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-[11px] text-emerald-300 space-y-1">
                                  <p className="font-semibold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>İlk Kurulum Adımları:</span>
                                  </p>
                                  <p className="text-slate-300 text-[10px] leading-relaxed">
                                    1. Bu QR kodu veya gizli anahtarı çalışanınızla paylaşın.<br />
                                    2. Çalışan telefonundaki Google Authenticator ile QR kodu okutacak.<br />
                                    3. "Kullanıcıyı Kaydet" butonuna bastığınızda hesap 2FA zorunlu olarak açılır.
                                  </p>
                                </div>

                                <div className="flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={handleRegenerateNewRegTotp}
                                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Yeni anahtar oluştur"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Farklı Anahtar Üret</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Kullanıcıyı Kaydet</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Users Table */}
                <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                        <th className="py-2.5 px-3 font-semibold">Kullanıcı</th>
                        <th className="py-2.5 px-3 font-semibold">E-posta / Kullanıcı Adı</th>
                        <th className="py-2.5 px-3 font-semibold">Rol</th>
                        <th className="py-2.5 px-3 font-semibold">Yetki Özeti &amp; İzinler</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Google 2FA</th>
                        <th className="py-2.5 px-3 font-semibold text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-500">
                            Henüz kayıtlı kullanıcı bulunamadı.
                          </td>
                        </tr>
                      ) : (
                        usersList.map((u) => {
                          const isMainAdmin = u.username === 'onder.cihan.acar@gmail.com' || u.username === 'admin';
                          const isCurrentUser = currentUser?.id === u.id || currentUser?.username === u.username;
                          
                          // Permissions breakdown
                          let perms = u.permissions;
                          if (typeof perms === 'string') {
                            try { perms = JSON.parse(perms); } catch (e) { perms = null; }
                          }
                          const effectivePerms = perms || (u.role === 'admin' ? ADMIN_PERMISSIONS : DEFAULT_PERMISSIONS);
                          const enabledModCount = Object.values(effectivePerms.modules || {}).filter(Boolean).length;
                          const canViewPw = effectivePerms.can_view_passwords === true;
                          const canEdit = effectivePerms.can_edit !== false;
                          const canDelete = effectivePerms.can_delete === true;

                          return (
                            <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold">
                                  {(u.full_name || u.username || 'U')[0].toUpperCase()}
                                </div>
                                <span>{u.full_name || u.username}</span>
                                {isCurrentUser && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    Siz
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400">
                                {u.username}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  u.role === 'admin'
                                    ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}>
                                  {u.role === 'admin' ? 'Yönetici' : 'Kısıtlı Yetkili'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                {u.role === 'admin' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/80">
                                    <ShieldCheck className="w-3 h-3 text-purple-400" />
                                    <span>Tam Yetkili</span>
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {canViewPw ? (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800" title="Şifreleri görebilir">
                                        👁️ Şifre Açık
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800" title="Şifreler maskeli">
                                        🔒 Şifre Gizli
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800/80" title="Erişebildiği Modül Sayısı">
                                      {enabledModCount}/9 Modül
                                    </span>
                                    {canDelete ? (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                                        Silme Açık
                                      </span>
                                    ) : null}
                                    {!canEdit ? (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                                        Salt Okunur
                                      </span>
                                    ) : null}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {u.totp_enabled ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenUserTotpModal(u)}
                                    className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-semibold cursor-pointer transition-colors shadow-sm"
                                    title="Google 2FA Ayarlarını Yönet veya Sıfırla"
                                  >
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span>Aktif (Yönet)</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenUserTotpModal(u)}
                                    className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-blue-950/80 text-blue-400 hover:text-blue-300 border border-slate-700 hover:border-blue-700 font-semibold cursor-pointer transition-colors shadow-sm"
                                    title="Bu kullanıcıya Google Authenticator 2FA Tanımla"
                                  >
                                    <KeyRound className="w-3 h-3 text-blue-400" />
                                    <span>+ 2FA Kur</span>
                                  </button>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {isMainAdmin ? (
                                  <span className="text-[10px] text-slate-500 italic">Ana Hesap</span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingUser(u);
                                        setEditRole(u.role || 'user');
                                        setEditPerms(effectivePerms);
                                      }}
                                      className="px-2 py-1 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-lg border border-slate-700 hover:border-blue-500 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                      title="Kullanıcı Yetkilerini Düzenle"
                                    >
                                      <Sliders className="w-3 h-3 text-blue-400 group-hover:text-white" />
                                      <span>Yetkileri Düzenle</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u)}
                                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                      title="Kullanıcıyı Sil"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Edit Existing User Permissions Modal Dialog */}
                {editingUser && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-slate-900 border border-blue-500/50 rounded-2xl max-w-3xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            <Sliders className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <span>Kullanıcı Yetkilerini Yapılandır:</span>
                              <span className="text-blue-400 font-mono">
                                {editingUser.full_name || editingUser.username}
                              </span>
                            </h4>
                            <p className="text-xs text-slate-400">
                              Kullanıcının erişebileceği modülleri, şifre görme ve silme yetkilerini kutucuklarla ayarlayın.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1">
                        <PermissionCheckboxes
                          role={editRole}
                          setRole={setEditRole}
                          perms={editPerms}
                          setPerms={setEditPerms}
                          isMainAdmin={editingUser.username === 'onder.cihan.acar@gmail.com'}
                        />
                      </div>

                      <div className="border-t border-slate-800 pt-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                          Vazgeç
                        </button>
                        <button
                          type="button"
                          disabled={editSaving}
                          onClick={handleSaveUserPermissions}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-2"
                        >
                          {editSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Kaydediliyor...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Yetkileri Kaydet</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* User 2FA Setup & Reset Modal Dialog */}
                {userTotpModalUser && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-slate-900 border border-blue-500/50 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <span>Google 2FA Yönetimi:</span>
                              <span className="text-blue-400 font-mono">
                                {userTotpModalUser.full_name || userTotpModalUser.username}
                              </span>
                            </h4>
                            <p className="text-xs text-slate-400">
                              {userTotpModalUser.totp_enabled
                                ? 'İki adımlı doğrulama bu kullanıcıda aktif durumda.'
                                : 'Bu kullanıcı için Google Authenticator kurulumu yapın.'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUserTotpModalUser(null)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Messages */}
                      {userTotpMsg.error && (
                        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>{userTotpMsg.error}</span>
                        </div>
                      )}
                      {userTotpMsg.success && (
                        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>{userTotpMsg.success}</span>
                        </div>
                      )}

                      {userTotpLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                          <span>İşlem yapılıyor, lütfen bekleyin...</span>
                        </div>
                      ) : userTotpModalUser.totp_enabled ? (
                        /* When user already has 2FA active */
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-white mb-1">2FA Koruması Açık</p>
                              <p className="text-slate-300 text-[11px] leading-relaxed">
                                Bu çalışan sisteme giriş yaparken kullanıcı adı ve şifresinin yanında telefonundaki Google Authenticator kodunu girmek zorundadır.
                              </p>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                            <h5 className="text-xs font-bold text-slate-200">Çalışan Telefonunu mu Değiştirdi veya Kaybetti?</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Eğer çalışan telefonunu değiştirdiyse veya Authenticator uygulamasını sildiyse, aşağıdaki butonla 2FA korumasını sıfırlayabilirsiniz.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleResetUserTotp(userTotpModalUser.id)}
                                className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                <span>2FA Korumasını Sıfırla (Kaldır)</span>
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-slate-800 pt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setUserTotpModalUser(null)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                            >
                              Kapat
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* When user does not have 2FA active yet */
                        <div className="space-y-4">
                          {userTotpData && (
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                                <div className="p-2.5 bg-white rounded-xl shadow-md shrink-0">
                                  <img
                                    src={userTotpData.qrCode}
                                    alt="2FA QR Code"
                                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                                  />
                                </div>
                                <div className="space-y-2 flex-1 min-w-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gizli Anahtar (Secret Key):</span>
                                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                                    <code className="text-xs font-mono text-emerald-400 font-bold select-all tracking-wider break-all flex-1">
                                      {userTotpData.secret}
                                    </code>
                                    <CopyButton text={userTotpData.secret} />
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-relaxed">
                                    1. QR kodu Google Authenticator ile okutun.<br />
                                    2. İsterseniz telefondaki 6 haneli kodu yazarak test edin veya doğrudan yönetici onayıyla aktifleştirin.
                                  </p>
                                </div>
                              </div>

                              {/* Verify input */}
                              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                                <label className="block text-[11px] font-medium text-slate-300">
                                  Telefondaki 6 Haneli Doğrulama Kodu (İsteğe Bağlı Test)
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    maxLength={6}
                                    value={userTotpVerifyCode}
                                    onChange={(e) => setUserTotpVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Örn: 123456"
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-center tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleActivateUserTotp(false)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer transition-colors flex items-center gap-1.5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Kodu Doğrula &amp; Aç</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleActivateUserTotp(true)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow cursor-pointer transition-colors flex items-center gap-1.5"
                              title="Kodu test etmeden doğrudan aktifleştir"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Doğrudan Aktifleştir (Yönetici Onayı)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserTotpModalUser(null)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                            >
                              Kapat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Safety Delete Guard Toggle */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Silme İşlemleri İçin Yönetici Koruması</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Aktif edildiğinde müşteri, sunucu veya cihaz silme butonları sadece Yönetici Girişi yapılmışken çalışır. Yanlışlıkla veri kaybını önler.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={requireAdminForDelete}
                    onChange={(e) => handleToggleRequireAdminForDelete(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PREFERENCES & UI */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              {/* Custom Logo Upload Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Sistem Logosu (MP4 Video / Animasyon)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Üst menü çubuğunda ve giriş ekranında gösterilecek kurumsal MP4 logonuzu doğrudan seçip yükleyebilirsiniz.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    <BrandLogo size="md" variant="terminal" />
                    <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{logoUploading ? 'Yükleniyor...' : 'MP4 Logo Seç & Yükle'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,image/*"
                        onChange={handleLogoFileChange}
                        disabled={logoUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="text-slate-300 font-semibold flex items-center gap-1">
                    <span>💡 Alternatif Dosya Yolu:</span>
                  </div>
                  <div>
                    MP4 video dosyanızı doğrudan bilgisayarınızda şu konuma <code className="text-blue-400 font-mono">logo.mp4</code> adıyla kopyalayabilirsiniz:
                  </div>
                  <div className="font-mono text-xs text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 select-all">
                    c:\Users\Onder\Desktop\itmanager\client\public\logo.mp4
                  </div>
                </div>

                {logoSuccess && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-900">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{logoSuccess}</span>
                  </div>
                )}

                {logoError && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-900">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{logoError}</span>
                  </div>
                )}
              </div>

              {/* Dil Seçeneği / Language Selection Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{t('settings.languageTitle')}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-850 uppercase">
                        {language}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t('settings.languageDesc')}
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <LanguageSelector variant="default" />
                </div>
              </div>

              {/* Giriş Ekranı Arka Planı (Video / Görsel Yükleme) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
                      <Image className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{t('settings.authBgTitle')}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {authBgType === 'image' ? t('settings.bgFormatImage') : t('settings.bgFormatVideo')}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t('settings.authBgDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Choose & Upload + Reset to Default */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <label className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{authBgUploading ? t('settings.bgUploading') : t('settings.uploadBgBtn')}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,image/*"
                        onChange={handleAuthBgFileChange}
                        disabled={authBgUploading}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleResetAuthBg}
                      disabled={authBgUploading}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                      title={t('settings.resetBgBtn')}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${authBgUploading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{t('settings.resetBgBtn')}</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Container */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-36 sm:h-44 flex items-center justify-center group shadow-inner">
                  {authBgType === 'image' ? (
                    <img
                      key={authBgUrl}
                      src={authBgUrl}
                      alt="Login Background Preview"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <SeamlessVideo
                      key={authBgUrl}
                      src={authBgUrl}
                      fadeDuration={1.2}
                      className="w-full h-full object-cover object-center"
                      containerClassName="relative w-full h-full overflow-hidden"
                    />
                  )}
                  {/* Subtle dark gradient overlay mimicking the actual login screen */}
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px]"></div>
                  
                  {/* Overlay badge with sample mock login mini-badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 border border-slate-700/60 rounded-full text-[10px] font-mono text-cyan-300 backdrop-blur-md shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>{t('settings.bgPreview')}</span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-[10px] font-mono text-slate-400 backdrop-blur-sm">
                    {authBgType.toUpperCase()}
                  </div>
                </div>

                {/* Background Selection Grid from Giris_Arka_Fon */}
                {authBgFiles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-cyan-400" />
                        <span>Giriş Arka Fon Klasöründeki Dosyalar ({authBgFiles.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={loadBackgrounds}
                        className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Klasörü yeniden tara"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Klasörü Yenile</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {authBgFiles.map((file) => {
                        const isCurrent = (authBgFile === file.filename) || (authBgUrl && authBgUrl.includes(file.filename));
                        const isSelecting = authBgSelecting === file.filename;
                        return (
                          <div
                            key={file.filename}
                            onClick={() => handleSelectBackground(file.filename)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden group ${
                              isCurrent
                                ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/50'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`p-1.5 rounded-lg shrink-0 ${isCurrent ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                  {file.type === 'video' ? <Film className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate">
                                    {file.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {file.filename} &bull; {(file.size / (1024 * 1024)).toFixed(1)} MB
                                  </div>
                                </div>
                              </div>

                              {isCurrent && (
                                <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Seçili</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                              <span className="text-slate-500 uppercase tracking-wider font-mono">{file.type}</span>
                              <span className={`font-semibold transition-colors ${isCurrent ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`}>
                                {isSelecting ? 'Uygulanıyor...' : isCurrent ? 'Şu An Aktif' : 'Tıkla ve Seç →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* File path box exactly requested by user */}
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-200 font-bold flex items-center gap-1.5">
                      <span>📁 Giriş Arka Fon Dosya Yolu:</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {authBgFile || '1.mp4'} Seçili
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Giris_Arka_Fon
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                    <span className="font-mono text-xs text-cyan-400 font-semibold select-all break-all flex-1">
                      {`C:\\Users\\Onder\\Desktop\\itmanager\\Giris_Arka_Fon\\${authBgFile || '1.mp4'}`}
                    </span>
                    <CopyButton text={`C:\\Users\\Onder\\Desktop\\itmanager\\Giris_Arka_Fon\\${authBgFile || '1.mp4'}`} />
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    💡 <strong>İpucu:</strong> Arka plan olarak kullanmak istediğiniz tüm hareketli MP4 videolarını veya görselleri doğrudan <code className="text-cyan-300 font-mono">C:\Users\Onder\Desktop\itmanager\Giris_Arka_Fon</code> klasörüne atabilirsiniz. Sistem dosyayı otomatik olarak tanır ve yukarıdaki seçenekler arasına ekler.
                  </p>
                </div>

                {authBgSuccess && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-900">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{authBgSuccess}</span>
                  </div>
                )}

                {authBgError && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-900">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authBgError}</span>
                  </div>
                )}
              </div>

              {/* Neon Glow Toggle */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Neon Işık Efekti (Cyberpunk Aura)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {neonEnabled ? 'Açık' : 'Kapalı'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Genel bakış sekmesindeki özet kartlarının arkasında canlı neon renk aurası ve parlama efektini açıp kapatabilirsiniz.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={neonEnabled}
                    onChange={(e) => onToggleNeon(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* 20 Technological & Sci-Fi Alert Sounds Selector */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                      {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Lisans Bitişi &amp; Sistem Uyarı Sesleri</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-blue-950 text-blue-300 border-blue-800">
                          20 Farklı Ses
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          soundOn ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {soundOn ? 'Aktif' : 'Sessiz'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Lisans süresi yaklaşan güvenlik cihazları için çalınacak fütüristik, siber veya klasik uyarı sesini seçin.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={soundOn}
                      onChange={(e) => handleToggleSound(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {soundOn && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {[
                        { key: 'all', label: 'Tüm Sesler (20)' },
                        { key: 'Teknolojik & Siber', label: 'Teknolojik & Siber (7)' },
                        { key: 'Sinyal & Radar', label: 'Sinyal & Radar (5)' },
                        { key: 'Bildirim & Melodi', label: 'Bildirim & Melodi (6)' },
                        { key: 'Kritik & Alarm', label: 'Kritik & Alarm (2)' }
                      ].map(cat => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setSoundCategoryFilter(cat.key)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            soundCategoryFilter === cat.key
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Sounds Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {ALERT_SOUNDS
                        .filter(s => soundCategoryFilter === 'all' || s.category === soundCategoryFilter)
                        .map(sound => {
                          const isSelected = selectedSound === sound.id;
                          const isPlaying = playingSoundId === sound.id;

                          return (
                            <div
                              key={sound.id}
                              onClick={() => handleSelectSound(sound.id)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                isSelected
                                  ? 'bg-amber-950/40 border-amber-500/80 shadow-sm shadow-amber-950/30'
                                  : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                                  isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {sound.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                                      {sound.name}
                                    </span>
                                    {isSelected && (
                                      <span className="text-[10px] text-amber-400 font-bold shrink-0">✓ Seçili</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate">{sound.description}</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTestSound(sound.id);
                                }}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                                  isPlaying
                                    ? 'bg-amber-500 text-slate-950 font-bold scale-105'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                }`}
                                title="Bu sesi dinle"
                              >
                                {isPlaying ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                                    <span>Çalıyor</span>
                                  </span>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[11px]">Dinle</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    {/* Active Sound Indicator Bar */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Geçerli Uyarı Sesi:</span>
                        <span className="font-bold text-amber-300 font-mono">
                          {ALERT_SOUNDS.find(s => s.id === selectedSound)?.name || 'Cyber Chime'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTestSound(selectedSound)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm shadow-amber-900/30"
                      >
                        <BellRing className="w-3.5 h-3.5 fill-current" />
                        <span>Seçili Sesi Test Et</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Default View Mode Setting */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>Varsayılan Cihaz &amp; Lisans Görünüm Modu</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Sanal Makineler, Kullanıcı PC, Sunucu ve Antivirüs sekmeleri açıldığında tercih edilen görünüm:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label
                    onClick={() => handleChangeDefaultView('cards')}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      defaultViewMode === 'cards'
                        ? 'bg-blue-950/40 border-blue-500/80 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="defaultViewMode"
                      value="cards"
                      checked={defaultViewMode === 'cards'}
                      onChange={() => {}}
                      className="sr-only"
                    />
                    <div className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 border-blue-500">
                      {defaultViewMode === 'cards' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-200">🗂️ Kartlar (Sığdır Görünümü)</span>
                      <span className="text-[11px] text-slate-400 block">Yatay kaydırma gerektirmeyen kompakt kartlar</span>
                    </div>
                  </label>

                  <label
                    onClick={() => handleChangeDefaultView('table')}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      defaultViewMode === 'table'
                        ? 'bg-blue-950/40 border-blue-500/80 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="defaultViewMode"
                      value="table"
                      checked={defaultViewMode === 'table'}
                      onChange={() => {}}
                      className="sr-only"
                    />
                    <div className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 border-blue-500">
                      {defaultViewMode === 'table' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-200">📊 Detaylı Tablo Görünümü</span>
                      <span className="text-[11px] text-slate-400 block">Tüm teknik özellikleri sütun sütun gösteren geniş tablo</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* License Alert Threshold */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Lisans Uyarısı Bildirim Eşiği</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Firewall ve Antivirüs lisans bitişine kaç gün kala bildirim ışığının yanıp sönmesini istersiniz?
                  </p>
                </div>

                <select
                  value={licenseThresholdDays}
                  onChange={(e) => handleChangeThreshold(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 shrink-0"
                >
                  <option value="15">15 Gün Önceden (Varsayılan)</option>
                  <option value="30">30 Gün Önceden</option>
                  <option value="45">45 Gün Önceden</option>
                  <option value="60">60 Gün Önceden</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE & MAINTENANCE */}
          {activeTab === 'database' && (
            <div className="space-y-5">
              {/* Database Overview */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">SQLite Yerel Veritabanı</h4>
                      <p className="text-xs text-slate-400 font-mono">server/data/itmanager.db (Node.js Native SQLite)</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Aktif &amp; Bağlı
                  </span>
                </div>
              </div>

              {backupActionMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{backupActionMsg}</span>
                </div>
              )}

              {/* Direct Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SQLite DB Download */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-400" />
                      <span>Veritabanı Dosyasını İndir (.db)</span>
                    </h5>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Gerçek SQLite veritabanı dosyasını bilgisayarınıza indirip harici disk veya bulut sürücülerinde güvenle saklayabilirsiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isDownloadingDb}
                    onClick={handleDownloadDb}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDownloadingDb ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>İndiriliyor...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>itmanager.db Dosyasını İndir</span>
                      </>
                    )}
                  </button>
                </div>

                {/* JSON Full Export */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-amber-400" />
                      <span>Tüm Verileri JSON Olarak Dışa Aktar</span>
                    </h5>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Tüm müşteriler, antivirüs lisansları, sunucular, sanal makineler, lisanslar ve IT çözümlerini JSON dosyası olarak aktarır.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isExportingJson}
                    onClick={handleExportJson}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isExportingJson ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dışa Aktarılıyor...</span>
                      </>
                    ) : (
                      <>
                        <FileJson className="w-4 h-4" />
                        <span>Tam JSON Yedek Al</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Otomatik Yedekleme Sistemi (Auto-Backup Engine) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Otomatik Periyodik Yedekleme</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          autoBackupEnabled
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {autoBackupEnabled ? 'Aktif (Çalışıyor)' : 'Devre Dışı'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Sistem belirlenen periyotlarda SQLite veritabanı ve JSON yedeklerini otomatik olarak alır ve arşivler.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 self-start sm:self-center">
                    <input
                      type="checkbox"
                      checked={autoBackupEnabled}
                      onChange={(e) => handleToggleAutoBackup(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Configuration Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Yedekleme Sıklığı (Periyot)
                    </label>
                    <select
                      value={autoBackupInterval}
                      onChange={(e) => handleChangeAutoBackupConfig('interval', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="6h">Her 6 Saatte Bir</option>
                      <option value="12h">Her 12 Saatte Bir</option>
                      <option value="daily">Günde 1 Kez (Her 24 Saatte)</option>
                      <option value="weekly">Haftada 1 Kez</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Saklanacak Yedek Sayısı (Arşiv)
                    </label>
                    <select
                      value={autoBackupRetention}
                      onChange={(e) => handleChangeAutoBackupConfig('retention', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="7">Son 7 Yedek (Eski olanlar silinir)</option>
                      <option value="14">Son 14 Yedek</option>
                      <option value="30">Son 30 Yedek</option>
                      <option value="60">Son 60 Yedek</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      disabled={isAutoBackupRunning}
                      onClick={handleRunAutoBackupNow}
                      className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAutoBackupRunning ? 'animate-spin' : ''}`} />
                      <span>{isAutoBackupRunning ? 'Yedek Alınıyor...' : 'Şimdi Otomatik Yedek Al'}</span>
                    </button>
                  </div>
                </div>

                {/* Backup Folder Path */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <span>📁 Otomatik Yedeklerin Kaydedildiği Klasör:</span>
                    </span>
                    {autoBackupLastRun && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Son Yedek: {new Date(autoBackupLastRun).toLocaleString('tr-TR')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="font-mono text-xs text-purple-300 select-all break-all flex-1">
                      {autoBackupFolder || 'C:\\Users\\Onder\\Desktop\\itmanager\\Otomatik_Yedekler'}
                    </span>
                    <CopyButton text={autoBackupFolder || 'C:\\Users\\Onder\\Desktop\\itmanager\\Otomatik_Yedekler'} />
                  </div>
                </div>

                {/* Message feedback */}
                {autoBackupMsg.success && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{autoBackupMsg.success}</span>
                  </div>
                )}
                {autoBackupMsg.error && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{autoBackupMsg.error}</span>
                  </div>
                )}

                {/* Backups List Table */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>Arşivdeki Otomatik Yedekler ({autoBackupList.length})</span>
                    <button
                      type="button"
                      onClick={loadAutoBackupStatus}
                      className="text-[11px] text-slate-400 hover:text-purple-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Listeyi Yenile</span>
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/50">
                    {autoBackupList.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        Henüz otomatik yedek dosyası bulunmuyor. "Şimdi Otomatik Yedek Al" butonuna basarak anında ilk yedeğinizi oluşturabilirsiniz.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                            <th className="py-2 px-3">Dosya Adı</th>
                            <th className="py-2 px-3">Format</th>
                            <th className="py-2 px-3">Boyut</th>
                            <th className="py-2 px-3">Yedeklenme Tarihi</th>
                            <th className="py-2 px-3 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-300">
                          {autoBackupList.map((backup) => (
                            <tr key={backup.filename} className="hover:bg-slate-900/40 transition-colors">
                              <td className="py-2 px-3 font-mono text-white text-[11px] truncate max-w-[200px]">
                                {backup.filename}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                  backup.filename.endsWith('.db')
                                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}>
                                  {backup.type}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                                {backup.sizeFormatted}
                              </td>
                              <td className="py-2 px-3 text-slate-400 text-[11px]">
                                {backup.dateFormatted}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadAutoBackupFile(backup.filename)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                                  title="Bu yedek dosyasını bilgisayara indir"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>İndir</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT & LICENSE */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center space-y-3">
                <div className="flex justify-center mb-3">
                  <BrandLogo size="banner" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white tracking-tight">OmniFlow</h4>
                  <p className="text-xs text-blue-400 font-mono font-medium">Sürüm 2.4 (Enterprise Edition)</p>
                </div>
                <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                  OmniFlow kurumsal IT altyapısı, sanallaştırma, antivirüs &amp; lisans takibi, firewall, ağ güvenliği, Google Authenticator (2FA) ve bilgi birikimi yönetimi platformu.
                </p>

                {/* Permanent Developer Copyright Invariant */}
                <div className="pt-4 mt-4 border-t border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-200">
                    Designed &amp; Developed by <span className="text-blue-400 font-bold tracking-wide">Önder Cihan ACAR</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    &copy; 2026. All Rights Reserved.
                  </p>
                </div>
              </div>

              {/* System Specs */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-2.5 text-xs">
                <h5 className="font-bold text-white mb-2">Mimari Detayları</h5>
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                  <span>Frontend Çatısı:</span>
                  <span className="font-mono text-slate-200">React 18 + Tailwind CSS + Lucide Icons</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                  <span>Backend Motoru:</span>
                  <span className="font-mono text-slate-200">Node.js Express (Port 5000)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                  <span>İki Adımlı Doğrulama (2FA):</span>
                  <span className="font-mono text-emerald-400">RFC 6238 TOTP (Google Authenticator)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400">
                  <span>Veritabanı Motoru:</span>
                  <span className="font-mono text-slate-200">SQLite (node:sqlite DatabaseSync)</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Lisans Tipi:</span>
                  <span className="font-medium text-emerald-400">Ömür Boyu Tam Yetkili Pro</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-mono">
            OmniFlow v2.4 • Önder Cihan ACAR
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
