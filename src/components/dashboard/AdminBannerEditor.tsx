import React, { useCallback, useState } from 'react';
import { X, Loader2, Save, Trash2, CloudUpload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AdminBannerEditorProps {
  sectionTitle: string;
  bannerUrl: string;
  title: string;
  description: string;
  onUrlChange: (val: string) => void;
  onTitleChange: (val: string) => void;
  onDescChange: (val: string) => void;
  onSave: () => void;
  isLoading: boolean;
  isUploading: boolean;
  onDeleteImage: () => void;
  onUploadClick: (file?: File) => void; 
  onClose?: () => void;
}

const AdminBannerEditor = React.memo(({
  sectionTitle,
  bannerUrl,
  title,
  description,
  onTitleChange,
  onDescChange,
  onSave,
  isLoading,
  isUploading,
  onDeleteImage,
  onUploadClick,
  onClose,
}: AdminBannerEditorProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onUploadClick(file); 
      }
    }
  }, [isUploading, onUploadClick]);

  const handleAreaClick = () => {
    if (isDragging || isUploading) return;
    onUploadClick();
  };

  return (
    <div className="bg-card border border-border w-full rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/20">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full" />
          {sectionTitle}
        </h2>
        {onClose && (
          <button 
            onClick={onClose} 
            className="px-3 py-1.5 rounded-xl bg-muted hover:bg-red-500 hover:text-white transition-all text-xs font-bold flex items-center gap-2"
          >
            <X size={16} /> Close
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Input Fields */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
            <Input 
              value={title} 
              onChange={(e) => onTitleChange(e.target.value)} 
              className="rounded-xl h-10 text-sm focus-visible:ring-primary/20" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
            <textarea 
              className="w-full min-h-[70px] max-h-[100px] rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none shadow-sm" 
              value={description} 
              onChange={(e) => onDescChange(e.target.value)}
            />
          </div>
        </div>

        {/* Improved Image Area */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Banner Image</label>
          
          <div 
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleAreaClick}
            className={`
              relative group aspect-[21/8] w-full rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all duration-300
              ${bannerUrl ? 'border-transparent' : 'border-border bg-muted/30'}
              ${isDragging ? 'border-primary bg-primary/10 scale-[0.98]' : 'border-border hover:border-primary/40'}
              ${isUploading ? 'cursor-wait' : 'cursor-pointer active:scale-[0.99]'}
            `}
          >
            {/* Image Preview with overlay */}
            {bannerUrl ? (
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img 
                  src={bannerUrl} 
                  alt="Preview" 
                  className={`w-full h-full object-cover transition-transform duration-700 ${isDragging ? 'scale-90 blur-sm' : 'group-hover:scale-105'}`} 
                />
                <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                   <CloudUpload size={28} className="text-white animate-bounce" />
                   <p className="text-[10px] text-white font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                     {isDragging ? 'Drop to upload' : 'Click or drop image'}
                   </p>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center gap-2 pointer-events-none transition-all ${isDragging ? 'scale-110 text-primary' : 'text-muted-foreground/40'}`}>
                <CloudUpload size={40} strokeWidth={1.5} />
                <p className="text-[10px] font-bold uppercase tracking-tighter">
                  {isDragging ? 'Release Now' : 'Click or Drag & Drop'}
                </p>
              </div>
            )}

            {/* Delete button */}
            {bannerUrl && !isDragging && !isUploading && (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); onDeleteImage(); }}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-xl z-20"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            {/* Global Uploading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-30">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Uploading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button 
            onClick={onSave} 
            disabled={isLoading || isUploading} 
            className="w-full h-11 rounded-xl font-bold uppercase tracking-widest"
          >
            {isLoading ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Save className="mr-2" size={16} />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
});

AdminBannerEditor.displayName = 'AdminBannerEditor';
export default AdminBannerEditor;