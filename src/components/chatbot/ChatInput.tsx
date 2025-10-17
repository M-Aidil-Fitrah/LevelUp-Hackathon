import React from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}

const ChatInput: React.FC<Props> = ({ value, onChange, onSend }) => {
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-black p-3 flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your message... (Enter to send)"
        className="flex-1 border border-black rounded-full px-4 py-3 outline-none focus:ring-0"
      />
      <button onClick={onSend} className="px-5 py-3 rounded-full bg-[#FF2000] text-white font-semibold hover:opacity-90 transition">
        Kirim
      </button>
    </div>
  );
};

export default ChatInput;
