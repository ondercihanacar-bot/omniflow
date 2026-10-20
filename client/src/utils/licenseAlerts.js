/**
 * Utility functions for Firewall License Expiration Tracking and Alerts
 * Includes a 20-sound high-tech Web Audio synthesizer library
 */

/**
 * Parses date string in common Turkish and ISO formats (DD.MM.YYYY, YYYY-MM-DD, DD/MM/YYYY)
 * @param {string} dateStr 
 * @returns {Date|null}
 */
export function parseExpiryDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Format: DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  // Format: YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Returns number of calendar days remaining until expiry
 * @param {string} dateStr 
 * @returns {number|null} null if invalid date, negative if expired, 0 if today, positive if future
 */
export function getDaysRemaining(dateStr) {
  const expiryDate = parseExpiryDate(dateStr);
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

import { speakRobotText } from './robotAudio';

/**
 * Categorizes the license status based on remaining days
 * - <= 30 days: Uyarı (Warning - Amber)
 * - <= 15 days: Kritik / Belirgin Uyarı & Sesli Alarm (Critical - Pulsing Red + Audio)
 * - > 30 days: Aktif / Normal (Emerald Green)
 * @param {number|null} days 
 */
export function getLicenseStatus(days) {
  if (days === null) {
    return {
      level: 'unknown',
      label: 'Belirtilmedi',
      shortLabel: 'Tarih Yok',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
      borderClass: 'border-slate-800',
      isUrgent: false,
      isWarning: false,
      isCritical: false
    };
  }

  if (days < 0) {
    const passed = Math.abs(days);
    return {
      level: 'expired',
      days,
      label: `Süresi Doldu (${passed} gün önce)`,
      shortLabel: `🚨 ${passed} gün önce doldu!`,
      badgeClass: 'bg-rose-950 text-rose-200 border-rose-500 animate-pulse font-extrabold shadow-[0_0_14px_rgba(244,63,94,0.45)] ring-1 ring-rose-500/50',
      borderClass: 'border-rose-500/80 shadow-rose-950/40 shadow-md',
      tagColor: 'rose',
      isUrgent: true,
      isWarning: true,
      isCritical: true,
      severity: 1
    };
  }

  if (days === 0) {
    return {
      level: 'today',
      days,
      label: 'Bugün Bitiyor!',
      shortLabel: '🚨 Bugün bitiyor!',
      badgeClass: 'bg-rose-900 text-white border-rose-500 animate-pulse font-extrabold shadow-[0_0_14px_rgba(244,63,94,0.5)] ring-1 ring-rose-500/60',
      borderClass: 'border-rose-500 shadow-rose-950/40 shadow-md',
      tagColor: 'rose',
      isUrgent: true,
      isWarning: true,
      isCritical: true,
      severity: 2
    };
  }

  // 1 to 15 days: KRİTİK / ÇOK DAHA BELİRGİN SESLİ & GÖRSEL UYARI
  if (days <= 15) {
    return {
      level: 'critical',
      days,
      label: `🚨 Kritik: Son ${days} Gün Kaldı!`,
      shortLabel: `🚨 ${days} gün kaldı!`,
      badgeClass: 'bg-rose-950 text-rose-200 border-rose-500 animate-pulse font-extrabold shadow-[0_0_14px_rgba(244,63,94,0.45)] ring-1 ring-rose-500/50',
      borderClass: 'border-rose-500 shadow-rose-950/40 shadow-lg ring-1 ring-rose-500/40',
      tagColor: 'rose',
      isUrgent: true,
      isWarning: true,
      isCritical: true,
      severity: 3
    };
  }

  // 16 to 30 days: SON 30 GÜN UYARISI BAŞLASIN (AMBER / SARI-TURUNCU UYARI)
  if (days <= 30) {
    return {
      level: 'warning',
      days,
      label: `⚠️ Uyarı: ${days} Gün Kaldı`,
      shortLabel: `⚠️ ${days} gün kaldı`,
      badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/80 font-bold shadow-[0_0_8px_rgba(245,158,11,0.25)]',
      borderClass: 'border-amber-500/60 shadow-amber-950/20 shadow-md',
      tagColor: 'amber',
      isUrgent: true,
      isWarning: true,
      isCritical: false,
      severity: 4
    };
  }

  // > 30 days: NORMAL / GÜVENLİ (YEŞİL / EMERALD)
  return {
    level: 'ok',
    days,
    label: `${days} Gün Kaldı (Aktif)`,
    shortLabel: `${days} gün`,
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 font-medium',
    borderClass: 'border-emerald-800/40',
    tagColor: 'emerald',
    isUrgent: false,
    isWarning: false,
    isCritical: false,
    severity: 5
  };
}

// ============================================================================
// 20 DISTINCT TECHNOLOGICAL & HIGH-TECH WEB AUDIO SOUND EFFECTS
// ============================================================================

/**
 * Creates an audio context safely
 */
function getAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

/**
 * Helper to generate a tone with exponential envelope
 */
function playTone(ctx, { freq = 440, type = 'sine', start = 0, duration = 0.3, gain = 0.15, sweepTo = null }) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const now = ctx.currentTime + start;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, now + duration);
  }

  gainNode.gain.setValueAtTime(gain, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

/**
 * 20 Distinct Alert Sound Synthesizers
 */
export const ALERT_SOUNDS = [
  {
    id: 'cyber_chime',
    name: 'Cyber Chime',
    category: 'Bildirim & Melodi',
    icon: '🔔',
    description: 'Klasik çift tonlu kristal dijital zil (A5 - D6)',
    play: (ctx) => {
      const now = ctx.currentTime;
      playTone(ctx, { freq: 880, type: 'sine', start: 0, duration: 0.3, gain: 0.12 });
      playTone(ctx, { freq: 1174.66, type: 'sine', start: 0.12, duration: 0.5, gain: 0.15 });
    }
  },
  {
    id: 'quantum_blip',
    name: 'Quantum Blip',
    category: 'Teknolojik & Siber',
    icon: '⚡',
    description: 'Yüksek frekanslı mikro kuantum çift bip',
    play: (ctx) => {
      playTone(ctx, { freq: 1200, sweepTo: 1800, type: 'sine', start: 0, duration: 0.08, gain: 0.16 });
      playTone(ctx, { freq: 1800, sweepTo: 2400, type: 'sine', start: 0.1, duration: 0.12, gain: 0.18 });
    }
  },
  {
    id: 'server_ping',
    name: 'Server Ping',
    category: 'Sinyal & Radar',
    icon: '📡',
    description: 'Veri merkezi derin sonar yankısı ve harmonik ping',
    play: (ctx) => {
      playTone(ctx, { freq: 440, type: 'sine', start: 0, duration: 0.9, gain: 0.2 });
      playTone(ctx, { freq: 880, type: 'sine', start: 0, duration: 0.6, gain: 0.06 });
    }
  },
  {
    id: 'scifi_beacon',
    name: 'Sci-Fi Beacon',
    category: 'Sinyal & Radar',
    icon: '🚀',
    description: 'Uzay istasyonu üçlü yükselen arpej sinyali',
    play: (ctx) => {
      playTone(ctx, { freq: 587.33, type: 'sine', start: 0, duration: 0.15, gain: 0.12 });
      playTone(ctx, { freq: 880, type: 'sine', start: 0.11, duration: 0.15, gain: 0.14 });
      playTone(ctx, { freq: 1174.66, type: 'sine', start: 0.22, duration: 0.45, gain: 0.16 });
    }
  },
  {
    id: 'cyber_pulse',
    name: 'Cyber Pulse',
    category: 'Teknolojik & Siber',
    icon: '🔮',
    description: 'Filtrelenmiş siber güvenlik ritmik enerji darbesi',
    play: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    }
  },
  {
    id: 'radar_sweep',
    name: 'Subspace Radar',
    category: 'Sinyal & Radar',
    icon: '🛰️',
    description: 'Frekans taramalı derin radar yankısı ve tepe tıkırtısı',
    play: (ctx) => {
      playTone(ctx, { freq: 350, sweepTo: 1400, type: 'sine', start: 0, duration: 0.24, gain: 0.16 });
      playTone(ctx, { freq: 1600, type: 'sine', start: 0.25, duration: 0.35, gain: 0.14 });
    }
  },
  {
    id: 'terminal_alert',
    name: 'NOC Terminal',
    category: 'Bildirim & Melodi',
    icon: '💻',
    description: 'Retro CRT konsol çift prompt tonu (G5 - C6)',
    play: (ctx) => {
      playTone(ctx, { freq: 784, type: 'square', start: 0, duration: 0.08, gain: 0.07 });
      playTone(ctx, { freq: 1046.5, type: 'square', start: 0.11, duration: 0.16, gain: 0.08 });
    }
  },
  {
    id: 'neural_spark',
    name: 'Neural Spark',
    category: 'Teknolojik & Siber',
    icon: '✨',
    description: 'Yapay zeka sinaptik kıvılcım basamakları',
    play: (ctx) => {
      const freqs = [1320, 1760, 2200, 2640];
      freqs.forEach((f, idx) => {
        playTone(ctx, { freq: f, type: 'sine', start: idx * 0.045, duration: 0.18, gain: 0.11 });
      });
    }
  },
  {
    id: 'shield_activate',
    name: 'Shield Online',
    category: 'Teknolojik & Siber',
    icon: '🛡️',
    description: 'Güvenlik kalkanı aktif enerji yükselişi',
    play: (ctx) => {
      playTone(ctx, { freq: 220, sweepTo: 880, type: 'sine', start: 0, duration: 0.3, gain: 0.16 });
      playTone(ctx, { freq: 1760, type: 'sine', start: 0.28, duration: 0.4, gain: 0.12 });
    }
  },
  {
    id: 'critical_klaxon',
    name: 'Critical Klaxon',
    category: 'Kritik & Alarm',
    icon: '🚨',
    description: 'Yüksek dikkat gerektiren iki kademeli sistem alarmı',
    play: (ctx) => {
      playTone(ctx, { freq: 880, type: 'sawtooth', start: 0, duration: 0.09, gain: 0.09 });
      playTone(ctx, { freq: 659.25, type: 'sawtooth', start: 0.1, duration: 0.09, gain: 0.09 });
      playTone(ctx, { freq: 880, type: 'sawtooth', start: 0.2, duration: 0.14, gain: 0.1 });
    }
  },
  {
    id: 'matrix_glitch',
    name: 'Matrix Data Stream',
    category: 'Teknolojik & Siber',
    icon: '🧬',
    description: 'Hızlı dijital veri paketi iletim efekti',
    play: (ctx) => {
      const freqs = [1000, 1400, 1800, 2200];
      freqs.forEach((f, i) => {
        playTone(ctx, { freq: f, type: 'triangle', start: i * 0.035, duration: 0.08, gain: 0.14 });
      });
    }
  },
  {
    id: 'telemetry_ding',
    name: 'Telemetry Ding',
    category: 'Bildirim & Melodi',
    icon: '💎',
    description: 'Saf cam tınılı yüksek telemetri zili (G6)',
    play: (ctx) => {
      playTone(ctx, { freq: 1567.98, type: 'sine', start: 0, duration: 0.7, gain: 0.18 });
      playTone(ctx, { freq: 3135.96, type: 'sine', start: 0, duration: 0.3, gain: 0.05 });
    }
  },
  {
    id: 'photon_beam',
    name: 'Photon Beam',
    category: 'Teknolojik & Siber',
    icon: '🔦',
    description: 'Foton ışını lazer iniş frekansı',
    play: (ctx) => {
      playTone(ctx, { freq: 2400, sweepTo: 480, type: 'sine', start: 0, duration: 0.22, gain: 0.18 });
    }
  },
  {
    id: 'satellite_link',
    name: 'Satellite Link',
    category: 'Sinyal & Radar',
    icon: '🛰️',
    description: 'Üçlü uydu senkronizasyon tıkırtısı (C6)',
    play: (ctx) => {
      playTone(ctx, { freq: 1046.5, type: 'sine', start: 0, duration: 0.05, gain: 0.15 });
      playTone(ctx, { freq: 1046.5, type: 'sine', start: 0.09, duration: 0.05, gain: 0.15 });
      playTone(ctx, { freq: 1046.5, type: 'sine', start: 0.18, duration: 0.18, gain: 0.17 });
    }
  },
  {
    id: 'holo_interface',
    name: 'Holo UI',
    category: 'Bildirim & Melodi',
    icon: '🪐',
    description: 'Holografik arayüz dokunma akoru (C - E - G)',
    play: (ctx) => {
      playTone(ctx, { freq: 523.25, type: 'sine', start: 0, duration: 0.45, gain: 0.08 });
      playTone(ctx, { freq: 659.25, type: 'sine', start: 0.04, duration: 0.45, gain: 0.08 });
      playTone(ctx, { freq: 783.99, type: 'sine', start: 0.08, duration: 0.5, gain: 0.1 });
    }
  },
  {
    id: 'firewall_guard',
    name: 'Firewall Guard',
    category: 'Kritik & Alarm',
    icon: '🧱',
    description: 'Ağ duvarı güvenliği tok metalik uyarı',
    play: (ctx) => {
      playTone(ctx, { freq: 330, type: 'triangle', start: 0, duration: 0.35, gain: 0.18 });
      playTone(ctx, { freq: 660, type: 'sine', start: 0.08, duration: 0.4, gain: 0.12 });
    }
  },
  {
    id: 'hyperdrive_charge',
    name: 'Hyperdrive Pulse',
    category: 'Teknolojik & Siber',
    icon: '⚡',
    description: 'Aşırı hız motoru enerji dolum vınlaması',
    play: (ctx) => {
      playTone(ctx, { freq: 160, sweepTo: 960, type: 'sine', start: 0, duration: 0.4, gain: 0.17 });
      playTone(ctx, { freq: 960, type: 'sine', start: 0.38, duration: 0.25, gain: 0.15 });
    }
  },
  {
    id: 'deep_sonar',
    name: 'Deep Sonar',
    category: 'Sinyal & Radar',
    icon: '🌊',
    description: 'Derin deniz sonar darbesi ve sub-bass tınısı (D4)',
    play: (ctx) => {
      playTone(ctx, { freq: 293.66, type: 'sine', start: 0, duration: 1.2, gain: 0.22 });
      playTone(ctx, { freq: 587.33, type: 'sine', start: 0, duration: 0.4, gain: 0.05 });
    }
  },
  {
    id: 'orbital_sync',
    name: 'Orbital Sync',
    category: 'Bildirim & Melodi',
    icon: '🌐',
    description: 'Yörünge harmonik ikili aralık (E5 - B5)',
    play: (ctx) => {
      playTone(ctx, { freq: 659.25, type: 'sine', start: 0, duration: 0.55, gain: 0.11 });
      playTone(ctx, { freq: 987.77, type: 'sine', start: 0.06, duration: 0.6, gain: 0.13 });
    }
  },
  {
    id: 'crystal_echo',
    name: 'Crystal Echo',
    category: 'Bildirim & Melodi',
    icon: '❄️',
    description: 'Dört kademeli kristal damla yankılanması',
    play: (ctx) => {
      const freqs = [1760, 1396.91, 1174.66, 880];
      freqs.forEach((f, i) => {
        playTone(ctx, { freq: f, type: 'sine', start: i * 0.09, duration: 0.35, gain: 0.12 - (i * 0.02) });
      });
    }
  }
];

