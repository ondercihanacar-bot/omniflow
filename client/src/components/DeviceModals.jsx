import React, { useState, useEffect, useRef } from 'react';
import {
  X, Server, Cloud, Laptop, Shield, Database,
  Sparkles, ClipboardPaste, Check, AlertCircle, ChevronDown, ChevronUp,
  Plus, Trash2, Search
} from 'lucide-react';

// ==================== PREDEFINED ENTERPRISE IT PRESETS ====================
export const DEFAULT_DEPARTMENTS = [
  'Muhasebe',
  'Finans',
  'İnsan Kaynakları (İK)',
  'Bilgi İşlem (IT)',
  'Satış & Pazarlama',
  'Satın Alma',
  'Yönetim & Genel Müdürlük',
  'Lojistik & Sevkiyat',
  'Depo & Stok',
  'Üretim & Fabrika',
  'Planlama & Kalite',
  'Hukuk',
  'İthalat & İhracat',
  'Ar-Ge & Tasarım',
  'Teknik Servis',
  'Müşteri Hizmetleri',
  'İdari İşler',
  'Güvenlik'
];

export const DEFAULT_DEVICE_TYPES = [
  'Masaüstü',
  'Laptop',
  'All-in-One',
  'Mini PC',
  'Apple Mac / MacBook',
  'İş İstasyonu (Workstation)',
  'Endüstriyel PC',
  'Tablet',
  'El Terminali',
  'POS / Kiosk'
];

export const DEFAULT_PC_BRANDS = [
  'Lenovo',
  'Dell',
  'HP',
  'Apple',
  'Asus',
  'Acer',
  'MSI',
  'Casper / Nirvana',
  'Monster',
  'Samsung',
  'Toshiba / Dynabook',
  'Intel NUC',
  'Toplama / OEM',
  'Diğer'
];

export const DEFAULT_OS_VERSIONS = [
  'Windows 11 Pro',
  'Windows 11 Home',
  'Windows 11 Enterprise',
  'Windows 10 Pro',
  'Windows 10 Home',
  'Windows 10 Enterprise LTSC',
  'Windows 7 Pro',
  'macOS Sequoia',
  'macOS Sonoma',
  'macOS Ventura',
  'Ubuntu Linux Desktop',
  'Debian Linux',
  'Pardus Linux',
  'FreeDOS'
];

export const DEFAULT_OFFICE_VERSIONS = [
  'Microsoft 365 Business Standard',
  'Microsoft 365 Apps for Business',
  'Microsoft 365 Personal / Family',
  'Office 2024 Home & Business',
  'Office 2021 Home & Business',
  'Office 2021 Professional Plus',
  'Office 2019 Home & Business',
  'Office 2019 Professional Plus',
  'Office 2016 Home & Business',
  'Office 2016 Pro Plus',
  'Office 2013',
  'LibreOffice',
  'WPS Office',
  'Yok / Lisanssız'
];

export const DEFAULT_SERVER_BRANDS = [
  'Dell PowerEdge',
  'HPE ProLiant',
  'Lenovo ThinkSystem',
  'Cisco UCS',
  'Supermicro',
  'Huawei FusionServer',
  'IBM System x',
  'Toplama / OEM Rack',
  'Diğer'
];

export const DEFAULT_SERVER_OS = [
  'Windows Server 2025 Standard',
  'Windows Server 2022 Standard',
  'Windows Server 2022 Datacenter',
  'Windows Server 2019 Standard',
  'Windows Server 2019 Datacenter',
  'Windows Server 2016 Standard',
  'Windows Server 2012 R2',
  'VMware ESXi 8.0',
  'VMware ESXi 7.0',
  'Proxmox VE 8.x',
  'Ubuntu Server 24.04 LTS',
  'Ubuntu Server 22.04 LTS',
  'Debian 12 (Bookworm)',
  'Red Hat Enterprise Linux (RHEL)',
  'AlmaLinux / Rocky Linux'
];

export const DEFAULT_HYPERVISORS = [
  'VMware ESXi',
  'VMware vSphere',
  'Microsoft Hyper-V',
  'Proxmox VE',
  'Nutanix AHV',
  'KVM / QEMU',
  'XenServer / XCP-ng',
  'Bare-Metal / Bağımsız'
];

