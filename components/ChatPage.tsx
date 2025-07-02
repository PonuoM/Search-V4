

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendIcon } from './icons/SendIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface ChatPageProps {
  isUnlocked: boolean;
  password: string;
  setPassword: (password: string) => void;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  const bubbleClasses = isModel
    ? 'bg-sky-100 dark:bg-sky-500/10 text-slate-800 dark:text-slate-200 self-start rounded-r-xl rounded-bl-xl'
    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 self-end rounded-l-xl rounded-br-xl';
  
  const icon = isModel 
    ? <SparklesIcon className="h-8 w-8 text-sky-500 dark:text-sky-400 p-1.5 bg-white dark:bg-slate-800 rounded-full" /> 
    : <UserCircleIcon className="h-8 w-8 text-slate-500" />;

  return (
    <div className={`flex items-start gap-3 w-full max-w-2xl mx-auto ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className="shrink-0 mt-1">{icon}</div>
      <div className={`p-4 shadow-md ${bubbleClasses}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export const ChatPage: React.FC<ChatPageProps> = ({
  isUnlocked,
  password,
  setPassword,
  messages,
  isLoading,
  error,
  onSendMessage,
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() && !isLoading) {
      onSendMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  if (!isUnlocked) {
    return (
      <main className="container mx-auto mt-4 mb-8 flex items-center justify-center p-4 sm:p-6 lg:p-8 w-full max-w-5xl">
        <div className="w-full max-w-sm p-8 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 text-center">
          <SparklesIcon className="h-12 w-12 text-teal-500 dark:text-teal-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">AI Chat Access</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">กรุณาใส่รหัสผ่านเพื่อเริ่มการสนทนากับ AI</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 border-2 border-slate-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-center text-lg tracking-widest"
            autoFocus
          />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto mt-4 mb-8 flex flex-col p-0 w-full max-w-5xl h-[70vh] bg-slate-100/80 dark:bg-black/20 backdrop-blur-2xl shadow-2xl rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-center">
                       <div className="flex items-center gap-3 bg-sky-100 dark:bg-sky-500/10 text-slate-800 dark:text-slate-200 self-start rounded-xl p-4 shadow-md">
                          <div className="animate-spin h-6 w-6 border-2 border-sky-500 border-t-transparent rounded-full"></div>
                          <span>AI กำลังคิด...</span>
                       </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {messages.length === 0 && !isLoading && (
                 <div className="text-center text-slate-500 dark:text-slate-400 h-full flex flex-col justify-center items-center -mt-8">
                    <SparklesIcon className="h-16 w-16 mb-4 text-slate-400 dark:text-slate-500"/>
                    <h2 className="text-2xl font-semibold text-slate-600 dark:text-slate-300">สวัสดี! ฉันคือผู้ช่วย AI ของคุณ</h2>
                    <p className="max-w-md mt-2">ฉันสามารถตอบคำถามจากข้อมูลการขายทั้งหมดได้ ลองถามคำถาม เช่น "ยอดขายเดือนล่าสุดเท่าไหร่?" หรือ "ยอดขายรวมทั้งหมด"</p>
                </div>
            )}
        </div>
        
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-sm">
             {error && <ErrorMessage message={error} />}
            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="ถามคำถามเกี่ยวกับข้อมูลการขาย..."
                    disabled={isLoading}
                    className="w-full px-5 py-3 bg-white/80 dark:bg-black/30 border-2 border-slate-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || !currentMessage.trim()}
                    className="p-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full transition-all duration-150 disabled:opacity-50 disabled:bg-slate-400"
                    aria-label="Send message"
                >
                    <SendIcon className="h-6 w-6"/>
                </button>
            </form>
        </div>
    </main>
  );
};