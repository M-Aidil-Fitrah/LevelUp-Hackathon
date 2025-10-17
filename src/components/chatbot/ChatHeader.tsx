import React from 'react';
import { Bot } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

const ChatHeader: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="px-4 py-3 border-b border-black bg-white flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-[#FF2000] text-white flex items-center justify-center">
        <Bot className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-black">LevelUp AI Assistant</div>
        <div className="text-black text-sm">How can I help you today?</div>
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Close chat" className="p-1 rounded hover:bg-black/5">
          <span className="text-xl leading-none">×</span>
        </button>
      )}
    </div>
  );
};

export default ChatHeader;
