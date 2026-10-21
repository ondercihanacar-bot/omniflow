import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, ShieldCheck, Lock, Unlock, Mail, User, Eye, EyeOff,
  Smartphone, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound,
  Sparkles, LogIn, UserPlus, Globe
} from 'lucide-react';
import { api } from '../api';
import BrandLogo from './BrandLogo';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import SeamlessVideo from './SeamlessVideo';

export default function AuthScreen({ onLoginSuccess }) {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [loginUser, setLoginUser] = useState(() => {
    try {
      return localStorage.getItem('itmanager_remembered_username') || 'onder.cihan.acar@gmail.com';
    } catch (e) {
      return 'onder.cihan.acar@gmail.com';
    }
  });
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('itmanager_remembered_username') !== null;
    } catch (e) {
      return true;
    }
  });
  
  // 2FA Step State
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const totpInputRef = useRef(null);

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dynamic Background State (Video or Image)
  const [bgUrl, setBgUrl] = useState(() => {
    try {
      const saved = localStorage.getItem('itmanager_auth_bg_url');
      if (!saved || saved.includes('custom') || saved.includes('null') || saved.includes('undefined')) {
        return '/auth-bg.mp4';
      }
      return saved;
    } catch (e) {
      return '/auth-bg.mp4';
    }
  });
  const [bgType, setBgType] = useState(() => {
    try {
      return localStorage.getItem('itmanager_auth_bg_type') || 'video';
    } catch (e) {
      return 'video';
    }
  });

  // Fetch background settings on mount
  useEffect(() => {
    api.getAuthStatus().then(res => {
      if (res && res.authBgUrl) {
        setBgUrl(res.authBgUrl);
        setBgType(res.authBgType || 'video');
        try {
          localStorage.setItem('itmanager_auth_bg_url', res.authBgUrl);
          localStorage.setItem('itmanager_auth_bg_type', res.authBgType || 'video');
        } catch (e) {}
      } else {
        setBgUrl('/auth-bg.mp4');
        setBgType('video');
      }
    }).catch(() => {
      setBgUrl('/auth-bg.mp4');
      setBgType('video');
    });
  }, []);

  // Auto-focus TOTP input when 2FA step activates
  useEffect(() => {
    if (is2FAStep && totpInputRef.current) {
      totpInputRef.current.focus();
    }
  }, [is2FAStep]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        username: loginUser.trim(),
        password: loginPass,
        totpCode: is2FAStep ? totpCode.trim() : undefined
      };

      const res = await api.loginAdmin(payload);

      // If server requires Google Authenticator 2FA code
      if (res.requireTotp) {
        setIs2FAStep(true);
        setAuthenticatedUser({
          username: res.username || loginUser,
          fullName: res.full_name || loginUser
        });
        setLoading(false);
        return;
      }

      if (res.success && res.user) {
        setSuccessMsg(t('auth.loginSuccess'));
        
        // Save session strictly in sessionStorage (closing tab/browser will destroy session)
        const sessionData = {
          user: res.user,
          token: res.token,
          loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('itmanager_user_session', JSON.stringify(sessionData));
        sessionStorage.setItem('itmanager_admin_logged_in', 'true');

        // Always remove persistent login tokens from localStorage so page reopen ALWAYS requires username/password
        try {
          localStorage.removeItem('itmanager_user_session');
          localStorage.removeItem('itmanager_admin_logged_in');
          if (rememberMe) {
            localStorage.setItem('itmanager_remembered_username', loginUser.trim());
          } else {
            localStorage.removeItem('itmanager_remembered_username');
          }
        } catch (e) {}

        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err.message || (language === 'tr' ? 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.' : 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regUser.trim()) {
      setErrorMsg(language === 'tr' ? 'Lütfen geçerli bir kullanıcı adı veya e-posta girin.' : 'Please enter a valid username or email.');
      return;
    }
    if (!regPass || regPass.length < 3) {
      setErrorMsg(t('auth.passwordTooShort'));
      return;
    }
    if (regPass !== regPassConfirm) {
      setErrorMsg(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await api.registerUser({
        username: regUser.trim(),
        email: regUser.trim(),
        full_name: regFullName.trim() || regUser.trim(),
        password: regPass
      });

      if (res.success) {
        setSuccessMsg(t('auth.registerSuccess'));
        setLoginUser(regUser.trim());
        setLoginPass(regPass);
        setMode('login');
        setRegFullName('');
        setRegUser('');
        setRegPass('');
        setRegPassConfirm('');
      }
    } catch (err) {
      setErrorMsg(err.message || (language === 'tr' ? 'Kayıt işlemi başarısız oldu.' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Full-Screen Background from Desktop (Video or Image) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {bgType === 'image' ? (
          <img
            key={bgUrl}
            src={bgUrl}
            alt="OmniFlow Background"
            onError={() => {
              console.warn('Auth image background failed, falling back to /auth-bg.mp4');
              setBgUrl('/auth-bg.mp4');
              setBgType('video');
              try {
                localStorage.setItem('itmanager_auth_bg_url', '/auth-bg.mp4');
                localStorage.setItem('itmanager_auth_bg_type', 'video');
              } catch (e) {}
            }}
            className="w-full h-full object-cover object-center animate-in fade-in duration-500"
          />
        ) : (
          <SeamlessVideo
            key={bgUrl}
            src={bgUrl}
            fadeDuration={1.4}
            className="w-full h-full object-cover object-center animate-in fade-in duration-500"
            containerClassName="absolute inset-0 w-full h-full overflow-hidden"
            onError={() => {
              console.warn('Auth video background failed to play, falling back to /auth-bg.mp4');
              if (bgUrl !== '/auth-bg.mp4') {
                setBgUrl('/auth-bg.mp4');
                setBgType('video');
                try {
                  localStorage.setItem('itmanager_auth_bg_url', '/auth-bg.mp4');
                  localStorage.setItem('itmanager_auth_bg_type', 'video');
                } catch (e) {}
              }
            }}
          />
        )}
        {/* Subtle dark gradient overlay to ensure perfect contrast and readability */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px]"></div>
      </div>

      {/* Top Header with Language Selector and Security Badge */}
      <header className="p-4 sm:p-6 flex items-center justify-between z-10 w-full px-4 sm:px-8">
        {/* Language Selector (TR / EN) */}
        <LanguageSelector variant="auth" />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-200 bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{t('auth.secureLogin')}</span>
        </div>
      </header>

      {/* Main Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-slate-900/85 border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl relative">
          
          {/* Top Brand Logo Banner (Beveled and blended with card) */}
          <div className="mb-4 text-center">
            <BrandLogo size="auth" />
            {is2FAStep && (
              <div className="mt-3">
                <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>{t('auth.authenticatorTitle')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('auth.authenticatorDesc')}
                </p>
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs (Login vs Register) - Hidden during 2FA */}
          {!is2FAStep && (
            <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('auth.loginTab')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('auth.registerTab')}</span>
              </button>
            </div>
          )}

          {/* Alerts: Error & Success */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* ================= FORM 1: LOGIN ================= */}
          {mode === 'login' && !is2FAStep && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t('auth.emailOrUsername')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder={t('auth.emailOrUsernamePlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{t('auth.password')}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {language === 'tr' ? 'Varsayılan: 2213' : 'Default: 2213'}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Pill for default user */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span>{t('auth.rememberMe')}</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setLoginUser('onder.cihan.acar@gmail.com');
                    setLoginPass('2213');
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer underline"
                >
                  {language === 'tr' ? 'Varsayılan Bilgileri Doldur' : 'Fill Default Admin'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('auth.loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.loginBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= FORM 2: 2FA GOOGLE AUTHENTICATOR STEP ================= */}
          {is2FAStep && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">{t('auth.authenticatorTitle')}</div>
                  <div className="text-[11px] text-slate-300">
                    {t('auth.authenticatorDesc')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                  {t('auth.authenticatorDesc')}:
                </label>
                <div className="relative">
                  <input
                    ref={totpInputRef}
                    type="text"
                    maxLength={6}
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full bg-slate-950 border-2 border-blue-500/50 rounded-xl py-3 text-center text-xl tracking-[0.5em] font-mono font-black text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIs2FAStep(false);
                    setTotpCode('');
                    setErrorMsg('');
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  {t('auth.cancel2FA')}
                </button>

                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{t('auth.verifyAndLogin')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= FORM 3: REGISTER NEW USER ================= */}
          {mode === 'register' && !is2FAStep && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('auth.newUsername')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    placeholder={t('auth.newUsernamePlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    required
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder={t('auth.passwordTooShort')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    required
                    value={regPassConfirm}
                    onChange={(e) => setRegPassConfirm(e.target.value)}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('auth.creatingAccount')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t('auth.registerBtn')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Mandatory Developer Copyright Footer (Seamless with full-screen background) */}
      <footer className="py-4 px-6 text-center shrink-0 z-10 bg-transparent border-t-0 pointer-events-auto">
        <div className="flex flex-col items-center justify-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
          <p className="text-xs font-semibold text-slate-100 tracking-wide">
            Designed &amp; Developed by <span className="text-cyan-400 font-bold tracking-wide">Önder Cihan ACAR</span>
          </p>
          <p className="text-[11px] text-slate-300 font-mono tracking-wider">
            &copy; 2026. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Floating Robot Mascot on Auth Screen (Pure Robot, No Frame, No Whiteness) */}
      <div className="fixed bottom-4 right-4 z-20 pointer-events-auto hidden md:block select-none">
        <img
          src="/omni-robot.webp"
          alt="Omni AI"
          className="w-24 lg:w-28 h-auto drop-shadow-[0_16px_20px_rgba(0,0,0,0.65)] hover:scale-110 transition-transform duration-300 cursor-pointer"
          title={t('auth.authMascotTooltip')}
        />
      </div>
    </div>
  );
}
