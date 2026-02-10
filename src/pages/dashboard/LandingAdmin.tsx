import { useState, useEffect, type ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { IconPicker } from '../../components/dashboard/IconPicker';
import { useNotification } from '../../hooks/useNotification';
import type { IconName } from '../../constants/icons';
import { Plus, Trash2, Save, Loader2, Upload, Image as ImageIcon, X, Globe } from 'lucide-react';

interface SocialLink {
  icon: IconName;
  url: string;
}

export default function LandingAdmin() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFav, setUploadingFav] = useState(false);
  
  const [greeting, setGreeting] = useState('');
  const [title, setTitle] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase.from('landing_settings').select('*').single();
    if (data && !error) {
      setGreeting(data.greeting || 'Hello');
      setTitle(data.title || '');
      setSiteTitle(data.site_title || '');
      setDescription(data.description || '');
      setLogoUrl(data.logo_url || '');
      setFaviconUrl(data.favicon_url || '');
      setTheme(data.default_theme || 'dark');
      setSocials(data.socials || []);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    try {
      if (type === 'logo') setUploading(true);
      else setUploadingFav(true);

      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      
      if (type === 'logo') {
        setLogoUrl(data.publicUrl);
      } else {
        setFaviconUrl(data.publicUrl);
      }

      showNotification(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`, "success");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      if (type === 'logo') setUploading(false);
      else setUploadingFav(false);
    }
  };

  const handleDeleteImage = async (type: 'logo' | 'favicon') => {
    const targetUrl = type === 'logo' ? logoUrl : faviconUrl;
    if (!targetUrl) return;
    if (!confirm(`Remove ${type} from server?`)) return;

    try {
      if (type === 'logo') setUploading(true);
      else setUploadingFav(true);

      const urlParts = targetUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error: deleteError } = await supabase.storage
        .from('assets')
        .remove([fileName]);

      if (deleteError) throw deleteError;

      if (type === 'logo') {
        setLogoUrl('');
        await supabase.from('landing_settings').update({ logo_url: '' }).eq('id', 1);
      } else {
        setFaviconUrl('');
        await supabase.from('landing_settings').update({ favicon_url: '' }).eq('id', 1);
      }
      
      showNotification(`${type === 'logo' ? 'Logo' : 'Favicon'} removed`, "info");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Failed to delete image", "error");
    } finally {
      if (type === 'logo') setUploading(false);
      else setUploadingFav(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('landing_settings').upsert({
        id: 1,
        greeting,
        title,
        site_title: siteTitle,
        description,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        default_theme: theme, 
        socials
      });

      if (error) throw error;
      showNotification("All settings updated successfully!", "success");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Error saving settings", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 lg:pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="order-1">
          <h1 className="text-2xl font-bold text-foreground">Landing Page Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your hero section and browser identity.</p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="hidden sm:flex order-2 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 order-2">
        <div className="lg:col-span-2 space-y-6">
          {/* General Branding */}
          <div className="bg-card border border-border p-5 md:p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Globe size={18} />
              <h2 className="text-sm font-bold uppercase tracking-wider">Site Identity</h2>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Site Title (Browser Tab)</label>
              <Input 
                value={siteTitle} 
                onChange={(e) => setSiteTitle(e.target.value)} 
                placeholder="e.g. John Doe | Portfolio" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Greeting Text</label>
                <Input 
                  value={greeting} 
                  onChange={(e) => setGreeting(e.target.value)} 
                  placeholder="e.g. Hello" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Hero Title</label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Main title..." 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Description</label>
              <textarea 
                className="w-full min-h-[120px] rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief bio or site description..."
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-card border border-border p-5 md:p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-foreground/80">Social Connections</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSocials([...socials, { icon: 'Instagram', url: '' }])} 
                className="rounded-xl h-8 border-dashed hover:border-primary hover:text-primary transition-colors"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>
            
            <div className="grid gap-3 max-h-[300px] lg:max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {socials.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 border border-dashed border-border rounded-2xl">
                  <p className="text-sm text-muted-foreground italic font-light">No social media links yet.</p>
                </div>
              ) : (
                socials.map((s, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-muted/30 p-3 rounded-2xl border border-border animate-in slide-in-from-top-1">
                    <div className="flex items-center gap-3">
                      <IconPicker selected={s.icon} onChange={(icon) => {
                        const next = [...socials];
                        next[i].icon = icon;
                        setSocials(next);
                      }} />
                    </div>
                    <Input 
                      placeholder="URL (https://...)" 
                      value={s.url} 
                      onChange={(e) => {
                        const next = [...socials];
                        next[i].url = e.target.value;
                        setSocials(next);
                      }}
                      className="flex-1 h-9 bg-background/50"
                    />
                    <button 
                      onClick={() => setSocials(socials.filter((_, idx) => idx !== i))} 
                      className="text-red-500 p-2 hover:bg-red-500/10 self-end sm:self-center rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Assets & Theme Sidebar */}
        <div className="space-y-6 lg:order-3">
          {/* Logo Upload */}
          <div className="bg-card border border-border p-5 md:p-6 rounded-3xl text-center space-y-4 shadow-sm">
            <label className="text-sm font-medium block text-left text-foreground/80">Logo Branding</label>
            <div className="relative group mx-auto w-32 h-32 bg-muted/50 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all hover:border-primary/50">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                  <button onClick={() => handleDeleteImage('logo')} className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">
                    <X size={28} strokeWidth={3} />
                  </button>
                </>
              ) : (
                <ImageIcon className="text-muted-foreground/30" size={40} />
              )}
              {uploading && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
            </div>
            <label className="block">
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" disabled={uploading} />
              <div className="cursor-pointer inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium w-full justify-center border border-primary/20 hover:bg-primary/20 transition-all">
                <Upload size={16} /> {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </div>
            </label>
          </div>

          {/* Favicon Upload */}
          <div className="bg-card border border-border p-5 md:p-6 rounded-3xl text-center space-y-4 shadow-sm">
            <label className="text-sm font-medium block text-left text-foreground/80">Favicon (Browser Icon)</label>
            <div className="relative group mx-auto w-16 h-16 bg-muted/50 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all hover:border-primary/50">
              {faviconUrl ? (
                <>
                  <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                  <button onClick={() => handleDeleteImage('favicon')} className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">
                    <X size={20} strokeWidth={3} />
                  </button>
                </>
              ) : (
                <ImageIcon className="text-muted-foreground/30" size={24} />
              )}
              {uploadingFav && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={16} /></div>}
            </div>
            <label className="block">
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'favicon')} accept="image/*" disabled={uploadingFav} />
              <div className="cursor-pointer inline-flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl text-xs font-medium w-full justify-center border border-border hover:bg-muted/80 transition-all">
                <Upload size={14} /> {faviconUrl ? 'Change Favicon' : 'Upload Favicon'}
              </div>
            </label>
          </div>

          {/* Theme Selector */}
          <div className="bg-card border border-border p-5 md:p-6 rounded-3xl space-y-4 shadow-sm">
            <label className="text-sm font-medium text-foreground/80">Default Mode</label>
            <div className="flex p-1 bg-muted rounded-2xl border border-border/50">
              {(['light', 'dark'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setTheme(m)}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl capitalize transition-all ${
                    theme === m ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Save Button */}
      <div className="sm:hidden order-last pt-4">
        <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 text-lg font-bold transition-all active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
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