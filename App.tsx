import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles, Zap, ScanText, Heart, Sun, Moon } from 'lucide-react';
import { UploadBox } from './components/UploadBox';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { ResultCard } from './components/ResultCard';
import { TextResult } from './components/TextResult';
import { uploadToImgBB } from './services/imgbbService';
import { extractTextFromImage } from './services/geminiService';
import { ImgBBResponse, UploadStatus } from './types';
import { EXPIRATION_OPTIONS } from './constants';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Form State
  const [imageName, setImageName] = useState('');
  const [expiration, setExpiration] = useState<number>(0);
  
  // Result Data
  const [result, setResult] = useState<ImgBBResponse['data'] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Text Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  
  // Theme Toggle Logic
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Cleanup preview URL to prevent memory leaks
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setImageName(nameWithoutExt);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus(UploadStatus.SELECTING);
    setErrorMsg(null);
    setExtractedText(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus(UploadStatus.UPLOADING);
    setErrorMsg(null);

    try {
      const response = await uploadToImgBB(
        selectedFile, 
        { 
          name: imageName, 
          expiration: expiration 
        }
      );

      setResult(response.data);
      setStatus(UploadStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setStatus(UploadStatus.ERROR);
    }
  };

  const handleExtractText = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setErrorMsg(null);

    try {
      const text = await extractTextFromImage(selectedFile);
      setExtractedText(text);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to extract text from image. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setExtractedText(null);
    setImageName('');
    setStatus(UploadStatus.IDLE);
    setErrorMsg(null);
  };

  const handleBackFromText = () => {
    setExtractedText(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out flex flex-col relative overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200' : 'bg-cream-50 text-slate-800 selection:bg-blue-200 selection:text-blue-900'}`}>
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {theme === 'dark' ? (
          <>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-blob"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
          </>
        ) : (
          <>
            <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
            <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
            <div className="absolute -bottom-20 left-20 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply"></div>
          </>
        )}
      </div>

      {/* Header */}
      <header className={`sticky top-0 w-full z-50 transition-all duration-300 border-b ${theme === 'dark' ? 'bg-slate-950/70 border-white/5' : 'bg-white/70 border-slate-200/50'} backdrop-blur-xl`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleReset}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-200 group-hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20' : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/20'}`}>
              <Upload className="w-5 h-5" />
            </div>
            <span className={`text-xl font-bold bg-clip-text text-transparent ${theme === 'dark' ? 'bg-gradient-to-r from-white to-slate-400' : 'bg-gradient-to-r from-slate-900 to-slate-600'}`}>
              ImgShare
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className={`hidden sm:flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full border backdrop-blur-md ${theme === 'dark' ? 'text-slate-400 bg-white/5 border-white/5' : 'text-slate-600 bg-white/50 border-slate-200'}`}>
                <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
                <span>Lightning Fast</span>
             </div>

             <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-200 ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-8 pb-20 px-4 sm:px-6 relative z-10">
        <div className="w-full max-w-xl">
          
          {/* View: Idle / Selecting / Error */}
          {(status === UploadStatus.IDLE || status === UploadStatus.SELECTING || status === UploadStatus.ERROR) && !result && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Branding */}
              {status === UploadStatus.IDLE && (
                <div className="text-center py-10 sm:py-16">
                  <h1 className={`text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Share Images <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                       In Seconds
                    </span>
                  </h1>
                  <p className={`text-lg max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Professional grade image hosting with instant direct links and smart text extraction.
                  </p>
                </div>
              )}

              {/* Upload Interface */}
              <div className="relative">
                {selectedFile && previewUrl ? (
                  extractedText ? (
                    <TextResult text={extractedText} onBack={handleBackFromText} />
                  ) : (
                    <div className={`rounded-3xl border overflow-hidden shadow-2xl animate-fade-in-up ring-1 ${theme === 'dark' ? 'bg-slate-900/60 border-white/10 ring-white/5 backdrop-blur-md' : 'bg-white/80 border-white ring-slate-900/5 backdrop-blur-xl shadow-slate-200/50'}`}>
                       {/* Preview Header */}
                       <div className={`relative h-64 flex items-center justify-center p-6 border-b ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                          <div className={`absolute inset-0 opacity-20 ${theme === 'dark' ? 'bg-[radial-gradient(#ffffff0a_1px,transparent_1px)]' : 'bg-[radial-gradient(#0000000a_1px,transparent_1px)]'} [background-size:16px_16px]`}></div>
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg relative z-10" 
                          />
                          <button 
                            onClick={handleReset}
                            className={`absolute top-4 right-4 p-2.5 rounded-full transition-all backdrop-blur-md border ${theme === 'dark' ? 'bg-black/40 text-white border-white/10 hover:bg-red-500/80' : 'bg-white/60 text-slate-600 border-white hover:bg-red-50 hover:text-red-600 shadow-sm'}`}
                            title="Remove image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                       </div>
                       
                       {/* Configuration Form */}
                       <div className="p-6 sm:p-8 space-y-6">
                          <div className={`flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-lg w-fit border ${theme === 'dark' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                            <Sparkles className="w-4 h-4" />
                            <span>Customize your upload</span>
                          </div>

                          <div className="space-y-5">
                            <Input 
                              label="Image Title"
                              value={imageName}
                              onChange={(e) => setImageName(e.target.value)}
                              placeholder="Enter a title for your image"
                            />

                            <div className="w-full">
                              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                Auto Expire
                              </label>
                              <div className="relative">
                                <select
                                  className={`w-full pl-3 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                                  value={expiration}
                                  onChange={(e) => setExpiration(Number(e.target.value))}
                                >
                                  {EXPIRATION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          {status === UploadStatus.ERROR && errorMsg && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-sm flex items-start animate-shake">
                               <div className="mr-3 mt-0.5">⚠️</div>
                               {errorMsg}
                            </div>
                          )}

                          <div className="pt-2 space-y-3">
                             <Button 
                               onClick={handleUpload} 
                               className="w-full h-14 text-lg font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                               isLoading={status === UploadStatus.UPLOADING}
                               disabled={isExtracting}
                             >
                                {status === UploadStatus.UPLOADING ? 'Uploading...' : 'Get Direct Link'}
                             </Button>

                             <Button 
                               onClick={handleExtractText}
                               variant="ghost"
                               className={`w-full h-12 border border-dashed transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-white border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5' : 'text-slate-500 hover:text-slate-800 border-slate-300 hover:border-purple-400 hover:bg-purple-50'}`}
                               isLoading={isExtracting}
                               icon={<ScanText className="w-4 h-4" />}
                               disabled={status === UploadStatus.UPLOADING}
                             >
                               {isExtracting ? 'Analyzing Image...' : 'Extract Text from Image'}
                             </Button>
                          </div>
                       </div>
                    </div>
                  )
                ) : (
                  <UploadBox onFileSelect={handleFileSelect} />
                )}
              </div>
            </div>
          )}

          {/* View: Success */}
          {status === UploadStatus.SUCCESS && result && (
             <div className="animate-fade-in-up w-full">
                <div className="flex items-center justify-center mb-8">
                   <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-6 py-2 rounded-full flex items-center border border-green-500/20 text-sm font-semibold shadow-lg shadow-green-500/10">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Upload Complete
                   </div>
                </div>
                <ResultCard data={result} onReset={handleReset} />
             </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full border-t py-8 mt-auto z-10 relative transition-colors ${theme === 'dark' ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200/50'} backdrop-blur-lg`}>
         <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
            <div className={`flex items-center space-x-1.5 px-4 py-2 rounded-full border transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/10 text-slate-500' : 'bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-600'}`}>
              <span>Created by</span>
              <a 
                href="https://cktd-devs.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 transition-colors font-medium hover:underline decoration-blue-500/30 underline-offset-4"
              >
                CKTD Devs
              </a>
              <span className="flex items-center ml-1">
                 with <Heart className="w-3.5 h-3.5 mx-1.5 text-red-500 fill-red-500 animate-pulse" />
              </span>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default App;