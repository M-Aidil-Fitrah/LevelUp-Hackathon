import React, { useEffect, useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import type { Message } from './types';

const ChatbotUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    setMessages([{ id: crypto.randomUUID(), role: 'assistant', content: 'Halo! Ada yang bisa saya bantu?', ts: Date.now() }]);
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const user: Message = { id: crypto.randomUUID(), role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, user]);
    setInput('');
    setTimeout(() => {
      const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: 'Terima kasih, saya proses ya!', ts: Date.now() };
      setMessages(prev => [...prev, reply]);
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto border border-black rounded-2xl overflow-hidden bg-white flex flex-col h-[70vh]">
      <ChatHeader />
      <MessageList messages={messages} />
      <ChatInput value={input} onChange={setInput} onSend={send} />
    </div>
  );
};

export default ChatbotUI;
