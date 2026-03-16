'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      setImageFile(file);
      setError(null);
      setCaption(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCaption = async () => {
    if (!imagePreview) return;
    
    setIsLoading(true);
    setError(null);
    setCaption(null);

    try {
      const res = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imagePreview })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate caption');
      }

      setCaption(data.caption);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setCaption(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      <header className="bg-white border-b border-neutral-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-md">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
              Gemini Vision
            </h1>
          </div>
          <div className="text-sm font-medium text-neutral-500">
            Image Caption Generator
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4">
            See the unseen with AI
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-neutral-500">
            Upload any image and let Google's Gemini Vision AI analyze it to generate a rich, detailed, and completely unique caption.
          </p>
        </div>

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Upload Area */}
          <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden transform transition-all hover:shadow-lg">
            {!imagePreview ? (
              <div 
                className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[28rem] cursor-pointer group hover:bg-neutral-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                  <Upload size={32} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Upload Image</h3>
                <p className="text-sm text-neutral-500 mb-6">Click to browse or drag & drop</p>
                <p className="text-xs text-neutral-400 font-medium px-4 py-2 bg-neutral-100 rounded-full">Supports JPG, PNG, WEBP</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-[28rem]">
                <div className="relative flex-1 bg-neutral-100 overflow-hidden group">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="bg-white/90 text-neutral-900 px-6 py-3 rounded-full font-bold shadow-lg flex items-center space-x-2 hover:bg-white hover:scale-105 transition-all"
                     >
                       <RefreshCw size={18} />
                       <span>Change Image</span>
                     </button>
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-neutral-100">
                  <button
                    onClick={generateCaption}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Analyzing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Generate Caption</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Result Area */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col h-[28rem]">
            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 flex items-center space-x-2">
                <ImageIcon size={18} className="text-indigo-500" />
                <span>AI Output</span>
              </h3>
              {caption && (
                <button 
                  onClick={resetState}
                  className="text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors uppercase tracking-wider"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
              {error ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100">
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              ) : caption ? (
                <div className="animate-fade-in flex flex-col h-full">
                  <div className="prose prose-purple prose-lg max-w-none text-neutral-700">
                    <p className="whitespace-pre-line leading-relaxed">{caption}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                  <div className="bg-neutral-50 p-6 rounded-full border border-neutral-100">
                    <Sparkles size={32} strokeWidth={1.5} className="text-neutral-300" />
                  </div>
                  <p className="font-medium text-center">
                    {isLoading ? "Gemini is looking at your image..." : "Your generated caption will appear here."}
                  </p>
                </div>
              )}
            </div>
            
            {caption && (
               <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex gap-2">
                 <button 
                   onClick={() => navigator.clipboard.writeText(caption)}
                   className="flex-1 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
                 >
                   Copy Text
                 </button>
                 <button 
                   onClick={generateCaption}
                   className="flex-[2] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center space-x-2 py-3 rounded-xl transition-colors"
                 >
                   <RefreshCw size={16} />
                   <span>Regenerate</span>
                 </button>
               </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
