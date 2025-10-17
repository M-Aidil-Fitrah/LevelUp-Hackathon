import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

const LS_KEY = 'levelup-chatbot';

const ChatBubble: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Load/save to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setMessages(JSON.parse(raw));
      else setMessages([{ id: crypto.randomUUID(), role: 'assistant', content: 'Hello! How can I help you?', ts: Date.now() }]);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [open, messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const user: Message = { id: crypto.randomUUID(), role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, user]);
    setInput('');

    // Simulated reply; integrate real API here
    setTimeout(() => {
      const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: 'Thanks! I\'ll get back to you with AI soon.', ts: Date.now() };
      setMessages(prev => [...prev, reply]);
    }, 500);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed right-4 bottom-4 z-50 h-12 w-12 rounded-full bg-white border border-black shadow-lg hover:shadow-xl transition-transform hover:scale-105 flex items-center justify-center"
        aria-label="Open chat"
      >
        <Bot className="h-6 w-6 text-[#FF2000]" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed right-4 bottom-20 z-50 w-[92vw] sm:w-[90vw] max-w-md md:max-w-lg bg-white border border-black rounded-2xl shadow-xl overflow-hidden flex flex-col h-[70vh] sm:h-[60vh]">
          <div className="px-4 py-3 border-b border-black bg-white flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#FF2000] text-white flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-black">LevelUp AI Assistant</div>
              <div className="text-black text-sm">Ready to help you!</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1 rounded hover:bg-black/5">
              <X className="h-5 w-5 text-black" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            {showSuggestions && (
              <div className="p-3 border-b border-black flex flex-wrap gap-2">
                {['Apa itu LevelUp?', 'UMKM terdekat', 'Promo hari ini'].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); setTimeout(send, 0); }}
                    className="px-3 py-1.5 rounded-full border border-black text-sm hover:bg-black hover:text-white transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-black'} rounded-2xl px-4 py-2 max-w-[80%]`}>{m.content}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-black p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message... (Enter to send)"
              className="flex-1 border border-black rounded-full px-4 py-3 outline-none focus:ring-0"
            />
            <button onClick={send} className="px-5 py-3 rounded-full bg-[#FF2000] text-white font-semibold hover:opacity-90 transition flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Kirim</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBubble;
