import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Glasses, X, Send } from 'lucide-react';

const FrameFinder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! Tell me about your face shape or style preference and I will find the perfect EyeLeads frames for you! 👓'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to latest messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Fetch via backend AI proxy for CORS compliance & key security
      const response = await api.post('/api/ai/chat', {
        messages: updatedMessages
      });

      if (response.data && response.data.status === 'success') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.data.content }
        ]);
      }
    } catch (error) {
      console.error('Frame Finder API Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Oops! I had trouble connecting to the EyeLeads frame advisor system. Please ensure the backend is running on port 5000 and try again! 👓'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hi! Tell me about your face shape or style preference and I will find the perfect EyeLeads frames for you! 👓'
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-4 md:bottom-6 md:right-6 z-50 font-sans select-none mb-16 md:mb-0">
      
      {/* Chat window (when open) */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[320px] sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-slideUp">
          
          {/* Header */}
          <div className="bg-[#1B3F6E] text-white px-5 py-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <h4 className="font-extrabold text-xs uppercase tracking-wider truncate max-w-[140px] sm:max-w-none">AI Advisor</h4>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={resetChat}
                className="text-white/60 hover:text-white text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer focus:outline-none"
                title="Reset Chat"
              >
                ↺ Reset
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:scale-110 transition-transform cursor-pointer focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-72 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`text-xs max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#1B3F6E] text-white rounded-tr-none font-semibold text-right'
                        : 'bg-[#EAF0F8] text-[#1A1A2E] rounded-tl-none font-medium text-left'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            
            {/* Loading / Typing Indicator */}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-[#EAF0F8] text-slate-400 text-[10px] font-extrabold uppercase px-4 py-2 rounded-2xl rounded-tl-none tracking-widest shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
            
            {/* Scroll Ref Anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Form */}
          <form
            onSubmit={sendMessage}
            className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="e.g. oval face, budget ₹4k"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-grow border border-slate-200 focus:border-[#1B3F6E] focus:ring-1 focus:ring-[#1B3F6E]/20 focus:outline-none rounded-xl px-4 py-2 text-xs text-[#1A1A2E] bg-slate-50 focus:bg-white transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#1B3F6E] hover:bg-[#254f85] text-white p-2.5 rounded-xl transition-all shadow active:scale-95 disabled:opacity-40 disabled:hover:bg-[#1B3F6E] cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1B3F6E] hover:bg-[#254f85] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center group relative border border-white/10"
        title="AI Frame Finder"
      >
        <Glasses className="h-6 w-6" />
        
        {/* Tooltip Label */}
        <span className="absolute right-16 bg-[#1B3F6E] text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-2 rounded-lg shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-white/5">
          Find Your Frame
        </span>
      </button>

    </div>
  );
};

export default FrameFinder;
