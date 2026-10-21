import React, { createContext, useContext, useState, useEffect } from 'react';

// Comprehensive dictionary for Turkish (TR) and English (EN)
export const translations = {
  tr: {
    // General / Common
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      close: 'Kapat',
      search: 'Ara',
      filter: 'Filtrele',
      loading: 'Yükleniyor...',
      actions: 'İşlemler',
      all: 'Tümü',
      active: 'Aktif',
      passive: 'Pasif',
      status: 'Durum',
      unit: 'Adet',
      devices: 'Cihaz',
      yes: 'Evet',
      no: 'Hayır',
      copy: 'Kopyala',
      copied: 'Kopyalandı!',
      refresh: 'Yenile',
      total: 'Toplam',
      or: 'veya',
      error: 'Hata',
      success: 'Başarılı',
      notes: 'Notlar',
      warning: 'Uyarı',
      confirmDeleteTitle: 'Silme Onayı',
      confirmDeleteMsg: 'Bu kaydı silmek istediğinize emin misiniz?'
    },

    // Authentication / Login Screen
    auth: {
      secureLogin: 'Güvenli Sistem Girişi',
      loginTab: 'Giriş Yap',
      registerTab: 'Kayıt Ol',
      emailOrUsername: 'E-Posta veya Kullanıcı Adı',
      emailOrUsernamePlaceholder: 'ornek@sirket.com veya kullanici_adi',
      password: 'Şifre / Parola',
      passwordPlaceholder: '••••••••',
      fullName: 'Ad Soyad',
      fullNamePlaceholder: 'Örn: Ahmet Yılmaz',
      newUsername: 'Kullanıcı Adı veya E-Posta',
      newUsernamePlaceholder: 'ornek@sirket.com veya kullanici',
      newPassword: 'Güçlü Bir Parola Belirleyin',
      confirmPassword: 'Parolayı Tekrar Girin',
      confirmPasswordPlaceholder: 'Parolanızı doğrulayın',
      passwordMismatch: 'Girilen parolalar birbiriyle eşleşmiyor!',
      passwordTooShort: 'Parola en az 4 karakter olmalıdır.',
      rememberMe: 'Beni bu cihazda hatırla',
      loginBtn: 'Sisteme Giriş Yap',
      registerBtn: 'Kullanıcı Hesabını Oluştur',
      loggingIn: 'Giriş yapılıyor...',
      creatingAccount: 'Hesap oluşturuluyor...',
      loginSuccess: 'Giriş başarılı, sisteme yönlendiriliyorsunuz...',
      registerSuccess: 'Kullanıcı kaydı başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.',
      authenticatorTitle: 'Google Authenticator (2FA)',
      authenticatorDesc: 'Lütfen telefonunuzdaki 6 haneli doğrulama kodunu girin',
      totpPlaceholder: '6 Haneli TOTP Kodu (Örn: 123456)',
      verifyAndLogin: 'Kodu Doğrula & Giriş Yap',
      verifying: 'Doğrulanıyor...',
      cancel2FA: 'Geri Dön / İptal',
      langSelect: 'Dil Seçeneği / Language',
      authMascotTooltip: 'Omni AI - Güvenli Sistem Girişi'
    },

    // Top Navbar
    navbar: {
      goHome: 'Ana Sayfaya Git (OmniFlow)',
      searchPlaceholder: 'IP, MAC, Lisans ara...',
      searchKbd: 'Ctrl+K',
      searchTooltip: 'Sistemde Ara (Ctrl+K)',
      kbButton: 'Kütüphane',
      customersButton: 'Müşteriler',
      kbTooltipToCustomer: 'Müşteri Yönetim Paneline Dön',
      kbTooltipToKB: 'IT Sorun & Çözüm Kütüphanesini Aç',
      licenseUrgentAlert: 'Adet Lisans Bitişi Yaklaştı veya Doldu!',
      licensesOk: 'Tüm Lisanslar Güncel (Firewall & Antivirüs)',
      licensesOkShort: 'Lisanslar OK',
      licenseBadge: 'Lisans',
      statCustomers: 'Müşteri',
      statServers: 'Sunucu',
      statVMs: 'VM',
      statPCs: 'PC',
      statFWs: 'FW',
      downloadDb: 'DB',
      downloadDbTooltip: 'Veritabanı Dosyasını (.db) İndir',
      exportJson: 'JSON',
      exportJsonTooltip: 'Tüm Verileri JSON Olarak Dışa Aktar',
      settings: 'Ayarlar',
      settingsTooltip: 'Yönetici Girişi & Sistem Ayarları',
      adminRole: 'Yönetici',
      restrictedRole: 'Kısıtlı Yetkili',
      logout: 'Oturumu Kapat',
      logoutTooltip: 'Oturumu Kapat & Çıkış Yap',
      systemSettings: 'Sistem Ayarları',
      systemSettingsDesc: 'Veritabanı, yedekler ve güvenlik',
      logoutDesc: 'Güvenli çıkış yap ve oturumu sonlandır',
      userMenu: 'Kullanıcı Menüsü',
      toggleSidebarHide: 'Sol Menüyü Gizle (Geniş Ekran Modu)',
      toggleSidebarShow: 'Sol Menüyü Göster'
    },

    // Sidebar
    sidebar: {
      customers: 'Müşteriler',
      addCustomer: 'Yeni Müşteri Ekle',
      searchCustomer: 'Müşteri veya IP ara...',
      kbButton: 'IT Çözüm Kütüphanesi',
      kbShort: 'KB',
      noCustomerFound: 'Müşteri bulunamadı.',
      noCustomerYet: 'Kayıtlı müşteri yok.',
      deviceBadge: 'Cihaz',
      serverTooltip: 'Fiziki Sunucu',
      vmTooltip: 'Sanal Sunucu (VM)',
      pcTooltip: 'Kullanıcı PC',
      fwTooltip: 'Firewall',
      nasTooltip: 'Yedek NAS',
      wifiTooltip: 'Wi-Fi AP',
      mailTooltip: 'Kurumsal Mail'
    },

    // Main Tabs & Workspace
    tabs: {
      overview: 'Genel Bakış',
      topology: 'Ağ Topolojisi',
      lines: 'Şubeler & Hatlar',
      servers: 'Fiziki Sunucular',
      vms: 'Sanal Makineler',
      pcs: 'Kullanıcı PC',
      firewalls: 'Güvenlik Duvarı',
      antivirus: 'Antivirüs & EDR',
      backups: 'Yedekleme & NAS',
      wifi: 'Wi-Fi Altyapısı',
      mail: 'Mail',
      mailTooltip: 'Kurumsal Mail Paneli, Exchange Aboneliği & Kullanıcı Hesapları',
      exportExcel: 'Excel Dökümü',
      exportExcelTooltip: 'Müşteri Envanterini Excel Olarak İndir (.xlsx)',
      reportPdf: 'PDF / Rapor Al',
      reportPdfTooltip: 'Departman ve Lisans Dökümünü PDF / Rapor Olarak Al',
      editCustomer: 'Düzenle',
      deleteCustomer: 'Müşteriyi Sil',
      noCustomerSelected: 'Henüz Bir Müşteri Seçilmedi',
      noCustomerSelectedDesc: 'Altyapı, sunucular, sanal makineler, lisanslar, firewall ve yedekleme cihazlarını yönetmek için sol menüden bir müşteri seçin veya yeni bir müşteri ekleyin.',
      addFirstCustomer: 'İlk Müşteriyi Ekle'
    },

    // Overview Tab Stat Cards
    overview: {
      physicalServer: 'Fiziki Sunucu',
      virtualMachine: 'Sanal Makine',
      userPc: 'Kullanıcı PC',
      firewallDevice: 'Firewall Cihazı',
      antivirusLicenses: 'Antivirüs & EDR',
      backupUnits: 'Yedekleme Ünitesi',
      internetLines: 'İnternet Hattı',
      wifiInfra: 'Wi-Fi & AP',
      mailAccounts: 'Kurumsal Mail',
      licensedOS: 'Lisanslı İşletim Sistemi',
      officeLicenses: 'Office Lisansı',
      viewAll: 'Tümünü Gör',
      quickAdd: 'Hızlı Ekle',
      branchDistribution: 'Şube Dağılımı',
      systemHealth: 'Sistem Durumu',
      allOk: 'Tüm Sistemler Normal',
      unitQty: 'Adet',
      vmQty: 'VM',
      clientQty: 'İstemci',
      deviceQty: 'Cihaz',
      unitPackage: 'Paket',
      unitUser: 'Kul.',
      unitNas: 'Ünite',
      unitAp: 'Cihaz/Ağ',
      unitAccount: 'Hesap'
    },

    // Device & Module Common
    modules: {
      branch: 'Şube / Lokasyon',
      mainOffice: 'Merkez Ofis',
      allBranches: 'Tüm Şubeler',
      department: 'Departman',
      allDepartments: 'Tüm Departmanlar',
      tableView: 'Tablo',
      cardsView: 'Kartlar (Sığdır)',
      hardwareSpecs: 'Donanım Özellikleri',
      remoteAccessId: 'Uzak Masaüstü / AnyDesk ID',
      ipAddress: 'IP Adresi',
      macAddress: 'MAC Adresi',
      serialNumber: 'Seri Numarası',
      licenseExpiry: 'Lisans Bitiş Tarihi',
      daysLeft: 'Gün Kaldı',
      expired: 'Süresi Doldu!',
      brandModel: 'Marka & Model'
    },

    // AI Mascot
    ai: {
      mascotTitle: 'Omni AI Asistan',
      version: 'v2.4',
      speech1: 'Merhaba! Ben Omni AI. Altyapınızı 7/24 izliyorum.',
      speech2Alert: '⚠️ Dikkat: {count} adet lisansın süresi yaklaşıyor!',
      speech2Ok: '🟢 Harika! Tüm ağ ve firewall lisansları güncel ve güvende.',
      speech3: 'İpucu: Klavyeden Ctrl + K tuşlayarak anında sistem araması yapabilirsiniz.',
      speech4: 'Hızlı rapor almak veya ayarları değiştirmek için bana tıklayabilirsiniz.',
      quickSearch: 'Hızlı Arama & Filtre',
      quickSearchDesc: 'Tüm müşteri ve cihazları tara',
      licenseAlerts: 'Lisans Uyarıları',
      customerReport: 'Müşteri Raporu (A4 / Excel)',
      customerReportDesc: 'PDF Önizleme',
      settings2FA: 'Ayarlar & 2FA Doğrulama',
      settings2FADesc: 'Yönetim',
      testSound: 'Uyarı Sesini Dinle',
      online: 'Çevrimiçi',
      integratedAi: 'OmniFlow Entegre Yapay Zeka',
      openPanel: 'Omni AI Asistanı',
      closePanel: 'Omni AI Panelini Kapat',
      maximize: 'Omni AI Asistanını Büyüt',
      liveMonitoring: 'Canlı Altyapı İzlemede',
      urgentAlertBanner: 'Kritik Lisans Uyarısı!',
      urgentAlertDesc: '{count} adet cihaz/lisans bitişe yaklaştı',
      inspect: 'İncele →',
      systemStable: 'Sistem Stabil & Güvenli',
      noUrgentAlert: 'Kritik lisans uyarısı bulunmuyor',
      metricsCustomers: 'Müşteriler',
      metricsServerVm: 'Sunucu & VM',
      metricsPcs: 'Kullanıcı PC',
      quickActionsTitle: 'Hızlı Eylemler & Kısayollar',
      universalSearch: 'Evrensel Arama',
      licenseTracking: 'Lisans Takip & Uyarılar',
      clean: 'Temiz',
      alertCount: '{count} Uyarı',
      listenAlertSoundDesc: 'Seçili uyarı sesini anında test et',
      minimizeTitle: 'Simge Durumuna Küçült',
      closeTitle: 'Paneli Kapat',
      mascotActive: 'Omni AI Aktif'
    },

    // Settings Modal
    settings: {
      title: 'Yönetim & Sistem Ayarları',
      languageTitle: 'Dil Seçeneği / Language Selection',
      languageDesc: 'OmniFlow arayüz dilini Türkçe veya İngilizce olarak buradan değiştirebilirsiniz.',
      currentLang: 'Geçerli Dil',
      authBgTitle: 'Giriş Ekranı Arka Planı (Video / Görsel)',
      authBgDesc: 'Giriş ekranında gösterilecek tam ekran video (MP4/WebM) veya görsel (JPG/PNG/WebP) arka planınızı buradan yükleyebilirsiniz.',
      uploadBgBtn: 'Arka Plan Seç & Yükle',
      resetBgBtn: 'Varsayılana Sıfırla',
      bgPreview: 'Giriş Ekranı Canlı Önizleme',
      bgUploading: 'Yükleniyor...',
      bgSuccess: 'Arka plan başarıyla yüklendi ve sisteme uygulandı!',
      bgResetSuccess: 'Arka plan varsayılan dinamik videoya sıfırlandı.',
      bgFormatVideo: 'Dinamik Video',
      bgFormatImage: 'Sabit Görsel',
      bgFilePathTip: '💡 Alternatif Dosya Yolu: Video dosyanızı doğrudan aşağıdaki konuma auth-bg.mp4 adıyla kopyalayabilirsiniz:',
      tabs: {
        auth: 'Yönetici & Güvenlik',
        preferences: 'Arayüz & Uyarı Tercihleri',
        database: 'Veritabanı & Yedek',
        about: 'Hakkında & Lisans'
      }
    }
  },

  en: {
    // General / Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      actions: 'Actions',
      all: 'All',
      active: 'Active',
      passive: 'Inactive',
      status: 'Status',
      unit: 'Qty',
      devices: 'Devices',
      yes: 'Yes',
      no: 'No',
      copy: 'Copy',
      copied: 'Copied!',
      refresh: 'Refresh',
      total: 'Total',
      or: 'or',
      error: 'Error',
      success: 'Success',
      notes: 'Notes',
      warning: 'Warning',
      confirmDeleteTitle: 'Confirm Delete',
      confirmDeleteMsg: 'Are you sure you want to delete this record?'
    },

    // Authentication / Login Screen
    auth: {
      secureLogin: 'Secure System Login',
      loginTab: 'Sign In',
      registerTab: 'Register',
      emailOrUsername: 'Email or Username',
      emailOrUsernamePlaceholder: 'user@company.com or username',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      fullName: 'Full Name',
      fullNamePlaceholder: 'e.g. John Doe',
      newUsername: 'Username or Email',
      newUsernamePlaceholder: 'user@company.com or username',
      newPassword: 'Create a Strong Password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      passwordMismatch: 'Passwords do not match!',
      passwordTooShort: 'Password must be at least 4 characters long.',
      rememberMe: 'Remember me on this device',
      loginBtn: 'Sign In to System',
      registerBtn: 'Create User Account',
      loggingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      loginSuccess: 'Login successful, redirecting to system...',
      registerSuccess: 'Account created successfully! You can now log in.',
      authenticatorTitle: 'Google Authenticator (2FA)',
      authenticatorDesc: 'Please enter the 6-digit verification code from your phone',
      totpPlaceholder: '6-Digit TOTP Code (e.g. 123456)',
      verifyAndLogin: 'Verify Code & Sign In',
      verifying: 'Verifying...',
      cancel2FA: 'Back / Cancel',
      langSelect: 'Language / Dil',
      authMascotTooltip: 'Omni AI - Secure System Login'
    },

    // Top Navbar
    navbar: {
      goHome: 'Go to Home / Overview (OmniFlow)',
      searchPlaceholder: 'Search IP, MAC, License...',
      searchKbd: 'Ctrl+K',
      searchTooltip: 'Search System (Ctrl+K)',
      kbButton: 'Knowledge Base',
      customersButton: 'Customers',
      kbTooltipToCustomer: 'Return to Customer Management Panel',
      kbTooltipToKB: 'Open IT Solution & Knowledge Base',
      licenseUrgentAlert: 'Licenses Expiring Soon or Expired!',
      licensesOk: 'All Licenses Up to Date (Firewall & Antivirus)',
      licensesOkShort: 'Licenses OK',
      licenseBadge: 'Licenses',
      statCustomers: 'Customers',
      statServers: 'Servers',
      statVMs: 'VM',
      statPCs: 'PC',
      statFWs: 'FW',
      downloadDb: 'DB',
      downloadDbTooltip: 'Download Database File (.db)',
      exportJson: 'JSON',
      exportJsonTooltip: 'Export All Data to JSON',
      settings: 'Settings',
      settingsTooltip: 'Admin Login & System Settings',
      adminRole: 'Administrator',
      restrictedRole: 'Restricted User',
      logout: 'Log Out',
      logoutTooltip: 'Sign Out & End Session',
      systemSettings: 'System Settings',
      systemSettingsDesc: 'Database, backups & security',
      logoutDesc: 'Sign out securely & end session',
      userMenu: 'User Menu',
      toggleSidebarHide: 'Hide Sidebar (Widescreen Mode)',
      toggleSidebarShow: 'Show Sidebar'
    },

    // Sidebar
    sidebar: {
      customers: 'Customers',
      addCustomer: 'Add New Customer',
      searchCustomer: 'Search customer or IP...',
      kbButton: 'IT Knowledge Base',
      kbShort: 'KB',
      noCustomerFound: 'No customer found.',
      noCustomerYet: 'No customers registered.',
      deviceBadge: 'Devices',
      serverTooltip: 'Physical Server',
      vmTooltip: 'Virtual Server (VM)',
      pcTooltip: 'User PC',
      fwTooltip: 'Firewall',
      nasTooltip: 'Backup NAS',
      wifiTooltip: 'Wi-Fi AP',
      mailTooltip: 'Corporate Mail'
    },

    // Main Tabs & Workspace
    tabs: {
      overview: 'Overview',
      topology: 'Network Topology',
      lines: 'Branches & Lines',
      servers: 'Physical Servers',
      vms: 'Virtual Machines',
      pcs: 'User Computers',
      firewalls: 'Firewalls',
      antivirus: 'Antivirus & EDR',
      backups: 'Backup & NAS',
      wifi: 'Wi-Fi Infrastructure',
      mail: 'Mail',
      mailTooltip: 'Corporate Mail Panel, Exchange Subscription & User Mailboxes',
      exportExcel: 'Excel Export',
      exportExcelTooltip: 'Download Customer Inventory as Excel (.xlsx)',
      reportPdf: 'PDF / Report',
      reportPdfTooltip: 'Generate Department & License Report as PDF',
      editCustomer: 'Edit',
      deleteCustomer: 'Delete Customer',
      noCustomerSelected: 'No Customer Selected Yet',
      noCustomerSelectedDesc: 'Please select a customer from the left sidebar or add a new customer to manage infrastructure, servers, virtual machines, firewalls, and backups.',
      addFirstCustomer: 'Add First Customer'
    },

    // Overview Tab Stat Cards
    overview: {
      physicalServer: 'Physical Server',
      virtualMachine: 'Virtual Machine',
      userPc: 'User PC',
      firewallDevice: 'Firewall Device',
      antivirusLicenses: 'Antivirus & EDR',
      backupUnits: 'Backup Unit',
      internetLines: 'Internet Line',
      wifiInfra: 'Wi-Fi & AP',
      mailAccounts: 'Corporate Mail',
      licensedOS: 'Licensed OS',
      officeLicenses: 'Office License',
      viewAll: 'View All',
      quickAdd: 'Quick Add',
      branchDistribution: 'Branch Distribution',
      systemHealth: 'System Health',
      allOk: 'All Systems Normal',
      unitQty: 'Units',
      vmQty: 'VM',
      clientQty: 'Clients',
      deviceQty: 'Devices',
      unitPackage: 'Package',
      unitUser: 'Users',
      unitNas: 'Units',
      unitAp: 'Dev/Net',
      unitAccount: 'Accounts'
    },

    // Device & Module Common
    modules: {
      branch: 'Branch / Location',
      mainOffice: 'Headquarters',
      allBranches: 'All Branches',
      department: 'Department',
      allDepartments: 'All Departments',
      tableView: 'Table',
      cardsView: 'Cards (Fitted)',
      hardwareSpecs: 'Hardware Specs',
      remoteAccessId: 'Remote Desktop / AnyDesk ID',
      ipAddress: 'IP Address',
      macAddress: 'MAC Address',
      serialNumber: 'Serial Number',
      licenseExpiry: 'License Expiry Date',
      daysLeft: 'Days Left',
      expired: 'Expired!',
      brandModel: 'Brand & Model'
    },

    // AI Mascot
    ai: {
      mascotTitle: 'Omni AI Assistant',
      version: 'v2.4',
      speech1: 'Hello! I am Omni AI. Monitoring your infrastructure 24/7.',
      speech2Alert: '⚠️ Attention: {count} licenses are expiring soon!',
      speech2Ok: '🟢 Great! All network and firewall licenses are up to date and secure.',
      speech3: 'Tip: Press Ctrl + K on your keyboard to instantly search the system.',
      speech4: 'Click on me to generate fast reports or adjust system settings.',
      quickSearch: 'Quick Search & Filter',
      quickSearchDesc: 'Search all customers and devices',
      licenseAlerts: 'License Alerts',
      customerReport: 'Customer Report (A4 / Excel)',
      customerReportDesc: 'PDF Preview',
      settings2FA: 'Settings & 2FA Verification',
      settings2FADesc: 'Management',
      testSound: 'Play Alert Chime',
      online: 'Online',
      integratedAi: 'OmniFlow Integrated AI',
      openPanel: 'Omni AI Assistant',
      closePanel: 'Close Omni AI Panel',
      maximize: 'Maximize Omni AI Assistant',
      liveMonitoring: 'Live Infrastructure Monitoring',
      urgentAlertBanner: 'Critical License Alert!',
      urgentAlertDesc: '{count} devices/licenses expiring soon',
      inspect: 'Inspect →',
      systemStable: 'System Stable & Secure',
      noUrgentAlert: 'No critical license alerts',
      metricsCustomers: 'Customers',
      metricsServerVm: 'Server & VM',
      metricsPcs: 'User PC',
      quickActionsTitle: 'Quick Actions & Shortcuts',
      universalSearch: 'Universal Search',
      licenseTracking: 'License Tracking & Alerts',
      clean: 'Clean',
      alertCount: '{count} Alerts',
      listenAlertSoundDesc: 'Test selected alert chime immediately',
      minimizeTitle: 'Minimize to Tray',
      closeTitle: 'Close Panel',
      mascotActive: 'Omni AI Active'
    },

    // Settings Modal
    settings: {
      title: 'Management & System Settings',
      languageTitle: 'Language Selection / Dil Seçeneği',
      languageDesc: 'Switch the OmniFlow interface language between Turkish and English here.',
      currentLang: 'Current Language',
      authBgTitle: 'Login Screen Background (Video / Image)',
      authBgDesc: 'Upload a custom full-screen video (MP4/WebM) or image (JPG/PNG/WebP) to display on the login screen.',
      uploadBgBtn: 'Choose & Upload Background',
      resetBgBtn: 'Reset to Default',
      bgPreview: 'Login Screen Live Preview',
      bgUploading: 'Uploading...',
      bgSuccess: 'Background uploaded and applied successfully!',
      bgResetSuccess: 'Background reset to default dynamic video.',
      bgFormatVideo: 'Dynamic Video',
      bgFormatImage: 'Static Image',
      bgFilePathTip: '💡 Alternative File Path: You can also copy your video file directly to the following location as auth-bg.mp4:',
      tabs: {
        auth: 'Admin & Security',
        preferences: 'UI & Alert Preferences',
        database: 'Database & Backup',
        about: 'About & License'
      }
    }
  }
};

