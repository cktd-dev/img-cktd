import React, { useState } from 'react';
import { Copy, Check, ArrowLeft, ScanText } from 'lucide-react';
import { Button } from './Button';

interface TextResultProps {
  text: string;
  onBack: () => void;
}

export const TextResult: React.FC<TextResultProps> = ({ text, onBack }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none animate-fade-in-up w-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
            <ScanText className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Extracted Text</h2>
        </div>
        <button 
          onClick={onBack}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Upload
        </button>
      </div>

      <div className="p-6">
        <div className="relative group">
          <textarea
            readOnly
            value={text}
            className="w-full h-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent"
          />
          <div className="absolute top-3 right-3">
             <button
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  copied 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
             >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
             </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
           <Button 
             onClick={handleCopy} 
             variant="primary" 
             className="flex-1 bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
           >
             {copied ? 'Copied to Clipboard' : 'Copy All Text'}
           </Button>
           <Button onClick={onBack} variant="secondary">
             Done
           </Button>
        </div>
      </div>
    </div>
  );
};