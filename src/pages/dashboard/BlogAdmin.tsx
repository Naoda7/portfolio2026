import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BlogEditor } from '../../components/dashboard/BlogEditor';
import AdminBannerEditor from '../../components/dashboard/AdminBannerEditor';
import { useNotification } from '../../hooks/useNotification';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2, 
  Save, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Layout 
} from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  banner_url: string;
  created_at: string;
}

export default function BlogAdmin() {
  const { showNotification } = useNotification();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPageBannerModalOpen, setIsPageBannerModalOpen] = useState(false);
  
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  
  const [pageBannerUrl, setPageBannerUrl] = useState('');
  const [pageBannerTitle, setPageBannerTitle] = useState('');
  const [pageBannerDescription, setPageBannerDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBlogs();
    fetchPageBanner();
  }, []);

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) setBlogs(data);
  };

  const fetchPageBanner = async () => {
    const { data } = await supabase
      .from('landing_settings')
      .select('blog_banner_url, blog_banner_title, blog_banner_description')
      .eq('id', 1)
      .single();
    if (data) {
      setPageBannerUrl(data.blog_banner_url || '');
      setPageBannerTitle(data.blog_banner_title || '');
      setPageBannerDescription(data.blog_banner_description || '');
    }
  };

  const handleFileUpload = async (source: ChangeEvent<HTMLInputElement> | File, target: 'article' | 'page') => {
    try {
      setUploading(true);
      let file: File;
      if (source instanceof File) {
        file = source;
      } else {
        const selectedFile = source.target.files?.[0];
        if (!selectedFile) return;
        file = selectedFile;
      }

      const folder = target === 'page' ? 'banner' : 'blog';
      const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      
      if (target === 'page') {
        setPageBannerUrl(data.publicUrl);
        showNotification("Blog banner uploaded", "success");
      } else {
        setBannerUrl(data.publicUrl);
        showNotification("Article thumbnail uploaded", "success");
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Upload failed', "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (url: string, setUrlState: (val: string) => void) => {
    if (!url) return;
    try {
      setUploading(true);
      const path = url.split('/storage/v1/object/public/assets/')[1];
      if (path) await supabase.storage.from('assets').remove([path]);
      setUrlState('');
      showNotification("Image removed", "info");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Storage cleanup failed', "error");
    } finally {
      setUploading(false);
    }
  };

  const savePageBanner = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('landing_settings')
        .upsert({ 
          id: 1, 
          blog_banner_url: pageBannerUrl,
          blog_banner_title: pageBannerTitle,
          blog_banner_description: pageBannerDescription
        });
      
      if (!error) {
        setIsPageBannerModalOpen(false);
        showNotification("Blog page appearance updated!", "success");
      } else {
        throw error;
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      const payload = { title, slug, content, banner_url: bannerUrl };

      const { error } = currentId 
        ? await supabase.from('blogs').update(payload).eq('id', currentId)
        : await supabase.from('blogs').insert([payload]);

      if (error) throw error;
      
      setIsModalOpen(false);
      fetchBlogs();
      showNotification(`Article ${currentId ? 'updated' : 'published'} successfully!`, "success");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to save article', "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blog: Blog) => {
    if (!confirm(`Delete article "${blog.title}"?`)) return;
    setLoading(true);
    try {
      if (blog.banner_url) {
        const path = blog.banner_url.split('/storage/v1/object/public/assets/')[1];
        if (path) await supabase.storage.from('assets').remove([path]);
      }
      await supabase.from('blogs').delete().eq('id', blog.id);
      fetchBlogs();
      showNotification("Article deleted", "info");
    } catch {
      showNotification("Failed to delete article", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Management</h1>
          <p className="text-sm text-muted-foreground">Manage articles and blog page appearance.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsPageBannerModalOpen(true)} 
            className="rounded-2xl border-dashed flex-1 md:flex-none transition-all hover:border-primary hover:text-primary"
          >
            <Layout size={18} className="mr-2" /> Banner
          </Button>
          <Button 
            onClick={() => { 
              setCurrentId(null); setTitle(''); setContent(''); setBannerUrl('');
              setIsModalOpen(true); 
            }} 
            className="rounded-2xl flex-1 md:flex-none shadow-lg shadow-primary/20"
          >
            <Plus size={18} className="mr-2" /> Write
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-[2rem] border border-dashed border-border">
            <p className="text-muted-foreground italic">No articles published yet.</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div key={blog.id} className="flex items-center gap-4 bg-card border border-border p-3 md:p-4 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="h-16 w-16 md:w-24 bg-muted rounded-2xl overflow-hidden flex-shrink-0">
                {blog.banner_url ? (
                  <img src={blog.banner_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground/30"><ImageIcon size={24} /></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm md:text-base text-foreground truncate block">
                  {blog.title}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  {new Date(blog.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex gap-1 shrink-0">
                <button onClick={() => {
                  setCurrentId(blog.id); setTitle(blog.title); setContent(blog.content); setBannerUrl(blog.banner_url);
                  setIsModalOpen(true);
                }} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => deleteBlog(blog)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isPageBannerModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl relative">
            <AdminBannerEditor 
              sectionTitle="Blog Page Appearance"
              bannerUrl={pageBannerUrl}
              title={pageBannerTitle}
              description={pageBannerDescription}
              onUrlChange={setPageBannerUrl}
              onTitleChange={setPageBannerTitle}
              onDescChange={setPageBannerDescription}
              onSave={savePageBanner}
              isLoading={loading}
              isUploading={uploading}
              onDeleteImage={() => handleDeleteImage(pageBannerUrl, setPageBannerUrl)}
              onClose={() => setIsPageBannerModalOpen(false)}
              onUploadClick={(droppedFile) => {
                if (droppedFile) {
                  handleFileUpload(droppedFile, 'page');
                  return;
                }
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (ev: Event) => {
                  const target = ev.target as HTMLInputElement;
                  if (target.files?.[0]) handleFileUpload({ target } as ChangeEvent<HTMLInputElement>, 'page');
                };
                input.click();
              }}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-4xl rounded-[2rem] shadow-2xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 md:p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">{currentId ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Article title..." className="rounded-xl h-11" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Thumbnail Banner</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative group w-full md:w-48 h-32 bg-muted rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    {bannerUrl ? (
                      <>
                        <img src={bannerUrl} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => handleDeleteImage(bannerUrl, setBannerUrl)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={24} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="text-muted-foreground/30" size={32} />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'article')} accept="image/*" disabled={uploading} />
                    <div className="h-full min-h-[80px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center hover:bg-muted/50 transition-all gap-2 p-4">
                      {uploading ? <Loader2 className="animate-spin text-primary" /> : (
                        <>
                          <Upload size={20} className="text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Tap to upload article banner</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Content Editor</label>
                <div className="min-h-[300px] border border-border rounded-2xl overflow-hidden">
                  <BlogEditor content={content} onChange={setContent} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="w-full h-12 rounded-2xl order-2 sm:order-1">Cancel</Button>
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl shadow-lg shadow-primary/20 order-1 sm:order-2">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <><Save size={18} className="mr-2" /> Publish Now</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.15); border-radius: 10px; }
      `}} />
    </div>
  );
}