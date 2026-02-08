import { useState, useEffect, type ChangeEvent, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import AdminBannerEditor from '../../components/dashboard/AdminBannerEditor';
import { useNotification } from '../../hooks/useNotification';
import { 
  Plus, 
  Search,
  ExternalLink, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Loader2, 
  X,
  Upload,
  Save,
  ChevronLeft,
  ChevronRight,
  Layout,
  Tag
} from 'lucide-react';
import { clsx } from 'clsx';

interface Portfolio {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image_url: string;
  project_url: string;
}

export default function PortfolioAdmin() {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<Portfolio[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showCategoryRecs, setShowCategoryRecs] = useState(false);
  const [showTagRecs, setShowTagRecs] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Banner State
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');

  // Form State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');

  useEffect(() => {
    fetchPortfolios();
    fetchBanner();
  }, []);

  const suggestions = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
    const filteredCategories = uniqueCategories.filter(cat => 
      cat.toLowerCase().startsWith(category.toLowerCase()) && 
      cat.toLowerCase() !== category.toLowerCase()
    );

    const allTags = items.flatMap(i => i.tags || []);
    const uniqueTags = Array.from(new Set(allTags)).filter(Boolean);
    
    const tagList = tags.split(',').map(t => t.trim());
    const lastTagInput = tagList[tagList.length - 1] || '';
    
    const filteredTags = uniqueTags.filter(t => 
      t.toLowerCase().startsWith(lastTagInput.toLowerCase()) && 
      !tagList.slice(0, -1).includes(t) && 
      t.toLowerCase() !== lastTagInput.toLowerCase()
    );

    return { 
      categories: filteredCategories, 
      tags: filteredTags 
    };
  }, [items, category, tags]);

  const handleTagSelect = (selectedTag: string) => {
    const tagList = tags.split(',').map(t => t.trim()).filter(t => t !== "");
    tagList[tagList.length - 1] = selectedTag;
    setTags(tagList.join(', ') + ', ');
    setShowTagRecs(false);
  };

  const fetchBanner = async () => {
    const { data } = await supabase
      .from('landing_settings')
      .select('banner_url, banner_title, banner_description')
      .single();
    
    if (data) {
      setBannerUrl(data.banner_url || '');
      setBannerTitle(data.banner_title || '');
      setBannerDescription(data.banner_description || '');
    }
  };

  const fetchPortfolios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) setItems(data);
    setLoading(false);
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentDisplayItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleFileUpload = async (source: ChangeEvent<HTMLInputElement> | File, type: 'project' | 'banner') => {
    try {
      setUploading(true);
      let file: File;

      if (source instanceof File) {
        file = source;
      } else {
        if (!source.target.files || source.target.files.length === 0) return;
        file = source.target.files[0];
      }

      const folder = type === 'banner' ? 'banner' : 'portfolio';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;

      const { error: uploadError } = await supabase.storage.from('assets').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(fileName);
      
      if (type === 'banner') {
        setBannerUrl(data.publicUrl);
        showNotification("Banner image uploaded", "success");
      } else {
        setImageUrl(data.publicUrl);
        showNotification("Project image uploaded", "success");
      }
    } catch {
      showNotification("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBannerImage = async () => {
    if (!bannerUrl) return;
    try {
      setUploading(true);
      const path = bannerUrl.split('/storage/v1/object/public/assets/')[1];
      if (path) await supabase.storage.from('assets').remove([path]);
      setBannerUrl('');
      showNotification("Banner image removed", "info");
    } catch {
      showNotification("Failed to delete banner file", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageUrl) return;
    try {
      setUploading(true);
      const path = imageUrl.split('/storage/v1/object/public/assets/')[1];
      if (path) await supabase.storage.from('assets').remove([path]);
      setImageUrl('');
      showNotification("Image removed", "info");
    } catch {
      showNotification("Failed to delete image", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title, description, category,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ""),
      image_url: imageUrl, project_url: projectUrl
    };

    const { error } = currentId 
      ? await supabase.from('portfolios').update(payload).eq('id', currentId)
      : await supabase.from('portfolios').insert([payload]);

    if (!error) { 
      closeModal(); 
      fetchPortfolios(); 
      showNotification(`Project ${currentId ? 'updated' : 'created'} successfully!`, "success");
    } else { 
      showNotification(error.message, "error"); 
    }
    setLoading(false);
  };

  const saveBanner = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('landing_settings').upsert({ 
        id: 1, 
        banner_url: bannerUrl,
        banner_title: bannerTitle,
        banner_description: bannerDescription
      });
      
      if (!error) {
        setIsBannerModalOpen(false);
        showNotification("Banner updated successfully!", "success");
      } else {
        showNotification(error.message, "error");
      }
    } catch {
      showNotification("Failed to save banner", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: Portfolio) => {
    if (confirm(`Delete "${item.title}"?`)) {
      try {
        setLoading(true);
        if (item.image_url) {
          const path = item.image_url.split('/storage/v1/object/public/assets/')[1];
          if (path) await supabase.storage.from('assets').remove([path]);
        }
        await supabase.from('portfolios').delete().eq('id', item.id);
        fetchPortfolios();
        showNotification("Project deleted", "info");
      } catch {
        showNotification("Delete failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const openModal = (item?: Portfolio) => {
    if (item) {
      setCurrentId(item.id); setTitle(item.title || '');
      setDescription(item.description || ''); setCategory(item.category || '');
      setTags(item.tags ? item.tags.join(', ') : '');
      setImageUrl(item.image_url || ''); setProjectUrl(item.project_url || '');
    } else {
      setCurrentId(null); setTitle(''); setDescription(''); setCategory(''); setTags(''); setImageUrl(''); setProjectUrl('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCategoryRecs(false);
    setShowTagRecs(false);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio Management</h1>
          <p className="text-muted-foreground text-sm">Organize and showcase your best work.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsBannerModalOpen(true)} 
            className="flex-1 md:flex-none rounded-2xl border-dashed hover:border-primary hover:text-primary transition-all"
          >
            <Layout size={18} className="mr-2" /> Banner
          </Button>
          <Button 
            onClick={() => openModal()} 
            className="flex-1 md:flex-none rounded-2xl shadow-lg shadow-primary/20"
          >
            <Plus size={18} className="mr-2" /> New Project
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          className="pl-10 h-11 rounded-2xl w-full" 
          placeholder="Search projects..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {loading && !isModalOpen && !isBannerModalOpen ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : currentDisplayItems.length > 0 ? (
          currentDisplayItems.map((item) => (
            <div key={item.id} className="group bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground/40"><ImageIcon size={32} /></div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-background/90 backdrop-blur-md text-[10px] uppercase tracking-wider px-3 py-1 border-none shadow-sm">{item.category}</Badge>
                </div>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col">
                <h3 className="font-bold text-base leading-tight truncate">{item.title}</h3>
                <p className="text-muted-foreground text-xs line-clamp-2 flex-1 leading-relaxed">{item.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
                  <div className="flex gap-2">
                    <button onClick={() => openModal(item)} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(item)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </div>
                  {item.project_url && (
                    <a href={item.project_url} target="_blank" rel="noreferrer" className="bg-primary/10 text-primary p-2 rounded-xl hover:bg-primary hover:text-white transition-all">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 text-muted-foreground italic bg-muted/10 border border-dashed border-border rounded-[2rem]">
            No projects found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="rounded-xl h-10 w-10">
            <ChevronLeft size={18} />
          </Button>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)} 
                className={clsx(
                  "w-10 h-10 rounded-xl text-sm font-medium transition-all shrink-0",
                  currentPage === i + 1 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                    : "bg-card border border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="rounded-xl h-10 w-10">
            <ChevronRight size={18} />
          </Button>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsBannerModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminBannerEditor 
              sectionTitle="Portfolio Page Banner"
              bannerUrl={bannerUrl}
              title={bannerTitle}
              description={bannerDescription}
              onUrlChange={setBannerUrl}
              onTitleChange={setBannerTitle}
              onDescChange={setBannerDescription}
              onSave={saveBanner}
              isLoading={loading}
              isUploading={uploading}
              onDeleteImage={handleDeleteBannerImage}
              onClose={() => setIsBannerModalOpen(false)}
              onUploadClick={(droppedFile) => {
                if (droppedFile) {
                  handleFileUpload(droppedFile, 'banner');
                  return;
                }
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (ev: Event) => {
                  const target = ev.target as HTMLInputElement;
                  if (target.files?.[0]) handleFileUpload({ target } as ChangeEvent<HTMLInputElement>, 'banner');
                };
                input.click();
              }}
            />
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div 
            className="bg-card border border-border w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">{currentId ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="App Redesign" className="rounded-xl h-11" />
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold ml-1">Category</label>
                  <Input 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    onFocus={() => setShowCategoryRecs(true)}
                    onBlur={() => setTimeout(() => setShowCategoryRecs(false), 200)}
                    placeholder="e.g. Development" 
                    className="rounded-xl h-11" 
                  />
                  {showCategoryRecs && suggestions.categories.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl p-2 animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-bold text-muted-foreground px-2 pb-1 uppercase tracking-wider">Suggestions</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.categories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => { setCategory(cat); setShowCategoryRecs(false); }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Description</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe the project goals and results..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold ml-1">Tags (comma separated)</label>
                  <Input 
                    value={tags} 
                    onChange={(e) => setTags(e.target.value)} 
                    onFocus={() => setShowTagRecs(true)}
                    onBlur={() => setTimeout(() => setShowTagRecs(false), 200)}
                    placeholder="React, Tailwind" 
                    className="rounded-xl h-11" 
                  />
                  {showTagRecs && suggestions.tags.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl p-2 animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-bold text-muted-foreground px-2 pb-1 uppercase tracking-wider">Suggestions</p>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                        {suggestions.tags.map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleTagSelect(t)}
                            className="text-xs px-2 py-1 rounded-md bg-muted border border-border hover:border-primary flex items-center gap-1 transition-all"
                          >
                            <Tag size={10} /> {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Live Project Link</label>
                  <Input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://..." className="rounded-xl h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Project Thumbnail</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative group w-full sm:w-32 aspect-video sm:aspect-square bg-muted rounded-2xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      <>
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={handleDeleteImage} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={24} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="text-muted-foreground/30" size={32} />
                    )}
                  </div>
                  <label className="w-full flex-1 group">
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'project')} accept="image/*" disabled={uploading} />
                    <div className="w-full h-14 cursor-pointer flex items-center justify-center gap-2 bg-muted border border-border rounded-2xl text-sm font-bold transition-all group-hover:bg-primary/5 group-hover:border-primary/50">
                      {uploading ? <Loader2 className="animate-spin text-primary" /> : <><Upload size={18} className="text-muted-foreground" /> Upload Cover Image</>}
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" onClick={closeModal} className="w-full h-12 rounded-2xl order-2 sm:order-1">Cancel</Button>
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl shadow-lg shadow-primary/20 order-1 sm:order-2">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                  {currentId ? 'Save Changes' : 'Create Project'}
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