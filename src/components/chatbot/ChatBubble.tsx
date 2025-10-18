import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

const LS_KEY = 'levelup-chatbot';
const API_URL = 'http://localhost:3000/api';

const ChatBubble: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Load/save to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        setMessages(JSON.parse(raw));
      } else {
        const welcome: Message = { 
          id: crypto.randomUUID(), 
          role: 'assistant', 
          content: 'Halo! Saya LevelUp AI Assistant. Ada yang bisa saya bantu hari ini? 😊', 
          ts: Date.now() 
        };
        setMessages([welcome]);
      }
    } catch {
      const welcome: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: 'Halo! Saya LevelUp AI Assistant. Ada yang bisa saya bantu hari ini? 😊', 
        ts: Date.now() 
      };
      setMessages([welcome]);
    }
  }, []);

  useEffect(() => {
    try { 
      localStorage.setItem(LS_KEY, JSON.stringify(messages)); 
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (open && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [open, messages.length]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message
    const userMsg: Message = { 
      id: crypto.randomUUID(), 
      role: 'user', 
      content: text, 
      ts: Date.now() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Anda harus login terlebih dahulu untuk menggunakan chatbot');
      }

      // Call backend API
      const response = await fetch(`${API_URL}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan pada server');
      }

      // Add bot response
      const botMsg: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: data.data.bot_response, 
        ts: Date.now() 
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error: any) {
      console.error('Chatbot error:', error);
      
      let errorMessage = 'Maaf, terjadi kesalahan. Silakan coba lagi.';
      
      if (error.message.includes('login')) {
        errorMessage = '🔐 Anda harus login terlebih dahulu untuk menggunakan chatbot. Silakan login dan coba lagi.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '🌐 Koneksi bermasalah. Pastikan Anda terhubung ke internet dan server berjalan.';
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }

      const errorMsg: Message = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: errorMessage, 
        ts: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => send(), 100);
  };

  const clearChat = () => {
    const welcome: Message = { 
      id: crypto.randomUUID(), 
      role: 'assistant', 
      content: 'Chat telah dibersihkan. Ada yang bisa saya bantu? 😊', 
      ts: Date.now() 
    };
    setMessages([welcome]);
    localStorage.removeItem(LS_KEY);
  };

  const showSuggestions = messages.length <= 1;

  // Get user role from localStorage
  const getUserRole = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.role || 'buyer';
      }
    } catch {}
    return 'buyer';
  };

  const userRole = getUserRole();

  // Different suggestions for buyer and seller
  const suggestions = userRole === 'seller' 
    ? ['Buatkan caption produk', 'Tips meningkatkan penjualan', 'Analisis performa toko']
    : ['UMKM terdekat', 'Rekomendasi produk populer', 'Promo hari ini'];

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed right-4 bottom-4 z-50 h-14 w-14 rounded-full bg-white border-2 border-black shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        aria-label="Open chat"
      >
        <Bot className="h-7 w-7 text-[#FF2000]" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed right-4 bottom-20 z-50 w-[92vw] sm:w-[90vw] max-w-md md:max-w-lg bg-white border-2 border-black rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[70vh] sm:h-[65vh]">
          {/* Header */}
          <div className="px-4 py-3 border-b-2 border-black bg-gradient-to-r from-[#FF2000] to-[#FF4000] flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white text-[#FF2000] flex items-center justify-center shadow-md">
              <Bot className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white">LevelUp AI Assistant</div>
              <div className="text-white/90 text-xs">
                {userRole === 'seller' ? '🛍️ Mode Penjual' : '🛒 Mode Pembeli'}
              </div>
            </div>
            <button 
              onClick={clearChat}
              className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 text-white rounded-lg transition mr-2"
              title="Clear chat"
            >
              Clear
            </button>
            <button 
              onClick={() => setOpen(false)} 
              aria-label="Close chat" 
              className="p-1.5 rounded-lg hover:bg-white/20 transition"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
            {/* Suggestions */}
            {showSuggestions && (
              <div className="p-3 border-b border-gray-200 bg-white flex flex-wrap gap-2">
                <div className="w-full text-xs text-gray-500 mb-1">💡 Saran pertanyaan:</div>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-full border-2 border-black text-sm font-medium hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${
                    m.role === 'user' 
                      ? 'bg-[#FF2000] text-white shadow-md' 
                      : 'bg-white text-black border-2 border-gray-200 shadow-sm'
                  } rounded-2xl px-4 py-2.5 max-w-[85%] break-words whitespace-pre-wrap`}>
                    {m.content}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-black border-2 border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#FF2000]" />
                    <span className="text-sm">AI sedang mengetik...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t-2 border-gray-200 p-3 bg-white flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ketik pesan... (Enter untuk kirim)"
              disabled={loading}
              className="flex-1 border-2 border-black rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF2000] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-full bg-[#FF2000] text-white font-semibold hover:bg-[#E01000] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBubble;