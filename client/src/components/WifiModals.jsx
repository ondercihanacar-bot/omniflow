import React, { useState, useEffect } from 'react';
import { X, Wifi, Radio, Router, Shield, Eye, EyeOff, Key, Building2, MapPin, Globe } from 'lucide-react';

// ==========================================
// 1. WIFI CONTROLLER MODAL (UniFi / Omada)
// ==========================================
export function WifiControllerModal({ isOpen, onClose, onSave, controller, customerId, branches = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    controller_name: '',
    branch_name: 'Merkez Ofis',
    controller_type: 'Donanım (UDM / CloudKey)',
    management_ip: '',
    email: '',
    username: '',
    password: '',
    version: '',
    notes: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (controller) {
      setFormData({
        customer_id: controller.customer_id || customerId,
        controller_name: controller.controller_name || '',
        branch_name: controller.branch_name || 'Merkez Ofis',
        controller_type: controller.controller_type || 'Donanım (UDM / CloudKey)',
        management_ip: controller.management_ip || '',
        email: controller.email || '',
        username: controller.username || '',
        password: controller.password || '',
        version: controller.version || '',
        notes: controller.notes || ''
      });
    } else {
      setFormData({
        customer_id: customerId,
        controller_name: '',
        branch_name: branches[0] || 'Merkez Ofis',
        controller_type: 'Donanım (UDM / CloudKey)',
        management_ip: '',
        email: '',
        username: 'admin',
        password: '',
        version: '',
        notes: ''
      });
    }
    setShowPassword(false);
  }, [controller, customerId, branches, isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-600/20 text-sky-400 rounded-lg border border-sky-500/30">
              <Router className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {controller ? 'Wi-Fi Kontrol Panelini Düzenle' : 'Yeni Wi-Fi / UniFi Kontrolcüsü Ekle'}
              </h3>
              <p className="text-xs text-slate-400">UniFi Cloud Key, UDM-Pro veya Yazılım Controller giriş bilgileri</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Kontrolcü / Panel Adı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Atlas UniFi Cloud Gateway (UDM-SE) veya Bursa CloudKey"
              value={formData.controller_name}
              onChange={(e) => setFormData({ ...formData, controller_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Şube / Lokasyon</span>
              </label>
              <input
                type="text"
                list="controller-branch-list"
                placeholder="Örn: Merkez Ofis"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <datalist id="controller-branch-list">
                <option value="Merkez Ofis" />
                {branches.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Kontrolcü Türü
              </label>
              <select
                value={formData.controller_type}
                onChange={(e) => setFormData({ ...formData, controller_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Donanım (UDM / CloudKey)">Donanım (UDM / CloudKey / Dream Machine)</option>
                <option value="Yazılım (Windows/Linux VM)">Yazılım Controller (Windows / Linux VM)</option>
                <option value="Bulut / SaaS (unifi.ui.com)">Bulut / Cloud Portal (unifi.ui.com)</option>
                <option value="TP-Link Omada Controller">TP-Link Omada Controller</option>
                <option value="Aruba / Ruijie Cloud">Aruba / Ruijie Cloud Portal</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Arayüz IP Adresi / Web URL</span>
            </label>
            <input
              type="text"
              placeholder="Örn: https://192.168.10.1:8443 veya https://unifi.ui.com"
              value={formData.management_ip}
              onChange={(e) => setFormData({ ...formData, management_ip: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Hesap E-posta Adresi (UniFi UI Mail)
            </label>
            <input
              type="email"
              placeholder="Örn: it@atlaslojistik.com.tr"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Arayüz Kullanıcı Adı
              </label>
              <input
                type="text"
                placeholder="Örn: admin, ubnt"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Arayüz Parolası
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre giriniz"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-9 font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Yazılım / UniFi OS Sürümü
            </label>
            <input
              type="text"
              placeholder="Örn: UniFi OS 3.2.12 / Network Application 8.1.127"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Özel Notlar
            </label>
            <textarea
              rows="2"
              placeholder="Örn: Sistem odası Rack Kabinet Port 1, Bulut yedeklemesi aktif..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {controller ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. WIFI ACCESS POINT MODAL (AP CİHAZLARI)
// ==========================================
export function WifiAPModal({ isOpen, onClose, onSave, ap, customerId, controllers = [], branches = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    controller_id: '',
    ap_name: '',
    branch_name: 'Merkez Ofis',
    brand: 'Ubiquiti UniFi',
    model: 'U7 Pro',
    ip_address: '',
    mac_address: '',
    location: '',
    status: 'Aktif',
    notes: ''
  });

  useEffect(() => {
    if (ap) {
      setFormData({
        customer_id: ap.customer_id || customerId,
        controller_id: ap.controller_id || '',
        ap_name: ap.ap_name || '',
        branch_name: ap.branch_name || 'Merkez Ofis',
        brand: ap.brand || 'Ubiquiti UniFi',
        model: ap.model || '',
        ip_address: ap.ip_address || '',
        mac_address: ap.mac_address || '',
        location: ap.location || '',
        status: ap.status || 'Aktif',
        notes: ap.notes || ''
      });
    } else {
      setFormData({
        customer_id: customerId,
        controller_id: controllers[0]?.id || '',
        ap_name: '',
        branch_name: branches[0] || 'Merkez Ofis',
        brand: 'Ubiquiti UniFi',
        model: 'U7 Pro',
        ip_address: '',
        mac_address: '',
        location: '',
        status: 'Aktif',
        notes: ''
      });
    }
  }, [ap, customerId, controllers, branches, isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {ap ? 'Wi-Fi Erişim Noktasını (AP) Düzenle' : 'Yeni Wi-Fi AP Cihazı Ekle'}
              </h3>
              <p className="text-xs text-slate-400">UniFi U7, U6 Pro, Mesh antenler ve fiziksel konum bilgileri</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Cihaz (AP) Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Depo Sevkiyat AP-1"
                value={formData.ap_name}
                onChange={(e) => setFormData({ ...formData, ap_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Şube / Lokasyon</span>
              </label>
              <input
                type="text"
                list="ap-branch-list"
                placeholder="Örn: Merkez Ofis"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <datalist id="ap-branch-list">
                <option value="Merkez Ofis" />
                {branches.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Bağlı Olduğu Kontrolcü
            </label>
            <select
              value={formData.controller_id}
              onChange={(e) => setFormData({ ...formData, controller_id: e.target.value ? parseInt(e.target.value) : '' })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Bağımsız / Standalone AP --</option>
              {controllers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.controller_name} ({c.branch_name || 'Merkez'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Marka
              </label>
              <input
                type="text"
                list="brand-suggestions"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="brand-suggestions">
                <option value="Ubiquiti UniFi" />
                <option value="TP-Link Omada" />
                <option value="Aruba Instant On" />
                <option value="Ruijie Reyee" />
                <option value="Cisco Meraki" />
                <option value="MikroTik" />
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Model (örn: U7 Pro, U6 Pro)
              </label>
              <input
                type="text"
                list="model-suggestions"
                placeholder="Örn: U7 Pro"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
              <datalist id="model-suggestions">
                <option value="U7 Pro (Wi-Fi 7)" />
                <option value="U7 Pro Max" />
                <option value="U6 Pro (Wi-Fi 6)" />
                <option value="U6 Lite" />
                <option value="U6 Long-Range (LR)" />
                <option value="U6 Mesh" />
                <option value="U6 Enterprise" />
                <option value="U6 Extender" />
                <option value="UniFi AP AC Pro" />
                <option value="UniFi AP AC LR" />
                <option value="UniFi Swiss Army Knife Ultra" />
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                IP Adresi
              </label>
              <input
                type="text"
                placeholder="Örn: 192.168.10.31"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                MAC Adresi
              </label>
              <input
                type="text"
                placeholder="Örn: 74:83:C2:11:22:33"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Bulunduğu Konum / Fiziksel Yer</span>
            </label>
            <input
              type="text"
              placeholder="Örn: 2. Kat Yönetim Toplantı Odası Tavanı veya Depo Raf 12 Direk"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Çalışma Durumu
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Aktif">🟢 Aktif (Çalışıyor)</option>
                <option value="Bakımda">🟡 Bakımda / Güncelleniyor</option>
                <option value="Arızalı">🔴 Arızalı / Bağlantı Yok</option>
                <option value="Pasif">⚪ Pasif / Sökülmüş</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                PoE / Switch Port Bilgisi
              </label>
              <input
                type="text"
                placeholder="Örn: PoE+ Switch 1 Port 8"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {ap ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. WIFI NETWORK MODAL (SSID & PAROLA)
// ==========================================
export function WifiNetworkModal({ isOpen, onClose, onSave, network, customerId, controllers = [], branches = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    controller_id: '',
    ssid: '',
    password: '',
    security_type: 'WPA2/WPA3 Personal',
    vlan_id: '',
    band: '2.4 GHz & 5 GHz',
    branch_name: 'Merkez Ofis',
    is_guest: false,
    notes: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (network) {
      setFormData({
        customer_id: network.customer_id || customerId,
        controller_id: network.controller_id || '',
        ssid: network.ssid || '',
        password: network.password || '',
        security_type: network.security_type || 'WPA2/WPA3 Personal',
        vlan_id: network.vlan_id || '',
        band: network.band || '2.4 GHz & 5 GHz',
        branch_name: network.branch_name || 'Merkez Ofis',
        is_guest: !!network.is_guest,
        notes: network.notes || ''
      });
    } else {
      setFormData({
        customer_id: customerId,
        controller_id: controllers[0]?.id || '',
        ssid: '',
        password: '',
        security_type: 'WPA2/WPA3 Personal',
        vlan_id: '',
        band: '2.4 GHz & 5 GHz',
        branch_name: branches[0] || 'Merkez Ofis',
        is_guest: false,
        notes: ''
      });
    }
    setShowPassword(false);
  }, [network, customerId, controllers, branches, isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {network ? 'Wi-Fi Ağını (SSID) Düzenle' : 'Yeni Wi-Fi Yayını (SSID) Ekle'}
              </h3>
              <p className="text-xs text-slate-400">Wi-Fi ağ adı, parolası, VLAN ve güvenlik yapılandırması</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-blue-400" />
              <span>Wi-Fi SSID Adı (Ağ Adı) *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Atlas_Personel, Atlas_Misafir, Depo_El_Terminalleri"
              value={formData.ssid}
              onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Wi-Fi Parolası (Şifre)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Wi-Fi şifresi giriniz"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-9 font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Yayın Kapsamı / Şube</span>
              </label>
              <input
                type="text"
                list="ssid-branch-list"
                placeholder="Örn: Tüm Şubeler veya Merkez Ofis"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <datalist id="ssid-branch-list">
                <option value="Tüm Şubeler" />
                <option value="Merkez Ofis" />
                {branches.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                İlgili Kontrolcü
              </label>
              <select
                value={formData.controller_id}
                onChange={(e) => setFormData({ ...formData, controller_id: e.target.value ? parseInt(e.target.value) : '' })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Tüm Kontrolcüler / Bağımsız --</option>
                {controllers.map(c => (
                  <option key={c.id} value={c.id}>{c.controller_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Güvenlik Protokolü
              </label>
              <select
                value={formData.security_type}
                onChange={(e) => setFormData({ ...formData, security_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="WPA2/WPA3 Personal">WPA2 / WPA3 Personal (Önerilen)</option>
                <option value="WPA2 Personal">WPA2 Personal (Klasik)</option>
                <option value="WPA3 Personal">WPA3 Personal</option>
                <option value="WPA2/WPA3 Enterprise (802.1X / RADIUS)">WPA2/WPA3 Enterprise (802.1X)</option>
                <option value="Açık (Parolasız / Captive Portal)">Açık (Parolasız / Hotspot Portal)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Frekans Bandı
              </label>
              <select
                value={formData.band}
                onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="2.4 GHz & 5 GHz">2.4 GHz & 5 GHz (Dual Band)</option>
                <option value="2.4 GHz, 5 GHz & 6 GHz">2.4 GHz, 5 GHz & 6 GHz (Wi-Fi 7 / Tri-Band)</option>
                <option value="5 GHz Only">5 GHz Sadece (Yüksek Hız)</option>
                <option value="2.4 GHz Only">2.4 GHz Sadece (IoT / El Terminalleri)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                VLAN Yapılandırması
              </label>
              <input
                type="text"
                placeholder="Örn: VLAN 10 (192.168.10.x)"
                value={formData.vlan_id}
                onChange={(e) => setFormData({ ...formData, vlan_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={formData.is_guest}
                  onChange={(e) => setFormData({ ...formData, is_guest: e.target.checked })}
                  className="rounded text-blue-600 w-4 h-4 bg-slate-950 border-slate-700"
                />
                <span className="font-semibold text-rose-300">Misafir / İzolasyon Ağı (Guest Portal)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Açıklama & Notlar
            </label>
            <textarea
              rows="2"
              placeholder="Örn: El terminalleri için özel SSID, misafir portalı 4 saatlik oturum..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {network ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
