import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, X, ChevronDown, ChevronUp, Search, ShieldAlert,
  FileSpreadsheet, Settings, Volume2, VolumeX, ShieldCheck, Cpu, HardDrive,
  MessageSquare, ExternalLink, Zap, Move, HelpCircle, Mic, MicOff, Send,
  Radio, RadioTower, CheckCircle2, Info
} from 'lucide-react';
import { playAlertChime, getSelectedSound, ALERT_SOUNDS } from '../utils/licenseAlerts';
import { getDaysRemaining, getLicenseStatus } from '../utils/licenseAlerts';
import { useLanguage } from '../context/LanguageContext';
import {
  playRobotWalkSound,
  playRobotWinkSound,
  speakOptimusPrime,
  playTransformersTransformSound,
  getRobotAudioPrefs,
  saveRobotAudioPrefs
} from '../utils/robotAudio';
import { queryOmniAI } from '../utils/aiQueryEngine';

export default function AIAssistantMascot({
  stats,
  licenseAlerts = [],
  onOpenSearch,
  onOpenLicenseAlerts,
  onOpenReport,
  onOpenSettings,
  onOpenHelp,
  selectedCustomerName,
  currentUser,
  customers = []
}) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [robotAnimation, setRobotAnimation] = useState('idle'); // 'idle' | 'walk' | 'wink'
  const [audioPrefs, setAudioPrefs] = useState(() => getRobotAudioPrefs());
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice Query & Q&A State
  const [isListening, setIsListening] = useState(false);
  const [voiceQueryInput, setVoiceQueryInput] = useState('');
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const recognitionRef = useRef(null);

  // Position state for drag & drop
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('omni_robot_pos_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // Clamp within screen boundaries
          const clampedX = Math.max(10, Math.min(window.innerWidth - 140, parsed.x));
          const clampedY = Math.max(10, Math.min(window.innerHeight - 160, parsed.y));
          return { x: clampedX, y: clampedY };
        }
      }
    } catch (e) {}
    // Default position: bottom-right
    const defX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 160) : 800;
    const defY = typeof window !== 'undefined' ? Math.max(20, window.innerHeight - 190) : 600;
    return { x: defX, y: defY };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, robotX: 0, robotY: 0, moved: false });
  const containerRef = useRef(null);

  // Extract user's first name for personalized greeting
  const getFirstName = useCallback(() => {
    if (currentUser?.full_name) {
      const parts = currentUser.full_name.trim().split(/\s+/);
      if (parts[0]) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    if (currentUser?.username) {
      const part = currentUser.username.split('@')[0].split('.')[0];
      if (part) return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return language === 'en' ? 'User' : 'Yönetici';
  }, [currentUser, language]);

  // Calculate urgent licenses
  const urgentLicenses = (licenseAlerts || []).filter(item => {
    const days = getDaysRemaining(item.license_expiry);
    return getLicenseStatus(days).isUrgent;
  });

  // Toggle sound effects and voice
  const handleToggleAudio = (e) => {
    e.stopPropagation();
    const updated = {
      ...audioPrefs,
      soundEffects: !audioPrefs.soundEffects,
      speechVoice: !audioPrefs.speechVoice
    };
    setAudioPrefs(updated);
    saveRobotAudioPrefs(updated);
  };

  // Trigger wink animation & cheerful chirp
  const triggerWink = useCallback(() => {
    setRobotAnimation('wink');
    playRobotWinkSound();
    setTimeout(() => {
      setRobotAnimation('idle');
    }, 1000);
  }, []);

  // Trigger walk animation & mechanical footsteps sound
  const triggerWalk = useCallback(() => {
    setRobotAnimation('walk');
    playRobotWalkSound();
    setTimeout(() => {
      setRobotAnimation('idle');
    }, 2200);
  }, []);

  // Optimus Prime speak helper
  const speakOptimus = useCallback((text) => {
    if (!audioPrefs.speechVoice) return;
    setIsSpeaking(true);
    speakOptimusPrime(text, language);
    const duration = Math.min(10000, Math.max(3000, text.length * 85));
    setTimeout(() => {
      setIsSpeaking(false);
    }, duration);
  }, [audioPrefs.speechVoice, language]);

  // 1. Initial Optimus Prime Welcome Greeting
  useEffect(() => {
    const firstName = getFirstName();
    const welcomeMsg = language === 'en'
      ? `Welcome ${firstName}! I am Optimus Prime. All systems are operational, protecting your servers and devices.`
      : `Hoş geldin ${firstName}! Ben Optimus Prime. Sistem hazır, tüm sunucu ve cihazları senin için koruyorum.`;

    setSpeechText(welcomeMsg);
    // Bubble stays closed by default until user clicks the robot

    let hasWelcomed = false;
    const performWelcome = () => {
      if (hasWelcomed) return;
      hasWelcomed = true;
      playTransformersTransformSound();
      speakOptimus(welcomeMsg);
      triggerWink();
    };

    // Attempt speaking after delay
    const timer = setTimeout(() => {
      performWelcome();
    }, 1100);

    // Browser autoplay policy fallback
    const handleFirstGesture = () => {
      performWelcome();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [currentUser?.username, language, getFirstName, triggerWink, speakOptimus]);

  // 2. Periodic walking and winking routines
  useEffect(() => {
    const walkInterval = setInterval(() => {
      if (!isDragging && !isOpen && !isListening) {
        triggerWalk();
      }
    }, 42000);

    const winkInterval = setInterval(() => {
      if (!isDragging && !isOpen && robotAnimation === 'idle' && !isListening) {
        triggerWink();
      }
    }, 55000);

    return () => {
      clearInterval(walkInterval);
      clearInterval(winkInterval);
    };
  }, [isDragging, isOpen, robotAnimation, isListening, triggerWalk, triggerWink]);

  // 3. Question Answering Logic
  const handleAskQuestion = async (queryText) => {
    const q = (queryText || voiceQueryInput).trim();
    if (!q) return;

    setIsProcessingQuery(true);
    try {
      const response = await queryOmniAI({
        prompt: q,
        customers,
        stats,
        licenseAlerts
      });

      setSpeechText(response.speech);
      setLastAnswer(response);
      setShowSpeechBubble(true);

      // Play robotic servo cue and speak with Optimus Prime baritone voice
      playTransformersTransformSound();
      speakOptimus(response.speech);
      triggerWink();
    } catch (err) {
      console.error('AI Query failed:', err);
    } finally {
      setIsProcessingQuery(false);
      setVoiceQueryInput('');
    }
  };

  // 4. Voice Recognition (Speech-to-Text via Web Speech API)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(language === 'en'
        ? 'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your question.'
        : 'Tarayıcınız sesli mikrofon desteği sunmuyor. Lütfen Google Chrome veya Microsoft Edge kullanın ya da sorunuzu yazarak iletin.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = language === 'en' ? 'en-US' : 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setShowSpeechBubble(true);
        setSpeechText(language === 'en' ? 'Listening... Speak your question now.' : 'Dinliyorum... Sorunuzu şimdi söyleyin.');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setVoiceQueryInput(transcript);
          handleAskQuestion(transcript);
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  // 5. Drag & Drop Event Handlers
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      robotX: position.x,
      robotY: position.y,
      moved: false
    };

    setIsDragging(true);

    const onPointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragStartRef.current.moved = true;
      }

      const maxX = window.innerWidth - 130;
      const maxY = window.innerHeight - 150;
      const newX = Math.max(10, Math.min(maxX, dragStartRef.current.robotX + dx));
      const newY = Math.max(10, Math.min(maxY, dragStartRef.current.robotY + dy));

      setPosition({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      setPosition((currentPos) => {
        try {
          localStorage.setItem('omni_robot_pos_v2', JSON.stringify(currentPos));
        } catch (e) {}
        return currentPos;
      });

      if (!dragStartRef.current.moved) {
        triggerWink();
        if (isOpen) {
          setIsOpen(false);
          setShowSpeechBubble(false);
        } else {
          setShowSpeechBubble(prev => !prev);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Keep inside screen on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const maxX = window.innerWidth - 130;
        const maxY = window.innerHeight - 150;
        return {
          x: Math.max(10, Math.min(maxX, prev.x)),
          y: Math.max(10, Math.min(maxY, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTestSound = (e) => {
    e.stopPropagation();
    playAlertChime();
  };

  const currentSoundName = ALERT_SOUNDS.find(s => s.id === getSelectedSound())?.name || 'Cyber Chime';

  // Position helpers for popups relative to robot
  const isNearTop = position.y < 360;
  const isNearLeft = position.x < 320;

  if (isMinimized) {
    return (
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-40"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-full shadow-lg shadow-cyan-950/50 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
          title={t('ai.maximize')}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-bold tracking-wide">Optimus Prime</span>
          <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none'
      }}
      className={`fixed z-40 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Interactive Speech Bubble & Voice Input Bar */}
      {!isOpen && showSpeechBubble && (
        <div
          className={`absolute max-w-[260px] sm:max-w-[320px] bg-slate-900/95 border border-cyan-500/40 text-slate-200 text-xs rounded-2xl p-3 shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-200 ${
            isNearTop ? 'top-[105%]' : 'bottom-[105%]'
          } ${
            isNearLeft ? 'left-0' : 'right-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header controls: Title, Voice status, Audio toggle, Close */}
          <div className="flex items-center justify-between gap-1 mb-2 border-b border-slate-800/80 pb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="font-bold">Optimus Prime AI</span>
              {isSpeaking && (
                <span className="px-1 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-700 rounded text-[9px] animate-pulse">
                  Konuşuyor...
                </span>
              )}
              {isListening && (
                <span className="px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-700 rounded text-[9px] animate-ping">
                  Dinliyor...
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleAudio}
                className="p-0.5 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                title={audioPrefs.soundEffects ? 'Sesi Kapat' : 'Sesi Aç'}
              >
                {audioPrefs.soundEffects ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSpeechBubble(false);
                  setIsOpen(true);
                }}
                className="p-0.5 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                title="Sistem Paneli ve Kısayollar"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowSpeechBubble(false)}
                className="p-0.5 text-slate-400 hover:text-white rounded transition-colors"
                title={t('common.close')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Speech Text Content */}
          <p className="leading-snug text-[11px] text-slate-200 select-text font-sans mb-2.5 whitespace-pre-line">
            {speechText}
          </p>

          {/* Voice Input & Query Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion();
            }}
            className="flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-xl p-1 shadow-inner focus-within:border-cyan-500 transition-colors"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-950'
                  : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80'
              }`}
              title={isListening ? 'Dinlemeyi durdur' : 'Mikrofona basarak konuşun'}
            >
              {isListening ? (
                <Radio className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </button>

            {/* Query Input Box */}
            <input
              type="text"
              value={voiceQueryInput}
              onChange={(e) => setVoiceQueryInput(e.target.value)}
              placeholder={isListening ? 'Dinliyorum, konuşun...' : 'Örn: Atlas Lojistik sunucuları?'}
              className="flex-1 bg-transparent px-2 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none min-w-0"
            />

            {/* Submit / Ask button */}
            <button
              type="submit"
              disabled={isProcessingQuery || !voiceQueryInput.trim()}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer shrink-0"
              title="Sor"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Quick Voice Question Suggestions */}
          <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex flex-wrap gap-1">
            <span className="text-[9px] text-slate-400 w-full block">Hızlı Örnek Sorular:</span>
            {customers && customers.length > 0 && (
              <button
                type="button"
                onClick={() => handleAskQuestion(`${customers[0].name} sunucuları neler?`)}
                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors"
              >
                🎙️ {customers[0].name.split(' ')[0]} Sunucuları
              </button>
            )}
            <button
              type="button"
              onClick={() => handleAskQuestion('Kritik lisans durumu nedir?')}
              className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors"
            >
              🎙️ Lisans Durumu
            </button>
          </div>

          {/* Dynamic Bubble Tail Arrow */}
          <div
            className={`absolute w-3 h-3 bg-slate-900 border-cyan-500/40 rotate-45 ${
              isNearTop
                ? '-top-1.5 border-t border-l ' + (isNearLeft ? 'left-6' : 'right-6')
                : '-bottom-1.5 border-r border-b ' + (isNearLeft ? 'left-6' : 'right-6')
            }`}
          ></div>
        </div>
      )}

      {/* Expanded Interactive Telemetry Card */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute w-[calc(100vw-32px)] sm:w-84 md:w-88 max-h-[82vh] bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/90 backdrop-blur-xl overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200 ${
            isNearTop ? 'top-[105%]' : 'bottom-[105%]'
          } ${
            isNearLeft ? 'left-0' : 'right-0'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center">
                <img
                  src="/omni-robot.webp"
                  alt="Optimus Prime AI"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(6,182,212,0.4)]"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white tracking-wide">Optimus Prime AI</h4>
                  <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-700 rounded-full text-[9px] font-mono">
                    Sesli Komut
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Canlı Envanter Sorgusu Aktif</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleAudio}
                className="p-1 text-slate-400 hover:text-cyan-300 rounded-lg transition-colors cursor-pointer"
                title={audioPrefs.soundEffects ? 'Robot Sesini Kapat' : 'Robot Sesini Aç'}
              >
                {audioPrefs.soundEffects ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={t('ai.minimizeTitle')}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={t('ai.closeTitle')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Search Bar inside panel */}
          <div className="p-3 bg-slate-900/60 border-b border-slate-800">
            <div className="text-[11px] font-bold text-cyan-300 mb-1.5 flex items-center justify-between">
              <span>Optimus Prime'a Sesli Sor</span>
              <span className="text-[10px] text-slate-400 font-normal">Mikrofona bas &amp; söyle</span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl p-1 shadow-inner focus-within:border-cyan-500 transition-colors"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-950'
                    : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800'
                }`}
                title={isListening ? 'Dinlemeyi durdur' : 'Mikrofonla Konuş'}
              >
                <Mic className="w-4 h-4 text-cyan-400" />
              </button>
              <input
                type="text"
                value={voiceQueryInput}
                onChange={(e) => setVoiceQueryInput(e.target.value)}
                placeholder="Örn: Atlas Lojistik yetkilisi kim?"
                className="flex-1 bg-transparent px-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none min-w-0"
              />
              <button
                type="submit"
                disabled={isProcessingQuery || !voiceQueryInput.trim()}
                className="p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick System Telemetry & Actions */}
          <div className="p-3.5 space-y-3 text-xs overflow-y-auto max-h-[calc(82vh-180px)]">
            {/* Last Q&A Box if available */}
            {lastAnswer && (
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Optimus Prime Yanıtı:
                  </span>
                  <button
                    type="button"
                    onClick={() => speakOptimus(lastAnswer.speech)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    Tekrar Dinle
                  </button>
                </div>
                <div className="text-slate-200 text-xs whitespace-pre-line leading-relaxed font-sans bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  {lastAnswer.text}
                </div>
              </div>
            )}

            {/* Health Banner */}
            {urgentLicenses.length > 0 ? (
              <div
                onClick={() => {
                  setIsOpen(false);
                  onOpenLicenseAlerts?.();
                }}
                className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-600/60 hover:bg-rose-900/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                  <div>
                    <span className="font-bold text-rose-200 block text-xs">{t('ai.urgentAlertBanner')}</span>
                    <span className="text-[10px] text-rose-300/80">{t('ai.urgentAlertDesc', { count: urgentLicenses.length })}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-900 text-rose-200 rounded-lg border border-rose-700">
                  {t('ai.inspect')}
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block text-emerald-200">{t('ai.systemStable')}</span>
                  <span className="text-[10px] text-emerald-400/80">{t('ai.noUrgentAlert')}</span>
                </div>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">{t('ai.metricsCustomers')}</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{stats?.customers || 0}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">{t('ai.metricsServerVm')}</span>
                <span className="text-sm font-bold text-indigo-400 font-mono">
                  {(stats?.servers || 0) + (stats?.vms || 0)}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">{t('ai.metricsPcs')}</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{stats?.pcs || 0}</span>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('ai.quickActionsTitle')}
              </span>

              {/* Omnibox search */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSearch?.();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-xs">{t('ai.universalSearch')}</span>
                </div>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-mono text-slate-400">
                  Ctrl + K
                </kbd>
              </button>

              {/* License Alert Center */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenLicenseAlerts?.();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-300" />
                  <span className="text-xs">{t('ai.licenseTracking')}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {urgentLicenses.length > 0 ? t('ai.alertCount', { count: urgentLicenses.length }) : t('ai.clean')}
                </span>
              </button>

              {/* Customer Inventory Report */}
              {onOpenReport && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenReport();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
                    <span className="text-xs">{t('ai.customerReport')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{t('ai.customerReportDesc')}</span>
                </button>
              )}

              {/* Settings & 2FA */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
                    <span className="text-xs">{t('ai.settings2FA')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{t('ai.settings2FADesc')}</span>
                </button>
              )}

              {/* Help & Documentation Guide */}
              {onOpenHelp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenHelp();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                    <span className="text-xs">{language === 'en' ? 'User Guide & Help' : 'Kullanım Kılavuzu & Yardım'}</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-mono text-cyan-300">
                    F1
                  </kbd>
                </button>
              )}

              {/* Sound Test shortcut */}
              <button
                type="button"
                onClick={handleTestSound}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 text-slate-300 transition-colors text-left cursor-pointer group"
                title={t('ai.listenAlertSoundDesc')}
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs">{t('ai.testSound')}</span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-mono">{currentSoundName}</span>
              </button>
            </div>
          </div>

          {/* Footer with Drag Hint */}
          <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-400">
              <Move className="w-3 h-3 text-cyan-400" />
              <span>Sürükleyip taşıyabilirsiniz</span>
            </span>
            <span className="text-cyan-400 font-mono">Optimus Prime v2.6</span>
          </div>
        </div>
      )}

      {/* Draggable Mascot Avatar Widget - Pure Transparent Robot */}
      <div
        onPointerDown={handlePointerDown}
        className="relative group transition-transform duration-200 active:scale-95"
        title="Tutup sürükleyebilirsiniz veya tıklayarak açabilirsiniz"
      >
        {/* Dynamic Animation Wrapper: Walk / Wink / Idle */}
        <div className={`relative flex items-center justify-center ${
          robotAnimation === 'walk'
            ? 'animate-robot-walk'
            : robotAnimation === 'wink'
              ? 'animate-robot-wink'
              : 'animate-robot-idle'
        }`}>
          {/* Pure Floating Robot Image */}
          <img
            src="/omni-robot.webp"
            alt="Omni AI Robot"
            draggable={false}
            className="w-20 sm:w-24 md:w-28 lg:w-32 h-auto select-none pointer-events-none drop-shadow-[0_16px_24px_rgba(0,0,0,0.7)]"
          />

          {/* Winking Sparkle Burst Effect */}
          {robotAnimation === 'wink' && (
            <div className="absolute top-2 left-6 z-20 pointer-events-none animate-ping">
              <Sparkles className="w-5 h-5 text-cyan-300 filter drop-shadow-[0_0_8px_rgba(6,182,212,1)]" />
            </div>
          )}

          {/* Tiny Cyber Status Pulse Dot near the antenna */}
          <span className="absolute top-1 right-4 flex h-3 w-3 pointer-events-none" title={t('ai.mascotActive')}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border border-slate-900 shadow-[0_0_10px_rgba(6,182,212,1)]"></span>
          </span>

          {/* Drag Handle Indicator Pill on hover */}
          <div className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/40 text-[9px] text-cyan-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md flex items-center gap-1 backdrop-blur-xs">
            <Move className="w-2.5 h-2.5" />
            <span>Taşı</span>
          </div>
        </div>
      </div>
    </div>
  );
}
