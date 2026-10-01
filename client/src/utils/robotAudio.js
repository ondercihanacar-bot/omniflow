// OMNIFlow - Omni Robot Audio & Speech Synthesizer Engine
// Web Audio API & Web Speech API based (Zero external dependencies, 100% offline & browser-native)

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Persisted audio preferences
const STORAGE_KEY = 'omni_robot_audio_prefs';

export function getRobotAudioPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    soundEffects: true, // Walk, wink, chirp sounds
    speechVoice: true,   // Spoken greetings and announcements
    volume: 0.8
  };
}

export function saveRobotAudioPrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {}
}

/**
 * Play a cute robotic servo footstep sound (Step 1 & Step 2)
 */
export function playRobotWalkSound() {
  const prefs = getRobotAudioPrefs();
  if (!prefs.soundEffects) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.18 * prefs.volume, now);
  masterGain.connect(ctx.destination);

  // Single step synthesizer helper
  const playStep = (timeOffset, pitchBase) => {
    // 1. Mechanical servo joint click (Bandpass sweep)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitchBase, now + timeOffset);
    osc.frequency.exponentialRampToValueAtTime(80, now + timeOffset + 0.08);

    gain.gain.setValueAtTime(0.35, now + timeOffset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + 0.09);

    // 2. Low mechanical footstep tap
    const tapOsc = ctx.createOscillator();
    const tapGain = ctx.createGain();
    tapOsc.type = 'sine';
    tapOsc.frequency.setValueAtTime(120, now + timeOffset);
    tapOsc.frequency.exponentialRampToValueAtTime(45, now + timeOffset + 0.07);

    tapGain.gain.setValueAtTime(0.5, now + timeOffset);
    tapGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.07);

    tapOsc.connect(tapGain);
    tapGain.connect(masterGain);

    tapOsc.start(now + timeOffset);
    tapOsc.stop(now + timeOffset + 0.08);
  };

  // Step 1: Left foot
  playStep(0.02, 320);

  // Step 2: Right foot (subtle higher pitch)
  playStep(0.24, 380);

  // Step 3: Settling tap
  playStep(0.46, 340);
}

/**
 * Play a cute robotic electronic chirp / wink / giggle sound (Wall-E / R2-D2 style)
 */
export function playRobotWinkSound() {
  const prefs = getRobotAudioPrefs();
  if (!prefs.soundEffects) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.22 * prefs.volume, now);
  masterGain.connect(ctx.destination);

  // Rapid ascending cheerful melodic chirp: D5 -> G5 -> B5 -> E6
  const notes = [
    { freq: 587.33, duration: 0.05, start: 0.0 },   // D5
    { freq: 783.99, duration: 0.06, start: 0.05 },  // G5
    { freq: 987.77, duration: 0.07, start: 0.11 },  // B5
    { freq: 1318.51, duration: 0.14, start: 0.18 }  // E6 with vibrato
  ];

  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, now + note.start);

    // Slight pitch bend for electronic cuteness
    osc.frequency.exponentialRampToValueAtTime(note.freq * 1.08, now + note.start + note.duration);

    gain.gain.setValueAtTime(0.01, now + note.start);
    gain.gain.linearRampToValueAtTime(0.4, now + note.start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.01);
  });
}

/**
 * Play subtle electronic talk cue sound (two tiny soft blips before speaking)
 */
export function playRobotSpeechBlip() {
  const prefs = getRobotAudioPrefs();
  if (!prefs.soundEffects) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.12 * prefs.volume, now);
  masterGain.connect(ctx.destination);

  const blip = (freq, start) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0.3, now + start);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.04);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + start);
    osc.stop(now + start + 0.045);
  };

  blip(1046, 0.0);
  blip(1567, 0.05);
}

/**
 * Speak text using Web Speech API with cute robotic persona
 */
export function speakRobotText(text, lang = 'tr') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const prefs = getRobotAudioPrefs();
  if (!prefs.speechVoice) return;
  if (!text) return;

  try {
    // Play electronic blip cue
    playRobotSpeechBlip();

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = prefs.volume;
    utterance.rate = 1.03;   // Crisp, agile robotic tempo
    utterance.pitch = 1.15;  // Cheerful, slightly youthful assistant pitch

    // Select suitable voice for language
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (lang === 'tr') {
        const trVoice = voices.find(v => v.lang && (v.lang.startsWith('tr') || v.lang.includes('TR')));
        if (trVoice) utterance.voice = trVoice;
      } else {
        const enVoice = voices.find(v => v.lang && (v.lang.startsWith('en') || v.lang.includes('US')));
        if (enVoice) utterance.voice = enVoice;
      }
    }

    // Set language tag
    utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Robot speech error:', err);
  }
}

/**
 * Play iconic Transformers Mechanical Transformation Sound FX (G1 style)
 */
export function playTransformersTransformSound() {
  const prefs = getRobotAudioPrefs();
  if (!prefs.soundEffects) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.25 * prefs.volume, now);
  masterGain.connect(ctx.destination);

  // Five distinct robotic transformation shifting pulses
  const pulses = [
    { start: 0.00, f1: 180, f2: 620, dur: 0.12, type: 'sawtooth' },
    { start: 0.10, f1: 420, f2: 880, dur: 0.11, type: 'square' },
    { start: 0.20, f1: 650, f2: 320, dur: 0.14, type: 'triangle' },
    { start: 0.32, f1: 280, f2: 950, dur: 0.13, type: 'sawtooth' },
    { start: 0.44, f1: 120, f2: 55,  dur: 0.20, type: 'sine' } // Final deep mechanical hydraulic lock
  ];

  pulses.forEach(p => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = p.type;
    osc.frequency.setValueAtTime(p.f1, now + p.start);
    osc.frequency.exponentialRampToValueAtTime(p.f2, now + p.start + p.dur);

    gain.gain.setValueAtTime(0.01, now + p.start);
    gain.gain.linearRampToValueAtTime(0.35, now + p.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.start + p.dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now + p.start);
    osc.stop(now + p.start + p.dur + 0.01);
  });
}

/**
 * Speak text with deep, heroic Optimus Prime robotic voice
 */
export function speakOptimusPrime(text, lang = 'tr') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const prefs = getRobotAudioPrefs();
  if (!prefs.speechVoice) return;
  if (!text) return;

  try {
    // Play robotic servo cue sound
    playRobotSpeechBlip();

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = prefs.volume;
    utterance.rate = 0.90;   // Dignified, commanding Autobot tempo
    utterance.pitch = 0.68;  // Deep, authoritative baritone robotic pitch

    // Select suitable voice for language, preferring deep male voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (lang === 'tr') {
        // Look for Turkish male voice first (e.g. Tolga, Ahmet, Google), or any Turkish voice
        const trMale = voices.find(v => v.lang && (v.lang.startsWith('tr') || v.lang.includes('TR')) && (v.name.includes('Tolga') || v.name.includes('Male') || v.name.includes('Erkek')));
        const trVoice = trMale || voices.find(v => v.lang && (v.lang.startsWith('tr') || v.lang.includes('TR')));
        if (trVoice) utterance.voice = trVoice;
      } else {
        const enMale = voices.find(v => v.lang && (v.lang.startsWith('en') || v.lang.includes('US')) && (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Guy') || v.name.includes('Male')));
        const enVoice = enMale || voices.find(v => v.lang && (v.lang.startsWith('en') || v.lang.includes('US')));
        if (enVoice) utterance.voice = enVoice;
      }
    }

    utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Optimus Prime speech error:', err);
  }
}