export const DEFAULT_FIREWALL_BRANDS = [
  'SonicWall',
  'Fortinet / FortiGate',
  'Sophos XG / XGS',
  'WatchGuard',
  'pfSense',
  'OPNsense',
  'Palo Alto',
  'Cisco Meraki',
  'MikroTik',
  'DrayTek',
  'Zyxel',
  'Diğer'
];

export const DEFAULT_NAS_BRANDS = [
  'Synology',
  'QNAP',
  'TrueNAS / FreeNAS',
  'Asustor',
  'Western Digital My Cloud',
  'Dell PowerVault',
  'HPE StoreEasy',
  'Diğer'
];

export const DEFAULT_BACKUP_SOFTWARE = [
  'Veeam Backup & Replication',
  'Acronis Cyber Protect',
  'Synology Active Backup for Business',
  'QNAP NetBak Replicator',
  'Nakivo Backup & Replication',
  'Commvault',
  'Windows Server Backup',
  'Cobian Backup',
  'Bacula',
  'Diğer'
];

// ==================== REUSABLE PRESET COMBOBOX WITH INLINE (+) ADD ====================
export function PresetCombobox({
  label,
  presetKey,
  defaultOptions = [],
  value = '',
  onChange,
  placeholder = '',
  required = false,
  colorScheme = 'emerald'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customOptions, setCustomOptions] = useState([]);
  const containerRef = useRef(null);
  const addInputRef = useRef(null);

  // Load custom presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`omniflow_presets_${presetKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomOptions(parsed);
        }
      }
    } catch (err) {
      console.error(`Failed to load presets for ${presetKey}`, err);
    }
  }, [presetKey]);

  // Click outside to close dropdown & add mode
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsAdding(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus input when isAdding becomes true
  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  // Add new preset
  const handleAddPreset = (textToAdd) => {
    const trimmed = (textToAdd !== undefined ? textToAdd : newItemText).trim();
    if (!trimmed) return;

    if (!defaultOptions.includes(trimmed) && !customOptions.includes(trimmed)) {
      const updated = [...customOptions, trimmed];
      setCustomOptions(updated);
      try {
        localStorage.setItem(`omniflow_presets_${presetKey}`, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save preset', err);
      }
    }

    onChange(trimmed);
    setNewItemText('');
    setIsAdding(false);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Delete custom preset
  const handleDeleteCustom = (e, itemToDelete) => {
    e.stopPropagation();
    const updated = customOptions.filter((o) => o !== itemToDelete);
    setCustomOptions(updated);
    try {
      localStorage.setItem(`omniflow_presets_${presetKey}`, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete preset', err);
    }
  };

  // Combined options: custom options first so user sees their additions easily
  const allOptions = [
    ...customOptions,
    ...defaultOptions.filter((d) => !customOptions.includes(d))
  ];

  const filteredOptions = allOptions.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasExactMatch = allOptions.some(
    (o) => o.toLowerCase() === (searchTerm || value || '').trim().toLowerCase()
  );

  const colors = {
    emerald: {
      borderFocus: 'focus:border-emerald-500',
      activeText: 'text-emerald-400',
      activeTextHover: 'hover:text-emerald-300',
      bgSelected: 'bg-emerald-600/20 text-emerald-300',
      btnSave: 'bg-emerald-600 hover:bg-emerald-500',
      activeRing: 'ring-emerald-500/30 border-emerald-500/60'
    },
    indigo: {
      borderFocus: 'focus:border-indigo-500',
      activeText: 'text-indigo-400',
      activeTextHover: 'hover:text-indigo-300',
      bgSelected: 'bg-indigo-600/20 text-indigo-300',
      btnSave: 'bg-indigo-600 hover:bg-indigo-500',
      activeRing: 'ring-indigo-500/30 border-indigo-500/60'
    },
    purple: {
      borderFocus: 'focus:border-purple-500',
      activeText: 'text-purple-400',
      activeTextHover: 'hover:text-purple-300',
      bgSelected: 'bg-purple-600/20 text-purple-300',
      btnSave: 'bg-purple-600 hover:bg-purple-500',
      activeRing: 'ring-purple-500/30 border-purple-500/60'
    },
    amber: {
      borderFocus: 'focus:border-amber-500',
      activeText: 'text-amber-400',
      activeTextHover: 'hover:text-amber-300',
      bgSelected: 'bg-amber-600/20 text-amber-300',
      btnSave: 'bg-amber-600 hover:bg-amber-500',
      activeRing: 'ring-amber-500/30 border-amber-500/60'
    },
    rose: {
      borderFocus: 'focus:border-rose-500',
      activeText: 'text-rose-400',
      activeTextHover: 'hover:text-rose-300',
      bgSelected: 'bg-rose-600/20 text-rose-300',
      btnSave: 'bg-rose-600 hover:bg-rose-500',
      activeRing: 'ring-rose-500/30 border-rose-500/60'
    }
  };

  const scheme = colors[colorScheme] || colors.emerald;

  return (
    <div className={`relative ${isOpen || isAdding ? 'z-30' : 'z-10'}`} ref={containerRef}>
      {/* Field Label & Quick Add (+) Button */}
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-slate-300 truncate pr-1">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsAdding((prev) => !prev);
            if (!isOpen) setIsOpen(false);
          }}
          className={`text-[11px] font-medium flex items-center gap-1 transition-all px-1.5 py-0.5 rounded cursor-pointer ${
            isAdding
              ? 'bg-amber-500/20 text-amber-300'
              : `${scheme.activeText} ${scheme.activeTextHover} hover:bg-slate-800`
          }`}
          title={`Yeni ${label} Tanımla`}
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          <span>{isAdding ? 'Kapat' : 'Ekle'}</span>
        </button>
      </div>

      {/* Inline Quick-Add Mode */}
      {isAdding ? (
        <div className={`flex items-center gap-1.5 bg-slate-950 border rounded-lg p-1 shadow-lg ring-1 ${scheme.activeRing}`}>
          <input
            ref={addInputRef}
            type="text"
            placeholder={`Yeni ${label.toLowerCase()} yazın...`}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddPreset();
              } else if (e.key === 'Escape') {
                setIsAdding(false);
              }
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAddPreset()}
            disabled={!newItemText.trim()}
            className={`px-2.5 py-1 ${scheme.btnSave} disabled:opacity-40 text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-sm cursor-pointer`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Kaydet</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewItemText('');
            }}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Regular Combobox Input */
        <div className="relative">
          <input
            type="text"
            required={required}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              setSearchTerm('');
              setIsOpen(true);
            }}
            className={`w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none transition-colors ${scheme.borderFocus}`}
          />
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setIsOpen((prev) => !prev);
            }}
            tabIndex={-1}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? `rotate-180 ${scheme.activeText}` : ''
              }`}
            />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !isAdding && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 backdrop-blur-md">
          {/* Search Filter Header */}
          {allOptions.length > 5 && (
            <div className="px-2 py-1.5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Seçeneklerde ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Quick-add row if search text doesn't exist */}
          {searchTerm.trim() && !hasExactMatch && (
            <div className="p-1 border-b border-slate-800 bg-emerald-950/30">
              <button
                type="button"
                onClick={() => handleAddPreset(searchTerm)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${scheme.activeText} hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="truncate">&quot;{searchTerm.trim()}&quot; seçeneğini yeni olarak kaydet</span>
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center italic">
                Eşleşen seçenek bulunamadı.
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = value === opt;
                const isCustom = customOptions.includes(opt);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? scheme.bgSelected + ' font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isSelected ? (
                        <Check className={`w-3.5 h-3.5 ${scheme.activeText} shrink-0`} />
                      ) : (
                        <span className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">{opt}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {isCustom && (
                        <>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Özel
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustom(e, opt)}
                            title="Bu özel seçeneği sil"
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer Quick-Add Button */}
          <div className="p-1 border-t border-slate-800 bg-slate-950/40">
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${scheme.activeText} hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Yeni {label} Ekle...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
    if (!isOpen) return;
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
        branch_name: (branches && branches[0]) || 'Merkez Ofis',
        location: '',
        status: 'Aktif',
        notes: ''
      });
    }
  }, [isOpen, server?.id, customerId]);

  if (!isOpen) return null;

  return (
    <div
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
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(formData); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
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
              <PresetCombobox
                label="Marka"
                presetKey="server_brand"
                defaultOptions={DEFAULT_SERVER_BRANDS}
                value={formData.brand}
                onChange={(val) => setFormData({ ...formData, brand: val })}
                placeholder="Örn: Dell PowerEdge, HPE"
                colorScheme="indigo"
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
    if (!isOpen) return;
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
  }, [isOpen, vm?.id, customerId]);

  if (!isOpen) return null;

  return (
    <div
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
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(formData); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
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
              <PresetCombobox
                label="Sanallaştırma Platformu"
                presetKey="hypervisors"
                defaultOptions={DEFAULT_HYPERVISORS}
                value={formData.hypervisor}
                onChange={(val) => setFormData({ ...formData, hypervisor: val })}
                placeholder="Örn: VMware ESXi 7.0, Hyper-V, Proxmox"
                colorScheme="purple"
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
                <PresetCombobox
                  label="Kurulu Windows / Sunucu Sürümü"
                  presetKey="server_os_version"
                  defaultOptions={DEFAULT_SERVER_OS}
                  value={formData.os_version}
                  onChange={(val) => setFormData({ ...formData, os_version: val })}
                  placeholder="Örn: Windows Server 2022 Datacenter"
                  colorScheme="purple"
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
                <PresetCombobox
                  label="Kurulu Office Sürümü"
                  presetKey="pc_office_version"
                  defaultOptions={DEFAULT_OFFICE_VERSIONS}
                  value={formData.office_version}
                  onChange={(val) => setFormData({ ...formData, office_version: val })}
                  placeholder="Örn: Office 2021 LTSC Standard / M365"
                  colorScheme="purple"
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
    if (!isOpen) return;
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
        branch_name: (branches && branches[0]) || 'Merkez Ofis',
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
  }, [isOpen, computer?.id, customerId]);

  if (!isOpen) return null;

  return (
    <div
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
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(formData); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
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
              <PresetCombobox
                label="Departman"
                presetKey="pc_department"
                defaultOptions={DEFAULT_DEPARTMENTS}
                value={formData.department}
                onChange={(val) => setFormData({ ...formData, department: val })}
                placeholder="Örn: Muhasebe"
                colorScheme="emerald"
              />
            </div>
          </div>

          {/* Device Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <PresetCombobox
                label="Cihaz Türü"
                presetKey="pc_device_type"
                defaultOptions={DEFAULT_DEVICE_TYPES}
                value={formData.device_type}
                onChange={(val) => setFormData({ ...formData, device_type: val })}
                placeholder="Örn: Masaüstü, Laptop"
                colorScheme="emerald"
              />
            </div>
            <div>
              <PresetCombobox
                label="Marka"
                presetKey="pc_brand"
                defaultOptions={DEFAULT_PC_BRANDS}
                value={formData.brand}
                onChange={(val) => setFormData({ ...formData, brand: val })}
                placeholder="Örn: Lenovo, Dell, HP"
                colorScheme="emerald"
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
                <PresetCombobox
                  label="Windows / İşletim Sistemi"
                  presetKey="pc_os_version"
                  defaultOptions={DEFAULT_OS_VERSIONS}
                  value={formData.os_version}
                  onChange={(val) => setFormData({ ...formData, os_version: val })}
                  placeholder="Örn: Windows 11 Pro"
                  colorScheme="emerald"
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
                <PresetCombobox
                  label="Office Sürümü"
                  presetKey="pc_office_version"
                  defaultOptions={DEFAULT_OFFICE_VERSIONS}
                  value={formData.office_version}
                  onChange={(val) => setFormData({ ...formData, office_version: val })}
                  placeholder="Örn: Office 2021 Home & Business"
                  colorScheme="emerald"
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
  }, [isOpen, firewall?.id, customerId]);

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
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(formData); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
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
              <PresetCombobox
                label="Marka"
                presetKey="firewall_brand"
                defaultOptions={DEFAULT_FIREWALL_BRANDS}
                value={formData.brand}
                onChange={(val) => setFormData({ ...formData, brand: val })}
                placeholder="Örn: SonicWall, Fortinet"
                colorScheme="rose"
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
    if (!isOpen) return;
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
        branch_name: (branches && branches[0]) || 'Merkez Ofis',
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
  }, [isOpen, backup?.id, customerId]);

  if (!isOpen) return null;

  return (
    <div
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
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSave(formData); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
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
              <PresetCombobox
                label="Marka"
                presetKey="nas_brand"
                defaultOptions={DEFAULT_NAS_BRANDS}
                value={formData.brand}
                onChange={(val) => setFormData({ ...formData, brand: val })}
                placeholder="Örn: Synology, QNAP"
                colorScheme="amber"
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
              <PresetCombobox
                label="Yedekleme Yazılımı / Yöntemi"
                presetKey="backup_software"
                defaultOptions={DEFAULT_BACKUP_SOFTWARE}
                value={formData.backup_software}
                onChange={(val) => setFormData({ ...formData, backup_software: val })}
                placeholder="Örn: Veeam Backup & Replication"
                colorScheme="amber"
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
