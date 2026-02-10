import { supabase } from './supabase';

// Tipe untuk jenis data yang tersedia
export type DataType = 'portfolio' | 'blog' | 'landing_settings' | 'about';

export const getItems = async (type: DataType) => {
  const mode = String(import.meta.env.VITE_USE_JSON_MODE || 'auto').toLowerCase();
  
  // Mapping nama tabel Supabase dan file JSON lokal
  const config = {
    portfolio: { table: 'projects', json: '/database/mock_data.json' },
    blog: { table: 'blogs', json: '/database/blog_data.json' },
    landing_settings: { table: 'landing_settings', json: '/database/custom.json' },
    about: { table: 'about_me', json: '/database/custom.json' } // Sesuaikan jika ada file khusus
  };

  const target = config[type];

  // 1. JIKA MODE JSON DIPAKSA
  if (mode === 'true') {
    return fetchLocalJson(target.json);
  }

  // 2. JIKA MODE SUPABASE ATAU AUTO
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key || !url.startsWith('http')) {
      throw new Error("Invalid Supabase Config");
    }

    const { data, error } = await supabase
      .from(target.table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) throw new Error("No data found");

    return data;

  } catch (err) {
    // 3. FALLBACK: Jika mode AUTO atau FALSE tapi gagal
    if (mode === 'auto' || mode === 'false') {
      console.log(`%c ℹ️ Data ${type.toUpperCase()}: Switching to JSON fallback.`, "color: #fbbf24; font-weight: bold;");
      return fetchLocalJson(target.json);
    }
    throw err;
  }
};

// Helper untuk fetch file JSON lokal
const fetchLocalJson = async (path: string) => {
  try {
    const response = await fetch(path);
    const data = await response.json();
    // Jika data blog/portfolio dibungkus dalam properti tertentu di JSON
    return data.projects || data.blogs || data; 
  } catch (error) {
    console.error("Critical Error: Local JSON also missing!", error);
    return [];
  }
};