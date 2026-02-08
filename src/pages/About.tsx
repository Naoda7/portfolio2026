import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, type Variants } from 'framer-motion';
import { Mail, Loader2, User, Globe, ArrowUpRight, Sparkles } from 'lucide-react';
import Footer from '../components/Footer';

interface AboutData {
  full_name: string;
  description: string;
  contact_email: string;
  photo_url: string;
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [siteTitle, setSiteTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      const useJsonMode = import.meta.env.VITE_USE_JSON_MODE === 'true';

      try {
        setIsLoading(true);

        if (useJsonMode) {
          const response = await fetch('/database/mock_data.json');
          if (!response.ok) throw new Error("Failed to fetch JSON data");
          const jsonData = await response.json();
          
          if (jsonData.about) {
            setAbout(jsonData.about as AboutData);
          }
          if (jsonData.settings?.title) {
            setSiteTitle(jsonData.settings.title);
          }
        } else {
          const { data: aboutData, error: aboutError } = await supabase
            .from('about_me')
            .select('*')
            .single();

          if (aboutError) throw aboutError;
          if (aboutData) setAbout(aboutData as AboutData);

          const { data: settingsData } = await supabase
            .from('landing_settings')
            .select('title')
            .single();
          
          if (settingsData) setSiteTitle(settingsData.title);
        }
      } catch (err) {
        console.error("Error fetching about data:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    fetchAboutData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-primary gap-6 font-sans">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="text-purple-500"
          >
            <Loader2 size={50} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
        <motion.p 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground"
        >
          Loading Profile
        </motion.p>
      </div>
    );
  }

  if (!about) return null;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 md:pt-40 overflow-x-hidden transition-colors duration-500 relative font-sans flex flex-col">
      
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 flex-grow w-full"
      >
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          
          <motion.div variants={itemVariants} className="lg:col-span-5 relative group">
            <div className="relative backdrop-blur-3xl p-4 rounded-[50px] border border-white/10 bg-white/5 shadow-2xl">
              <div className="relative z-10 w-full aspect-[4/5] rounded-[40px] overflow-hidden border border-white/10 shadow-inner">
                {about.photo_url ? (
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    src={about.photo_url} 
                    alt={about.full_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <User size={80} strokeWidth={1} />
                  </div>
                )}
              </div>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute -bottom-4 -right-4 z-20 bg-card border border-border px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3"
              >
                <Sparkles size={16} className="text-purple-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Designer & Developer</span>
              </motion.div>
            </div>
          </motion.div>

          <div className="lg:col-span-7">
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <span className="h-[2px] w-10 bg-gradient-to-r from-purple-500 to-transparent" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.4em]">Personal Journey</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-8xl font-black mb-10 tracking-tighter italic uppercase leading-[0.9]"
            >
              <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent inline-block">
                {about.full_name}
              </span>
            </motion.h1>

            <motion.div variants={itemVariants} className="mb-12 relative">
              <p className="text-muted-foreground text-lg md:text-2xl leading-relaxed whitespace-pre-line font-medium italic">
                {about.description}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-8">
              {about.contact_email && (
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:${about.contact_email}`}
                  className="group relative flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-2 pr-8 rounded-full hover:bg-white/10 transition-all duration-300 shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-purple-400 uppercase font-black tracking-widest">Get In Touch</span>
                    <span className="text-sm font-bold tracking-tight">{about.contact_email}</span>
                  </div>
                </motion.a>
              )}

              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 text-muted-foreground hover:text-white cursor-pointer transition-all group"
              >
                <Globe size={18} className="group-hover:text-blue-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">View Portfolio</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-purple-500" />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mt-20"
      >
        <Footer title={siteTitle} />
      </motion.div>
    </div>
  );
}