import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  }, [onFileSelect]);

  const validateAndPassFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    // Optional: Max size check (32MB is ImgBB limit)
    if (file.size > 32 * 1024 * 1024) {
      alert("File is too large (Max 32MB).");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div
      className={`relative group cursor-pointer w-full min-h-[300px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 ease-out overflow-hidden
        ${isDragging 
          ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]' 
          : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-400/50 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-blue-900/10'
        }
      `}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 ${isDragging || 'group-hover:opacity-100'}`} />
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        title=""
      />
      
      <div className="relative z-0 flex flex-col items-center justify-center p-8 text-center transition-transform duration-300 group-hover:scale-105">
        <div className={`
          relative w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isDragging 
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 rotate-3 scale-110' 
            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-700 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:-rotate-3 shadow-md dark:shadow-none'
          }
        `}>
          {isDragging ? <UploadCloud size={40} className="animate-bounce" /> : <ImageIcon size={40} />}
          
          {/* Decorative dots */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity delay-100" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-500 rounded-full border-2 border-white dark:border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity delay-200" />
        </div>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">
          {isDragging ? "Drop it like it's hot" : "Upload an image"}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-xs leading-relaxed mb-6 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          Drag and drop your file here, or click to browse from your device.
        </p>

        <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wide opacity-70 group-hover:opacity-100 transition-opacity">
           <span className="bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded">JPG</span>
           <span className="bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded">PNG</span>
           <span className="bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded">GIF</span>
           <span className="bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded">WEBP</span>
        </div>
      </div>
    </div>
  );
};