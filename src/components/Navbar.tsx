import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-4 md:top-8 left-0 right-0 z-[100] px-4 font-sans">
      <div className="max-w-max mx-auto relative">
        {/* --- MAIN NAVBAR CONTAINER --- */}
        <div className="bg-white/60 dark:bg-[#16161a]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 px-4 md:px-8 py-3 rounded-full flex items-center justify-between gap-4 md:gap-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-2xl transition-all duration-300">
          
          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative py-1 ${
                    isActive ? "text-primary" : "text-slate-600 dark:text-item-title hover:text-primary"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full origin-center" 
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-12 md:gap-4">
            <div className="hidden md:block w-[1px] h-4 bg-slate-200 dark:bg-white/10" />
            
            {/* Toggle Theme */}
            <button 
              onClick={() => setIsDark(!isDark)} 
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <motion.div initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                  <Moon size={16} className="fill-current" />
                </motion.div>
              ) : (
                <motion.div initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                  <Sun size={16} />
                </motion.div>
              )}
            </button>

            {/* Hamburger (Mobile) */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-primary transition-all"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU OVERLAY --- */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMenu}
                className="fixed inset-0 -z-10 md:hidden bg-black/10 dark:bg-black/40 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed top-24 left-14 right-14 md:hidden flex justify-center pointer-events-none"
              >
                <div className="bg-white/90 dark:bg-card/95 border border-white/40 dark:border-border p-4 rounded-[32px] shadow-2xl flex flex-col gap-1 backdrop-blur-2xl w-full max-w-sm pointer-events-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={closeMenu}
                      className={`text-[11px] font-black uppercase tracking-[0.2em] py-4 px-6 rounded-2xl transition-all whitespace-nowrap text-center ${
                        location.pathname === item.path 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                          : "text-slate-600 dark:text-item-title hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}