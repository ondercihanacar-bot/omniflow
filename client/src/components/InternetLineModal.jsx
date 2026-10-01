import React, { useState, useEffect } from 'react';
import { X, Globe, Radio, Shield, MapPin, Eye, EyeOff, Key, Server, Cpu } from 'lucide-react';

export default function InternetLineModal({ isOpen, onClose, onSave, line = null, customerId }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    branch_name: '',
    line_type: 'Fiber / Metro Ethernet',
    isp: 'Türk Telekom Metro Ethernet',
    circuit_number: '',
    is_primary: true,
    static_ip: '',
    subnet_mask: '255.255.255.248 (/29)',
    gateway: '',
    dns_servers: '195.175.39.39, 8.8.8.8',
    pppoe_user: '',
    pppoe_password: '',
    modem_brand_model: '',
    modem_ip: '192.168.1.1',
    modem_user: 'admin',
    modem_password: '',
    speed_info: '',
    location_address: '',
    notes: ''
  });

  const [showPppoePass, setShowPppoePass] = useState(false);
  const [showModemPass, setShowModemPass] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (line) {
      setFormData({
        ...line,
        customer_id: line.customer_id || customerId,
        is_primary: Boolean(line.is_primary)
      });
    } else {
      setFormData({
        customer_id: customerId,
        branch_name: '',
        line_type: 'Fiber / Metro Ethernet',
        isp: 'Türk Telekom Metro Ethernet',
        circuit_number: '',
        is_primary: true,
        static_ip: '',
        subnet_mask: '255.255.255.248 (/29)',
        gateway: '',
        dns_servers: '195.175.39.39, 8.8.8.8',
        pppoe_user: '',
        pppoe_password: '',
        modem_brand_model: '',
        modem_ip: '192.168.1.1',
        modem_user: 'admin',
        modem_password: '',
        speed_info: '',
        location_address: '',
        notes: ''
      });
    }
    setError('');
  }, [line, customerId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.branch_name.trim()) {
      setError('Şube / Lokasyon Adı zorunludur.');
      return;
    }
    onSave(formData);
  };

  const isFiber = formData.line_type.includes('Fiber') || formData.line_type.includes('Metro');
  const isVdsl = formData.line_type.includes('VDSL') || formData.line_type.includes('ADSL');

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-3xl w-full my-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {line ? 'İnternet Hattı & Şube Düzenle' : 'Yeni Şube / İnternet Hattı Ekle'}
              </h3>
              <p className="text-xs text-slate-400">Fiber (Statik IP, Subnet, Gateway) veya VDSL (PPPoE, Modem Arayüzü)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Branch & Line Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Şube / Lokasyon Adı <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Merkez Ofis (Kartal), Gebze Depo, Kadıköy Şube"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hat Türü</label>
              <select
                value={formData.line_type}
                onChange={(e) => setFormData({ ...formData, line_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Fiber / Metro Ethernet">Fiber / Metro Ethernet</option>
                <option value="GPON Fiber">GPON Fiber</option>
                <option value="VDSL / ADSL">VDSL / ADSL</option>
                <option value="4G / LTE Yedek Hat">4G / LTE Yedek Hat</option>
                <option value="Karasal / Radyolink">Karasal / Radyolink</option>
              </select>
            </div>
          </div>

          {/* ISP, Circuit Number & Line Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">İSS (Servis Sağlayıcı)</label>
              <input
                type="text"
                placeholder="Örn: Türk Telekom, Superonline, Vodafone"
                value={formData.isp}
                onChange={(e) => setFormData({ ...formData, isp: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Devre / Hizmet No</label>
              <input
                type="text"
                placeholder="Örn: TT-METRO-41289 veya 1829019283"
                value={formData.circuit_number}
                onChange={(e) => setFormData({ ...formData, circuit_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hat Hızı / Paket</label>
              <input
                type="text"
                placeholder="Örn: 100 Mbps Simetrik veya 50/8 Mbps"
                value={formData.speed_info}
                onChange={(e) => setFormData({ ...formData, speed_info: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Line Role Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 cursor-pointer"
            />
            <label htmlFor="is_primary" className="text-xs font-medium text-slate-300 cursor-pointer">
              Bu lokasyon / şube için <strong>Ana Hat (Primary WAN)</strong> olarak işaretle (Yedek hat ise işareti kaldırın)
            </label>
          </div>

          {/* ================= SECTION 1: FIBER / IP PARAMETERS ================= */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                Statik IP, Subnet Mask & Gateway (Fiber / Ağ Yapılandırması)
              </h4>
              <span className="text-[11px] text-slate-400">Tüm hatlar veya Fiber için</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dış Statik IP (WAN IP)
                </label>
                <input
                  type="text"
                  placeholder="Örn: 85.105.142.66"
                  value={formData.static_ip}
                  onChange={(e) => setFormData({ ...formData, static_ip: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alt Ağ Maskesi (Subnet Mask)
                </label>
                <input
                  type="text"
                  placeholder="Örn: 255.255.255.248 (/29)"
                  value={formData.subnet_mask}
                  onChange={(e) => setFormData({ ...formData, subnet_mask: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ağ Geçidi (Gateway IP)
                </label>
                <input
                  type="text"
                  placeholder="Örn: 85.105.142.65"
                  value={formData.gateway}
                  onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                DNS Sunucu IP Adresleri
              </label>
              <input
                type="text"
                placeholder="Örn: 195.175.39.39, 195.175.39.40, 8.8.8.8"
                value={formData.dns_servers}
                onChange={(e) => setFormData({ ...formData, dns_servers: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* ================= SECTION 2: VDSL / MODEM BILGILERI ================= */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4" />
                VDSL / ADSL Kullanıcı Bilgileri & Modem Arayüzü
              </h4>
              <span className="text-[11px] text-slate-400">VDSL / Modem kurulu şubeler için</span>
            </div>

            {/* PPPoE User & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  İnternet / PPPoE Kullanıcı Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: atlaslojistik@ttnet veya 1234567@superonline"
                  value={formData.pppoe_user}
                  onChange={(e) => setFormData({ ...formData, pppoe_user: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  İnternet / PPPoE Parolası
                </label>
                <div className="relative">
                  <input
                    type={showPppoePass ? 'text' : 'password'}
                    placeholder="PPPoE Parolası"
                    value={formData.pppoe_password}
                    onChange={(e) => setFormData({ ...formData, pppoe_password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPppoePass(!showPppoePass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showPppoePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modem Hardware & Management Web UI */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modem Marka & Model</label>
                <input
                  type="text"
                  placeholder="Örn: DrayTek Vigor 2865"
                  value={formData.modem_brand_model}
                  onChange={(e) => setFormData({ ...formData, modem_brand_model: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modem Arayüz IP / Port</label>
                <input
                  type="text"
                  placeholder="Örn: 192.168.1.1 veya :8080"
                  value={formData.modem_ip}
                  onChange={(e) => setFormData({ ...formData, modem_ip: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modem Kullanıcı Adı</label>
                <input
                  type="text"
                  placeholder="Örn: admin"
                  value={formData.modem_user}
                  onChange={(e) => setFormData({ ...formData, modem_user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Modem Parolası</label>
                <div className="relative">
                  <input
                    type={showModemPass ? 'text' : 'password'}
                    placeholder="Modem Şifresi"
                    value={formData.modem_password}
                    onChange={(e) => setFormData({ ...formData, modem_password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModemPass(!showModemPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showModemPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Location Address & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Şube / Lokasyon Adresi
              </label>
              <input
                type="text"
                placeholder="Örn: Gebze Organize Sanayi Bölgesi No:12 Kocaeli"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notlar & IPsec / VPN Durumu
              </label>
              <input
                type="text"
                placeholder="Örn: Merkeze IPsec VPN bağlı, modem köprü modunda vb."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md cursor-pointer"
            >
              {line ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
