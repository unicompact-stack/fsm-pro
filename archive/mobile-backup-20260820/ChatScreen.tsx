import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/statusUtils';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';

interface ChatScreenProps {
  onBack: () => void;
}

/**
 * ChatScreen — чат рабочего с диспетчером.
 * Показывается из профиля мастера, чтобы бригада могла связаться с руководителем.
 */
export const ChatScreen: React.FC<ChatScreenProps> = ({ onBack }) => {
  const { chatMessages, sendChatMessage, currentUser } = useApp();
  const [input, setInput] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [chatMessages]);

  const send = () => {
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F4F7FA]">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#168BEA]/10 text-[#168BEA]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-[#263238]">Чат с диспетчером</div>
            <div className="text-[11px] text-slate-500">Елена Морозова · онлайн</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {chatMessages.length === 0 && (
          <p className="text-xs text-[#94A3B8] text-center py-8">Сообщений пока нет.</p>
        )}
        {chatMessages.map(msg => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${isMe
                ? 'bg-[#168BEA] text-white rounded-br-md'
                : 'bg-white text-[#263238] rounded-bl-md border border-slate-200'}`}>
                <div className="text-[10px] font-bold mb-0.5 opacity-80">{isMe ? 'Вы' : msg.senderName}</div>
                <div className="text-xs leading-relaxed break-words">{msg.text}</div>
                <div className="text-[10px] mt-1 opacity-60">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex gap-2 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
          placeholder="Написать диспетчеру..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-[#168BEA]"
        />
        <button onClick={send} className="px-4 py-2.5 rounded-xl bg-[#168BEA] text-white text-xs font-bold hover:bg-[#1277c9] transition-all flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5" />
          Отправить
        </button>
      </div>
    </div>
  );
};