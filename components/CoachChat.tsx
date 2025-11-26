
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Mic, Volume2, VolumeX, Settings, X, Sparkles, PlayCircle } from 'lucide-react';
import { ChatMessage, MessageRole, Language, CoachPersona } from '../types';
import { UI_STRINGS } from '../constants';

interface CoachChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  language: Language;
  voice: string | null;
  persona: CoachPersona;
  onUpdateSettings: (voice: string, persona: CoachPersona) => void;
}

const CoachChat: React.FC<CoachChatProps> = ({ 
  messages, onSendMessage, isLoading, language,
  voice, persona, onUpdateSettings
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const ui = UI_STRINGS[language];

  // Load Voices
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const langPrefix = language === 'zh' ? 'zh' : 'en';
      const filtered = allVoices.filter(v => v.lang.startsWith(langPrefix));
      setAvailableVoices(filtered.length > 0 ? filtered : allVoices);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [language]);

  // Auto-scroll & TTS
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

    if (!isMuted && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === MessageRole.MODEL) speak(lastMsg.text);
    }
  }, [messages, isMuted, availableVoices, language, voice]);

  const speak = (text: string) => {
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    if (voice) {
      const selectedVoice = voices.find(v => v.voiceURI === voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    } else if (voices.length > 0) {
      utterance.voice = voices[0];
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(ui.microphoneError);
      return;
    }
    window.speechSynthesis.cancel();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const toggleSettings = () => {
    if (!showSettings) {
      window.speechSynthesis.cancel(); // Stop talking when opening settings
    }
    setShowSettings(!showSettings);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 rounded-2xl border-2 border-indigo-500/50 overflow-hidden shadow-2xl relative pb-2">
      
      {/* Header (Fixed Height) */}
      <div className="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700 shrink-0 h-14">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-2 shadow-lg">
            <Bot className="text-white" size={20} />
          </div>
          <div className="leading-tight">
            <h3 className="font-bold text-white text-sm">{ui.coachTitle}</h3>
            <p className="text-[10px] text-slate-400">{ui.personas[persona]}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => { setIsMuted(!isMuted); window.speechSynthesis.cancel(); }} className="p-1.5 text-slate-400 hover:text-white transition-colors">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button onClick={toggleSettings} className={`p-1.5 text-slate-400 hover:text-white transition-colors ${showSettings ? 'text-white' : ''}`}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 p-4 animate-in slide-in-from-top-10 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2"><Settings size={18}/> {ui.settings}</h3>
            <button onClick={() => setShowSettings(false)} className="bg-slate-800 p-1 rounded-full hover:bg-slate-700"><X size={20} className="text-slate-400 hover:text-white" /></button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Persona Selector */}
            <div>
              <label className="block text-xs text-purple-400 font-bold uppercase tracking-wider mb-2">{ui.persona}</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ui.personas) as CoachPersona[]).map(p => (
                  <button
                    key={p}
                    onClick={() => onUpdateSettings(voice || '', p)}
                    className={`text-xs p-3 rounded-xl border text-left transition-all relative ${persona === p ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-900/50' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'}`}
                  >
                    <div className="font-bold mb-0.5">{ui.personas[p]}</div>
                    {persona === p && <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selector */}
            <div>
              <label className="block text-xs text-purple-400 font-bold uppercase tracking-wider mb-2">{ui.voice}</label>
              <div className="flex gap-2">
                <select 
                  value={voice || ''} 
                  onChange={(e) => onUpdateSettings(e.target.value, persona)}
                  className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm p-3 rounded-xl focus:border-purple-500 outline-none"
                >
                  <option value="">Default System Voice</option>
                  {availableVoices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => speak(language === 'zh' ? "你好，我是 Sparky！" : "Hello, I am Sparky!")}
                  className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
                  title={ui.testVoice}
                >
                  <PlayCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/80 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === MessageRole.USER;
          const isLatest = idx === messages.length - 1;
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1`}>
              <div className={`
                max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}
                ${isLatest && !isUser ? 'border-indigo-500/50 shadow-lg shadow-indigo-900/20' : ''}
              `}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {isLoading && (
           <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl px-4 py-2 text-xs flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-400"/> {ui.thinking}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 z-10">
        <div className={`flex items-center bg-slate-900 rounded-xl border transition-all ${isListening ? 'border-red-500 ring-2 ring-red-900/50' : 'border-slate-600 focus-within:border-indigo-500'}`}>
          <button onClick={startVoiceInput} className={`p-3 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}>
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? ui.listening : ui.chatPlaceholder}
            className="flex-1 bg-transparent px-2 py-3 text-sm text-white focus:outline-none placeholder-slate-500"
            autoComplete="off"
          />
          <button onClick={handleSend} disabled={!input.trim()} className="p-3 text-indigo-500 hover:text-indigo-400 disabled:opacity-50 transition-colors">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