export const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' }
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('omniflow_language');
      if (saved && (saved === 'tr' || saved === 'en')) {
        return saved;
      }
      // Detect browser language if not set
      if (typeof navigator !== 'undefined' && navigator.language) {
        if (navigator.language.toLowerCase().startsWith('tr')) return 'tr';
      }
    } catch (e) {}
    return 'tr';
  });

  const setLanguage = (lang) => {
    if (lang !== 'tr' && lang !== 'en') return;
    setLanguageState(lang);
    try {
      localStorage.setItem('omniflow_language', lang);
    } catch (e) {}
  };

  // Translation helper function
  // Usage: t('auth.loginTab') or t('common.save')
  const t = (path, params = {}) => {
    if (!path) return '';
    const keys = path.split('.');
    
    // Check in current language
    let current = translations[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = null;
        break;
      }
    }

    // Fallback to Turkish if not found in English
    if (current === null || current === undefined) {
      let fallback = translations['tr'];
      for (const k of keys) {
        if (fallback && typeof fallback === 'object' && k in fallback) {
          fallback = fallback[k];
        } else {
          fallback = null;
          break;
        }
      }
      current = fallback || path;
    }

    // Replace parameter interpolations like {count}
    if (typeof current === 'string' && params && typeof params === 'object') {
      let str = current;
      Object.keys(params).forEach(param => {
        str = str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(params[param]));
      });
      return str;
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe dummy fallback if accessed outside of provider
    return {
      language: 'tr',
      setLanguage: () => {},
      t: (path) => path,
      languages: SUPPORTED_LANGUAGES
    };
  }
  return context;
}

export default LanguageContext;
