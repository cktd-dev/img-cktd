import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles, Zap, ScanText, Heart, Sun, Moon, Wand2, Download, ArrowRight } from 'lucide-react';
import { UploadBox } from './components/UploadBox';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { ResultCard } from './components/ResultCard';
import { TextResult } from './components/TextResult';
import { uploadToImgBB } from './services/imgbbService';
import { extractTextFromImage, generateAIImage } from './services/geminiService';
import { ImgBBResponse, UploadStatus } from './types';
import { EXPIRATION_OPTIONS } from './constants';

type AppMode = 'hosting' | 'generation';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mode, setMode] = useState<AppMode>('hosting');
  
  // Hosting State
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [expiration, setExpiration] = useState<number>(0);
  const [result, setResult] = useState<ImgBBResponse['data'] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // OCR State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  // Generation State
  const [prompt, setPrompt] = useState('');
  const [refImage, setRefImage] = useState<File | null>(null);
  const [refPreview, setRefPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  
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
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (refPreview) URL.revokeObjectURL(refPreview);
    };
  }, [previewUrl, refPreview]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- Hosting Handlers ---

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setImageName(nameWithoutExt);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus(UploadStatus.SELECTING);
    setErrorMsg(null);
    setExtractedText(null);
    // Ensure we stay in hosting mode if called from elsewhere
    setMode('hosting');
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

  // --- Generation Handlers ---

  const handleRefImageSelect = (file: File) => {
    setRefImage(file);
    setRefPreview(URL.createObjectURL(file));
  };

  const handleClearRefImage = () => {
    setRefImage(null);
    setRefPreview(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGenError(null);
    setGeneratedImageBase64(null);

    try {
      const base64 = await generateAIImage(prompt, refImage || undefined);
      setGeneratedImageBase64(base64);
    } catch (err: any) {
      setGenError("Failed to generate image. Try a different prompt or reference image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const base64ToFile = (base64: string, filename: string): File => {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: 'image/png' });
  };

  const handleHostGeneratedImage = () => {
    if (!generatedImageBase64) return;
    const file = base64ToFile(generatedImageBase64, `ai-gen-${Date.now()}.png`);
    setMode('hosting');
    handleFileSelect(file);
    // Reset generation state
    setGeneratedImageBase64(null);
    setPrompt('');
    handleClearRefImage();
  };

  const handleDownloadGenerated = () => {
    if (!generatedImageBase64) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${generatedImageBase64}`;
    link.download = `ai-generated-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out flex flex-col relative overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200' : 'bg-cream-50 text-slate-800 selection:bg-blue-200 selection:text-blue-900'}`}>
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {theme === 'dark' ? (
          <>
            <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-blob ${mode === 'generation' ? 'bg-purple-500/10' : ''}`}></div>
            <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000 ${mode === 'generation' ? 'bg-pink-500/10' : ''}`}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
          </>
        ) : (
          <>
            <div className={`absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full blur-[100px] animate-blob mix-blend-multiply ${mode === 'generation' ? 'bg-pink-100/40' : 'bg-orange-100/40'}`}></div>
            <div className={`absolute top-40 right-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply ${mode === 'generation' ? 'bg-purple-100/40' : 'bg-blue-100/40'}`}></div>
            <div className={`absolute -bottom-20 left-20 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply`}></div>
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
      <main className="flex-grow flex flex-col items-center pt-6 pb-20 px-4 sm:px-6 relative z-10 w-full max-w-4xl mx-auto">
        
        {/* Navigation Tabs */}
        {status === UploadStatus.IDLE && (
          <div className="flex p-1 mb-8 space-x-1 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/50 backdrop-blur-sm">
            <button
              onClick={() => setMode('hosting')}
              className={`flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === 'hosting'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Host Image
            </button>
            <button
              onClick={() => setMode('generation')}
              className={`flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === 'generation'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AI Create
            </button>
          </div>
        )}

        {/* Branding (Only show if no active process) */}
        {status === UploadStatus.IDLE && !generatedImageBase64 && (
          <div className="text-center mb-10">
            {mode === 'hosting' ? (
              <>
                <h1 className={`text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Share Images <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                     In Seconds
                  </span>
                </h1>
                <p className={`text-lg max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Professional grade image hosting with instant direct links and smart text extraction.
                </p>
              </>
            ) : (
              <>
                <h1 className={`text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Imagine Reality <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                     With AI
                  </span>
                </h1>
                <p className={`text-lg max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Create stunning visuals or edit existing images using the power of Nano Banana models.
                </p>
              </>
            )}
          </div>
        )}

        {/* MODE: HOSTING */}
        {mode === 'hosting' && (
          <div className="w-full max-w-xl animate-fade-in">
            {/* View: Uploading / Config / Result */}
            {(status === UploadStatus.IDLE || status === UploadStatus.SELECTING || status === UploadStatus.ERROR || status === UploadStatus.UPLOADING) && !result && (
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
        )}

        {/* MODE: GENERATION */}
        {mode === 'generation' && (
          <div className="w-full max-w-2xl animate-fade-in">
            {!generatedImageBase64 ? (
              <div className={`rounded-3xl border overflow-hidden shadow-2xl ring-1 ${theme === 'dark' ? 'bg-slate-900/60 border-white/10 ring-white/5 backdrop-blur-md' : 'bg-white/80 border-white ring-slate-900/5 backdrop-blur-xl shadow-slate-200/50'}`}>
                <div className="p-6 sm:p-8 space-y-6">
                   {/* Prompt Input */}
                   <div>
                     <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        Describe your imagination
                     </label>
                     <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A cyberpunk cat sitting on a neon skyscraper, digital art..."
                        className={`w-full h-32 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                     />
                   </div>
                   
                   {/* Reference Image (Optional) */}
                   <div className="space-y-3">
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                         Reference Image (Optional)
                      </label>
                      {refPreview ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-40 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                          <img src={refPreview} alt="Reference" className="h-full object-contain" />
                          <button 
                            onClick={handleClearRefImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1">
                           <UploadBox onFileSelect={handleRefImageSelect} />
                        </div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upload an image to edit it or use it as a style reference.
                      </p>
                   </div>

                   {genError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 dark:text-red-400 text-sm flex items-start animate-shake">
                         <div className="mr-3 mt-0.5">⚠️</div>
                         {genError}
                      </div>
                   )}

                   <Button 
                     onClick={handleGenerate} 
                     className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-500/20"
                     isLoading={isGenerating}
                     disabled={!prompt.trim()}
                     icon={<Sparkles className="w-5 h-5" />}
                   >
                     {isGenerating ? 'Creating Magic...' : 'Generate Image'}
                   </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in-up">
                 <div className={`rounded-3xl overflow-hidden shadow-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-slate-900 p-1">
                       <img 
                          src={`data:image/png;base64,${generatedImageBase64}`} 
                          alt="Generated" 
                          className="w-full h-auto rounded-2xl"
                       />
                    </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleHostGeneratedImage}
                      className="flex-1 bg-blue-600 hover:bg-blue-500"
                      icon={<Upload className="w-4 h-4" />}
                    >
                      Host & Share Link
                    </Button>
                    <Button 
                      onClick={handleDownloadGenerated}
                      variant="secondary"
                      className="flex-1"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                    <Button 
                      onClick={() => {
                        setGeneratedImageBase64(null);
                        setPrompt('');
                      }}
                      variant="ghost"
                      className="flex-initial"
                    >
                      Create New
                    </Button>
                 </div>
              </div>
            )}
          </div>
        )}

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