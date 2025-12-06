import React, { useState } from 'react';
import { ImgBBResponse } from '../types';
import { Copy, Check, ExternalLink, Code, Link, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultCardProps {
  data: ImgBBResponse['data'];
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onReset }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAllLinks, setShowAllLinks] = useState(false);

  const directLink = data.url;

  const otherLinks = [
    { label: "Viewer Link", value: data.url_viewer, key: 'viewer' },
    { label: "HTML Full", value: `<img src="${data.url}" alt="${data.title}" border="0">`, key: 'html_full' },
    { label: "HTML Thumb", value: `<a href="${data.url_viewer}"><img src="${data.thumb.url}" alt="${data.title}" border="0"></a>`, key: 'html_thumb' },
    { label: "Markdown", value: `![${data.title}](${data.url})`, key: 'markdown' },
    { label: "Markdown Thumb", value: `[![${data.title}](${data.thumb.url})](${data.url_viewer})`, key: 'markdown_thumb' },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Primary Success Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 transition-colors">
        
        {/* Preview Section */}
        <div className="p-1 bg-slate-50 dark:bg-slate-800/50">
           <div className="bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZjhmYWZjIi8+CjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlMmU4ZjAiLz4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI2UyZThmMCIvPgo8L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMGYxNzJhIi8+CjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxZTI5M2IiLz4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzFlMjkzYiIvPgo8L3N2Zz4=')] bg-repeat rounded-xl p-8 flex items-center justify-center min-h-[200px]">
              <img 
                src={data.url} 
                alt="Uploaded" 
                className="max-h-64 max-w-full object-contain shadow-2xl rounded-lg" 
              />
           </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
             <div className="overflow-hidden">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate" title={data.title}>
                  {data.title || "Untitled Image"}
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-3">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">{data.width} × {data.height}</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">{(data.size / 1024).toFixed(1)} KB</span>
                  <span className="uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">{data.image.extension}</span>
                </div>
             </div>
             <button 
                onClick={onReset}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white underline decoration-slate-300 dark:decoration-slate-600 hover:decoration-blue-500 dark:hover:decoration-white transition-all whitespace-nowrap"
              >
                Upload Another
              </button>
          </div>

          {/* Main Direct Link - Highlighted */}
          <div className="mb-6">
             <label className="block text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center">
               <Link className="w-4 h-4 mr-2" />
               Direct Link
             </label>
             <div className="flex shadow-lg shadow-blue-900/5 dark:shadow-blue-900/10 rounded-xl overflow-hidden group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <input 
                  readOnly
                  value={directLink}
                  className="flex-grow bg-slate-50 dark:bg-slate-950 border-0 text-slate-700 dark:text-slate-200 text-sm px-4 py-4 font-mono focus:outline-none"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={() => handleCopy(directLink, 'direct')}
                  className={`px-6 font-medium transition-all duration-200 flex items-center justify-center ${
                    copiedKey === 'direct' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copiedKey === 'direct' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
             </div>
          </div>

          {/* Toggle Other Links */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
             <button 
               onClick={() => setShowAllLinks(!showAllLinks)}
               className="w-full flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-2 group"
             >
               <span className="flex items-center">
                 <Code className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                 {showAllLinks ? 'Hide Embed Codes' : 'Show Embed Codes (HTML, Markdown)'}
               </span>
               {showAllLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
             </button>

             {showAllLinks && (
               <div className="mt-4 space-y-4 animate-fade-in">
                 {otherLinks.map((link) => (
                    <div key={link.key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                        {link.label}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          readOnly
                          value={link.value}
                          className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm rounded-lg pl-3 pr-3 py-2 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 font-mono"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        <button
                          onClick={() => handleCopy(link.value, link.key)}
                          className={`flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                            copiedKey === link.key 
                              ? 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white'
                          }`}
                          title="Copy"
                        >
                          {copiedKey === link.key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};