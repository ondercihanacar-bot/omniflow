import React, { useState, useEffect } from 'react';
import { X, Server, Cloud, Laptop, Shield, Database } from 'lucide-react';

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

// ==================== 4. FIREWALL MODAL ====================
export function FirewallModal({ isOpen, onClose, onSave, firewall = null, customerId, branches = [] }) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    device_name: '',
    branch_name: 'Merkez Ofis',
    brand: 'Fortinet',
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
        brand: 'Fortinet',
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
  }, [firewall, customerId, isOpen, branches]);

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
