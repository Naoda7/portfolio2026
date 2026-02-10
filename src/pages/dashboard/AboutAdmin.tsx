import { useState, useEffect, type ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNotification } from '../../hooks/useNotification';
import { Loader2, Save, Upload, User, Mail, X, Globe } from 'lucide-react';

export default function AboutAdmin() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    const { data } = await supabase.from('about_me').select('*').single();
    if (data) {
      setFullName(data.full_name || '');
      setDescription(data.description || '');
      setEmail(data.contact_email || '');
      setPhotoUrl(data.photo_url || '');
      setPortfolioUrl(data.portfolio_url || '');
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files?.[0]) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `profile/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setPhotoUrl(data.publicUrl);
      showNotification("Profile photo uploaded", "success");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Upload failed', "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoUrl) return;
    if (!confirm('Permanently delete profile photo?')) return;

    try {
      setUploading(true);
      const path = photoUrl.split('/storage/v1/object/public/assets/')[1];
      
      if (path) {
        await supabase.storage.from('assets').remove([path]);
      }

      setPhotoUrl('');
      await supabase.from('about_me').update({ photo_url: '' }).eq('id', 1);
      showNotification("Photo removed", "info");
    } catch {
      showNotification("Failed to remove photo", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('about_me').upsert({
        id: 1,
        full_name: fullName,
        description,
        contact_email: email,
        photo_url: photoUrl,
        portfolio_url: portfolioUrl
      });

      if (error) throw error;
      showNotification("Profile updated successfully!", "success");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to update profile', "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">About Me</h1>
        <p className="text-sm text-muted-foreground">Personal information that appears on your bio page.</p>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-6 md:p-10 shadow-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group h-36 w-36 rounded-full border-4 border-dashed border-muted-foreground/20 overflow-hidden bg-muted flex items-center justify-center transition-all hover:border-primary/50">
            {photoUrl ? (
              <>
                <img src={photoUrl} className="h-full w-full object-cover" alt="Profile" />
                <button 
                  onClick={handleDeletePhoto}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  title="Remove photo"
                >
                  <X size={28} />
                </button>
              </>
            ) : (
              <User size={56} className="text-muted-foreground/30" />
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            )}
          </div>

          <label className="cursor-pointer group">
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              accept="image/*" 
              disabled={uploading} 
            />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold transition-all group-hover:bg-primary group-hover:text-primary-foreground">
              <Upload size={16} /> 
              {photoUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
            </div>
          </label>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Full Name</label>
            <Input 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Your full name" 
              className="rounded-xl h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  className="pl-12 rounded-xl h-12" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@example.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Portfolio Link (URL)</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  className="pl-12 rounded-xl h-12" 
                  value={portfolioUrl} 
                  onChange={(e) => setPortfolioUrl(e.target.value)} 
                  placeholder="https://yourportfolio.com" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Bio / Personal Description</label>
            <textarea 
              className="w-full min-h-[160px] rounded-[1.5rem] border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none custom-scrollbar"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading || uploading} 
          className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Save size={20} className="mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.15); border-radius: 10px; }
      `}} />
    </div>
  );
}