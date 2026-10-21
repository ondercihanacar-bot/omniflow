import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewTab from './components/OverviewTab';
import PhysicalServersTab from './components/PhysicalServersTab';
import VirtualMachinesTab from './components/VirtualMachinesTab';
import UserComputersTab from './components/UserComputersTab';
import FirewallsTab from './components/FirewallsTab';
import BackupUnitsTab from './components/BackupUnitsTab';
import NetworkTopologyTab from './components/NetworkTopologyTab';
import ErrorBoundary from './components/ErrorBoundary';
import InternetLinesTab from './components/InternetLinesTab';
import WifiTab from './components/WifiTab';
import InternetLineModal from './components/InternetLineModal';
import ReportModal from './components/ReportModal';
import CustomerModal from './components/CustomerModal';
import { ServerModal, VMModal, ComputerModal, FirewallModal, BackupModal } from './components/DeviceModals';
import { WifiControllerModal, WifiAPModal, WifiNetworkModal } from './components/WifiModals';
import GlobalSearchModal from './components/GlobalSearchModal';
import LicenseAlertModal from './components/LicenseAlertModal';
import AntivirusTab from './components/AntivirusTab';
import AntivirusModal from './components/AntivirusModal';
import MailTab from './components/MailTab';
import { MailServiceModal, MailAccountModal } from './components/MailModals';
import SettingsModal from './components/SettingsModal';
import OmniHubLicenseModal from './components/OmniHubLicenseModal';
import HelpModal from './components/HelpModal';
import AuthScreen from './components/AuthScreen';
import AIAssistantMascot from './components/AIAssistantMascot';
import KnowledgeBaseTab from './components/KnowledgeBaseTab';
import KnowledgeBaseModal from './components/KnowledgeBaseModal';
import ConfirmDialog from './components/ConfirmDialog';
import CopyButton from './components/CopyButton';
import DeleteCustomerSecurityModal from './components/DeleteCustomerSecurityModal';
import DisasterVaultModal from './components/DisasterVaultModal';
import SecurityAuditModal from './components/SecurityAuditModal';
import AssetTagModal from './components/AssetTagModal';
import { exportCustomerToExcel } from './utils/exporter';
import {
  getDaysRemaining, getLicenseStatus, playAlertChime, getSoundEnabled,
  playCriticalLicenseAlarm, announceCriticalLicenseVoice
} from './utils/licenseAlerts';
import { checkPermission } from './utils/permissions';
import {
  Building2, Globe, Phone, Mail, Edit, Trash2, LayoutDashboard,
  Server, Cloud, Laptop, Shield, ShieldCheck, Database, Plus, RefreshCw,
  Network, FileSpreadsheet, Printer, Wifi, BookOpen, Lock, Key, AlertCircle, Award, QrCode
} from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);

  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState(null);

  const [isVMModalOpen, setIsVMModalOpen] = useState(false);
  const [editingVM, setEditingVM] = useState(null);

  const [isPCModalOpen, setIsPCModalOpen] = useState(false);
  const [editingPC, setEditingPC] = useState(null);

  const [isFirewallModalOpen, setIsFirewallModalOpen] = useState(false);
  const [editingFirewall, setEditingFirewall] = useState(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [editingBackup, setEditingBackup] = useState(null);

  const [isAntivirusModalOpen, setIsAntivirusModalOpen] = useState(false);
  const [editingAntivirus, setEditingAntivirus] = useState(null);

  // Wi-Fi Modals State
  const [isWifiControllerModalOpen, setIsWifiControllerModalOpen] = useState(false);
  const [editingWifiController, setEditingWifiController] = useState(null);

  const [isWifiAPModalOpen, setIsWifiAPModalOpen] = useState(false);
  const [editingWifiAP, setEditingWifiAP] = useState(null);

  const [isWifiNetworkModalOpen, setIsWifiNetworkModalOpen] = useState(false);
  const [editingWifiNetwork, setEditingWifiNetwork] = useState(null);

  // Mail Modals State
  const [isMailServiceModalOpen, setIsMailServiceModalOpen] = useState(false);
  const [editingMailService, setEditingMailService] = useState(null);
  const [isMailAccountModalOpen, setIsMailAccountModalOpen] = useState(false);
  const [editingMailAccount, setEditingMailAccount] = useState(null);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLicenseAlertModalOpen, setIsLicenseAlertModalOpen] = useState(false);
  const [isOmniHubLicenseModalOpen, setIsOmniHubLicenseModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDeleteSecurityModalOpen, setIsDeleteSecurityModalOpen] = useState(false);
  const [isDisasterVaultModalOpen, setIsDisasterVaultModalOpen] = useState(false);
  const [isSecurityAuditModalOpen, setIsSecurityAuditModalOpen] = useState(false);
  const [isAssetTagModalOpen, setIsAssetTagModalOpen] = useState(false);
  const [licenseAlerts, setLicenseAlerts] = useState([]);
  const hasPlayedAlertSound = useRef(false);

  // OmniHub Licensing State
  const [omniLicense, setOmniLicense] = useState(null);
  const [licenseRefreshing, setLicenseRefreshing] = useState(false);

  const loadOmniLicense = useCallback(async () => {
    try {
      const res = await fetch('/api/license/status');
      const data = await res.json();
      if (data.license) setOmniLicense(data.license);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadOmniLicense();
    const interval = setInterval(loadOmniLicense, 30000);
    return () => clearInterval(interval);
  }, [loadOmniLicense]);

  // Knowledge Base State
  const [viewMode, setViewMode] = useState('customer'); // 'customer' | 'kb'
  const [kbItems, setKbItems] = useState([]);
  const [isKBModalOpen, setIsKBModalOpen] = useState(false);
  const [editingKBItem, setEditingKBItem] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('itmanager_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('itmanager_sidebar_open', String(next));
      return next;
    });
  };

  // User Authentication & Session State
  // Web sayfasını her kapatıp açtığımızda oturum sıfırlanmalı ve giriş ekranı gelmelidir.
  // Oturum sadece aktif sekme süresince (sessionStorage) tutulur, localStorage'da saklanmaz.
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // Temizleme: Eski kalıcı localStorage oturumlarını otomatik temizle
      localStorage.removeItem('itmanager_user_session');
      localStorage.removeItem('itmanager_admin_logged_in');

      const saved = sessionStorage.getItem('itmanager_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.user || parsed;
      }
    } catch (e) {}
    return null;
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('itmanager_admin_logged_in', 'true');
    try {
      localStorage.removeItem('itmanager_user_session');
      localStorage.removeItem('itmanager_admin_logged_in');
    } catch (e) {}
    loadCustomers();
    loadStats();
    loadLicenseAlerts();
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('itmanager_user_session');
      sessionStorage.removeItem('itmanager_admin_logged_in');
      localStorage.removeItem('itmanager_user_session');
      localStorage.removeItem('itmanager_admin_logged_in');
    } catch (e) {}
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
  };

  // Listen for unauthorized/expired session events
  useEffect(() => {
    const handleAuthRequired = () => {
      try {
        sessionStorage.removeItem('itmanager_user_session');
        sessionStorage.removeItem('itmanager_admin_logged_in');
        localStorage.removeItem('itmanager_user_session');
        localStorage.removeItem('itmanager_admin_logged_in');
      } catch (e) {}
      setCurrentUser(null);
      setIsAdminLoggedIn(false);
    };
    window.addEventListener('itm_auth_required', handleAuthRequired);
    return () => window.removeEventListener('itm_auth_required', handleAuthRequired);
  }, []);

  // Automatically fallback to overview tab if current tab is restricted for currentUser
  useEffect(() => {
    if (!currentUser) return;
    const tabModuleMap = {
      lines: 'internet',
      servers: 'servers',
      vms: 'vms',
      pcs: 'computers',
      firewalls: 'firewalls',
      antivirus: 'antivirus',
      backups: 'backups',
      wifi: 'wifi'
    };
    const requiredModule = tabModuleMap[activeTab];
    if (requiredModule && !checkPermission(currentUser, 'module', requiredModule)) {
      setActiveTab('overview');
    }
  }, [activeTab, currentUser]);

  // Settings & Admin Login State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('itmanager_admin_logged_in') === 'true' || !!sessionStorage.getItem('itmanager_user_session');
  });
  const [neonEnabled, setNeonEnabled] = useState(() => {
    const saved = localStorage.getItem('itmanager_neon_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const handleLoginAdmin = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('itmanager_admin_logged_in', 'true');
  };

  const handleLogoutAdmin = () => {
    handleLogout();
  };

  const handleToggleNeon = (enabled) => {
    setNeonEnabled(enabled);
    localStorage.setItem('itmanager_neon_enabled', String(enabled));
  };

  const customerBranches = useMemo(() => {
    return Array.from(
      new Set([
        'Merkez Ofis',
        ...(customerData?.internet_lines || []).map(l => l.branch_name),
        ...(customerData?.user_computers || []).map(c => c.branch_name),
        ...(customerData?.physical_servers || []).map(s => s.branch_name),
        ...(customerData?.firewalls || []).map(f => f.branch_name),
        ...(customerData?.backup_units || []).map(b => b.branch_name),
        ...(customerData?.wifi_controllers || []).map(w => w.branch_name),
        ...(customerData?.wifi_access_points || []).map(a => a.branch_name),
        ...(customerData?.wifi_networks || []).map(n => n.branch_name && n.branch_name !== 'Tüm Şubeler' ? n.branch_name : null),
        ...(customerData?.antivirus_licenses || []).map(a => a.branch_name)
      ].filter(Boolean))
    );
  }, [customerData]);

  // Load all initial data
  const loadStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadLicenseAlerts = useCallback(async () => {
    try {
      const data = await api.getAllLicenseAlerts();
      setLicenseAlerts(data || []);

      const processed = (data || []).map(f => {
        const days = getDaysRemaining(f.license_expiry);
        return { ...f, daysRemaining: days, status: getLicenseStatus(days) };
      });

      const criticalItems = processed.filter(p => p.status.isCritical); // <= 15 days or expired
      const warningItems = processed.filter(p => p.status.isWarning); // <= 30 days

      if (criticalItems.length > 0 && getSoundEnabled() && !hasPlayedAlertSound.current) {
        hasPlayedAlertSound.current = true;
        setTimeout(() => {
          playCriticalLicenseAlarm();
          announceCriticalLicenseVoice(criticalItems.length);
        }, 1200);
      } else if (warningItems.length > 0 && getSoundEnabled() && !hasPlayedAlertSound.current) {
        hasPlayedAlertSound.current = true;
        setTimeout(() => {
          playAlertChime();
        }, 1200);
      }
    } catch (err) {
      console.error('License alerts fetch error:', err);
    }
  }, []);

  const loadKBItems = useCallback(async () => {
    try {
      const list = await api.getKnowledgeBase();
      setKbItems(list || []);
    } catch (err) {
      console.error('KB fetch error:', err);
    }
  }, []);

  const loadCustomers = useCallback(async (selectId = null) => {
    try {
      const list = await api.getCustomers();
      setCustomers(list);
      if (list.length > 0) {
        const targetId = selectId || selectedCustomerId || list[0].id;
        setSelectedCustomerId(targetId);
      } else {
        setSelectedCustomerId(null);
        setCustomerData(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCustomerId]);

  const loadCustomerDetails = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await api.getCustomer(id);
      setCustomerData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
    loadStats();
    loadLicenseAlerts();
    loadKBItems();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerDetails(selectedCustomerId);
    }
  }, [selectedCustomerId, loadCustomerDetails]);

  // Global Keyboard Shortcuts: Ctrl + K (Search) and F1 (Help Guide)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
      if (e.key === 'F1') {
        e.preventDefault();
        setIsHelpModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Logo click triggers direct navigation to Home / Overview
  const handleGoHome = () => {
    setViewMode('customer');
    setActiveTab('overview');
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  };

  // ---------------- Customer CRUD ----------------
  const handleSaveCustomer = async (formData) => {
    try {
      let targetId = selectedCustomerId;
      if (editingCustomer) {
        targetId = editingCustomer.id;
        const updated = await api.updateCustomer(targetId, formData);
        // Immediate local state update so the whole UI reflects the changes instantly
        setCustomerData(prev => (prev && prev.id === targetId ? { ...prev, ...updated, ...formData } : prev));
      } else {
        const newCust = await api.createCustomer(formData);
        targetId = newCust.id;
        setSelectedCustomerId(targetId);
      }
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);

      // Re-fetch customer details, customers list, and stats concurrently
      await Promise.all([
        loadCustomerDetails(targetId),
        loadCustomers(targetId),
        loadStats()
      ]);
    } catch (err) {
      console.error('Customer save error:', err);
      alert(err.message || 'Müşteri kaydedilirken bir hata oluştu.');
      throw err;
    }
  };

  const handleDeleteCustomer = (cust) => {
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.username === 'admin');
    if (!isAdmin) {
      alert('Yetkisiz İşlem: Müşteriyi ve tüm ilişkili alt envanterini silme yetkisi sadece Sistem Yöneticisine (Admin) aittir.');
      return;
    }
    setIsDeleteSecurityModalOpen(true);
  };

  // ---------------- Internet Lines & Branches CRUD ----------------
  const handleSaveLine = async (formData) => {
    try {
      if (editingLine) {
        await api.updateInternetLine(editingLine.id, formData);
      } else {
        await api.createInternetLine(formData);
      }
      setIsLineModalOpen(false);
      setEditingLine(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteLine = (line) => {
    setConfirmDialog({
      isOpen: true,
      title: 'İnternet Hattını / Şubeyi Sil',
      message: `"${line.branch_name}" (${line.line_type}) kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteInternetLine(line.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- Server CRUD ----------------
  const handleSaveServer = async (formData) => {
    try {
      if (editingServer) {
        await api.updateServer(editingServer.id, formData);
      } else {
        await api.createServer(formData);
      }
      setIsServerModalOpen(false);
      setEditingServer(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteServer = (server) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Fiziki Sunucuyu Sil',
      message: `"${server.server_name}" adlı fiziki sunucu kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteServer(server.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- VM CRUD ----------------
  const handleSaveVM = async (formData) => {
    try {
      if (editingVM) {
        await api.updateVM(editingVM.id, formData);
      } else {
        await api.createVM(formData);
      }
      setIsVMModalOpen(false);
      setEditingVM(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteVM = (vm) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Sanal Makineyi Sil',
      message: `"${vm.vm_name}" adlı sanal makine kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteVM(vm.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- User PC CRUD ----------------
  const handleSavePC = async (formData) => {
    try {
      if (editingPC) {
        await api.updateComputer(editingPC.id, formData);
      } else {
        await api.createComputer(formData);
      }
      setIsPCModalOpen(false);
      setEditingPC(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePC = (pc) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kullanıcı Bilgisayarını Sil',
      message: `"${pc.computer_name}" adlı bilgisayar kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteComputer(pc.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- Firewall CRUD ----------------
  const handleSaveFirewall = async (formData) => {
    try {
      if (editingFirewall) {
        await api.updateFirewall(editingFirewall.id, formData);
      } else {
        await api.createFirewall(formData);
      }
      setIsFirewallModalOpen(false);
      setEditingFirewall(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
      await loadLicenseAlerts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFirewall = (fw) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Firewall Kaydını Sil',
      message: `"${fw.device_name}" adlı firewall kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteFirewall(fw.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
          await loadLicenseAlerts();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- Backup Unit CRUD ----------------
  const handleSaveBackup = async (formData) => {
    try {
      if (editingBackup) {
        await api.updateBackupUnit(editingBackup.id, formData);
      } else {
        await api.createBackupUnit(formData);
      }
      setIsBackupModalOpen(false);
      setEditingBackup(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteBackup = (bu) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Yedekleme Ünitesini Sil',
      message: `"${bu.device_name}" adlı yedekleme ünitesi kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteBackupUnit(bu.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- Wi-Fi Controller CRUD ----------------
  const handleSaveWifiController = async (formData) => {
    try {
      if (editingWifiController) {
        await api.updateWifiController(editingWifiController.id, formData);
      } else {
        await api.createWifiController(formData);
      }
      setIsWifiControllerModalOpen(false);
      setEditingWifiController(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteWifiController = (ctrl) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Wi-Fi Kontrolcüsünü Sil',
      message: `"${ctrl.controller_name}" adlı kontrol panelini silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteWifiController(ctrl.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- Wi-Fi Access Point CRUD ----------------
  const handleSaveWifiAP = async (formData) => {
    try {
      if (editingWifiAP) {
        await api.updateWifiAP(editingWifiAP.id, formData);
      } else {
        await api.createWifiAP(formData);
      }
      setIsWifiAPModalOpen(false);
      setEditingWifiAP(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteWifiAP = (ap) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Wi-Fi Erişim Noktasını Sil',
      message: `"${ap.ap_name}" adlı AP cihazı kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteWifiAP(ap.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- Wi-Fi Network (SSID) CRUD ----------------
  const handleSaveWifiNetwork = async (formData) => {
    try {
      if (editingWifiNetwork) {
        await api.updateWifiNetwork(editingWifiNetwork.id, formData);
      } else {
        await api.createWifiNetwork(formData);
      }
      setIsWifiNetworkModalOpen(false);
      setEditingWifiNetwork(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteWifiNetwork = (net) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Wi-Fi Ağını (SSID) Sil',
      message: `"${net.ssid}" adlı Wi-Fi ağını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteWifiNetwork(net.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // ---------------- Antivirus Licenses CRUD ----------------
  const handleSaveAntivirus = async (formData) => {
    try {
      if (editingAntivirus) {
        await api.updateAntivirusLicense(editingAntivirus.id, formData);
      } else {
        await api.createAntivirusLicense(formData);
      }
      setIsAntivirusModalOpen(false);
      setEditingAntivirus(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadLicenseAlerts();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAntivirus = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Antivirüs Lisans Kaydını Sil',
      message: `"${item.product_name || item.brand}" antivirüs lisans kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteAntivirusLicense(item.id);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadLicenseAlerts();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // Mail Handlers
  const handleSaveMailService = async (formData) => {
    try {
      if (editingMailService) {
        await api.updateMailService(editingMailService.id, formData);
      } else {
        await api.createMailService(formData);
      }
      setIsMailServiceModalOpen(false);
      setEditingMailService(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadLicenseAlerts();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteMailService = (serviceId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Mail Servisini Sil',
      message: 'Bu mail servisini ve yönetim paneli kaydını silmek istediğinize emin misiniz? Kayıtlı e-posta hesapları silinmez ancak servis ilişkisi kaldırılır.',
      onConfirm: async () => {
        try {
          await api.deleteMailService(serviceId);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadLicenseAlerts();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  const handleSaveMailAccount = async (formData) => {
    try {
      if (editingMailAccount) {
        await api.updateMailAccount(editingMailAccount.id, formData);
      } else {
        await api.createMailAccount(formData);
      }
      setIsMailAccountModalOpen(false);
      setEditingMailAccount(null);
      await loadCustomerDetails(selectedCustomerId);
      await loadCustomers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickUpdateMailAccount = async (accountId, patchData) => {
    try {
      await api.updateMailAccount(accountId, patchData);
      await loadCustomerDetails(selectedCustomerId);
    } catch (err) {
      alert('Parola güncellenirken hata oluştu: ' + err.message);
    }
  };

  const handleDeleteMailAccount = (accountId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'E-Posta Hesabını Sil',
      message: 'Bu kullanıcı e-posta hesabını ve parolasını silmek istediğinize emin misiniz?',
      onConfirm: async () => {
        try {
          await api.deleteMailAccount(accountId);
          setConfirmDialog({ isOpen: false });
          await loadCustomerDetails(selectedCustomerId);
          await loadCustomers();
          await loadStats();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // Quick Add Trigger from Overview
  const handleQuickAdd = (type) => {
    if (type === 'server') {
      setEditingServer(null);
      setIsServerModalOpen(true);
    } else if (type === 'vm') {
      setEditingVM(null);
      setIsVMModalOpen(true);
    } else if (type === 'pc') {
      setEditingPC(null);
      setIsPCModalOpen(true);
    } else if (type === 'firewall') {
      setEditingFirewall(null);
      setIsFirewallModalOpen(true);
    } else if (type === 'antivirus') {
      setEditingAntivirus(null);
      setIsAntivirusModalOpen(true);
    } else if (type === 'mail' || type === 'mail-account') {
      setEditingMailAccount(null);
      setIsMailAccountModalOpen(true);
    } else if (type === 'mail-service') {
      setEditingMailService(null);
      setIsMailServiceModalOpen(true);
    } else if (type === 'backup') {
      setEditingBackup(null);
      setIsBackupModalOpen(true);
    } else if (type === 'line') {
      setEditingLine(null);
      setIsLineModalOpen(true);
    } else if (type === 'wifi-controller') {
      setEditingWifiController(null);
      setIsWifiControllerModalOpen(true);
    } else if (type === 'wifi-ap') {
      setEditingWifiAP(null);
      setIsWifiAPModalOpen(true);
    } else if (type === 'wifi-network' || type === 'wifi') {
      setEditingWifiNetwork(null);
      setIsWifiNetworkModalOpen(true);
    }
  };

  // ---------------- Knowledge Base CRUD ----------------
  const handleSaveKBItem = async (formData) => {
    try {
      if (editingKBItem && editingKBItem.id) {
        await api.updateKnowledgeBaseItem(editingKBItem.id, formData);
      } else {
        await api.createKnowledgeBaseItem(formData);
      }
      setIsKBModalOpen(false);
      setEditingKBItem(null);
      await loadKBItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteKBItem = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Çözüm Kaydını Sil',
      message: `"${item.title}" adlı IT çözüm kaydını silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await api.deleteKnowledgeBaseItem(item.id);
          setConfirmDialog({ isOpen: false });
          await loadKBItems();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // Handle Search Result Selection
  const handleSelectSearchResult = ({ customerId, tab }) => {
    if (tab === 'kb') {
      setViewMode('kb');
      return;
    }
    setViewMode('customer');
    if (customerId) setSelectedCustomerId(customerId);
    setActiveTab(tab);
  };

  const processedLicenseAlerts = licenseAlerts.map(f => {
    const days = getDaysRemaining(f.license_expiry);
    const status = getLicenseStatus(days);
    return { ...f, daysRemaining: days, status };
  });

  const criticalLicenseAlerts = processedLicenseAlerts.filter(f => f.status.isCritical);
  const warningLicenseAlerts = processedLicenseAlerts.filter(f => f.status.isWarning && !f.status.isCritical);
  const urgentLicenseAlerts = processedLicenseAlerts.filter(f => f.status.isUrgent);

  // Per-customer license tracking: Antivirus
  const currentCustomerAntivirusList = (customerData?.antivirus_licenses || []).map(a => {
    const days = getDaysRemaining(a.license_expiry);
    return { ...a, daysRemaining: days, status: getLicenseStatus(days) };
  });
  const currentCustomerHasCriticalAntivirus = currentCustomerAntivirusList.some(a => a.status.isCritical);
  const currentCustomerHasWarningAntivirus = currentCustomerAntivirusList.some(a => a.status.isWarning && !a.status.isCritical);
  const currentCustomerHasExpiringAntivirus = currentCustomerHasCriticalAntivirus || currentCustomerHasWarningAntivirus;

  // Per-customer license tracking: Firewall
  const currentCustomerFirewallList = (customerData?.firewalls || []).map(f => {
    const days = getDaysRemaining(f.license_expiry);
    return { ...f, daysRemaining: days, status: getLicenseStatus(days) };
  });
  const currentCustomerHasCriticalFirewall = currentCustomerFirewallList.some(f => f.status.isCritical);
  const currentCustomerHasWarningFirewall = currentCustomerFirewallList.some(f => f.status.isWarning && !f.status.isCritical);
  const currentCustomerHasExpiringFirewall = currentCustomerHasCriticalFirewall || currentCustomerHasWarningFirewall;

  // Single-fire audio warning per customer load when critical license <= 15 days exists
  const playedCustomerAlarmRef = useRef({});
  useEffect(() => {
    if (!customerData?.id) return;
    if ((currentCustomerHasCriticalAntivirus || currentCustomerHasCriticalFirewall) && getSoundEnabled()) {
      if (!playedCustomerAlarmRef.current[customerData.id]) {
        playedCustomerAlarmRef.current[customerData.id] = true;
        setTimeout(() => {
          playCriticalLicenseAlarm();
          const avProduct = currentCustomerAntivirusList.find(a => a.status.isCritical)?.product_name;
          const fwName = currentCustomerFirewallList.find(f => f.status.isCritical)?.device_name;
          const target = avProduct || fwName || customerData.name;
          announceCriticalLicenseVoice(target);
        }, 900);
      }
    }
  }, [customerData?.id, currentCustomerHasCriticalAntivirus, currentCustomerHasCriticalFirewall]);

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        stats={stats}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onGoHome={handleGoHome}
        urgentLicenseCount={urgentLicenseAlerts.length}
        criticalLicenseCount={criticalLicenseAlerts.length}
        warningLicenseCount={warningLicenseAlerts.length}
        onOpenLicenseAlerts={() => setIsLicenseAlertModalOpen(true)}
        isKBView={viewMode === 'kb'}
        onToggleKBView={() => setViewMode(prev => prev === 'kb' ? 'customer' : 'kb')}
        kbCount={kbItems.length}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
        canExport={checkPermission(currentUser, 'export')}
        canAccessKB={checkPermission(currentUser, 'module', 'knowledge_base')}
        onOpenOmniHubLicense={() => setIsOmniHubLicenseModalOpen(true)}
      />

      {/* OMNIHUB LİSANS ASKIYA ALINDI (DONDURULDU) KİLİT EKRANI */}
      {omniLicense?.status === 'suspended' ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/95 relative overflow-hidden z-20">
          <div className="max-w-xl w-full p-8 rounded-2xl bg-slate-900 border-2 border-rose-500/80 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center space-y-6 relative z-10 backdrop-blur-xl">
            <div className="w-20 h-20 rounded-full bg-rose-950/80 border-2 border-rose-500 text-rose-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse">
              <Lock className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-600 text-rose-300 font-mono text-xs font-bold uppercase tracking-wider">
                HİZMET DONDURULDU
              </span>
              <h2 className="text-2xl font-black text-white mt-3 tracking-wide">
                OMNIFlow Lisansı Askıya Alınmıştır
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Bu yazılımın lisansı ödeme gecikmesi, sözleşme feshi veya idari nedenlerle <strong className="text-cyan-400">OmniHub Lisans Yönetim Merkezi</strong> tarafından uzaktan durdurulmuştur.
                Altyapı izleme ve yönetim servisleri kilitlenmiştir.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Lisans Sahibi:</span>
                <span className="text-white font-bold truncate max-w-xs">{omniLicense.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Donanım Mührü (HWID):</span>
                <span className="text-cyan-400">{omniLicense.hardware_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Durum:</span>
                <span className="text-rose-400 font-bold">DONDURULDU (SUSPENDED)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Merkezi Dağıtıcı:</span>
                <span className="text-slate-300">Önder Cihan ACAR - OmniHub Portal</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  setLicenseRefreshing(true);
                  try {
                    await fetch('/api/license/sync', { method: 'POST' });
                    await loadOmniLicense();
                    await loadStats();
                  } catch (_) {}
                  setLicenseRefreshing(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-cyan-400 ${licenseRefreshing ? 'animate-spin' : ''}`} />
                <span>Ödeme Yapıldı / Merkezle Eşitle</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOmniHubLicenseModalOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>Yeni Lisans Anahtarı Gir</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              Designed & Developed by Önder Cihan ACAR © 2026. All Rights Reserved.
            </p>
          </div>
        </div>
      ) : (
        /* Main Workspace: Sidebar + Content */
        <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop for Sidebar Drawer */}
        {isSidebarOpen && (
          <div
            onClick={handleToggleSidebar}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 md:hidden animate-fade-in"
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar */}
        <Sidebar
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={(id) => {
            setViewMode('customer');
            setSelectedCustomerId(id);
            setActiveTab('overview');
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          onOpenNewCustomerModal={() => {
            setEditingCustomer(null);
            setIsCustomerModalOpen(true);
          }}
          isKBView={viewMode === 'kb'}
          onSelectKBView={() => {
            setViewMode('kb');
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          canAccessKB={checkPermission(currentUser, 'module', 'knowledge_base')}
          canEdit={checkPermission(currentUser, 'edit')}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-slate-950 w-full min-w-0">
          {/* Expired License Warning Banner */}
          {omniLicense?.status === 'expired' && (
            <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-2xl border border-amber-500/80 bg-amber-950/40 text-amber-200 flex items-center justify-between shadow-lg shadow-amber-950/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs">OMNIFlow Lisans Süreniz Dolmuştur (Kısıtlı / Salt Okunur Mod)</div>
                  <div className="text-[11px] text-amber-300/80 mt-0.5">
                    Yeni kayıt, müşteri veya envanter değişikliği yapılamaz. Verileri incelemeye devam edebilir veya lisansınızı yenileyebilirsiniz.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOmniHubLicenseModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                Lisansı Yenile
              </button>
            </div>
          )}
          {viewMode === 'kb' ? (
            <div className="flex-1 p-4 sm:p-6 w-full">
              <KnowledgeBaseTab
                items={kbItems}
                customers={customers}
                canEdit={checkPermission(currentUser, 'edit')}
                canDelete={checkPermission(currentUser, 'delete')}
                onAdd={(prefill) => {
                  setEditingKBItem(prefill && typeof prefill === 'object' ? prefill : null);
                  setIsKBModalOpen(true);
                }}
                onEdit={(item) => {
                  setEditingKBItem(item);
                  setIsKBModalOpen(true);
                }}
                onDelete={handleDeleteKBItem}
              />
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                <span>Yükleniyor...</span>
              </div>
            </div>
          ) : !customerData ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-slate-600">
                <Building2 className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t('tabs.noCustomerSelected')}</h2>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                {t('tabs.noCustomerSelectedDesc')}
              </p>
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setIsCustomerModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('tabs.addFirstCustomer')}</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-2.5 sm:p-4 md:p-6 space-y-4 sm:space-y-5 w-full min-w-0">
              {/* Customer Header Banner */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      title="Müşteri Ana Ekranı / Genel Bakış (İşlemlere Devam Et)"
                      className={`p-2 sm:p-3 rounded-xl shrink-0 mt-0.5 transition-all cursor-pointer group flex items-center justify-center ${
                        activeTab === 'overview'
                          ? 'bg-gradient-to-br from-blue-600/30 to-indigo-600/30 text-blue-300 border-2 border-blue-400 shadow-lg shadow-blue-900/40 ring-2 ring-blue-500/30'
                          : 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/35 hover:border-blue-400 hover:text-white hover:scale-105 shadow-sm'
                      }`}
                    >
                      <Building2 className="w-5 h-5 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {customerData.code && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            title="Genel Bakışa Dön"
                            className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-blue-400 border border-slate-700 cursor-pointer hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            {customerData.code}
                          </button>
                        )}
                        <h2
                          onClick={() => setActiveTab('overview')}
                          title="Müşteri Ana Ekranına Dön (Genel Bakış)"
                          className="text-xl font-extrabold text-white tracking-tight cursor-pointer hover:text-blue-300 transition-colors"
                        >
                          {customerData.name}
                        </h2>
                      </div>

                      {/* Contact & IP ribbon */}
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                        {customerData.external_ip && (
                          <div className="flex items-center gap-1.5 font-mono bg-blue-950/40 text-blue-300 px-2.5 py-1 rounded-lg border border-blue-900/60">
                            <Globe className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-semibold">{customerData.external_ip}</span>
                            <CopyButton text={customerData.external_ip} title="Dış IP Kopyala" />
                          </div>
                        )}
                        {customerData.contact_person && (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="text-slate-500">Yetkili:</span>
                            <span className="font-medium">{customerData.contact_person}</span>
                          </div>
                        )}
                        {customerData.phone && (
                          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{customerData.phone}</span>
                          </div>
                        )}
                        {customerData.email && (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-blue-400">{customerData.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    {checkPermission(currentUser, 'export') && (
                      <>
                        <button
                          onClick={() => exportCustomerToExcel(customerData)}
                          title={t('tabs.exportExcelTooltip')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/40 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t('tabs.exportExcel')}</span>
                        </button>

                        <button
                          onClick={() => setIsReportModalOpen(true)}
                          title={t('tabs.reportPdfTooltip')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/40 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-400" />
                          <span>{t('tabs.reportPdf')}</span>
                        </button>
                      </>
                    )}

                    {/* Felaket Kurtarma Çantası (Offline AES-256 Kasa) */}
                    <button
                      onClick={() => setIsDisasterVaultModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-bold rounded-lg border border-purple-800/60 hover:border-purple-600 transition-all cursor-pointer shadow-sm"
                      title="İnternet koptuğunda dahi çalışan şifreli tek dosya kurtarma kasasını indir"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span>🔮 Felaket Çantası</span>
                    </button>

                    {/* Güvenlik & Risk Karnesi */}
                    <button
                      onClick={() => setIsSecurityAuditModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-800/60 hover:border-emerald-600 transition-all cursor-pointer shadow-sm"
                      title="Yöneticiye sunulabilir resmi IT Güvenlik ve Risk Karnesini görüntüle / yazdır"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>🛡️ Güvenlik Karnesi</span>
                    </button>

                    {/* Akıllı QR Etiket Basıcı */}
                    <button
                      onClick={() => setIsAssetTagModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 text-xs font-bold rounded-lg border border-blue-800/60 hover:border-blue-600 transition-all cursor-pointer shadow-sm"
                      title="Müşteriye ait tüm PC, Sunucu ve Güvenlik Duvarları için QR kodlu varlık etiketleri üret (Termal & A4)"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-400" />
                      <span>🏷️ QR Etiket Bas</span>
                    </button>

                    {checkPermission(currentUser, 'edit') && (
                      <button
                        onClick={() => {
                          setEditingCustomer(customerData);
                          setIsCustomerModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-400" />
                        <span>{t('tabs.editCustomer')}</span>
                      </button>
                    )}

                    {/* Sadece Admin Silebilmeli - 2 Aşamalı Güvenlik Kilidi */}
                    {currentUser && (currentUser.role === 'admin' || currentUser.username === 'admin') && (
                      <button
                        onClick={() => handleDeleteCustomer(customerData)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-lg border border-rose-800/60 hover:border-rose-600 transition-all cursor-pointer shadow-sm"
                        title="Sadece Yönetici (Admin) Yetkisiyle 2 Aşamalı Parola Korumasıyla Silinebilir"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>{t('tabs.deleteCustomer')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{t('tabs.overview')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('topology')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                      activeTab === 'topology'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t('tabs.topology')}</span>
                  </button>

                  {checkPermission(currentUser, 'module', 'internet') && (
                    <button
                      onClick={() => setActiveTab('lines')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeTab === 'lines'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t('tabs.lines')}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {(customerData.internet_lines || []).length}
                      </span>
                    </button>
                  )}

                  {checkPermission(currentUser, 'module', 'servers') && (
                    <button
                      onClick={() => setActiveTab('servers')}
                      title={t('tabs.servers')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeTab === 'servers'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Server className="w-3.5 h-3.5" />
                      <span>{t('tabs.servers')}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {(customerData.physical_servers || []).length}
                      </span>
                    </button>
                  )}

                  {checkPermission(currentUser, 'module', 'vms') && (
                    <button
                      onClick={() => setActiveTab('vms')}
                      title={t('tabs.vms')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeTab === 'vms'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>{t('tabs.vms')}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                        {(customerData.virtual_machines || []).length}
                      </span>
                    </button>
                  )}

                  {checkPermission(currentUser, 'module', 'computers') && (
                    <button
                      onClick={() => setActiveTab('pcs')}
                      title={t('tabs.pcs')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeTab === 'pcs'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>{t('tabs.pcs')}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {(customerData.user_computers || []).length}
                      </span>
                    </button>
                  )}

                  {checkPermission(currentUser, 'module', 'firewalls') && (
                    <button
                      onClick={() => setActiveTab('firewalls')}
                      title={
                        currentCustomerHasCriticalFirewall
                          ? '🚨 KRİTİK: 15 günden az kalan güvenlik duvarı lisansı var!'
                          : currentCustomerHasWarningFirewall
                          ? '⚠️ UYARI: Son 30 gün içinde süresi dolacak güvenlik duvarı lisansı var'
                          : t('tabs.firewalls')
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer relative ${
                        activeTab === 'firewalls'
                          ? currentCustomerHasCriticalFirewall
                            ? 'bg-rose-700 text-white shadow-md shadow-rose-950/50'
                            : currentCustomerHasWarningFirewall
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-rose-600 text-white shadow-sm'
                          : currentCustomerHasCriticalFirewall
                          ? 'text-rose-300 hover:text-white hover:bg-rose-950/60 border border-rose-600/70 animate-pulse'
                          : currentCustomerHasWarningFirewall
                          ? 'text-amber-300 hover:text-white hover:bg-amber-950/60 border border-amber-600/70'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Shield className={`w-3.5 h-3.5 ${
                        currentCustomerHasCriticalFirewall
                          ? 'text-rose-300'
                          : currentCustomerHasWarningFirewall
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`} />
                      <span>{t('tabs.firewalls')}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
                        currentCustomerHasCriticalFirewall
                          ? 'bg-rose-950 text-rose-200 border-rose-600 font-bold'
                          : currentCustomerHasWarningFirewall
                          ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}>
                        {(customerData.firewalls || []).length}
                      </span>
                      {currentCustomerHasCriticalFirewall ? (
                        <span className="relative flex h-2 w-2" title="🚨 Kritik: 15 günden az kaldı!">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-90"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      ) : currentCustomerHasWarningFirewall ? (
                        <span className="relative flex h-2 w-2" title="⚠️ Uyarı: Son 30 gün!">
                          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      ) : null}
                    </button>
                  )}

                  {checkPermission(currentUser, 'module', 'antivirus') && (
                    <button
                      onClick={() => setActiveTab('antivirus')}
                      title={
                        currentCustomerHasCriticalAntivirus
                          ? '🚨 KRİTİK: 15 günden az kalan antivirüs lisansı var!'
                          : currentCustomerHasWarningAntivirus
                          ? '⚠️ UYARI: Son 30 gün içinde süresi dolacak antivirüs lisansı var'
                          : t('tabs.antivirus')
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer relative ${
                        activeTab === 'antivirus'
                          ? currentCustomerHasCriticalAntivirus
                            ? 'bg-rose-700 text-white shadow-md shadow-rose-950/50'
                            : currentCustomerHasWarningAntivirus
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-teal-600 text-white shadow-sm'
                          : currentCustomerHasCriticalAntivirus
                          ? 'text-rose-300 hover:text-white hover:bg-rose-950/60 border border-rose-600/70 animate-pulse'
                          : currentCustomerHasWarningAntivirus
                          ? 'text-amber-300 hover:text-white hover:bg-amber-950/60 border border-amber-600/70'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 ${
                        currentCustomerHasCriticalAntivirus
                          ? 'text-rose-300'
                          : currentCustomerHasWarningAntivirus
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`} />
                      <span>{t('tabs.antivirus')}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
                        currentCustomerHasCriticalAntivirus
                          ? 'bg-rose-950 text-rose-200 border-rose-600 font-bold'
                          : currentCustomerHasWarningAntivirus
                          ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold'
                          : 'bg-teal-950 text-teal-300 border-teal-800'
                      }`}>
                        {(customerData.antivirus_licenses || []).length}
                      </span>
                      {currentCustomerHasCriticalAntivirus ? (
                        <span className="relative flex h-2 w-2" title="🚨 Kritik: 15 günden az kaldı!">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-90"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      ) : currentCustomerHasWarningAntivirus ? (
                        <span className="relative flex h-2 w-2" title="⚠️ Uyarı: Son 30 gün!">
                          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      ) : null}
                    </button>
                  )}

                  {checkPermission(currentUser, 'module', 'backups') && (
                    <button
                      onClick={() => setActiveTab('backups')}
                      title={t('tabs.backups')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeTab === 'backups'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{t('tabs.backups')}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                        {(customerData.backup_units || []).length}
                      </span>
                    </button>
                  )}

                  {checkPermission(currentUser, 'module', 'wifi') && (
                    <button
                      onClick={() => setActiveTab('wifi')}
                      title={t('tabs.wifi')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeTab === 'wifi'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Wifi className="w-3.5 h-3.5 text-sky-400" />
                      <span>{t('tabs.wifi')}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
                        {(customerData.wifi_access_points || []).length} AP
                      </span>
                    </button>
                  )}

                  {checkPermission(currentUser, 'module', 'mail') && (
                    <button
                      onClick={() => setActiveTab('mail')}
                      title={t('tabs.mailTooltip') || t('tabs.mail')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                        activeTab === 'mail'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t('tabs.mail')}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                        {(customerData.mail_accounts || []).length}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Tab Component */}
              <div className="flex-1 pb-10">
                {activeTab === 'overview' && (
                  <OverviewTab
                    customer={customerData}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onOpenAddModal={handleQuickAdd}
                    neonEnabled={neonEnabled}
                    canEdit={checkPermission(currentUser, 'edit')}
                    currentUser={currentUser}
                  />
                )}

                {activeTab === 'topology' && (
                  <ErrorBoundary title="Ağ Topolojisi Sekmesinde Bir Sorun Oluştu">
                    <NetworkTopologyTab
                      customer={customerData}
                      onOpenReport={() => setIsReportModalOpen(true)}
                    />
                  </ErrorBoundary>
                )}

                {activeTab === 'lines' && (
                  <InternetLinesTab
                    lines={customerData.internet_lines || []}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    canViewPasswords={checkPermission(currentUser, 'view_passwords')}
                    onAdd={() => {
                      setEditingLine(null);
                      setIsLineModalOpen(true);
                    }}
                    onEdit={(l) => {
                      setEditingLine(l);
                      setIsLineModalOpen(true);
                    }}
                    onDelete={handleDeleteLine}
                  />
                )}

                {activeTab === 'servers' && (
                  <PhysicalServersTab
                    customer={customerData}
                    servers={customerData.physical_servers || []}
                    branches={customerBranches}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    canViewPasswords={checkPermission(currentUser, 'view_passwords')}
                    onAdd={() => {
                      setEditingServer(null);
                      setIsServerModalOpen(true);
                    }}
                    onEdit={(srv) => {
                      setEditingServer(srv);
                      setIsServerModalOpen(true);
                    }}
                    onDelete={handleDeleteServer}
                    onReloadCustomer={() => customerData && loadCustomerDetails(customerData.id)}
                  />
                )}

                {activeTab === 'vms' && (
                  <VirtualMachinesTab
                    customer={customerData}
                    branches={customerBranches}
                    vms={customerData.virtual_machines || []}
                    physicalServers={customerData.physical_servers || []}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    onAdd={() => {
                      setEditingVM(null);
                      setIsVMModalOpen(true);
                    }}
                    onEdit={(vm) => {
                      setEditingVM(vm);
                      setIsVMModalOpen(true);
                    }}
                    onDelete={handleDeleteVM}
                    onReloadCustomer={() => customerData && loadCustomerDetails(customerData.id)}
                  />
                )}

                {activeTab === 'pcs' && (
                  <UserComputersTab
                    customer={customerData}
                    computers={customerData.user_computers || []}
                    branches={customerBranches}
                    mailAccounts={customerData.mail_accounts || []}
                    currentUser={currentUser}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    onAdd={() => {
                      setEditingPC(null);
                      setIsPCModalOpen(true);
                    }}
                    onEdit={(pc) => {
                      setEditingPC(pc);
                      setIsPCModalOpen(true);
                    }}
                    onDelete={handleDeletePC}
                    onOpenReport={() => setIsReportModalOpen(true)}
                    onReloadCustomer={() => loadCustomerDetails(selectedCustomerId)}
                  />
                )}

                {activeTab === 'firewalls' && (
                  <FirewallsTab
                    firewalls={customerData.firewalls || []}
                    branches={customerBranches}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    canViewPasswords={checkPermission(currentUser, 'view_passwords')}
                    onAdd={() => {
                      setEditingFirewall(null);
                      setIsFirewallModalOpen(true);
                    }}
                    onEdit={(fw) => {
                      setEditingFirewall(fw);
                      setIsFirewallModalOpen(true);
                    }}
                    onDelete={handleDeleteFirewall}
                  />
                )}

                {activeTab === 'antivirus' && (
                  <AntivirusTab
                    licenses={customerData.antivirus_licenses || []}
                    branches={customerBranches}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    onAdd={() => {
                      setEditingAntivirus(null);
                      setIsAntivirusModalOpen(true);
                    }}
                    onEdit={(item) => {
                      setEditingAntivirus(item);
                      setIsAntivirusModalOpen(true);
                    }}
                    onDelete={handleDeleteAntivirus}
                  />
                )}

                {activeTab === 'backups' && (
                  <BackupUnitsTab
                    backupUnits={customerData.backup_units || []}
                    branches={customerBranches}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    canViewPasswords={checkPermission(currentUser, 'view_passwords')}
                    onAdd={() => {
                      setEditingBackup(null);
                      setIsBackupModalOpen(true);
                    }}
                    onEdit={(bu) => {
                      setEditingBackup(bu);
                      setIsBackupModalOpen(true);
                    }}
                    onDelete={handleDeleteBackup}
                  />
                )}

                {activeTab === 'wifi' && (
                  <WifiTab
                    customer={customerData}
                    controllers={customerData.wifi_controllers || []}
                    accessPoints={customerData.wifi_access_points || []}
                    networks={customerData.wifi_networks || []}
                    branches={customerBranches}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    canViewPasswords={checkPermission(currentUser, 'view_passwords')}
                    onAddController={() => {
                      setEditingWifiController(null);
                      setIsWifiControllerModalOpen(true);
                    }}
                    onEditController={(ctrl) => {
                      setEditingWifiController(ctrl);
                      setIsWifiControllerModalOpen(true);
                    }}
                    onDeleteController={handleDeleteWifiController}
                    onAddAP={() => {
                      setEditingWifiAP(null);
                      setIsWifiAPModalOpen(true);
                    }}
                    onEditAP={(ap) => {
                      setEditingWifiAP(ap);
                      setIsWifiAPModalOpen(true);
                    }}
                    onDeleteAP={handleDeleteWifiAP}
                    onAddNetwork={() => {
                      setEditingWifiNetwork(null);
                      setIsWifiNetworkModalOpen(true);
                    }}
                    onEditNetwork={(net) => {
                      setEditingWifiNetwork(net);
                      setIsWifiNetworkModalOpen(true);
                    }}
                    onDeleteNetwork={handleDeleteWifiNetwork}
                  />
                )}

                {activeTab === 'mail' && (
                  <MailTab
                    customer={customerData}
                    mailServices={customerData.mail_services || []}
                    mailAccounts={customerData.mail_accounts || []}
                    branches={customerBranches}
                    computers={customerData.user_computers || []}
                    currentUser={currentUser}
                    canEdit={checkPermission(currentUser, 'edit')}
                    canDelete={checkPermission(currentUser, 'delete')}
                    canViewPasswords={checkPermission(currentUser, 'view_passwords')}
                    onAddService={() => {
                      setEditingMailService(null);
                      setIsMailServiceModalOpen(true);
                    }}
                    onEditService={(srv) => {
                      setEditingMailService(srv);
                      setIsMailServiceModalOpen(true);
                    }}
                    onDeleteService={handleDeleteMailService}
                    onAddAccount={() => {
                      setEditingMailAccount(null);
                      setIsMailAccountModalOpen(true);
                    }}
                    onEditAccount={(acc) => {
                      setEditingMailAccount(acc);
                      setIsMailAccountModalOpen(true);
                    }}
                    onDeleteAccount={handleDeleteMailAccount}
                    onQuickUpdateAccount={handleQuickUpdateMailAccount}
                    onReloadCustomer={() => loadCustomerDetails(selectedCustomerId)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Page Footer */}
          <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 backdrop-blur-sm py-4 px-6 text-center shrink-0">
            <div className="w-full mx-auto flex flex-col items-center justify-center gap-1">
              <p className="text-xs font-medium text-slate-400">
                Designed &amp; Developed by <span className="text-blue-400 font-semibold tracking-wide">Önder Cihan ACAR</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                &copy; 2026. All Rights Reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
      )}

      {/* ===================== MODALS ===================== */}
      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        customer={editingCustomer}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />

      {/* Physical Server Modal */}
      <ServerModal
        isOpen={isServerModalOpen}
        server={editingServer}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsServerModalOpen(false);
          setEditingServer(null);
        }}
        onSave={handleSaveServer}
      />

      {/* VM Modal */}
      <VMModal
        isOpen={isVMModalOpen}
        vm={editingVM}
        customerId={selectedCustomerId}
        physicalServers={customerData?.physical_servers || []}
        onClose={() => {
          setIsVMModalOpen(false);
          setEditingVM(null);
        }}
        onSave={handleSaveVM}
      />

      {/* PC Modal */}
      <ComputerModal
        isOpen={isPCModalOpen}
        computer={editingPC}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsPCModalOpen(false);
          setEditingPC(null);
        }}
        onSave={handleSavePC}
      />

      {/* Firewall Modal */}
      <FirewallModal
        isOpen={isFirewallModalOpen}
        firewall={editingFirewall}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsFirewallModalOpen(false);
          setEditingFirewall(null);
        }}
        onSave={handleSaveFirewall}
      />

      {/* Backup Unit Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        backup={editingBackup}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsBackupModalOpen(false);
          setEditingBackup(null);
        }}
        onSave={handleSaveBackup}
      />

      {/* Internet Line / Branch Modal */}
      <InternetLineModal
        isOpen={isLineModalOpen}
        line={editingLine}
        customerId={selectedCustomerId}
        onClose={() => {
          setIsLineModalOpen(false);
          setEditingLine(null);
        }}
        onSave={handleSaveLine}
      />

      {/* Wi-Fi Controller Modal */}
      <WifiControllerModal
        isOpen={isWifiControllerModalOpen}
        controller={editingWifiController}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsWifiControllerModalOpen(false);
          setEditingWifiController(null);
        }}
        onSave={handleSaveWifiController}
      />

      {/* Wi-Fi Access Point Modal */}
      <WifiAPModal
        isOpen={isWifiAPModalOpen}
        ap={editingWifiAP}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsWifiAPModalOpen(false);
          setEditingWifiAP(null);
        }}
        onSave={handleSaveWifiAP}
      />

      {/* Wi-Fi Network / SSID Modal */}
      <WifiNetworkModal
        isOpen={isWifiNetworkModalOpen}
        network={editingWifiNetwork}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsWifiNetworkModalOpen(false);
          setEditingWifiNetwork(null);
        }}
        onSave={handleSaveWifiNetwork}
      />

      {/* Global Omnibox Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false })}
      />

      {/* Customer Inventory & Department Report Modal (PDF & Excel) */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        customer={customerData}
      />

      {/* License Alert Center Modal (Firewalls, Antivirus & Mail/Exchange) */}
      <LicenseAlertModal
        isOpen={isLicenseAlertModalOpen}
        onClose={() => setIsLicenseAlertModalOpen(false)}
        licenses={licenseAlerts}
        onSelectLicense={(customerId, type, itemId) => {
          setSelectedCustomerId(customerId);
          if (type === 'antivirus') {
            setActiveTab('antivirus');
          } else if (type === 'mail') {
            setActiveTab('mail');
          } else {
            setActiveTab('firewalls');
          }
          loadCustomerDetails(customerId);
        }}
      />

      {/* Antivirus License Modal */}
      <AntivirusModal
        isOpen={isAntivirusModalOpen}
        antivirus={editingAntivirus}
        license={editingAntivirus}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsAntivirusModalOpen(false);
          setEditingAntivirus(null);
        }}
        onSave={handleSaveAntivirus}
      />

      {/* Mail Service & Panel Modal */}
      <MailServiceModal
        isOpen={isMailServiceModalOpen}
        service={editingMailService}
        customerId={selectedCustomerId}
        branches={customerBranches}
        onClose={() => {
          setIsMailServiceModalOpen(false);
          setEditingMailService(null);
        }}
        onSave={handleSaveMailService}
      />

      {/* Mail Account Modal */}
      <MailAccountModal
        isOpen={isMailAccountModalOpen}
        account={editingMailAccount}
        customerId={selectedCustomerId}
        mailServices={customerData?.mail_services || []}
        branches={customerBranches}
        onClose={() => {
          setIsMailAccountModalOpen(false);
          setEditingMailAccount(null);
        }}
        onSave={handleSaveMailAccount}
      />

      {/* IT Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={isKBModalOpen}
        onClose={() => {
          setIsKBModalOpen(false);
          setEditingKBItem(null);
        }}
        onSave={handleSaveKBItem}
        item={editingKBItem}
        customers={customers}
      />

      {/* Admin Login & System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        stats={stats}
        isAdminLoggedIn={isAdminLoggedIn}
        currentUser={currentUser}
        onLoginAdmin={handleLoginAdmin}
        onLogoutAdmin={handleLogoutAdmin}
        neonEnabled={neonEnabled}
        onToggleNeon={handleToggleNeon}
      />

      {/* Omni AI Assistant Floating Mascot Widget */}
      <AIAssistantMascot
        stats={stats}
        licenseAlerts={licenseAlerts}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenLicenseAlerts={() => setIsLicenseAlertModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        selectedCustomerName={customerData?.name}
        currentUser={currentUser}
        customers={customers}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* User Guide & Help Center Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* OmniHub Protected Enterprise Licensing Modal */}
      <OmniHubLicenseModal
        isOpen={isOmniHubLicenseModalOpen}
        onClose={() => setIsOmniHubLicenseModalOpen(false)}
        onUpdated={loadOmniLicense}
      />

      {/* 2 Aşamalı Güvenlik Korumalı Müşteri Silme Modalı (Sadece Admin + Parola) */}
      <DeleteCustomerSecurityModal
        isOpen={isDeleteSecurityModalOpen}
        onClose={() => setIsDeleteSecurityModalOpen(false)}
        customer={customerData}
        currentUser={currentUser}
        onSuccess={async (deletedCust) => {
          setSelectedCustomerId(null);
          await loadCustomers();
          await loadStats();
        }}
      />

      {/* Felaket Kurtarma Çantası (Offline AES-256 Kasa) */}
      <DisasterVaultModal
        isOpen={isDisasterVaultModalOpen}
        onClose={() => setIsDisasterVaultModalOpen(false)}
        customer={customerData}
      />

      {/* Müşteri IT Sağlık & Güvenlik Karnesi (Risk Audit) */}
      <SecurityAuditModal
        isOpen={isSecurityAuditModalOpen}
        onClose={() => setIsSecurityAuditModalOpen(false)}
        customer={customerData}
      />

      {/* Akıllı QR Kod & Varlık Etiketleyici Modalı */}
      {isAssetTagModalOpen && customerData && (
        <AssetTagModal
          isOpen={isAssetTagModalOpen}
          onClose={() => setIsAssetTagModalOpen(false)}
          customer={customerData}
          deviceType="pc"
          computers={customerData.user_computers || []}
          servers={customerData.physical_servers || []}
          firewalls={customerData.firewalls || []}
        />
      )}
    </div>
  );
}
