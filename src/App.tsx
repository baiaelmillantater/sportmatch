import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecommendationCard } from './components/RecommendationCard';
import { ChatAssistant } from './components/ChatAssistant';
import { searchEvent, getTrendingEvents } from './services/gemini';
import { EventExperience, EventDetails } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, MapPin, Calendar, Map as MapIcon, List, LayoutGrid, Info, ArrowLeft, ChevronRight, Loader2, Star } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [experience, setExperience] = useState<EventExperience | null>(null);
  const [trendingEvents, setTrendingEvents] = useState<EventDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'itinerary' | 'map'>('all');

  useEffect(() => {
    async function fetchTrending() {
      try {
        const events = await getTrendingEvents();
        setTrendingEvents(events);
      } catch (err) {
        console.error("Error fetching trending events", err);
      } finally {
        setIsTrendingLoading(false);
      }
    }
    fetchTrending();
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchEvent(query);
      setExperience(result);
    } catch (err: any) {
      setError(err.message || 'Qualcosa è andato storto.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'ticket', label: 'Biglietti' },
    { id: 'hotel', label: 'Hotel' },
    { id: 'transport', label: 'Trasporti' },
    { id: 'parking', label: 'Parcheggi' },
    { id: 'restaurant', label: 'Ristoranti' },
    { id: 'bar', label: 'Fan Bar' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-brand-border sticky top-0 bg-brand-bg/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExperience(null)}>
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-black font-black text-xl">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">MatchAdvisor</span>
        </div>
        
        {experience && (
          <button 
            onClick={() => setExperience(null)}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Nuova Ricerca</span>
          </button>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <AnimatePresence mode="wait">
          {!experience ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-12 py-20"
            >
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter leading-none">
                  Trova l'evento.<br />
                  <span className="gradient-text">L'AI organizza tutto.</span>
                </h1>
                <p className="text-xl text-white/40 max-w-2xl mx-auto font-light">
                  Il tuo assistente personale per vivere lo sport in Italia senza stress. 
                  Dai biglietti al parcheggio, MatchAdvisor trova il meglio per te.
                </p>
              </div>

              <SearchBar onSearch={handleSearch} isLoading={isLoading} />

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 py-2 px-4 rounded-lg inline-block">
                  {error}
                </p>
              )}

              {/* Trending Events Section */}
              <div className="pt-12 space-y-8">
                <div className="flex items-center justify-center gap-3">
                  <Star className="text-brand-secondary animate-pulse" size={24} fill="currentColor" />
                  <h2 className="text-2xl font-bold">Eventi più cercati oggi</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isTrendingLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-48 rounded-3xl bg-brand-card border border-brand-border animate-pulse" />
                    ))
                  ) : (
                    trendingEvents.map((event) => (
                      <motion.button
                        key={event.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSearch(event.name)}
                        className="text-left p-6 rounded-3xl bg-brand-card border border-brand-border hover:border-brand-primary/50 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Trophy size={48} />
                        </div>
                        <div className="space-y-3 relative z-10">
                          <div className="flex items-center gap-2 text-brand-primary font-mono text-[10px] uppercase tracking-widest">
                            <Trophy size={12} />
                            <span>{event.sport}</span>
                          </div>
                          <h3 className="text-xl font-bold leading-tight group-hover:text-brand-primary transition-colors">
                            {event.name}
                          </h3>
                          <div className="flex flex-col gap-1 text-xs text-white/40">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span>{event.venue}, {event.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{event.date}</span>
                            </div>
                          </div>
                          <p className="text-xs text-white/30 line-clamp-2 pt-2 border-t border-white/5">
                            {event.description}
                          </p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
                {[
                  { icon: <Trophy />, title: "Eventi Top", desc: "Serie A, Tennis Roma, F1 Monza e molto altro." },
                  { icon: <MapPin />, title: "Venue Intelligence", desc: "L'AI conosce ogni stadio e impianto sportivo." },
                  { icon: <Info />, title: "Smart Concierge", desc: "Consigli basati su vicinanza e utilità reale." }
                ].map((feature, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-brand-card border border-brand-border text-left space-y-4">
                    <div className="text-brand-primary">{feature.icon}</div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="experience"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Event Header */}
              <div className="relative rounded-[40px] overflow-hidden bg-brand-card border border-brand-border p-8 md:p-12">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-primary/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-[0.2em]">
                      <Trophy size={14} />
                      <span>EVENTO {experience.event.sport === 'football' ? 'CALCIO' : experience.event.sport.toUpperCase()}</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter">
                      {experience.event.name}
                    </h2>
                    <div className="flex flex-wrap gap-6 text-white/60">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-brand-primary" />
                        <span>{experience.event.venue}, {experience.event.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-brand-primary" />
                        <span>{experience.event.date}</span>
                      </div>
                    </div>
                  </div>
                  
                    <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                    {[
                      { id: 'all', icon: <LayoutGrid size={18} />, label: 'Panoramica' },
                      { id: 'itinerary', icon: <List size={18} />, label: 'Itinerario' },
                      { id: 'map', icon: <MapIcon size={18} />, label: 'Mappa AI' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                          activeTab === tab.id ? "bg-brand-primary text-black" : "text-white/40 hover:text-white"
                        )}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeTab === 'all' && (
                <div className="space-y-16">
                  {/* AI Summary */}
                  <div className="p-8 rounded-3xl bg-brand-primary/5 border border-brand-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black">
                        <Info size={18} />
                      </div>
                      <h3 className="text-xl font-bold">Analisi Concierge AI</h3>
                    </div>
                    <p className="text-lg text-white/80 leading-relaxed font-light italic">
                      "{experience.summary}"
                    </p>
                  </div>

                  {/* Recommendations by Category */}
                  {categories.map(cat => {
                    const items = experience.recommendations.filter(r => r.type === cat.id);
                    if (items.length === 0) return null;
                    return (
                      <section key={cat.id} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold flex items-center gap-3">
                            {cat.label}
                            <span className="text-xs font-mono text-white/20 bg-white/5 px-2 py-1 rounded">
                              {items.length} OPZIONI
                            </span>
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {items.map(item => (
                            <RecommendationCard key={item.id} item={item} />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-bold">Il tuo Piano MatchAdvisor</h3>
                    <p className="text-white/40">Sequenza ottimizzata per vivere l'evento senza stress.</p>
                  </div>
                  <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-brand-primary/20">
                    {experience.itinerary.map((item, i) => (
                      <div key={i} className="relative pl-12 group">
                        <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-brand-card border-2 border-brand-primary flex items-center justify-center z-10 group-hover:bg-brand-primary group-hover:text-black transition-colors">
                          <ChevronRight size={18} />
                        </div>
                        <div className="p-6 rounded-2xl bg-brand-card border border-brand-border group-hover:border-brand-primary/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-brand-primary font-mono font-bold">{item.time}</span>
                            <span className="text-xs text-white/20 uppercase tracking-widest">{item.location}</span>
                          </div>
                          <h4 className="text-lg font-bold mb-2">{item.activity}</h4>
                          {item.note && <p className="text-sm text-white/40">{item.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'map' && (
                <div className="h-[600px] rounded-[40px] bg-brand-card border border-brand-border flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i2197!3i1402!2m3!1e0!2sm!3i633140934!3m8!2sit!3sUS!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0!23i4111425')] bg-cover bg-center" />
                  <div className="relative z-10 text-center space-y-4 max-w-md p-8 glass rounded-3xl">
                    <MapIcon size={48} className="mx-auto text-brand-primary" />
                    <h3 className="text-2xl font-bold">Mappa AI Interattiva</h3>
                    <p className="text-sm text-white/60">
                      In un'app reale, qui verrebbe visualizzata la mappa di Google con i pin per {experience.event.venue} e tutti i punti consigliati.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['Venue', 'Hotel', 'Parcheggi', 'Ristoranti'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <ChatAssistant experience={experience} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t border-brand-border bg-brand-card/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black font-black">
                M
              </div>
              <span className="text-lg font-bold">MatchAdvisor</span>
            </div>
            <p className="text-sm text-white/40 max-w-sm">
              La tua piattaforma AI per gli eventi sportivi in Italia. 
              Organizza la tua trasferta o il tuo weekend di sport con un click.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-brand-primary">Sport</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li className="hover:text-white cursor-pointer transition-colors">Serie A</li>
              <li className="hover:text-white cursor-pointer transition-colors">Tennis (ATP/WTA)</li>
              <li className="hover:text-white cursor-pointer transition-colors">Formula 1</li>
              <li className="hover:text-white cursor-pointer transition-colors">MotoGP</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-brand-primary">Legal</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-white cursor-pointer transition-colors">Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
          <p>© 2026 MatchAdvisor AI. Tutti i diritti riservati.</p>
          <p>Powered by Gemini 3.1 Pro & Google Maps Grounding</p>
        </div>
      </footer>
    </div>
  );
}
