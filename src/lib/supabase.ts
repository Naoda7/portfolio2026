import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Anon Key dari environment variables Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Placeholder digunakan agar createClient tidak melempar error saat inisialisasi awal 
 * jika file .env belum dikonfigurasi. Ini mencegah aplikasi "crash" total saat build 
 * atau saat pertama kali dijalankan.
 */
const safeUrl = supabaseUrl || "https://placeholder-project.supabase.co";
const safeKey = supabaseAnonKey || "placeholder-key";

// Inisialisasi instance Supabase
export const supabase = createClient(safeUrl, safeKey);

/**
 * Helper untuk mengecek apakah konfigurasi Supabase sudah benar.
 * Sangat berguna untuk logika fallback (seperti fitur JSON Mode yang Anda gunakan).
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== "https://placeholder-project.supabase.co" && 
  supabaseAnonKey
);