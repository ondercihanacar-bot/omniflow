import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, X, Send, Image as ImageIcon, Paperclip, RefreshCw,
  Copy, Check, Bot, User, KeyRound, BookmarkPlus, ArrowRight,
  Lightbulb, AlertCircle, Terminal, CheckCircle2, ChevronRight, Shield
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function AIChatModal({
  isOpen,
  onClose,
  onSaveToKB, // Callback to prefill KnowledgeBaseModal with AI solution
  selectedCustomerName
}) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Merhaba! Ben **OMNI AI IT Çözüm Asistanı**.\n\nKarşılaştığınız sistem, sunucu, ağ veya kullanıcı arızasını bana iletebilirsiniz:\n- Hata kodu (0x80070005, Event ID, Error 98 vb.),\n- Log çıktısı veya hata açıklaması,\n- **Doğrudan Ekran Görüntüsü (Screenshot):** Ekran alıntısı aracından görüntüyü kopyalayıp buraya \`Ctrl + V\` ile yapıştırabilir veya dosya olarak yükleyebilirsiniz.\n\nNasıl yardımcı olabilirim?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null); // { base64, mimeType, name, size }
  const [loading, setLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [savedMsgId, setSavedMsgId] = useState(null);

  // API Key Configuration State
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keyNotice, setKeyNotice] = useState('');

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch AI Settings on mount
  useEffect(() => {
    if (isOpen) {
      api.getAISettings().then(res => {
        if (res && res.hasApiKey) {
          setHasApiKey(true);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !showKeyConfig) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showKeyConfig]);

  if (!isOpen) return null;

  // Handle Clipboard Paste (Ctrl + V with Image Screenshot)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setAttachedImage({
              base64: event.target.result,
              mimeType: file.type || 'image/png',
              name: `Ekran_Goruntusu_${Date.now()}.png`,
              size: file.size
            });
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  // Handle File Upload from Input
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Lütfen yalnızca resim dosyası seçin (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage({
        base64: event.target.result,
        mimeType: file.type,
        name: file.name,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send Message to AI
  const handleSendMessage = async (textToSend, imgToSend) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    const img = imgToSend !== undefined ? imgToSend : attachedImage;

    if (!text && !img) return;

    const userMsgId = Date.now();
    const newUserMsg = {
      id: userMsgId,
      sender: 'user',
      text: text || '(Görsel yüklendi)',
      image: img?.base64,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await api.diagnoseWithAI({
        message: text,
        imageBase64: img?.base64,
        mimeType: img?.mimeType || 'image/png'
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.text || 'Teşhis tamamlandı.',
        source: res.source,
        warning: res.warning,
        notice: res.notice,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `⚠️ **Bağlantı Hatası:** ${err.message || 'AI servisine ulaşılamadı. Lütfen tekrar deneyin.'}`,
          isError: true,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Save API Key
  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    setKeyNotice('');
    try {
      const res = await api.saveAISettings({ geminiApiKey: apiKeyInput });
      setHasApiKey(res.hasApiKey);
      setKeyNotice('API Anahtarı başarıyla kaydedildi!');
      setTimeout(() => {
        setShowKeyConfig(false);
        setKeyNotice('');
      }, 1200);
    } catch (err) {
      setKeyNotice(`Hata: ${err.message}`);
    } finally {
      setSavingKey(false);
    }
  };

  // Copy Code Snippet helper
  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Save AI Solution to Knowledge Base
  const handleSaveSolutionToKB = (aiMsg) => {
    if (!onSaveToKB) return;

    // Extract title, root cause and commands from AI text
    const lines = aiMsg.text.split('\n');
    let title = 'AI Çözümü';
    let rootCause = '';
    let solutionSteps = aiMsg.text;
    let commandSnippet = '';

    // Simple parsing heuristics
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.includes('Kök Neden') || l.includes('Root Cause')) {
        rootCause = lines.slice(i + 1, i + 4).join('\n').replace(/^[#*-]\s*/, '').trim();
      }
      if (l.includes('```')) {
        const codeLines = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].includes('```')) break;
          codeLines.push(lines[j]);
        }
        if (codeLines.length > 0) {
          commandSnippet = codeLines.join('\n');
        }
      }
    }

    // Guess a clean title from user's last question
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg && lastUserMsg.text && lastUserMsg.text !== '(Görsel yüklendi)') {
      title = lastUserMsg.text.slice(0, 80);
    }

    onSaveToKB({
      title,
      root_cause: rootCause || 'AI Teşhisi ile belirlendi.',
      solution_steps: solutionSteps,
      command_snippet: commandSnippet,
      category: 'Sistem & Windows',
      severity: 'Normal'
    });

    setSavedMsgId(aiMsg.id);
    setTimeout(() => setSavedMsgId(null), 3000);
  };

  // Render Formatted Message Text (Supports headers, lists, code blocks)
  const renderMessageContent = (text, msgId) => {
    if (!text) return null;

    // Split text by markdown code blocks (```lang ... ```)
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockCounter = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        lang: match[1] || 'bash',
        code: match[2].trim(),
        id: `${msgId}-code-${blockCounter++}`
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return (
      <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed select-text font-sans">
        {parts.map((p, idx) => {
          if (p.type === 'code') {
            const isCopied = copiedCodeId === p.id;
            return (
              <div key={idx} className="my-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-inner">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="uppercase">{p.lang || 'KOMUT'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(p.code, p.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 text-[11px] sm:text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre leading-normal">
                  {p.code}
                </pre>
              </div>
            );
          }

          // Plain text rendering with basic markdown headers and bolding
          const paragraphs = p.content.split('\n');
          return (
            <div key={idx} className="space-y-1">
              {paragraphs.map((line, pIdx) => {
                if (!line.trim()) return <div key={pIdx} className="h-1" />;

                // Headings
                if (line.startsWith('### ')) {
                  return (
                    <h4 key={pIdx} className="font-bold text-cyan-300 text-xs sm:text-sm mt-2.5 mb-1 flex items-center gap-1.5">
                      {line.replace('### ', '')}
                    </h4>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h3 key={pIdx} className="font-bold text-white text-sm sm:text-base mt-3 mb-1">
                      {line.replace('## ', '')}
                    </h3>
                  );
                }

                // Bullet points
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                  return (
                    <div key={pIdx} className="flex items-start gap-2 pl-2">
                      <span className="text-cyan-400 mt-1 text-[10px]">•</span>
                      <span>{line.replace(/^[-*]\s*/, '')}</span>
                    </div>
                  );
                }

                // Numbered list
                if (/^\d+\.\s/.test(line.trim())) {
                  return (
                    <div key={pIdx} className="flex items-start gap-2 pl-2">
                      <span className="text-cyan-400 font-mono font-bold text-[11px] shrink-0">
                        {line.match(/^\d+\./)[0]}
                      </span>
                      <span>{line.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  );
                }

                return <p key={pIdx}>{line}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/95 flex flex-col overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-500/30 shrink-0">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span>OMNI AI IT Çözüm Asistanı</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.2 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] font-mono">
                  Gemini 2.0 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hata kodu, log veya ekran görüntüsü (screenshot) ile anında teşhis ve çözüm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Gemini API Key Toggle Button */}
            <button
              type="button"
              onClick={() => setShowKeyConfig(prev => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                hasApiKey
                  ? 'bg-slate-800 hover:bg-slate-700 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-amber-500/50 text-slate-300'
              }`}
              title="Google Gemini API Anahtarı Ayarları"
            >
              <KeyRound className={`w-3.5 h-3.5 ${hasApiKey ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">{hasApiKey ? 'Gemini Aktif' : 'API Key'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Kapat (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible API Key Configuration Drawer */}
        {showKeyConfig && (
          <div className="p-3.5 bg-slate-950 border-b border-indigo-500/30 text-xs animate-in slide-in-from-top-2 duration-150">
            <div className="max-w-xl mx-auto space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  Google Gemini API Anahtarı (Ücretsiz)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {hasApiKey ? '✅ Özel API Key Tanımlı' : '⚡ Varsayılan Motor Aktif'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sınırsız ekran görüntüsü analizi ve en yüksek hızda Gemini 2.0 Flash yanıtları için <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">Google AI Studio'dan<ExternalLink className="w-2.5 h-2.5" /></a> alacağınız ücretsiz API anahtarını buraya yapıştırabilirsiniz.
              </p>
              <form onSubmit={handleSaveApiKey} className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={savingKey}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {savingKey ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </form>
              {keyNotice && (
                <div className="text-[11px] font-semibold text-emerald-400">
                  {keyNotice}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat History Pane */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {/* AI Avatar */}
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Message Bubble Card */}
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 shadow-lg ${
                  isAI
                    ? 'bg-slate-950/80 border border-slate-800 text-slate-200'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-indigo-950/40'
                }`}>
                  {/* Attached image preview inside user bubble */}
                  {msg.image && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 max-w-sm max-h-60 bg-black/40">
                      <img
                        src={msg.image}
                        alt="Yüklenen Hata Görseli"
                        className="w-full h-full object-contain cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(msg.image, '_blank')}
                        title="Tam boyutta incelemek için tıklayın"
                      />
                    </div>
                  )}

                  {/* Text Content */}
                  {isAI ? (
                    renderMessageContent(msg.text, msg.id)
                  ) : (
                    <p className="text-xs sm:text-[13px] whitespace-pre-line leading-relaxed select-text">
                      {msg.text}
                    </p>
                  )}

                  {/* AI Metadata & Quick Actions Footer */}
                  {isAI && msg.id !== 1 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>OMNI AI Diagnosed</span>
                        {msg.source && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {msg.source}
                          </span>
                        )}
                      </div>

                      {/* 1-Click Save to Knowledge Base Button */}
                      {onSaveToKB && (
                        <button
                          type="button"
                          onClick={() => handleSaveSolutionToKB(msg)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
                            savedMsgId === msg.id
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                              : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border-slate-800 hover:border-cyan-500/50'
                          }`}
                          title="Bu çözümü doğrudan IT Sorun & Çözüm Kütüphanesine kaydet"
                        >
                          {savedMsgId === msg.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Kütüphaneye Eklendi!</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3 h-3 text-cyan-400" />
                              <span>Kütüphaneye Çözüm Olarak Ekle</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking / Generating Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                <RefreshCw className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-cyan-300 flex items-center gap-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>OMNI AI hatayı analiz ediyor ve çözüm üretiyor...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && !loading && (
          <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              Hızlı Teşhis:
            </span>
            <button
              type="button"
              onClick={() => handleSendMessage('Windows Update 0x80070005 erişim engellendi hatası')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
            >
              0x80070005 Hatası
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('FortiClient SSL-VPN %98 takılıyor')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
            >
              FortiClient %98 Takılma
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Veeam VSS Writer 8193 hatası')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
            >
              VSS Writer 8193
            </button>
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2">
          
          {/* Attached Image Thumbnail Preview */}
          {attachedImage && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-cyan-500/40 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-black shrink-0">
                <img
                  src={attachedImage.base64}
                  alt="Seçili Görsel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {attachedImage.name}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono">
                  {(attachedImage.size / 1024).toFixed(1)} KB • Ekran Görüntüsü Eklendi
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                title="Görseli Kaldır"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form & Actions */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Image Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
              title="Ekran Görüntüsü / Resim Yükle (veya doğrudan Ctrl+V yapıştırın)"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Message Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder="Sorunu veya hata kodunu yazın (Ctrl+V ile ekran görüntüsü yapıştırabilirsiniz)..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none leading-relaxed"
              />
              <div className="absolute right-2 bottom-2 text-[9px] text-slate-500 font-mono pointer-events-none hidden sm:block">
                Enter: Gönder • Shift+Enter: Yeni Satır
              </div>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!inputText.trim() && !attachedImage)}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-lg shadow-indigo-950/60 transition-all cursor-pointer shrink-0"
              title="Gönder"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
