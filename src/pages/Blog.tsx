import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

interface Blog {
  id: string;
  title: string;
  content: string;
  category: string;
  banner_url: string;
  created_at: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerDescription, setBannerDescription] = useState<string>("");
  const [siteTitle, setSiteTitle] = useState<string>(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 6;

  const fetchBlogs = useCallback(async () => {
    const useJsonMode = import.meta.env.VITE_USE_JSON_MODE === 'true';

    try {
      setIsLoading(true);

      if (useJsonMode) {
        const customRes = await fetch('/database/custom.json');
        if (customRes.ok) {
          const customData = await customRes.json();
          const blogBanner = customData.blog;
          
          setBannerUrl(blogBanner?.page_banner_url || null);
          setBannerTitle(blogBanner?.blog_banner_title || "My Thoughts");
          setBannerDescription(blogBanner?.blog_banner_description || "Sharing stories and insights.");
          setSiteTitle(blogBanner?.title || "Digital Soul");
        }

        const blogRes = await fetch('/database/blog_data.json');
        if (!blogRes.ok) throw new Error("Failed to fetch blog_data.json");
        const blogData = await blogRes.json();
        
        const allBlogs: Blog[] = Array.isArray(blogData) ? blogData : (blogData.blogs || []);
        setTotalCount(allBlogs.length);

        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage;
        setBlogs(allBlogs.slice(from, to));

      } else {
        const { data: settings } = await supabase
          .from('landing_settings')
          .select('blog_banner_url, title, blog_banner_title, blog_banner_description')
          .single();
        
        setBannerUrl(settings?.blog_banner_url || null);
        setBannerTitle(settings?.blog_banner_title || "My Thoughts");
        setBannerDescription(settings?.blog_banner_description || "Sharing stories and insights.");
        setSiteTitle(settings?.title || "Digital Soul");

        const { count } = await supabase
          .from('blogs')
          .select('*', { count: 'exact', head: true });
        
        setTotalCount(count || 0);

        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        if (data) setBlogs(data as Blog[]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBlogs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchBlogs]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-primary gap-4 font-sans">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={48} />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Thoughts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-500 overflow-x-hidden">
      <section className="pt-28 md:pt-36 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[40px] py-16 md:py-24 flex flex-col items-center justify-center text-center border border-border bg-card/30 shadow-xl backdrop-blur-sm"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {bannerUrl ? (
              <>
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10" />
            )}
          </div>

          <motion.h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter italic uppercase">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              {bannerTitle}
            </span>
          </motion.h1>
          <p className="text-accent-custom text-sm md:text-lg max-w-xl px-6 font-medium italic">
            {bannerDescription}
          </p>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='wait'>
            {blogs.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -10 }}
                className="group bg-card border border-border rounded-[35px] overflow-hidden shadow-md hover:shadow-2xl transition-all flex flex-col h-full"
              >
                <div className="aspect-video relative m-3 rounded-[25px] overflow-hidden bg-muted">
                  {post.banner_url ? (
                    <img src={post.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black tracking-widest text-accent-custom/30 italic">NO PREVIEW</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-background/80 backdrop-blur-md border border-border text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                      {post.category || 'Article'}
                    </span>
                  </div>
                </div>

                <div className="p-8 pt-2 flex flex-col flex-grow">
                  <div className="flex items-center text-accent-custom text-[10px] font-black uppercase tracking-widest mb-3">
                    <Calendar size={12} className="mr-1.5 text-emerald-500" />
                    {new Date(post.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </div>
                  <h2 className="text-xl font-black mb-3 text-item-title group-hover:text-emerald-500 transition-colors leading-tight italic line-clamp-2 uppercase">
                    {post.title}
                  </h2>
                  <div className="text-item-desc text-xs line-clamp-3 mb-8 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: post.content }} />
                  <Link to={`/blog/${post.id}`} className="mt-auto flex items-center justify-center gap-2 bg-muted hover:bg-emerald-500 hover:text-white py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300 text-accent-custom active:scale-95">
                    Read Full Article <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-20">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-3 rounded-xl border border-border bg-card hover:border-emerald-500 disabled:opacity-20 transition-all text-accent-custom active:scale-90"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all tracking-widest ${currentPage === page ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-card border border-border hover:border-emerald-500 text-accent-custom'}`}>{page}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 rounded-xl border border-border bg-card hover:border-emerald-500 disabled:opacity-20 transition-all text-accent-custom active:scale-90"><ChevronRight size={20} /></button>
          </div>
        )}
      </section>

      <Footer title={siteTitle} />
    </div>
  );
}