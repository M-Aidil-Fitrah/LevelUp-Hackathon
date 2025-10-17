import React, { useEffect, useRef } from 'react';
import type { Message } from './types';

interface Props {
  messages: Message[];
}

const MessageList: React.FC<Props> = ({ messages }) => {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map(m => (
        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`${m.role === 'user' ? 'bg-black text-white' : 'bg-white text-black border border-black'} rounded-2xl px-4 py-2 max-w-[80%]`}>{m.content}</div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
