import React, { useState, useEffect } from 'react';
import {
  X, Server, Cloud, Laptop, Shield, Database,
  Sparkles, ClipboardPaste, Check, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

// ==================== 1. PHYSICAL SERVER MODAL ====================
export function ServerModal({ isOpen, onClose, onSave, server = null, customerId, branches = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    server_name: '',
    brand: '',
    model: '',
    serial_number: '',
    cpu_info: '',
    ram_info: '',
    disk_info: '',
    ip_address: '',
    mac_address: '',
    management_ip: '',
    management_user: '',
    management_password: '',
    local_admin_user: '',
    local_admin_password: '',
    branch_name: 'Merkez Ofis',
    location: '',
    status: 'Aktif',
    notes: ''
  });

  useEffect(() => {
    if (server) {
      setFormData({
        branch_name: 'Merkez Ofis',
        local_admin_user: '',
        local_admin_password: '',
        ...server,
        customer_id: server.customer_id || customerId
      });
    } else {
      setFormData({
        customer_id: customerId,
        server_name: '',
        brand: '',
        model: '',
        serial_number: '',
        cpu_info: '',
        ram_info: '',
        disk_info: '',
        ip_address: '',
        mac_address: '',
        management_ip: '',
        management_user: '',
        management_password: '',
        local_admin_user: '',
        local_admin_password: '',
        branch_name: branches[0] || 'Merkez Ofis',
        location: '',
        status: 'Aktif',
        notes: ''
      });
    }
  }, [server, customerId, isOpen, branches]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-2xl w-full my-8 text-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {server ? 'Fiziki Sunucu Düzenle' : 'Yeni Fiziki Sunucu Ekle'}
              </h3>
              <p className="text-xs text-slate-400">Marka, model, donanım özellikleri, IP, MAC ve yönetim arayüzü</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sunucu Adı (Hostname) *</label>
              <input
                type="text"
                required
                placeholder="Örn: ATLAS-SRV01"
                value={formData.server_name}
                onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Durum</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Bakımda">Bakımda</option>
                <option value="Kapalı">Kapalı</option>
                <option value="Yedek">Yedek</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marka</label>
              <input
                type="text"
                placeholder="Örn: Dell, HP, Lenovo"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
              <input
                type="text"
                placeholder="Örn: PowerEdge R740"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seri No / Service Tag</label>
              <input
                type="text"
                placeholder="Örn: 9X7B2K3"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Donanım Bilgileri</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">İşlemci (CPU) Bilgisi</label>
                <input
                  type="text"
                  placeholder="Örn: 2x Intel Xeon Gold 5218 (32 Cores, 2.30 GHz)"
                  value={formData.cpu_info}
                  onChange={(e) => setFormData({ ...formData, cpu_info: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">RAM Bilgisi</label>
                  <input
                    type="text"
                    placeholder="Örn: 128 GB DDR4 ECC (4x 32GB)"
                    value={formData.ram_info}
                    onChange={(e) => setFormData({ ...formData, ram_info: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Disk & RAID Yapısı</label>
                  <input
                    type="text"
                    placeholder="Örn: RAID-10 (4x 1.92TB SAS SSD) + RAID-1 (2x 480GB)"
                    value={formData.disk_info}
                    onChange={(e) => setFormData({ ...formData, disk_info: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Ağ & Yönetim (iDRAC / iLO)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sunucu IP Adresi</label>
                <input
                  type="text"
                  placeholder="Örn: 192.168.10.10"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">MAC Adresi</label>
                <input
                  type="text"
                  placeholder="Örn: 00:1E:67:84:A1:01"
                  value={formData.mac_address}
                  onChange={(e) => setFormData({ ...formData, mac_address: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Yönetim IP (iDRAC/iLO)</label>
                <input
                  type="text"
                  placeholder="Örn: 192.168.10.15"
                  value={formData.management_ip}
                  onChange={(e) => setFormData({ ...formData, management_ip: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Yönetim Kullanıcı Adı</label>
                <input
                  type="text"
                  placeholder="Örn: root"
                  value={formData.management_user}
                  onChange={(e) => setFormData({ ...formData, management_user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Yönetim Parolası</label>
                <input
                  type="text"
                  placeholder="Parola"
                  value={formData.management_password}
                  onChange={(e) => setFormData({ ...formData, management_password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Local Admin Section */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              İşletim Sistemi Local Admin (Yönetici Girişi)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Local Admin Kullanıcı Adı</label>
                <input
                  type="text"
                  placeholder="Örn: .\Administrator veya .\itadmin"
                  value={formData.local_admin_user || ''}
                  onChange={(e) => setFormData({ ...formData, local_admin_user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Local Admin Parolası</label>
                <input
                  type="text"
                  placeholder="Local Admin Parolası"
                  value={formData.local_admin_password || ''}
                  onChange={(e) => setFormData({ ...formData, local_admin_password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Şube / Lokasyon</label>
              <input
                type="text"
                list="branch-list-server"
                placeholder="Örn: Merkez Ofis, Gebze Depo"
                value={formData.branch_name || ''}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
              <datalist id="branch-list-server">
                {branches.map((b, i) => (
                  <option key={i} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kabin / Oda Konumu</label>
              <input
                type="text"
                placeholder="Örn: Sistem Odası - Kabin 1 / U14"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notlar / Açıklama</label>
              <input
                type="text"
                placeholder="Örn: ESXi 7.0 kurulu, bakım anlaşmalı"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

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
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md cursor-pointer"
            >
              {server ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== 2. VIRTUAL MACHINE MODAL ====================
export function VMModal({ isOpen, onClose, onSave, vm = null, customerId, physicalServers = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    physical_server_id: '',
    vm_name: '',
    hypervisor: 'VMware ESXi',
    role_description: '',
    vcpu: '',
    ram: '',
    disk: '',
    ip_address: '',
    mac_address: '',
    os_version: '',
    os_license_key: '',
    office_version: '',
    office_license_key: '',
    local_admin_user: '',
    local_admin_password: '',
    status: 'Aktif',
    notes: ''
  });

  useEffect(() => {
    if (vm) {
      setFormData({
        local_admin_user: '',
        local_admin_password: '',
        ...vm,
        customer_id: vm.customer_id || customerId,
        physical_server_id: vm.physical_server_id || ''
      });
    } else {
      setFormData({
        customer_id: customerId,
        physical_server_id: physicalServers.length > 0 ? physicalServers[0].id : '',
        vm_name: '',
        hypervisor: 'VMware ESXi',
        role_description: '',
        vcpu: '4 vCPU',
        ram: '16 GB',
        disk: '120 GB SSD',
        ip_address: '',
        mac_address: '',
        os_version: 'Windows Server 2022 Standard',
        os_license_key: '',
        office_version: '',
        office_license_key: '',
        local_admin_user: '',
        local_admin_password: '',
        status: 'Aktif',
        notes: ''
      });
    }
  }, [vm, customerId, isOpen, physicalServers]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-2xl w-full my-8 text-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {vm ? 'Sanal Makine Düzenle' : 'Yeni Sanal Makine (VM) Ekle'}
              </h3>
              <p className="text-xs text-slate-400">VM donanımı, Windows & Office lisans anahtarları, IP ve MAC</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sanal Makine Adı (VM Hostname) *</label>
              <input
                type="text"
                required
                placeholder="Örn: ATLAS-DC01"
                value={formData.vm_name}
                onChange={(e) => setFormData({ ...formData, vm_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bağlı Olduğu Fiziki Server</label>
              <select
                value={formData.physical_server_id}
                onChange={(e) => setFormData({ ...formData, physical_server_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">-- Bağımsız / Bulut / Seçilmedi --</option>
                {physicalServers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.server_name} ({s.brand} {s.model})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sanallaştırma Platformu</label>
              <input
                type="text"
                placeholder="Örn: VMware ESXi 7.0, Hyper-V, Proxmox"
                value={formData.hypervisor}
                onChange={(e) => setFormData({ ...formData, hypervisor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Görevi / Rolü</label>
              <input
                type="text"
                placeholder="Örn: Domain Controller, Logo ERP, SQL DB"
                value={formData.role_description}
                onChange={(e) => setFormData({ ...formData, role_description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">VM Donanım Kaynakları</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">vCPU</label>
                <input
                  type="text"
                  placeholder="Örn: 4 vCPU"
                  value={formData.vcpu}
                  onChange={(e) => setFormData({ ...formData, vcpu: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Atanan RAM</label>
                <input
                  type="text"
                  placeholder="Örn: 16 GB"
                  value={formData.ram}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Disk Alanı</label>
                <input
                  type="text"
                  placeholder="Örn: 120 GB SSD (C:)"
                  value={formData.disk}
                  onChange={(e) => setFormData({ ...formData, disk: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Ağ Bilgileri</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">IP Adresi</label>
                <input
                  type="text"
                  placeholder="Örn: 192.168.10.2"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">MAC Adresi</label>
                <input
                  type="text"
                  placeholder="Örn: 00:50:56:A1:02:11"
                  value={formData.mac_address}
                  onChange={(e) => setFormData({ ...formData, mac_address: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">İşletim Sistemi & Office Lisansları</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kurulu Windows Sürümü</label>
                <input
                  type="text"
                  placeholder="Örn: Windows Server 2022 Datacenter"
                  value={formData.os_version}
                  onChange={(e) => setFormData({ ...formData, os_version: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Windows Lisans Key</label>
                <input
                  type="text"
                  placeholder="Örn: W269N-WFGWX-YVC9B-4J6C9-T83GX"
                  value={formData.os_license_key}
                  onChange={(e) => setFormData({ ...formData, os_license_key: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kurulu Office Sürümü</label>
                <input
                  type="text"
                  placeholder="Örn: Office 2021 LTSC Standard / M365"
                  value={formData.office_version}
                  onChange={(e) => setFormData({ ...formData, office_version: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Office Lisans Key / Bilgisi</label>
                <input
                  type="text"
                  placeholder="Örn: FXYTK-NJ28C-GB6KV-3TV67-J88C3"
                  value={formData.office_license_key}
                  onChange={(e) => setFormData({ ...formData, office_license_key: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Local Admin Section */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Sanal Makine Local Admin (Yönetici Girişi)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Local Admin Kullanıcı Adı</label>
                <input
                  type="text"
                  placeholder="Örn: .\Administrator veya .\itadmin"
                  value={formData.local_admin_user || ''}
                  onChange={(e) => setFormData({ ...formData, local_admin_user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Local Admin Parolası</label>
                <input
                  type="text"
                  placeholder="Local Admin Parolası"
                  value={formData.local_admin_password || ''}
                  onChange={(e) => setFormData({ ...formData, local_admin_password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Durum</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Askıda">Askıda</option>
                <option value="Kapalı">Kapalı</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notlar</label>
              <input
                type="text"
                placeholder="Örn: DHCP ve DNS rolleri aktif, yedek DC yok"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

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
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-md cursor-pointer"
            >
              {vm ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== 3. USER COMPUTER MODAL ====================
export function ComputerModal({ isOpen, onClose, onSave, computer = null, customerId, branches = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    computer_name: '',
    assigned_user: '',
    branch_name: 'Merkez Ofis',
    department: '',
    device_type: 'Masaüstü',
    brand: '',
    model: '',
    serial_number: '',
    hardware_specs: '',
    os_version: 'Windows 11 Pro',
    os_license_key: '',
    office_version: 'Office 2021 Home & Business',
    office_license_key: '',
    ethernet_ip: '',
    ethernet_mac: '',
    wifi_ip: '',
    wifi_mac: '',
    remote_access_id: '',
    local_admin_user: '',
    local_admin_password: '',
    antivirus: '',
    notes: ''
  });

  useEffect(() => {
    if (computer) {
      setFormData({
        branch_name: 'Merkez Ofis',
        local_admin_user: '',
        local_admin_password: '',
        ...computer,
        customer_id: computer.customer_id || customerId
      });
    } else {
      setFormData({
        customer_id: customerId,
        computer_name: '',
        assigned_user: '',
        branch_name: branches[0] || 'Merkez Ofis',
        department: '',
        device_type: 'Masaüstü',
        brand: '',
        model: '',
        serial_number: '',
        hardware_specs: '',
        os_version: 'Windows 11 Pro',
        os_license_key: '',
        office_version: '',
        office_license_key: '',
        ethernet_ip: '',
        ethernet_mac: '',
        wifi_ip: '',
        wifi_mac: '',
        remote_access_id: '',
        local_admin_user: '',
        local_admin_password: '',
        antivirus: '',
        notes: ''
      });
    }
  }, [computer, customerId, isOpen, branches]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-3xl w-full my-8 text-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {computer ? 'Kullanıcı Bilgisayarı Düzenle' : 'Yeni Kullanıcı Bilgisayarı Ekle'}
              </h3>
              <p className="text-xs text-slate-400">Marka, model, donanım, Windows & Office lisans keyleri, Ethernet & Wi-Fi IP/MAC</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Identity & User */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Makina Adı (Hostname) *</label>
              <input
                type="text"
                required
                placeholder="Örn: PC-MUH-01"
                value={formData.computer_name}
                onChange={(e) => setFormData({ ...formData, computer_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Şube / Lokasyon</label>
              <input
                type="text"
                list="branch-list-pc"
                placeholder="Örn: Merkez Ofis, Gebze Depo"
                value={formData.branch_name || ''}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
              <datalist id="branch-list-pc">
                {branches.map((b, i) => (
                  <option key={i} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Zimmetli Kullanıcı</label>
              <input
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.assigned_user}
                onChange={(e) => setFormData({ ...formData, assigned_user: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Departman</label>
              <input
                type="text"
                placeholder="Örn: Muhasebe"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Device Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cihaz Türü</label>
              <select
                value={formData.device_type}
                onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Masaüstü">Masaüstü</option>
                <option value="Laptop">Laptop</option>
                <option value="All-in-One">All-in-One</option>
                <option value="Mini PC">Mini PC</option>
                <option value="Mac">Apple Mac</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marka</label>
              <input
                type="text"
                placeholder="Örn: Lenovo, Dell, HP"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
              <input
                type="text"
                placeholder="Örn: ThinkCentre M70q"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seri No</label>
              <input
                type="text"
                placeholder="Örn: MJ0DK198"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Donanım Detayları (İşlemci / RAM / Disk vb.)</label>
            <input
              type="text"
              placeholder="Örn: Intel Core i5-12400 / 16GB DDR4 / 512GB NVMe SSD"
              value={formData.hardware_specs}
              onChange={(e) => setFormData({ ...formData, hardware_specs: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Ethernet & WiFi Network Details */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Ağ Bilgileri (Ethernet & Wi-Fi)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">Ethernet (Kablolu)</span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-slate-400">Ethernet IP Adresi</label>
                    <input
                      type="text"
                      placeholder="Örn: 192.168.10.105"
                      value={formData.ethernet_ip}
                      onChange={(e) => setFormData({ ...formData, ethernet_ip: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">Ethernet MAC Adresi</label>
                    <input
                      type="text"
                      placeholder="Örn: 54:EE:75:A8:12:01"
                      value={formData.ethernet_mac}
                      onChange={(e) => setFormData({ ...formData, ethernet_mac: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">Wi-Fi (Kablosuz)</span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-slate-400">Wi-Fi IP Adresi</label>
                    <input
                      type="text"
                      placeholder="Örn: 192.168.10.106"
                      value={formData.wifi_ip}
                      onChange={(e) => setFormData({ ...formData, wifi_ip: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">Wi-Fi MAC Adresi</label>
                    <input
                      type="text"
                      placeholder="Örn: 7C:10:C9:DF:22:14"
                      value={formData.wifi_mac}
                      onChange={(e) => setFormData({ ...formData, wifi_mac: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Licenses Section */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">İşletim Sistemi & Office Lisans Bilgileri</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Windows Sürümü</label>
                <input
                  type="text"
                  placeholder="Örn: Windows 11 Pro 23H2"
                  value={formData.os_version}
                  onChange={(e) => setFormData({ ...formData, os_version: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Windows Lisans Key</label>
                <input
                  type="text"
                  placeholder="Örn: VK7JG-NPHTM-C97JM-9MPGT-3V66T"
                  value={formData.os_license_key}
                  onChange={(e) => setFormData({ ...formData, os_license_key: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Office Sürümü</label>
                <input
                  type="text"
                  placeholder="Örn: Office 2021 Home & Business / M365"
                  value={formData.office_version}
                  onChange={(e) => setFormData({ ...formData, office_version: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Office Lisans Key / Hesap</label>
                <input
                  type="text"
                  placeholder="Örn: XHQ8N-C3MCJ-RQXB6-WCHYG-C9WKB"
                  value={formData.office_license_key}
                  onChange={(e) => setFormData({ ...formData, office_license_key: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Local Admin Section */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Local Admin Hesabı (Yönetici Girişi)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Local Admin Kullanıcı Adı</label>
                <input
                  type="text"
                  placeholder="Örn: .\Administrator veya .\itadmin"
                  value={formData.local_admin_user || ''}
                  onChange={(e) => setFormData({ ...formData, local_admin_user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Local Admin Parolası</label>
                <input
                  type="text"
                  placeholder="Local Admin Parolası"
                  value={formData.local_admin_password || ''}
                  onChange={(e) => setFormData({ ...formData, local_admin_password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Remote Access & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Uzak Bağlantı (AnyDesk / TV ID)</label>
              <input
                type="text"
                placeholder="Örn: AnyDesk: 849 221 002"
                value={formData.remote_access_id}
                onChange={(e) => setFormData({ ...formData, remote_access_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Antivirüs / EDR</label>
              <input
                type="text"
                placeholder="Örn: Kaspersky Endpoint Security"
                value={formData.antivirus}
                onChange={(e) => setFormData({ ...formData, antivirus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notlar</label>
              <input
                type="text"
                placeholder="Örn: Çift monitör bağlı, Logo Client yüklü"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

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
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md cursor-pointer"
            >
              {computer ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper to parse copied text from SonicWall, Fortinet, Sophos web console
export function parseFirewallText(text) {
  const result = {};
  if (!text || typeof text !== 'string') return result;

  const lower = text.toLowerCase();

  // 1. Brand
  if (lower.includes('sonicwall') || lower.includes('sonicos')) {
    result.brand = 'SonicWall';
  } else if (lower.includes('fortigate') || lower.includes('fortinet') || lower.includes('fortios')) {
    result.brand = 'Fortinet';
  } else if (lower.includes('sophos') || lower.includes('sfos') || lower.includes('xg-')) {
    result.brand = 'Sophos';
  } else if (lower.includes('pfsense')) {
    result.brand = 'pfSense';
  } else if (lower.includes('watchguard')) {
    result.brand = 'WatchGuard';
  }

  // 2. Model
  const modelMatch = text.match(/(?:Model|Cihaz Modeli)[:\s]+(?:SonicWall\s+|FortiGate\s+)?([A-Za-z0-9\s-]+?)(?:\r?\n|$)/i) ||
                     text.match(/\b(TZ\s*\d+|NSa\s*\d+|NSsp\s*\d+|NSv\s*\d+|FortiGate[ -]?\w+|XGS\s*\d+)\b/i);
  if (modelMatch) {
    result.model = modelMatch[1].trim();
    result.device_name = `${result.brand || 'Firewall'} ${result.model}`;
  }

  // 3. Serial Number
  const snMatch = text.match(/(?:Serial\s*(?:Number|No)?|Seri\s*(?:Numarası|No))[:\s]+([A-F0-9]{10,16})/i) ||
                  text.match(/\b([A-F0-9]{12})\b/);
  if (snMatch) {
    result.serial_number = snMatch[1].trim();
  }

  // 4. Firmware Version
  const fwMatch = text.match(/(?:Firmware\s*(?:Version)?|Yazılım\s*Sürümü)[:\s]+([^\r\n]+)/i) ||
                  text.match(/\b(SonicOS\s+[0-9a-zA-Z.-]+|FortiOS\s+[0-9a-zA-Z.-]+|SFOS\s+[0-9a-zA-Z.-]+)\b/i);
  if (fwMatch) {
    result.firmware_version = fwMatch[1].trim();
  }

  // 5. IP Address
  const ipMatch = text.match(/(?:IP Address|Yönetim IP|Management IP|LAN IP|WAN IP)[:\s]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
  if (ipMatch) {
    result.management_ip = `https://${ipMatch[1]}:8443`;
  }

  // 6. Expiry Date (AGSS, CGSS, Support 24x7, UTM bundle)
  const expMatch = text.match(/(?:Expires?|Bitiş(?:\s*Tarihi)?|Expiration|Valid until)[:\s]*([0-9]{1,2}[./-][0-9]{1,2}[./-][0-9]{2,4})/i) ||
                   text.match(/\b([0-9]{1,2}[./-][0-9]{1,2}[./-](?:20\d{2}))\b/);
  if (expMatch) {
    const dMatch = expMatch[1].match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b/);
    if (dMatch) {
      let p1 = parseInt(dMatch[1], 10);
      let p2 = parseInt(dMatch[2], 10);
      let y = dMatch[3];
      if (p1 <= 12 && p2 > 12) {
        result.license_expiry = `${String(p2).padStart(2, '0')}.${String(p1).padStart(2, '0')}.${y}`;
      } else {
        result.license_expiry = `${String(p1).padStart(2, '0')}.${String(p2).padStart(2, '0')}.${y}`;
      }
    }
  }

  // 7. Notes
  const notes = [];
  if (result.serial_number) notes.push(`Seri No: ${result.serial_number}`);
  if (lower.includes('cgss') || lower.includes('agss')) notes.push('Lisans Paketi: AGSS / CGSS Kapsamlı Güvenlik');
  if (lower.includes('capture atp')) notes.push('Capture ATP Sandboxing: Aktif');
  if (lower.includes('support 24x7') || lower.includes('24x7')) notes.push('Teknik Destek: 24x7 Aktif');
  if (lower.includes('utm')) notes.push('UTM Güvenlik Paketi: Aktif');
  if (notes.length > 0) result.notes = notes.join('\n');

  return result;
}

// ==================== 4. FIREWALL MODAL ====================
export function FirewallModal({ isOpen, onClose, onSave, firewall = null, customerId, branches = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    device_name: '',
    branch_name: 'Merkez Ofis',
    brand: 'SonicWall',
    model: '',
    management_ip: '',
    username: 'admin',
    password: '',
    external_ip: '',
    firmware_version: '',
    license_expiry: '',
    ssl_vpn_portal: '',
    notes: ''
  });

  const [showManualPaste, setShowManualPaste] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');
  const [smartDetectionMsg, setSmartDetectionMsg] = useState(null);

  useEffect(() => {
    if (firewall) {
      setFormData({
        branch_name: 'Merkez Ofis',
        ...firewall,
        customer_id: firewall.customer_id || customerId
      });
    } else {
      setFormData({
        customer_id: customerId,
        device_name: '',
        branch_name: branches[0] || 'Merkez Ofis',
        brand: 'SonicWall',
        model: '',
        management_ip: 'https://192.168.1.1:8443',
        username: 'admin',
        password: '',
        external_ip: '',
        firmware_version: '',
        license_expiry: '',
        ssl_vpn_portal: '',
        notes: ''
      });
    }
    setShowManualPaste(false);
    setPasteInputText('');
    setSmartDetectionMsg(null);
  }, [firewall, customerId, isOpen, branches]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const applyParsedFirewall = (text) => {
    const parsed = parseFirewallText(text);
    const count = Object.keys(parsed).length;
    if (count === 0) {
      setSmartDetectionMsg({
        type: 'warning',
        text: 'Metinde firewall/güvenlik duvarı bilgisi bulunamadı. Lütfen SonicWall web panelindeki System Status veya Licenses alanını kopyalayın.'
      });
      return false;
    }

    setFormData(prev => ({
      ...prev,
      ...(parsed.brand && { brand: parsed.brand }),
      ...(parsed.model && { model: parsed.model }),
      ...(parsed.device_name && (!prev.device_name || prev.device_name === '') && { device_name: parsed.device_name }),
      ...(parsed.firmware_version && { firmware_version: parsed.firmware_version }),
      ...(parsed.management_ip && { management_ip: parsed.management_ip }),
      ...(parsed.license_expiry && { license_expiry: parsed.license_expiry }),
      ...(parsed.notes && {
        notes: prev.notes ? `${prev.notes}\n${parsed.notes}` : parsed.notes
      })
    }));

    const detectedSummary = [
      parsed.brand,
      parsed.model,
      parsed.firmware_version,
      parsed.license_expiry ? `Lisans: ${parsed.license_expiry}` : null
    ].filter(Boolean).join(' • ');

    setSmartDetectionMsg({
      type: 'success',
      text: `✓ Başarıyla Algılandı: ${detectedSummary}`
    });
    return true;
  };

  const handleClipboardFill = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          applyParsedFirewall(text);
          return;
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
    setShowManualPaste(true);
    setSmartDetectionMsg({
      type: 'info',
      text: 'Pano okunamadı. Lütfen SonicWall web panelinden kopyaladığınız metni aşağıdaki alana yapıştırın (Ctrl+V).'
    });
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-2xl w-full my-8 text-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600/20 text-rose-400 rounded-lg border border-rose-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {firewall ? 'Firewall Cihazını Düzenle' : 'Yeni Firewall (Güvenlik Duvarı) Ekle'}
              </h3>
              <p className="text-xs text-slate-400">Marka, model, arayüz giriş IP, kullanıcı adı, parola ve dış statik IP</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Smart Clipboard Auto-Fill Hero Banner */}
          <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>SonicWall / Firewall Panodan Akıllı Doldur</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">SonicWall / Fortinet / Sophos</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    SonicWall web panelinizdeki (System &gt; Status veya Licenses) metnini kopyalayıp tek tıkla formu doldurun.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClipboardFill}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-rose-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Panodaki metni oku ve firewall alanlarını otomatik doldur"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Panodan Doldur</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualPaste(prev => !prev)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{showManualPaste ? 'Kapat' : 'Metin Yapıştır'}</span>
                  {showManualPaste ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Manual Paste Drawer */}
            {showManualPaste && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-fadeIn">
                <textarea
                  rows={3}
                  value={pasteInputText}
                  onChange={(e) => setPasteInputText(e.target.value)}
                  placeholder="SonicWall web panelinden kopyaladığınız Sistem veya Lisans metnini buraya yapıştırın (Ctrl + V)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500 placeholder-slate-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!pasteInputText.trim()) return;
                      const ok = applyParsedFirewall(pasteInputText);
                      if (ok) setShowManualPaste(false);
                    }}
                    disabled={!pasteInputText.trim()}
                    className="px-3 py-1.5 bg-rose-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Çözümle &amp; Doldur</span>
                  </button>
                </div>
              </div>
            )}

            {/* Smart Detection Feedback */}
            {smartDetectionMsg && (
              <div className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${
                smartDetectionMsg.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : smartDetectionMsg.type === 'warning'
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/70 border-slate-700 text-slate-300'
              }`}>
                {smartDetectionMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                )}
                <span>{smartDetectionMsg.text}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cihaz Tanımı / Adı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Ana Güvenlik Duvarı"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Şube / Lokasyon</label>
              <input
                type="text"
                list="branch-list-fw"
                placeholder="Örn: Merkez Ofis, Gebze Depo"
                value={formData.branch_name || ''}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
              <datalist id="branch-list-fw">
                {branches.map((b, i) => (
                  <option key={i} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marka</label>
              <input
                type="text"
                placeholder="Örn: Fortinet, Sophos, pfSense"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
              <input
                type="text"
                placeholder="Örn: FortiGate 60F, XGS 116"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cihaz Dış Statik IP (WAN IP)</label>
              <input
                type="text"
                placeholder="Örn: 85.105.142.66"
                value={formData.external_ip}
                onChange={(e) => setFormData({ ...formData, external_ip: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Arayüz Giriş Bilgileri</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Arayüz Giriş IP Adresi ve Portu</label>
                <input
                  type="text"
                  placeholder="Örn: https://192.168.10.1:8443 veya 192.168.1.1"
                  value={formData.management_ip}
                  onChange={(e) => setFormData({ ...formData, management_ip: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Arayüz Kullanıcı Adı</label>
                  <input
                    type="text"
                    placeholder="Örn: admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Arayüz Parolası</label>
                  <input
                    type="text"
                    placeholder="Parola"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Extra Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Firmware Sürümü</label>
              <input
                type="text"
                placeholder="Örn: v7.4.4"
                value={formData.firmware_version}
                onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lisans Bitiş Tarihi</label>
              <input
                type="text"
                placeholder="Örn: 15.11.2026"
                value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SSL VPN Portalı</label>
              <input
                type="text"
                placeholder="Örn: https://85.105.142.66:10443"
                value={formData.ssl_vpn_portal}
                onChange={(e) => setFormData({ ...formData, ssl_vpn_portal: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notlar & Port Yönlendirmeleri</label>
            <textarea
              rows="2"
              placeholder="Örn: Port 3389 VPN üzerinden açık, WAN2 yedek VDSL hattı"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
            ></textarea>
          </div>

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
              className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md cursor-pointer"
            >
              {firewall ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== 5. BACKUP UNIT MODAL ====================
export function BackupModal({ isOpen, onClose, onSave, backup = null, customerId, branches = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    device_name: '',
    branch_name: 'Merkez Ofis',
    location: '',
    brand: 'Synology',
    model: '',
    management_ip: '',
    username: 'admin',
    password: '',
    capacity: '',
    backup_software: '',
    backup_schedule: '',
    notes: ''
  });

  useEffect(() => {
    if (backup) {
      setFormData({
        branch_name: 'Merkez Ofis',
        location: '',
        ...backup,
        customer_id: backup.customer_id || customerId
      });
    } else {
      setFormData({
        customer_id: customerId,
        device_name: '',
        branch_name: branches[0] || 'Merkez Ofis',
        location: '',
        brand: 'Synology',
        model: '',
        management_ip: 'http://192.168.1.200:5000',
        username: 'admin',
        password: '',
        capacity: '',
        backup_software: 'Veeam Backup & Replication',
        backup_schedule: 'Her gün 22:00',
        notes: ''
      });
    }
  }, [backup, customerId, isOpen, branches]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-2xl w-full my-8 text-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {backup ? 'Yedekleme Ünitesini Düzenle' : 'Yeni Yedekleme Ünitesi (NAS) Ekle'}
              </h3>
              <p className="text-xs text-slate-400">Marka, model, IP adresi, kullanıcı adı, parola ve yedekleme planı</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cihaz Tanımı / Adı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Sistem Odası Yedek NAS"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Şube / Lokasyon</label>
              <input
                type="text"
                list="branch-list-bu"
                placeholder="Örn: Merkez Ofis, Gebze Depo"
                value={formData.branch_name || ''}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
              <datalist id="branch-list-bu">
                {branches.map((b, i) => (
                  <option key={i} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marka</label>
              <input
                type="text"
                placeholder="Örn: Synology, QNAP, TrueNAS"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
              <input
                type="text"
                placeholder="Örn: DiskStation DS923+"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kabin / Oda Konumu</label>
              <input
                type="text"
                placeholder="Örn: Sistem Odası - Kabin 2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Depolama Kapasitesi & RAID</label>
              <input
                type="text"
                placeholder="Örn: 4x 8TB HDD - RAID 5 (21.8 TB)"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Arayüz Giriş Bilgileri</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Arayüz IP Adresi ve Portu</label>
                <input
                  type="text"
                  placeholder="Örn: http://192.168.10.200:5000"
                  value={formData.management_ip}
                  onChange={(e) => setFormData({ ...formData, management_ip: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kullanıcı Adı</label>
                  <input
                    type="text"
                    placeholder="Örn: nasadmin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parolası</label>
                  <input
                    type="text"
                    placeholder="Parola"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Backup Software & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Yedekleme Yazılımı / Yöntemi</label>
              <input
                type="text"
                placeholder="Örn: Veeam Backup & Replication, Active Backup"
                value={formData.backup_software}
                onChange={(e) => setFormData({ ...formData, backup_software: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Yedekleme Periyodu</label>
              <input
                type="text"
                placeholder="Örn: Her gece 02:00 tam yedek"
                value={formData.backup_schedule}
                onChange={(e) => setFormData({ ...formData, backup_schedule: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notlar</label>
            <textarea
              rows="2"
              placeholder="Örn: Harici USB diske haftalık offline kopya alınıyor."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            ></textarea>
          </div>

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
              className="px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md cursor-pointer"
            >
              {backup ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
