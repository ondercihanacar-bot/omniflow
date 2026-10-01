const os = require('os');
const crypto = require('crypto');

let dbRef = null;
let getSettingRef = null;
let setSettingRef = null;

function init(db, getSetting, setSetting) {
  dbRef = db;
  getSettingRef = getSetting;
  setSettingRef = setSetting;

  // Initialize install date if not set
  if (!getSettingRef('omnihub_install_date')) {
    setSettingRef('omnihub_install_date', new Date().toISOString());
  }

  // Initial background heartbeat check
  setTimeout(() => {
    syncHeartbeat().catch(() => {});
  }, 5000);

  // Periodic heartbeat every 4 hours
  setInterval(() => {
    syncHeartbeat().catch(() => {});
  }, 4 * 60 * 60 * 1000);
}

function getHardwareId() {
  try {
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'CPU';
    const hostname = os.hostname();
    const network = os.networkInterfaces();
    let mac = '';
    for (const name of Object.keys(network)) {
      for (const net of network[name]) {
        if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
          mac = net.mac;
          break;
        }
      }
      if (mac) break;
    }
    const raw = `OMNIFLOW-${hostname}-${cpuModel}-${mac}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
    return `CPU-${hash.slice(0, 8)}-MB-${hash.slice(8, 16)}`;
  } catch (err) {
    return 'CPU-OMNIFLOW-DEFAULT-HWID';
  }
}

function getOmniHubUrl() {
  return getSettingRef('omnihub_server_url', 'http://localhost:5200');
}

function getLicenseStatus() {
  const licenseKey = getSettingRef('omnihub_license_key', '');
  const hwid = getHardwareId();
  const hubUrl = getOmniHubUrl();

  // If no license key is activated
  if (!licenseKey) {
    const installDateStr = getSettingRef('omnihub_install_date', new Date().toISOString());
    const installDate = new Date(installDateStr);
    const demoEndDate = new Date(installDate.getTime() + 15 * 24 * 3600 * 1000);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((demoEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));

    return {
      licensed: false,
      status: daysRemaining > 0 ? 'demo' : 'unlicensed',
      license_key: null,
      customer_name: 'Deneme / Ücretsiz Sürüm',
      product_name: 'OMNIFlow Enterprise',
      end_date: demoEndDate.toISOString().split('T')[0],
      days_remaining: daysRemaining,
      max_devices: 10,
      max_users: 25,
      enabled_modules: ['Network Monitor', 'Topology Map'],
      hardware_id: hwid,
      omnihub_url: hubUrl,
      last_sync: null
    };
  }

  // Active or previously activated license
  const storedStatus = getSettingRef('omnihub_license_status', 'active');
  const customerName = getSettingRef('omnihub_customer_name', 'Senkron Bilgisayar');
  const endDate = getSettingRef('omnihub_end_date', '');
  const maxDevices = parseInt(getSettingRef('omnihub_max_devices', '50'), 10);
  const maxUsers = parseInt(getSettingRef('omnihub_max_users', '100'), 10);
  let modules = [];
  try {
    modules = JSON.parse(getSettingRef('omnihub_modules', '[]'));
  } catch {
    modules = [];
  }

  let daysRemaining = null;
  let currentStatus = storedStatus;

  if (endDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(endDate);
    exp.setHours(0, 0, 0, 0);
    daysRemaining = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (daysRemaining <= 0 && storedStatus !== 'suspended') {
      currentStatus = 'expired';
    }
  }

  return {
    licensed: true,
    status: currentStatus,
    license_key: licenseKey,
    customer_name: customerName,
    product_name: 'OMNIFlow',
    end_date: endDate || 'Süresiz (Lifetime)',
    days_remaining: daysRemaining,
    max_devices: maxDevices,
    max_users: maxUsers,
    enabled_modules: modules,
    hardware_id: hwid,
    omnihub_url: hubUrl,
    last_sync: getSettingRef('omnihub_last_sync', null)
  };
}

async function activateLicense(licenseKey, hubUrl) {
  if (!licenseKey || typeof licenseKey !== 'string') {
    throw new Error('Geçersiz lisans anahtarı.');
  }

  const cleanKey = licenseKey.trim().toUpperCase();
  const targetUrl = (hubUrl || getOmniHubUrl()).replace(/\/$/, '');
  const hwid = getHardwareId();

  const payload = {
    license_key: cleanKey,
    hardware_id: hwid,
    client_version: '2.4.0',
    hostname: os.hostname()
  };

  const response = await fetch(`${targetUrl}/api/v1/license/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok || !data.valid) {
    throw new Error(data.error || 'Aktivasyon işlemi OmniHub tarafından reddedildi.');
  }

  // Save to system_settings
  setSettingRef('omnihub_server_url', targetUrl);
  setSettingRef('omnihub_license_key', cleanKey);
  setSettingRef('omnihub_license_status', data.status || 'active');
  setSettingRef('omnihub_customer_name', data.customer_name || 'Kurumsal Müşteri');
  setSettingRef('omnihub_end_date', data.end_date || '');
  setSettingRef('omnihub_max_devices', String(data.max_devices || 50));
  setSettingRef('omnihub_max_users', String(data.max_users || 100));
  setSettingRef('omnihub_modules', JSON.stringify(data.enabled_modules || []));
  setSettingRef('omnihub_last_sync', new Date().toISOString());

  return getLicenseStatus();
}

async function syncHeartbeat() {
  const licenseKey = getSettingRef('omnihub_license_key', '');
  if (!licenseKey) return;

  const targetUrl = getOmniHubUrl().replace(/\/$/, '');
  const hwid = getHardwareId();

  try {
    // Count devices
    let devCount = 0;
    try {
      devCount = dbRef.prepare('SELECT count(*) as c FROM user_computers').get().c;
    } catch (_) {}

    const response = await fetch(`${targetUrl}/api/v1/license/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        hardware_id: hwid,
        client_version: '2.4.0',
        device_count: devCount,
        active_users: 1,
        uptime_seconds: Math.floor(process.uptime())
      })
    });

    const data = await response.json();
    setSettingRef('omnihub_last_sync', new Date().toISOString());

    if (data.status) {
      setSettingRef('omnihub_license_status', data.status);
    }
    if (data.end_date) {
      setSettingRef('omnihub_end_date', data.end_date);
    }
  } catch (err) {
    console.log('[OMNIHUB-SYNC] Heartbeat unreachable, running offline mode.');
  }
}

module.exports = {
  init,
  getHardwareId,
  getLicenseStatus,
  activateLicense,
  syncHeartbeat
};
