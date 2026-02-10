import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import brandingData from '../data/branding.json';

export const useBranding = () => {
  useEffect(() => {
    // Fungsi helper untuk update Title dan Favicon di browser
    const applyToDom = (title: string, favicon: string) => {
      if (title) document.title = title;

      if (favicon) {
        const oldIcons = document.querySelectorAll("link[rel*='icon']");
        oldIcons.forEach(el => el.remove());

        const link = document.createElement('link');
        link.rel = 'icon';

        const isRemote = favicon.startsWith('http');
        link.href = isRemote ? `${favicon}?t=${Date.now()}` : favicon;

        if (favicon.endsWith('.svg')) link.type = 'image/svg+xml';
        else link.type = 'image/png';

        document.head.appendChild(link);
      }
    };

    const initBranding = async () => {
      // Normalisasi mode dari .env (auto, true, atau false)
      const mode = String(import.meta.env.VITE_USE_JSON_MODE || 'auto').toLowerCase();
      
      const defaultTitle = brandingData.site_title;
      const defaultFavicon = brandingData.favicon_url;

      // 1. JIKA MODE JSON DIPAKSA
      if (mode === 'true') {
        applyToDom(defaultTitle, defaultFavicon);
        return;
      }

      // 2. JIKA MODE SUPABASE ATAU AUTO
      try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        // Validasi dasar URL agar tidak memicu error fatal SDK
        if (!url || !key || !url.startsWith('http')) {
          throw new Error("Missing or invalid Supabase config");
        }

        const { data, error } = await supabase
          .from('landing_settings')
          .select('site_title, favicon_url')
          .single();

        // Jika API key salah atau tabel tidak ditemukan
        if (error) throw error;

        if (data) {
          applyToDom(
            data.site_title || defaultTitle,
            data.favicon_url || defaultFavicon
          );
        } else {
          throw new Error("No branding data found");
        }

      } catch (err) {
        // 3. FALLBACK: Jika mode AUTO atau mode FALSE tapi gagal koneksi
        if (mode === 'auto' || mode === 'false') {
          // Log sederhana agar developer tahu terjadi fallback tanpa membuat konsol berantakan
          const reason = err instanceof Error ? err.message : "Connection failed";
          console.log(`%c ℹ️ Mode ${mode.toUpperCase()}: Switching to JSON branding (${reason}) `, "color: #fbbf24; font-weight: bold;");
          
          applyToDom(defaultTitle, defaultFavicon);
        } else {
          // Default tetap jalan agar UI tidak rusak
          applyToDom(defaultTitle, defaultFavicon);
        }
      }
    };

    initBranding();
  }, []);
};