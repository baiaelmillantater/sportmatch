import React, { useState } from 'react';
import { Search, MapPin, Calendar, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState<'low' | 'balanced' | 'premium'>('balanced');
  const [mode, setMode] = useState<'standard' | 'group' | 'away'>('standard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(`${query} (Budget: ${budget}, Mode: ${mode})`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div className={cn(
          "relative flex items-center transition-all duration-300 rounded-2xl p-1",
          "bg-brand-card border border-brand-border group-focus-within:border-brand-primary/50",
          "shadow-2xl shadow-brand-primary/5"
        )}>
          <div className="pl-4 text-white/40">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca un evento (es: Milan Inter, GP Monza...)"
            className="w-full bg-transparent border-none focus:ring-0 text-lg py-4 px-4 placeholder:text-white/20"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
              "bg-brand-primary hover:bg-emerald-400 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Trova</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap justify-center gap-6">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold text-center">Budget</p>
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {[
              { id: 'low', label: 'Low Cost' },
              { id: 'balanced', label: 'Equilibrato' },
              { id: 'premium', label: 'Premium' }
            ].map(b => (
              <button
                key={b.id}
                onClick={() => setBudget(b.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  budget === b.id ? "bg-brand-primary text-black" : "text-white/40 hover:text-white"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold text-center">Modalità</p>
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {[
              { id: 'standard', label: 'Standard' },
              { id: 'group', label: 'Gruppi' },
              { id: 'away', label: 'Trasferta' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  mode === m.id ? "bg-brand-primary text-black" : "text-white/40 hover:text-white"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
