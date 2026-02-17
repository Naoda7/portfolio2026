import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ExternalLink, ZoomIn, ZoomOut, Move } from 'lucide-react';
import type { Portfolio } from '../types/portfolio';

interface ProjectCardProps {
  item: Portfolio;
}

export default function ProjectCard({ item }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const isLocked = isModalOpen || isPreviewOpen;
    document.body.style.overflow = isLocked ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen, isPreviewOpen]);

  const handleResetZoom = () => setZoom(1);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -10 }}
        onClick={() => setIsModalOpen(true)}
        className="group bg-card border border-border rounded-[35px] overflow-hidden cursor-pointer shadow-[#bab3e636] shadow-lg hover:shadow-2xl hover:shadow-[#bab3e636] transition-all h-full flex flex-col"
      >
        <div className="aspect-[4/3] relative m-3 rounded-[25px] rounded-b-none overflow-hidden bg-muted shrink-0">
          <img 
            src={item.image_url} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            alt={item.title} 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Maximize2 className="text-white" size={20} />
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-1 flex flex-col flex-grow">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            #{item.category}
          </span>
          <h3 className="text-xl font-black italic uppercase text-item-title mt-1 leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-item-desc text-sm line-clamp-2 mt-2 font-medium mb-4 min-h-[2.5rem]">
            {item.description}
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            {item.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-semibold uppercase border border-border px-2 py-1 rounded-md opacity-50">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {createPortal(
        <AnimatePresence mode="wait">
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }} 
                className="bg-card border border-border w-full max-w-5xl h-auto md:h-[600px] rounded-[40px] overflow-hidden relative z-10 flex flex-col md:flex-row shadow-2xl"
              >
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="absolute top-6 right-6 p-2 bg-muted/50 hover:bg-primary hover:text-white rounded-full z-50 transition-all"
                >
                  <X size={20}/>
                </button>
                
                <div 
                  className="md:w-3/5 bg-black/20 flex items-center justify-center p-4 cursor-zoom-in group" 
                  onClick={() => { setIsPreviewOpen(true); setIsModalOpen(false); }}
                >
                  <img src={item.image_url} className="w-full h-auto object-contain rounded-2xl shadow-inner group-hover:scale-[1.02] transition-transform duration-500" alt="Detail" />
                </div>

                <div className="md:w-2/5 p-8 md:p-12 flex flex-col h-full bg-card">
                  <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">{item.category}</span>
                  <h2 className="text-3xl font-black italic uppercase mt-2 mb-6 text-item-title leading-tight border-b border-border pb-4">{item.title}</h2>
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar mb-6">
                    <p className="text-item-desc text-base leading-relaxed whitespace-pre-wrap font-medium">{item.description}</p>
                  </div>
                  {item.project_url && (
                    <a href={item.project_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-lg active:scale-95">
                      View Project <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {isPreviewOpen && (
            <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center overflow-hidden touch-none">
              <div 
                className="absolute inset-0 z-0 cursor-default" 
                onClick={() => {setIsPreviewOpen(false); handleResetZoom();}} 
              />
              
              <div className="absolute top-10 right-10 z-[140]">
                 <button 
                  onClick={() => {setIsPreviewOpen(false); handleResetZoom();}} 
                  className="p-4 bg-card/80 backdrop-blur-md border border-border text-foreground rounded-full hover:bg-red-500 hover:text-white transition-all shadow-2xl"
                 >
                    <X size={24}/>
                 </button>
              </div>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-card/80 backdrop-blur-xl px-8 py-4 rounded-full border border-border z-[130] shadow-2xl text-foreground">
                <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))} className="hover:text-primary transition-all active:scale-90"><ZoomOut size={24}/></button>
                <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-[10px] font-black uppercase opacity-50 tracking-tighter">Zoom</span>
                    <span className="text-xs font-black">{Math.round(zoom * 100)}%</span>
                </div>
                <button onClick={() => setZoom(prev => Math.min(4, prev + 0.25))} className="hover:text-primary transition-all active:scale-90"><ZoomIn size={24}/></button>
                <div className="w-[1px] h-6 bg-border mx-2" />
                <div className="flex items-center gap-2 opacity-50">
                    <Move size={16} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Hold to Pan</span>
                </div>
              </div>

              <motion.div
                drag
                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                dragElastic={0.2}
                className="relative z-10 cursor-grab active:cursor-grabbing"
              >
                <motion.img 
                  animate={{ scale: zoom }} 
                  transition={{ type: "spring", stiffness: 250, damping: 30 }} 
                  src={item.image_url} 
                  className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none" 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--primary), 0.5); }
      `}</style>
    </>
  );
}