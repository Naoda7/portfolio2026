import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User, 
  LogOut,
  Palette,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { title: 'Landing Page', icon: Palette, path: '/dashboard/landing' },
  { title: 'Portfolio', icon: Briefcase, path: '/dashboard/portfolio' },
  { title: 'Blog', icon: FileText, path: '/dashboard/blog' },
  { title: 'About Me', icon: User, path: '/dashboard/about' },
];

export const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      alert(error.message);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <aside className={clsx(
      "w-72 lg:w-64 h-screen lg:h-[calc(100vh-2rem)] lg:m-4",
      "bg-card border-r lg:border border-border lg:rounded-3xl",
      "flex flex-col p-6 shadow-sm relative transition-all duration-300"
    )}>
      
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-6 right-6 p-2 hover:bg-muted rounded-xl text-muted-foreground"
      >
        <X size={20} />
      </button>

      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <LayoutDashboard size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">Admin Panel</span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={20} className={clsx(isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
              <span className="font-medium">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto pt-6 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-primary hover:border-primary/50 border bg-card/50 border-border rounded-2xl px-4"
          onClick={handleLogout} 
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};