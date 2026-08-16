import { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { uploadImage } from '@/lib/supabase';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string | null;
  folder: string;
  label?: string;
}

export function ImageUpload({ onUpload, currentUrl, folder, label = 'Upload Image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleFile = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file, folder);
    setUploading(false);
    if (url) { setPreview(url); onUpload(url); }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
      {preview ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => { setPreview(null); onUpload(''); if (inputRef.current) inputRef.current.value = ''; }} className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-slate-500 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-colors">
          {uploading ? (<><Loader2 size={24} className="animate-spin" /><span className="text-sm font-medium">Uploading...</span></>) : (<><Upload size={24} /><span className="text-sm font-medium">Click to upload</span></>)}
        </button>
      )}
    </div>
  );
}