// ============================================================================
// STORAGE & PLAYBACK HELPERS
// ============================================================================

const SOUND_ENABLED_KEY = 'itmanager_license_sound_enabled';
const SOUND_CHOICE_KEY = 'itmanager_license_sound_choice';
const DEFAULT_SOUND_ID = 'cyber_chime';

export function getSoundEnabled() {
  try {
    const val = localStorage.getItem(SOUND_ENABLED_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch (err) {
    console.warn('Could not save sound setting:', err);
  }
}

export function getSelectedSound() {
  try {
    const id = localStorage.getItem(SOUND_CHOICE_KEY);
    if (id && ALERT_SOUNDS.some(s => s.id === id)) {
      return id;
    }
    return DEFAULT_SOUND_ID;
  } catch {
    return DEFAULT_SOUND_ID;
  }
}

export function setSelectedSound(soundId) {
  try {
    if (ALERT_SOUNDS.some(s => s.id === soundId)) {
      localStorage.setItem(SOUND_CHOICE_KEY, soundId);
    }
  } catch (err) {
    console.warn('Could not save sound choice:', err);
  }
}

/**
 * Plays a specific sound by its unique ID
 * @param {string} soundId 
 */
export function playSoundById(soundId) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const item = ALERT_SOUNDS.find(s => s.id === soundId) || ALERT_SOUNDS[0];
    item.play(ctx);
  } catch (err) {
    console.warn('Failed to play alert sound:', soundId, err);
  }
}

