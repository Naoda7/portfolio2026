// src/pages/Login.tsx
import { useState} from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthError } from '@supabase/supabase-js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (authError) throw authError;
      if (data.session) navigate('/dashboard');
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.status === 429 ? "Locked: Tunggu 5 menit." : "Akses ditolak.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Lights */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm z-10">
        {/* Card Adaptif */}
        <div className="bg-white dark:bg-card/40 backdrop-blur-2xl border border-black/5 dark:border-white/10 p-8 rounded-[35px] shadow-2xl">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 border border-item-desc rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase ">Login</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-5">
            <input 
              type="email" 
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/5 dark:bg-background/50 border border-black/5 dark:border-white/5 rounded-xl px-5 py-3 outline-none focus:border-purple-500/50 transition-all text-sm"
              required
            />

            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/5 dark:bg-background/50 border border-black/5 dark:border-white/5 rounded-xl px-5 py-3 outline-none focus:border-purple-500/50 transition-all text-sm"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="text-red-500 text-[10px] text-center font-bold uppercase tracking-widest">{error}</p>}

            <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50">
              {loading ? "Verifying..." : "Login"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {/*
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest opacity-40 font-medium">
           <span>Encrypted</span>
           <span>|</span>
           <span>AES-256 Protocol</span>
        </div>
        */}
      </motion.div>
    </div>
  );
}