import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from './lib/supabase';

import { NotificationProvider } from './context/NotificationProvider';

import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import BlogPage from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import AboutMe from './pages/About';
import Login from './pages/Login';

import DashboardLayout from './layouts/DashboardLayout';
import LandingAdmin from './pages/dashboard/LandingAdmin';
import PortfolioAdmin from './pages/dashboard/PortfolioAdmin';
import BlogAdmin from './pages/dashboard/BlogAdmin';
import AboutAdmin from './pages/dashboard/AboutAdmin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const PublicLayout = ({ children }: { children: ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

export default function App() {
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    const syncGlobalTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('landing_settings')
          .select('default_theme')
          .single();

        const dbTheme = data?.default_theme;
        const localTheme = localStorage.getItem('theme');
        const lastSyncedDbTheme = localStorage.getItem('last_db_theme');

        if (!error && dbTheme) {
          if (dbTheme !== lastSyncedDbTheme) {
            document.documentElement.classList.toggle('dark', dbTheme === 'dark');
            localStorage.setItem('theme', dbTheme);
            localStorage.setItem('last_db_theme', dbTheme);
          } 
          else if (localTheme) {
            document.documentElement.classList.toggle('dark', localTheme === 'dark');
          }
        }
      } catch (err) {
        console.error("Theme Engine Error:", err);
      } finally {
        setIsThemeLoading(false);
      }
    };

    syncGlobalTheme();
  }, []);

  if (isThemeLoading) {
    return <div className="min-h-screen bg-background transition-colors duration-500" />;
  }

  return (
    <NotificationProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* --- PUBLIC SECTION --- */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
          <Route path="/blog/:id" element={<PublicLayout><BlogDetail /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutMe /></PublicLayout>} />
          
          {/* --- AUTH SECTION --- */}
          <Route path="/gate-access" element={<Login />} />
          
          {/* redirect for legacy login URL */}
          <Route path="/login" element={<Navigate to="/gate-access" replace />} />

          {/* --- PRIVATE SECTION (ADMIN) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Redirect */}
              <Route index element={<Navigate to="/dashboard/landing" replace />} />
              
              <Route path="landing" element={<LandingAdmin />} />
              <Route path="portfolio" element={<PortfolioAdmin />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="about" element={<AboutAdmin />} />
            </Route>
          </Route>

          {/* --- FALLBACK SECTION --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}