/**
 * Synthesizes the user's chosen alert notification sound
 */
export function playAlertChime() {
  try {
    if (!getSoundEnabled()) return;
    const choice = getSelectedSound();
    playSoundById(choice);
  } catch (err) {
    console.warn('Audio chime could not be played:', err);
  }
}

/**
 * High-urgency critical alarm sound for licenses expiring within <= 15 days
 * Plays a distinct two-tone alert siren
 */
export function playCriticalLicenseAlarm() {
  try {
    if (!getSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Distinct 3-stage critical klaxon siren
    const now = ctx.currentTime;
    playTone(ctx, { freq: 920, type: 'sawtooth', start: 0, duration: 0.12, gain: 0.15 });
    playTone(ctx, { freq: 680, type: 'sawtooth', start: 0.14, duration: 0.12, gain: 0.15 });
    playTone(ctx, { freq: 980, type: 'sawtooth', start: 0.28, duration: 0.22, gain: 0.18 });
  } catch (err) {
    console.warn('Critical license alarm could not be played:', err);
  }
}

/**
 * Spoken voice warning via Optimus Prime speech engine for licenses expiring within <= 15 days
 * @param {string|number} subject Info about the expiring license or count
 */
export function announceCriticalLicenseVoice(subject) {
  try {
    if (!getSoundEnabled()) return;
    let message = 'Dikkat! 15 gün veya daha az süresi kalan kritik lisans bulunmaktadır!';
    if (typeof subject === 'string' && subject.trim()) {
      message = `Dikkat! ${subject} lisansının süresi 15 günden az kalmıştır. Lütfen yenileyiniz!`;
    } else if (typeof subject === 'number' && subject > 0) {
      message = `Dikkat! ${subject} adet lisansın süresi 15 gün veya daha az kalmıştır!`;
    }
    speakRobotText(message, 'tr');
  } catch (err) {
    console.warn('Voice announcement failed:', err);
  }
}
