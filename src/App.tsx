import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from './lib/supabase';

import { NotificationProvider } from './context/NotificationProvider';
import { useBranding } from './hooks/useBranding';

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

  // Custom hook untuk favicon dan title (sudah menangani JSON mode secara internal)
  useBranding();

  useEffect(() => {
    const syncGlobalTheme = async () => {
      const isJsonMode = import.meta.env.VITE_USE_JSON_MODE === 'true';
      const localTheme = localStorage.getItem('theme') || 'light';

      // JIKA MODE JSON AKTIF: Lewati panggilan Supabase
      if (isJsonMode) {
        document.documentElement.classList.toggle('dark', localTheme === 'dark');
        setIsThemeLoading(false);
        return;
      }

      // JIKA MODE DATABASE AKTIF: Hubungi Supabase
      try {
        const { data, error } = await supabase
          .from('landing_settings')
          .select('default_theme')
          .single();

        const dbTheme = data?.default_theme;
        const lastSyncedDbTheme = localStorage.getItem('last_db_theme');

        if (!error && dbTheme) {
          if (dbTheme !== lastSyncedDbTheme) {
            document.documentElement.classList.toggle('dark', dbTheme === 'dark');
            localStorage.setItem('theme', dbTheme);
            localStorage.setItem('last_db_theme', dbTheme);
          } else {
            document.documentElement.classList.toggle('dark', localTheme === 'dark');
          }
        } else {
          // Fallback jika error database
          document.documentElement.classList.toggle('dark', localTheme === 'dark');
        }
      } catch (err) {
        console.warn("Database theme sync failed, using local theme", err);
        document.documentElement.classList.toggle('dark', localTheme === 'dark');
      } finally {
        setIsThemeLoading(false);
      }
    };

    syncGlobalTheme();
  }, []);

  if (isThemeLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <NotificationProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
          <Route path="/blog/:id" element={<PublicLayout><BlogDetail /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutMe /></PublicLayout>} />
          
          <Route path="/gate-access" element={<Login />} />
          <Route path="/login" element={<Navigate to="/gate-access" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard/landing" replace />} />
              <Route path="landing" element={<LandingAdmin />} />
              <Route path="portfolio" element={<PortfolioAdmin />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="about" element={<AboutAdmin />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}