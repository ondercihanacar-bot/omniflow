import React, { useState, useEffect } from 'react';
import {
  X, AlertTriangle, ShieldAlert, Lock, Key, Trash2, ArrowRight,
  ArrowLeft, CheckCircle2, Shield, Eye, EyeOff, Building2, Laptop,
  Server, Cloud, Mail
} from 'lucide-react';
import { api } from '../api';

export default function DeleteCustomerSecurityModal({
  isOpen,
  onClose,
  customer,
  currentUser,
  onSuccess
}) {
  const [step, setStep] = useState(1); // 1: Confirmation & Impact Warning, 2: Admin Password Verification
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAdminPassword('');
      setErrorMsg('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Global ESC key listener to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen || !customer) return null;

  // Asset counts for impact analysis
  const pcCount = customer.user_computers?.length || 0;
  const firewallCount = customer.firewalls?.length || 0;
  const serverCount = customer.physical_servers?.length || 0;
  const vmCount = customer.virtual_machines?.length || 0;
  const mailCount = customer.mail_accounts?.length || 0;
  const lineCount = customer.internet_lines?.length || 0;
  const totalAssets = pcCount + firewallCount + serverCount + vmCount + mailCount + lineCount;

  // Handle Step 2 Final Delete with Password
  const handleSubmitDelete = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminPassword || !adminPassword.trim()) {
      setErrorMsg('Lütfen yönetici parolanızı girin.');
      return;
    }

    setIsDeleting(true);

    try {
      await api.deleteCustomer(customer.id, adminPassword.trim());
      setIsDeleting(false);
      onClose();
      if (onSuccess) {
        onSuccess(customer);
      }
    } catch (err) {
      setIsDeleting(false);
      setErrorMsg(err.message || 'Müşteri silinemedi. Parola hatalı olabilir.');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-slate-900 border-2 border-rose-600/70 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100 ring-4 ring-rose-950/50">
        
        {/* ================= MODAL HEADER ================= */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Müşteri Silme Güvenlik Kilidi
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {step === 1 ? 'Aşama 1 / 2' : 'Aşama 2 / 2: Parola Doğrulama'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sadece Sistem Yöneticisi (Admin) yetkisiyle gerçekleştirilebilir
              </p>
            </div>
          </div>

          {!isDeleting && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ================= STEP 1: IMPACT CONFIRMATION ================= */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Danger Hero Banner */}
            <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-rose-300 text-sm">
                  Kritik Uyarı: Bu İşlem Geri Alınamaz!
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-white font-mono bg-rose-900/40 px-1.5 py-0.5 rounded border border-rose-700/50">
                    {customer.name}
                  </strong> adlı müşteriyi ve müşteriye ait <strong>tüm alt envanter verilerini</strong> kalıcı olarak silmek üzeresiniz.
                </p>
              </div>
            </div>

            {/* Impact Asset Count Badges */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Bu Müşteriyle Birlikte Silinecek Varlıklar:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    <strong className="text-white">{pcCount}</strong> PC
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    <strong className="text-white">{serverCount}</strong> Sunucu
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    <strong className="text-white">{vmCount}</strong> Sanal Makine
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    <strong className="text-white">{firewallCount}</strong> Firewall
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    <strong className="text-white">{mailCount}</strong> E-Posta
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    <strong className="text-white">{lineCount}</strong> Şube/Hat
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300">Silme Güvenlik Protokolü:</span>
              <p>
                Yanlışlıkla silinmeyi önlemek amacıyla, bir sonraki aşamada oturum açtığınız <strong>Admin parolanızı</strong> doğrulamanız istenecektir.
              </p>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
              >
                <span>Evet, Silmek İstiyorum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ADMIN PASSWORD CONFIRMATION ================= */}
        {step === 2 && (
          <form onSubmit={handleSubmitDelete} className="p-5 sm:p-6 space-y-4">
            <div className="bg-amber-950/40 border border-amber-900/60 rounded-xl p-3.5 flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300 block">Yönetici Kimlik Doğrulaması</span>
                <span className="text-slate-300">
                  Lütfen <strong>{currentUser?.username || 'admin'}</strong> yönetici hesabınızın güncel parolasını girin.
                </span>
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Yönetici (Admin) Parolası
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  disabled={isDeleting}
                  placeholder="Yönetici parolanızı yazın..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-950/70 border border-rose-700 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Geri Dön</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 cursor-pointer"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={isDeleting || !adminPassword}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Siliniyor ve Doğrulanıyor...' : 'Müşteriyi Kalıcı Olarak Sil'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
