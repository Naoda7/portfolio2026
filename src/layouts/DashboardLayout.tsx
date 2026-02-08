import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { supabase } from '../lib/supabase';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout() {
  const [theme, setTheme] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const applyTheme = useCallback((currentTheme: string) => {
    setTheme(currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const fetchTheme = async () => {
      const { data } = await supabase
        .from('landing_settings')
        .select('default_theme')
        .single();
        
      if (data?.default_theme) {
        applyTheme(data.default_theme);
      } else {
        applyTheme('dark'); 
      }
    };

    fetchTheme();

    const channel = supabase
      .channel('theme-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'landing_settings' },
        (payload) => {
          if (payload.new.default_theme) {
            applyTheme(payload.new.default_theme);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applyTheme]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-full bg-background transition-colors duration-500 overflow-hidden text-foreground">
      
      {/* Mobile Sidebar Overlay*/}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        
        {/* Mobile Navbar Header */}
        <header className="flex items-center justify-between px-6 py-4 lg:hidden bg-background/80 backdrop-blur-md border-b border-border z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="font-bold tracking-tight">Admin Console</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 w-full h-full">
          <div 
            className={`
              min-h-full w-full bg-card border border-border rounded-[2rem] p-4 md:p-8 shadow-sm transition-all duration-500
              ${theme ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}