import { useState } from 'react';
import { Trash2, Upload, Loader2, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be smaller than 4 MB.');
      return;
    }
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('You need to be logged in to upload images.');
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('food-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('food-images').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-gray-200">
        <img src={value} alt="Food preview" className="h-44 w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-red-600 shadow hover:bg-white"
          aria-label="Remove image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-colors hover:border-primary-400 hover:bg-primary-50/50 ${
          disabled ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        ) : (
          <>
            <ImageIcon className="h-6 w-6 text-primary-600" />
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Upload a photo (max 4 MB)
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </label>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
