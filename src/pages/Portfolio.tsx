import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import Footer from '../components/Footer';
import type { Portfolio } from '../types/portfolio';

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerDescription, setBannerDescription] = useState<string>("");
  const [siteTitle, setSiteTitle] = useState<string>(""); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchData = useCallback(async () => {
    const useJsonMode = import.meta.env.VITE_USE_JSON_MODE === 'true';
    try {
      setIsLoading(true);
      let portfolioData: Portfolio[] = [];

      if (useJsonMode) {
        const customRes = await fetch('/database/custom.json');
        if (customRes.ok) {
          const customData = await customRes.json();
          const pfSettings = customData.portfolio;
          setBannerUrl(pfSettings?.banner_url || null);
          setBannerTitle(pfSettings?.banner_title || "Selected Works");
          setBannerDescription(pfSettings?.banner_description || "Exploring creative boundaries.");
          setSiteTitle(pfSettings?.title || "Digital Soul");
        }

        const response = await fetch('/database/mock_data.json');
        const jsonData = await response.json();
        portfolioData = jsonData.portfolios || [];
      } else {
        const { data: settings } = await supabase.from('landing_settings').select('banner_url, title, banner_title, banner_description').single();
        setBannerUrl(settings?.banner_url || null);
        setSiteTitle(settings?.title || "Digital Soul");
        setBannerTitle(settings?.banner_title || "Selected Works");
        setBannerDescription(settings?.banner_description || "Exploring creative boundaries.");
        
        const { data, error } = await supabase.from('portfolios').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        portfolioData = data as Portfolio[];
      }

      if (portfolioData) {
        setPortfolios(portfolioData);
        setCategories(['All', ...Array.from(new Set(portfolioData.map((item) => item.category)))]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const filteredData = useMemo(() => 
    activeTab === 'All' ? portfolios : portfolios.filter(i => i.category === activeTab), 
    [activeTab, portfolios]
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const currentData = useMemo(() => 
    filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), 
    [currentPage, filteredData]
  );

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-primary gap-4 font-sans">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={48} />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Compiling Projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* --- BANNER SECTION --- */}
      <section className="pt-28 md:pt-36 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative overflow-hidden rounded-[35px] py-16 flex flex-col items-center border border-border bg-card/30 backdrop-blur-sm shadow-xl text-center"
        >
          <div className="absolute inset-0 -z-10">
            {bannerUrl ? (
              <img src={bannerUrl} className="w-full h-full object-cover opacity-30" alt="Banner" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent px-4 uppercase">
            {bannerTitle}
          </h1>
          <p className="text-banner-desc mt-2 font-medium px-4 italic">
            {bannerDescription}
          </p>
        </motion.div>
      </section>

      {/* --- FILTER TABS --- */}
      <div className="flex flex-wrap justify-center gap-2 mt-10 px-6">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => {setActiveTab(cat); setCurrentPage(1);}} 
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === cat 
              ? "bg-primary text-primary-foreground border-primary shadow-lg -translate-y-1" 
              : "bg-card/50 text-accent-custom border-border hover:border-primary/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* --- PORTFOLIO GRID --- */}
      <section className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {currentData.map((item) => (
            <ProjectCard 
              key={item.id} 
              item={item} 
            />
          ))}
        </AnimatePresence>
      </section>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-16 mb-16">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1} 
            className="p-3 rounded-full bg-card border border-border disabled:opacity-20 hover:border-primary transition-all active:scale-90"
          >
            <ChevronLeft size={20}/>
          </button>
          <span className="text-xs font-black text-accent-custom tracking-widest uppercase">
            {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages} 
            className="p-3 rounded-full bg-card border border-border disabled:opacity-20 hover:border-primary transition-all active:scale-90"
          >
            <ChevronRight size={20}/>
          </button>
        </div>
      )}

      <Footer title={siteTitle} />
    </div>
  );
}