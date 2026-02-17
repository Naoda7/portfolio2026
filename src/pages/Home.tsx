import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import type { Portfolio } from '../types/portfolio';
import { 
  HelpCircle, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';
import { ICON_MAP } from '../constants/icons'; 

interface SocialConnection {
  icon: string; 
  url: string;
}

interface HeroSettings {
  greeting: string;
  title: string;
  description: string;
  logo_url: string;
  socials: SocialConnection[];
}

export default function Home() {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [randomAllItems, setRandomAllItems] = useState<Portfolio[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const shuffleArray = useCallback((array: Portfolio[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  }, []);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    const mode = String(import.meta.env.VITE_USE_JSON_MODE || 'auto').toLowerCase();
    
    const fetchFromLocal = async () => {
      try {
        const [heroRes, portfolioRes] = await Promise.all([
          fetch('/database/custom.json', { signal }),
          fetch('/database/mock_data.json', { signal })
        ]);

        if (heroRes.ok && portfolioRes.ok) {
          const heroData = await heroRes.json();
          const portData = await portfolioRes.json();
          const rawData = portData.portfolios || [];
          const sortedData = rawData.sort((a: Portfolio, b: Portfolio) => 
            b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' })
          );
          setHero(heroData.hero);
          setPortfolios(sortedData);
          setRandomAllItems(shuffleArray(sortedData).slice(0, 6));
        }
      } catch {
        // Error diabaikan sesuai instruksi tanpa console log
      }
    };

    try {
      setIsLoading(true);
      if (mode === 'true') {
        await fetchFromLocal();
        return;
      }

      const { data: sData, error: sError } = await supabase.from('landing_settings').select('*').single();
      const { data: pData, error: pError } = await supabase.from('portfolios').select('*').order('created_at', { ascending: false });
      
      if (sError || pError) throw new Error("Database Error");

      if (sData) setHero(sData);
      if (pData) {
        const data = pData as Portfolio[];
        setPortfolios(data);
        setRandomAllItems(shuffleArray(data).slice(0, 6));
      }
    } catch {
      if (mode === 'auto' || mode === 'false') {
        await fetchFromLocal();
      }
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [shuffleArray]);

  useEffect(() => { 
    const controller = new AbortController();
    fetchData(controller.signal); 
    return () => controller.abort();
  }, [fetchData]);

  useEffect(() => {
    if (portfolios.length > 0 && activeTab === 'All') {
      const interval = setInterval(() => {
        setRandomAllItems(shuffleArray(portfolios).slice(0, 6));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [portfolios, activeTab, shuffleArray]);

  const categories = useMemo(() => 
    ['All', ...Array.from(new Set(portfolios.map(p => p.category)))], 
    [portfolios]
  );
  
  const filteredPortfolios = useMemo(() => {
    if (activeTab === 'All') return randomAllItems; 
    return portfolios.filter(p => p.category === activeTab).slice(0, 6);
  }, [activeTab, portfolios, randomAllItems]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-primary gap-4 font-sans antialiased">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={48} />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Launching Experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden font-sans antialiased">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="relative px-4 pt-28 md:pt-36 max-w-7xl mx-auto w-full">
        <div className="relative backdrop-blur-2xl p-6 sm:p-10 md:p-16 rounded-[40px] border border-white/10 shadow-md overflow-hidden transition-all duration-500">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px] -z-10 animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-fit mx-auto relative z-10"
          >
            {hero?.logo_url && (
              <motion.div whileHover={{ rotate: -5, scale: 1.05 }} className="w-40 h-40 md:w-64 md:h-64 shrink-0 drop-shadow-2xl">
                <img src={hero.logo_url} alt="Logo" className="w-full h-full object-contain" />
              </motion.div>
            )}

            <div className="text-center md:text-left">
              <h1 className="text-[0.75rem] md:text-[1.25rem] font-bold mb-1 opacity-60 italic uppercase">
                <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-400 bg-clip-text text-transparent inline-block w-fit">
                  {hero?.greeting || "Hello"}
                </span>
              </h1>
              <h1 className="text-3xl md:text-[5rem] font-black mb-4 tracking-tighter italic uppercase leading-[0.8]">
                <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent inline-block w-fit">
                  {hero?.title || "Digital Soul"}
                </span>
              </h1>
              <p className="text-item-desc text-base md:text-xl max-w-xl mb-8 leading-relaxed font-medium">
                {hero?.description}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {hero?.socials?.map((social, idx) => {
                  const IconComponent = ICON_MAP[social.icon as keyof typeof ICON_MAP] || HelpCircle;
                  return (
                    <motion.a 
                      whileHover={{ y: -5, scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }} 
                      key={idx} 
                      href={social.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-4 bg-white/5 border border-white/10 rounded-[1.2rem] text-foreground hover:text-primary transition-all shadow-md active:scale-95 backdrop-blur-sm"
                    >
                      <IconComponent size={20} />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="px-4 py-12 md:py-20 max-w-7xl mx-auto w-full">
        <div className="bg-card/30 backdrop-blur-md p-6 md:p-12 rounded-[40px] border border-border shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10">
            <div className="text-center md:text-left relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] 
                bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-transparent 
                dark:from-purple-600/30 dark:via-blue-600/20 blur-[50px] md:blur-[80px] rounded-full -z-10 opacity-70" />
              <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent relative z-10">
                Selected Works
              </h2>
              <p className="text-accent-custom mt-2 font-black uppercase text-[10px] tracking-[0.3em]">Where Art Meets Interface</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveTab(cat)} 
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    activeTab === cat 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                    : "bg-card/50 text-accent-custom border-border hover:border-primary/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[550px] items-stretch">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredPortfolios.map((item) => (
                <motion.div
                  key={`${activeTab}-${item.id}`} 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="h-full"
                >
                  <ProjectCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-16 text-center">
            <a href="/portfolio" className="group inline-flex items-center gap-3 px-12 py-5 border-2 border-primary rounded-full hover:bg-primary text-primary hover:text-white transition-all font-black text-xs tracking-[0.2em] uppercase active:scale-95">
              SEE ALL PROJECTS <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
            </a>
          </div>
        </div>
      </section>

      <Footer title={hero?.title} />
    </div>
  );
}