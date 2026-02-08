import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Loader2, ChevronUp } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  content: string;
  category: string;
  banner_url: string; 
  created_at: string;
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchDetail = async () => {
      const useJsonMode = import.meta.env.VITE_USE_JSON_MODE === 'true';
      
      try {
        setIsLoading(true);
        if (!id) return;

        if (useJsonMode) {
          const response = await fetch('/database/blog_data.json');
          if (!response.ok) throw new Error("Failed to fetch blog_data.json");
          const jsonData = await response.json();
          const allBlogs: Blog[] = Array.isArray(jsonData) ? jsonData : (jsonData.blogs || []);
          
          const foundPost = allBlogs.find(b => b.id === id);
          if (foundPost) setPost(foundPost);
        } else {
          const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          if (data) setPost(data as Blog);
        }
      } catch (err: unknown) {
        console.error("Error fetching detail:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-primary gap-4 font-sans">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={48} />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Reading Data...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground gap-6 font-sans">
        <h1 className="text-3xl font-black italic text-item-title tracking-tighter">Article Not Found</h1>
        <Link to="/blog" className="px-8 py-3 bg-card border border-border rounded-2xl text-primary font-bold hover:bg-muted transition-all active:scale-95">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-background text-foreground pb-20 pt-32 transition-colors duration-500 relative font-sans overflow-x-hidden"
    >
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-accent-custom hover:text-primary mb-12 font-bold tracking-widest text-[11px] uppercase transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-16">
          <div className="flex flex-wrap items-center gap-4 mb-8">
             <span className="flex items-center gap-1.5 text-primary font-black text-[10px] uppercase bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 tracking-wider">
               <Tag size={12} /> {post.category || 'Article'}
             </span>
             <span className="flex items-center gap-1.5 text-accent-custom text-[10px] font-bold uppercase tracking-wider">
               <Calendar size={12} className="text-primary" /> {new Date(post.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}
             </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black italic leading-[1.1] md:leading-[1] mb-12 tracking-tighter text-item-title break-words overflow-wrap-anywhere">
            {post.title}
          </h1>
          
          {post.banner_url && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full aspect-video rounded-[40px] md:rounded-[55px] overflow-hidden border border-border bg-card/60 backdrop-blur-2xl shadow-2xl"
            >
              <img src={post.banner_url} alt={post.title} className="w-full h-full object-cover" />
            </motion.div>
          )}
        </header>

        {/* Content */}
        <article className="max-w-none">
          <div 
            className="prose prose-primary dark:prose-invert max-w-none 
                       prose-p:text-item-desc prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8
                       prose-headings:text-item-title prose-headings:italic prose-headings:tracking-tighter
                       prose-li:text-item-desc prose-li:text-lg
                       prose-strong:text-item-title prose-strong:font-black
                       prose-img:rounded-[30px] prose-img:shadow-xl
                       
                       text-item-desc text-lg leading-relaxed
                       [&>h2]:text-item-title [&>h2]:mt-16 [&>h2]:mb-6 [&>h2]:font-black [&>h2]:text-3xl md:[&>h2]:text-4xl
                       [&>h3]:text-item-title [&>h3]:mt-12 [&>h3]:mb-4 [&>h3]:font-black [&>h3]:text-2xl
                       break-words"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Footer Post */}
        <div className="mt-20 pt-10 border-t border-border flex justify-center">
            <Link to="/blog" className="text-sm font-black uppercase tracking-[0.2em] text-accent-custom hover:text-primary transition-colors text-center">
               End of Article — Back to Overview
            </Link>
        </div>
      </div>

      {/* Floating Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            whileHover={{ y: -5, backgroundColor: "var(--primary)", color: "white" }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-6 md:bottom-12 md:right-12 z-[100] 
                       w-14 h-14 flex items-center justify-center
                       bg-card/80 backdrop-blur-2xl 
                       border border-border text-primary 
                       rounded-full shadow-2xl transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        ::selection {
          background: rgba(var(--primary), 0.2);
          color: var(--primary);
        }
        /* Extra safety for long words in titles */
        .break-words {
          word-break: break-word;
          overflow-wrap: break-word;
        }
      `}</style>
    </motion.div>
  );
}