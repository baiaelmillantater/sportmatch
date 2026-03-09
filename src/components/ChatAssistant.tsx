import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithConcierge } from '../services/gemini';
import { EventExperience } from '../types';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface ChatAssistantProps {
  experience: EventExperience;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ experience }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: `Ciao! Sono il tuo concierge AI. Hai bisogno di aiuto per organizzare il tuo viaggio per ${experience.event.name}? Chiedimi pure di trovare hotel più economici, parcheggi più vicini o ristoranti specifici.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithConcierge(userMsg, experience);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Scusa, ho avuto un problema tecnico. Riprova tra poco." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-brand-primary text-black shadow-xl shadow-brand-primary/20 hover:scale-110 transition-transform z-50"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-brand-card border border-brand-border rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-primary/5">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-brand-primary" />
                <span className="font-semibold">AI Concierge</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}>
                  <div className={cn(
                    "p-2 rounded-lg shrink-0 h-fit",
                    msg.role === 'user' ? "bg-brand-primary text-black" : "bg-white/5 text-brand-primary"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm",
                    msg.role === 'user' ? "bg-brand-primary/10 text-white" : "bg-white/5 text-white/80"
                  )}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-brand-primary h-fit">
                    <Bot size={16} />
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-brand-border bg-brand-bg">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Chiedi al concierge..."
                  className="w-full bg-white/5 border border-brand-border rounded-xl py-2 pl-4 pr-12 focus:ring-1 focus:ring-brand-primary outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-1.5 rounded-lg bg-brand-primary text-black disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
