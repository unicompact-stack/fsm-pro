import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, MessageSquare } from 'lucide-react';

/**
 * ChatScreen — чат работника с руководителем.
 * Показывает все сообщения и позволяет ответить.
 */
export const ChatScreen: React.FC = () => {
  const { chatMessages, sendChatMessage, currentUser, clearNotifications } = useApp();
  const [input, setInput] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    clearNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendChatMessage(text);
    setInput('');
  };

  const fmtTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F4F7FA]">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-black text-slate-900">Чат</h1>
        <p className="text-xs text-slate-500 mt-1">Связь с руководителем</p>
      </div>

      <div ref={boxRef} className="flex-1 overflow-y-auto px-4 pb-3 space-y-2.5">
        {chatMessages.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            Сообщений пока нет
          </div>
        )}
        {chatMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isManager = msg.senderRole === 'dispatcher' || msg.senderRole === 'admin';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                  isMe
                    ? 'bg-[#168BEA] text-white rounded-br-md'
                    : isManager
                    ? 'bg-[#EFF6FF] text-slate-800 rounded-bl-md border border-[#BFE1FF]'
                    : 'bg-white text-slate-800 rounded-bl-md border border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-bold mb-0.5 ${isMe ? 'opacity-80' : 'text-slate-400'}`}>
                  {isMe ? 'Вы' : msg.senderName}
                  {isManager && !isMe && <span className="ml-1 text-[#168BEA]">· руководитель</span>}
                </div>
                <div className="text-sm leading-relaxed break-words">{msg.text}</div>
                <div className={`text-[10px] mt-1 ${isMe ? 'opacity-70' : 'text-slate-400'}`}>{fmtTime(msg.timestamp)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 bg-white border-t border-slate-200 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Написать руководителю..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#168BEA]"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2.5 rounded-xl bg-[#168BEA] text-white font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pb-1 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
          <MessageSquare className="w-3 h-3" /> Сообщения видны и руководителю в его панели
        </span>
      </div>
    </div>
  );
};
