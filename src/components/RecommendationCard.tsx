import React from 'react';
import { Star, MapPin, ExternalLink, Navigation, Clock, CreditCard } from 'lucide-react';
import { Recommendation } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface RecommendationCardProps {
  item: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ item }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'ticket': return <CreditCard size={18} />;
      case 'hotel': return <Clock size={18} />;
      case 'parking': return <Navigation size={18} />;
      case 'restaurant': return <Star size={18} />;
      case 'bar': return <Star size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-brand-card border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 transition-all duration-300"
    >
      {item.aiScore && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-bold">
          <Star size={12} fill="currentColor" />
          <span>Punteggio AI: {item.aiScore}</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-white/5 text-brand-primary group-hover:bg-brand-primary group-hover:text-black transition-colors">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-brand-primary transition-colors">
            {item.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {item.distance && (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <MapPin size={12} /> {item.distance}
              </span>
            )}
            {item.price && (
              <span className="text-xs text-white/40 flex items-center gap-1">
                <CreditCard size={12} /> {item.price}
              </span>
            )}
          </div>

          <p className="text-sm text-white/60 mb-4 line-clamp-2">
            {item.description}
          </p>

          {item.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/5 text-white/40">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
          >
            <span>{item.type === 'ticket' ? 'Acquista Biglietti' : 'Vedi sul sito'}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      
      {item.aiReasoning && (
        <div className="mt-4 pt-4 border-t border-brand-border">
          <p className="text-[11px] italic text-white/40 leading-relaxed">
            <span className="font-bold text-brand-primary not-italic">Consiglio AI:</span> {item.aiReasoning}
          </p>
        </div>
      )}
    </motion.div>
  );
};
