const API_BASE = '/api';

function getAuthToken() {
  try {
    const raw = localStorage.getItem('itmanager_user_session') || sessionStorage.getItem('itmanager_user_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.token || null;
    }
  } catch (e) {}
  return null;
}

async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const res = await window.fetch(url, { ...options, headers });

  if (res.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
    localStorage.removeItem('itmanager_user_session');
    sessionStorage.removeItem('itmanager_user_session');
    localStorage.removeItem('itmanager_admin_logged_in');
    window.dispatchEvent(new CustomEvent('itm_auth_required'));
  }

  return res;
}


export const api = {
  // Stats
  getStats: async () => {
    const res = await authFetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('İstatistikler yüklenemedi');
    return res.json();
  },

  // Customers
  getCustomers: async () => {
    const res = await authFetch(`${API_BASE}/customers`);
    if (!res.ok) throw new Error('Müşteriler alınamadı');
    return res.json();
  },

  getCustomer: async (id) => {
    const res = await authFetch(`${API_BASE}/customers/${id}`);
    if (!res.ok) throw new Error('Müşteri detayları alınamadı');
    return res.json();
  },

  generatePdf: async (html, filename) => {
    const res = await authFetch(`${API_BASE}/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, filename })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'PDF oluşturulamadı');
    }
    return res.blob();
  },

  createCustomer: async (data) => {
    const res = await authFetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Müşteri eklenemedi');
    return res.json();
  },

  updateCustomer: async (id, data) => {
    const res = await authFetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Müşteri güncellenemedi');
    return res.json();
  },

  deleteCustomer: async (id, adminPassword = null) => {
    const headers = {};
    if (adminPassword) {
      headers['x-admin-password'] = encodeURIComponent(adminPassword);
      headers['Content-Type'] = 'application/json';
    }
    const res = await authFetch(`${API_BASE}/customers/${id}`, {
      method: 'DELETE',
      headers,
      body: adminPassword ? JSON.stringify({ adminPassword }) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Müşteri silinemedi');
    return data;
  },

  // Physical Servers
  getPhysicalServers: async (customerId) => {
    const url = customerId ? `${API_BASE}/physical-servers?customerId=${customerId}` : `${API_BASE}/physical-servers`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Fiziksel sunucular alınamadı');
    return res.json();
  },

  createServer: async (data) => {
    const res = await authFetch(`${API_BASE}/physical-servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Sunucu eklenemedi');
    return res.json();
  },

  updateServer: async (id, data) => {
    const res = await authFetch(`${API_BASE}/physical-servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Sunucu güncellenemedi');
    return res.json();
  },

  deleteServer: async (id) => {
    const res = await authFetch(`${API_BASE}/physical-servers/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Sunucu silinemedi');
    return res.json();
  },

  // Virtual Machines
  getVirtualMachines: async (customerId) => {
    const url = customerId ? `${API_BASE}/virtual-machines?customerId=${customerId}` : `${API_BASE}/virtual-machines`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Sanal makineler alınamadı');
    return res.json();
  },

  createVM: async (data) => {
    const res = await authFetch(`${API_BASE}/virtual-machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Sanal makine eklenemedi');
    return res.json();
  },

  updateVM: async (id, data) => {
    const res = await authFetch(`${API_BASE}/virtual-machines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Sanal makine güncellenemedi');
    return res.json();
  },

  deleteVM: async (id) => {
    const res = await authFetch(`${API_BASE}/virtual-machines/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Sanal makine silinemedi');
    return res.json();
  },

  // User Computers
  getUserComputers: async (customerId) => {
    const url = customerId ? `${API_BASE}/user-computers?customerId=${customerId}` : `${API_BASE}/user-computers`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Kullanıcı bilgisayarları alınamadı');
    return res.json();
  },

  createComputer: async (data) => {
    const res = await authFetch(`${API_BASE}/user-computers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Bilgisayar eklenemedi');
    return res.json();
  },

  updateComputer: async (id, data) => {
    const res = await authFetch(`${API_BASE}/user-computers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Bilgisayar güncellenemedi');
    return res.json();
  },

  deleteComputer: async (id) => {
    const res = await authFetch(`${API_BASE}/user-computers/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Bilgisayar silinemedi');
    return res.json();
  },

  // Firewalls & License Alerts
  getFirewallLicenseAlerts: async () => {
    const res = await authFetch(`${API_BASE}/alerts/firewall-licenses`);
    if (!res.ok) throw new Error('Firewall lisans uyarıları alınamadı');
    return res.json();
  },

  getFirewalls: async (customerId) => {
    const url = customerId ? `${API_BASE}/firewalls?customerId=${customerId}` : `${API_BASE}/firewalls`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Firewall kayıtları alınamadı');
    return res.json();
  },

  createFirewall: async (data) => {
    const res = await authFetch(`${API_BASE}/firewalls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Firewall eklenemedi');
    return res.json();
  },

  updateFirewall: async (id, data) => {
    const res = await authFetch(`${API_BASE}/firewalls/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Firewall güncellenemedi');
    return res.json();
  },

  deleteFirewall: async (id) => {
    const res = await authFetch(`${API_BASE}/firewalls/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Firewall silinemedi');
    return res.json();
  },

  // Backup Units
  getBackupUnits: async (customerId) => {
    const url = customerId ? `${API_BASE}/backup-units?customerId=${customerId}` : `${API_BASE}/backup-units`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Yedekleme üniteleri alınamadı');
    return res.json();
  },

  createBackupUnit: async (data) => {
    const res = await authFetch(`${API_BASE}/backup-units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Yedekleme ünitesi eklenemedi');
    return res.json();
  },

  updateBackupUnit: async (id, data) => {
    const res = await authFetch(`${API_BASE}/backup-units/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Yedekleme ünitesi güncellenemedi');
    return res.json();
  },

  deleteBackupUnit: async (id) => {
    const res = await authFetch(`${API_BASE}/backup-units/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Yedekleme ünitesi silinemedi');
    return res.json();
  },

  // Internet Lines & Branches
  getInternetLines: async (customerId) => {
    const url = customerId ? `${API_BASE}/internet-lines?customerId=${customerId}` : `${API_BASE}/internet-lines`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('İnternet hatları ve şubeler alınamadı');
    return res.json();
  },

  createInternetLine: async (data) => {
    const res = await authFetch(`${API_BASE}/internet-lines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('İnternet hattı / şube eklenemedi');
    return res.json();
  },

  updateInternetLine: async (id, data) => {
    const res = await authFetch(`${API_BASE}/internet-lines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('İnternet hattı güncellenemedi');
    return res.json();
  },

  deleteInternetLine: async (id) => {
    const res = await authFetch(`${API_BASE}/internet-lines/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('İnternet hattı silinemedi');
    return res.json();
  },

  // Wi-Fi Controllers
  getWifiControllers: async (customerId) => {
    const url = customerId ? `${API_BASE}/wifi-controllers?customerId=${customerId}` : `${API_BASE}/wifi-controllers`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Wi-Fi kontrolcüleri alınamadı');
    return res.json();
  },

  createWifiController: async (data) => {
    const res = await authFetch(`${API_BASE}/wifi-controllers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Wi-Fi kontrolcüsü eklenemedi');
    return res.json();
  },

  updateWifiController: async (id, data) => {
    const res = await authFetch(`${API_BASE}/wifi-controllers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Wi-Fi kontrolcüsü güncellenemedi');
    return res.json();
  },

  deleteWifiController: async (id) => {
    const res = await authFetch(`${API_BASE}/wifi-controllers/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Wi-Fi kontrolcüsü silinemedi');
    return res.json();
  },

  // Wi-Fi Access Points
  getWifiAccessPoints: async (customerId) => {
    const url = customerId ? `${API_BASE}/wifi-access-points?customerId=${customerId}` : `${API_BASE}/wifi-access-points`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Wi-Fi erişim noktaları alınamadı');
    return res.json();
  },

  createWifiAP: async (data) => {
    const res = await authFetch(`${API_BASE}/wifi-access-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Wi-Fi AP cihazı eklenemedi');
    return res.json();
  },

  updateWifiAP: async (id, data) => {
    const res = await authFetch(`${API_BASE}/wifi-access-points/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Wi-Fi AP cihazı güncellenemedi');
    return res.json();
  },

  deleteWifiAP: async (id) => {
    const res = await authFetch(`${API_BASE}/wifi-access-points/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Wi-Fi AP cihazı silinemedi');
    return res.json();
  },

  // Wi-Fi Networks (SSID)
  getWifiNetworks: async (customerId) => {
    const url = customerId ? `${API_BASE}/wifi-networks?customerId=${customerId}` : `${API_BASE}/wifi-networks`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Wi-Fi ağları (SSID) alınamadı');
    return res.json();
  },

  createWifiNetwork: async (data) => {
    const res = await authFetch(`${API_BASE}/wifi-networks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Wi-Fi ağı (SSID) eklenemedi');
    return res.json();
  },

  updateWifiNetwork: async (id, data) => {
    const res = await authFetch(`${API_BASE}/wifi-networks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Wi-Fi ağı güncellenemedi');
    return res.json();
  },

  deleteWifiNetwork: async (id) => {
    const res = await authFetch(`${API_BASE}/wifi-networks/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Wi-Fi ağı silinemedi');
    return res.json();
  },

  // Knowledge Base (IT Solutions & Runbook)
  getKnowledgeBase: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'Tümü') query.set('category', params.category);
    if (params.q) query.set('q', params.q);
    if (params.customerId) query.set('customerId', params.customerId);
    const qs = query.toString();
    const url = qs ? `${API_BASE}/knowledge-base?${qs}` : `${API_BASE}/knowledge-base`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Bilgi bankası çözümleri alınamadı');
    return res.json();
  },

  getKnowledgeBaseItem: async (id) => {
    const res = await authFetch(`${API_BASE}/knowledge-base/${id}`);
    if (!res.ok) throw new Error('Çözüm detayı alınamadı');
    return res.json();
  },

  createKnowledgeBaseItem: async (data) => {
    const res = await authFetch(`${API_BASE}/knowledge-base`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Çözüm kaydedilemedi');
    return res.json();
  },

  updateKnowledgeBaseItem: async (id, data) => {
    const res = await authFetch(`${API_BASE}/knowledge-base/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Çözüm güncellenemedi');
    return res.json();
  },

  deleteKnowledgeBaseItem: async (id) => {
    const res = await authFetch(`${API_BASE}/knowledge-base/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Çözüm silinemedi');
    return res.json();
  },

  // Search
  search: async (query) => {
    if (!query) return [];
    const res = await authFetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Arama hatası');
    return res.json();
  },

  // Antivirus Licenses
  getAntivirusLicenses: async (customerId) => {
    const url = customerId ? `${API_BASE}/antivirus-licenses?customerId=${customerId}` : `${API_BASE}/antivirus-licenses`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Antivirüs lisansları alınamadı');
    return res.json();
  },

  createAntivirusLicense: async (data) => {
    const res = await authFetch(`${API_BASE}/antivirus-licenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Antivirüs lisansı eklenemedi');
    }
    return res.json();
  },

  updateAntivirusLicense: async (id, data) => {
    const res = await authFetch(`${API_BASE}/antivirus-licenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Antivirüs lisansı güncellenemedi');
    }
    return res.json();
  },

  deleteAntivirusLicense: async (id) => {
    const res = await authFetch(`${API_BASE}/antivirus-licenses/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Antivirüs lisansı silinemedi');
    return res.json();
  },

  // Mail Services (Management Panels & Exchange)
  getMailServices: async (customerId) => {
    const url = customerId ? `${API_BASE}/mail-services?customerId=${customerId}` : `${API_BASE}/mail-services`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Mail servisleri alınamadı');
    return res.json();
  },

  createMailService: async (data) => {
    const res = await authFetch(`${API_BASE}/mail-services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Mail servisi eklenemedi');
    }
    return res.json();
  },

  updateMailService: async (id, data) => {
    const res = await authFetch(`${API_BASE}/mail-services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Mail servisi güncellenemedi');
    }
    return res.json();
  },

  deleteMailService: async (id) => {
    const res = await authFetch(`${API_BASE}/mail-services/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Mail servisi silinemedi');
    return res.json();
  },

  // Mail Accounts (User Mailboxes)
  getMailAccounts: async (customerId, mailServiceId) => {
    let url = `${API_BASE}/mail-accounts`;
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (mailServiceId) params.append('mailServiceId', mailServiceId);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const res = await authFetch(url);
    if (!res.ok) throw new Error('E-posta hesapları alınamadı');
    return res.json();
  },

  createMailAccount: async (data) => {
    const res = await authFetch(`${API_BASE}/mail-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'E-posta hesabı eklenemedi');
    }
    return res.json();
  },

  updateMailAccount: async (id, data) => {
    const res = await authFetch(`${API_BASE}/mail-accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'E-posta hesabı güncellenemedi');
    }
    return res.json();
  },

  deleteMailAccount: async (id) => {
    const res = await authFetch(`${API_BASE}/mail-accounts/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('E-posta hesabı silinemedi');
    return res.json();
  },

  createMailAccountsBulk: async (data) => {
    const res = await authFetch(`${API_BASE}/mail-accounts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Toplu e-posta hesapları eklenemedi');
    }
    return res.json();
  },

  fetchM365Users: async (credentials) => {
    const res = await authFetch(`${API_BASE}/m365/fetch-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Microsoft 365 kullanıcıları çekilemedi');
    }
    return res.json();
  },

  // All License Alerts (Firewalls, Antivirus & Mail/Exchange)
  getAllLicenseAlerts: async () => {
    const res = await authFetch(`${API_BASE}/alerts/all-licenses`);
    if (!res.ok) throw new Error('Lisans uyarıları alınamadı');
    return res.json();
  },

  // Auth & 2FA (Google Authenticator)
  getAuthStatus: async () => {
    const res = await authFetch(`${API_BASE}/auth/status`);
    if (!res.ok) throw new Error('Güvenlik durumu alınamadı');
    return res.json();
  },

  loginAdmin: async (credentials) => {
    const res = await authFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Giriş yapılamadı');
    }
    return data;
  },

  registerUser: async (userData) => {
    const res = await authFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Kullanıcı kaydı oluşturulamadı');
    }
    return data;
  },

  getUsers: async () => {
    const res = await authFetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Kullanıcı listesi alınamadı');
    return res.json();
  },

  updateUserPermissions: async (id, payload) => {
    const res = await authFetch(`${API_BASE}/users/${id}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Yetkiler güncellenemedi');
    }
    return data;
  },

  deleteUser: async (id) => {
    const res = await authFetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Kullanıcı silinemedi');
    }
    return data;
  },

  changeAdminPassword: async (passwords) => {
    const res = await authFetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwords)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Parola güncellenemedi');
    }
    return data;
  },

  setupTotp: async (payload = {}) => {
    const res = await authFetch(`${API_BASE}/auth/totp/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('2FA kurulum bilgisi alınamadı');
    return res.json();
  },

  enableTotp: async (payload) => {
    const res = await authFetch(`${API_BASE}/auth/totp/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || '2FA etkinleştirilemedi');
    }
    return data;
  },

  disableTotp: async (payload) => {
    const res = await authFetch(`${API_BASE}/auth/totp/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || '2FA devre dışı bırakılamadı');
    }
    return data;
  },

  resetUserTotp: async (userId) => {
    const res = await authFetch(`${API_BASE}/users/${userId}/reset-2fa`, {
      method: 'POST'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || '2FA sıfırlanamadı');
    }
    return data;
  },

    // Security Audits & Status
  getSecurityStatus: async () => {
    const res = await authFetch(`${API_BASE}/security/status`);
    if (!res.ok) throw new Error('Güvenlik durumu alınamadı');
    return res.json();
  },

  getSecurityLogs: async (limit = 50) => {
    const res = await authFetch(`${API_BASE}/security/logs?limit=${limit}`);
    if (!res.ok) throw new Error('Güvenlik denetim günlüğü alınamadı');
    return res.json();
  },

  uploadLogo: async (dataUrl, filename = 'logo.mp4') => {
    const res = await authFetch(`${API_BASE}/upload-logo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Logo yüklenemedi');
    }
    return data;
  },

  uploadAuthBg: async (dataUrl, filename = 'custom-auth-bg.mp4') => {
    const res = await authFetch(`${API_BASE}/upload-auth-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Arka plan yüklenemedi');
    }
    return data;
  },

  resetAuthBg: async () => {
    const res = await authFetch(`${API_BASE}/reset-auth-bg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Arka plan sıfırlanamadı');
    }
    return data;
  },

  getBackgrounds: async () => {
    const res = await authFetch(`${API_BASE}/backgrounds`);
    if (!res.ok) throw new Error('Arka plan listesi alınamadı');
    return res.json();
  },

  selectBackground: async (filename) => {
    const res = await authFetch(`${API_BASE}/select-background`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Arka plan seçilemedi');
    }
    return data;
  },

  // Reliable Blob Download for SQLite DB Backup
  downloadDbBackup: async () => {
    const res = await authFetch(`${API_BASE}/backup/download`);
    if (!res.ok) throw new Error('Veritabanı yedeği indirilemedi');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniFlow_Backup_${new Date().toISOString().slice(0, 10)}.db`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  },

  // Reliable Blob Download for Full JSON Export
  exportAllJson: async () => {
    const res = await authFetch(`${API_BASE}/export/all`);
    if (!res.ok) throw new Error('JSON yedeği alınamadı');
    const data = await res.json();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniFlow_Export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  },

  // Auto-Backup Endpoints
  getAutoBackupStatus: async () => {
    const res = await authFetch(`${API_BASE}/backup/auto-status`);
    if (!res.ok) throw new Error('Otomatik yedekleme durumu alınamadı');
    return res.json();
  },

  saveAutoBackupSettings: async (settings) => {
    const res = await authFetch(`${API_BASE}/backup/auto-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Ayarlar kaydedilemedi');
    return data;
  },

  runAutoBackupNow: async () => {
    const res = await authFetch(`${API_BASE}/backup/run-now`, {
      method: 'POST'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Otomatik yedek alınamadı');
    return data;
  },

  downloadAutoBackupFile: async (filename) => {
    const res = await authFetch(`${API_BASE}/backup/file/${encodeURIComponent(filename)}`);
    if (!res.ok) throw new Error('Yedek dosyası indirilemedi');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return true;
  },

  // Antigravity AI Diagnostic & Chat APIs
  diagnoseWithAI: async ({ message, imageBase64, mimeType, customerId, history }) => {
    const res = await authFetch(`${API_BASE}/ai/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, imageBase64, mimeType, customerId, history })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'AI teşhisi üretilemedi');
    return data;
  },

  getAISettings: async () => {
    const res = await authFetch(`${API_BASE}/ai/settings`);
    if (!res.ok) throw new Error('AI ayarları alınamadı');
    return res.json();
  },

  saveAISettings: async ({ geminiApiKey }) => {
    const res = await authFetch(`${API_BASE}/ai/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geminiApiKey })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'AI ayarları kaydedilemedi');
    return data;
  }
};

