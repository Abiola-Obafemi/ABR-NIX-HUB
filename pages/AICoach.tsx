import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Search, Crown } from 'lucide-react';
import { getCoachResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useUser } from '../contexts/UserContext';

const AICoach: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: `Coach ABØ here. I've analyzed your stats (KD: ${user?.stats?.kd || 'N/A'}). What aspect of your game are we improving today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [m.text]
      }));
      
      const contextString = `
        Username: ${user?.username}, 
        Region: ${user?.region}, 
        Platform: ${user?.platform},
        Stats: {
            KD: ${user?.stats?.kd},
            WinRate: ${user?.stats?.winRate},
            Matches: ${user?.stats?.matches},
            Earnings: ${user?.stats?.earnings}
        }
      `;
      
      const responseText = await getCoachResponse(userMsg.text, history, contextString);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-black border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20 transform -rotate-3">
            <Crown className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div>
            <h2 className="font-bold text-white brand-font tracking-wide">COACH ABØ</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-neutral-400">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-neutral-800' : 'bg-red-600/10'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4 text-neutral-400" /> : <Crown className="w-4 h-4 text-red-500" />}
            </div>
            <div
              className={`p-4 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-neutral-800 text-white rounded-tr-none'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-tl-none'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-lg bg-red-600/10 flex-shrink-0 flex items-center justify-center">
                <Crown className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl rounded-tl-none flex items-center gap-2 text-neutral-400 text-sm">
              <Search className="w-4 h-4 animate-pulse" />
              <span>Analyzing meta...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-black border-t border-neutral-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ABØ about drop spots, mechanics, or game sense..."
            className="w-full bg-neutral-900 border border-neutral-800 text-white pl-4 pr-12 py-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AICoach;