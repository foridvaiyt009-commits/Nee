/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Type, 
  Image as ImageIcon, 
  User, 
  Settings, 
  Layout, 
  Trash2, 
  RefreshCcw,
  Facebook,
  Globe,
  Twitter,
  Instagram,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';

// --- Types ---

interface NewsCardState {
  headline: string;
  source: string;
  footerText: string;
  bgImage: string | null;
  reporterImage: string | null;
  logo: string | null;
  templateId: 'classic' | 'quote' | 'minimal';
  style: {
    headlineSize: number;
    headlineColor: string;
    sourceColor: string;
    showAd: boolean;
    adText: string;
  };
  social: {
    facebook: string;
    twitter: string;
    website: string;
  };
}

// --- Constants ---

const INITIAL_STATE: NewsCardState = {
  headline: 'এখানে আপনার সংবাদের শিরোনাম লিখুন',
  source: 'আপনার চ্যানেলের নাম',
  footerText: 'www.yournews.com | facebook.com/yournews',
  bgImage: null,
  reporterImage: null,
  logo: null,
  templateId: 'classic',
  style: {
    headlineSize: 34,
    headlineColor: '#FFFFFF',
    sourceColor: '#FACC15', // Yellow-400
    showAd: false,
    adText: 'বিজ্ঞাপনের জন্য যোগাযোগ করুন: ০১৮০০০০০০০০',
  },
  social: {
    facebook: 'yournews',
    twitter: '@yournews',
    website: 'yournews.com',
  },
};

// --- Components ---

export default function App() {
  const [state, setState] = useState<NewsCardState>(INITIAL_STATE);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'bgImage' | 'reporterImage' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      // Small delay to ensure any pending styles are applied
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2, // Higher quality
      });
      const link = document.createElement('a');
      link.download = `news-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  }, [cardRef]);

  const resetState = () => setState(INITIAL_STATE);

  return (
    <div className="min-h-screen bg-neutral-100 font-sans flex flex-col md:flex-row">
      {/* Sidebar Controls / Order second on mobile */}
      <div className="w-full md:w-96 bg-white border-r border-neutral-200 overflow-y-auto md:max-h-screen p-6 shadow-xl z-20 order-2 md:order-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-600 p-2 rounded-lg text-white shadow-lg shadow-red-200">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">News Card BD</h1>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-semibold">Professional Editor</p>
          </div>
        </div>

        <div className="space-y-8 pb-20 md:pb-0">
          {/* Templates Section */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
              <Layout size={16} /> টেমপ্লেট নির্বাচন করুন
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {(['classic', 'quote', 'minimal'] as const).map(id => (
                <button
                  key={id}
                  onClick={() => setState(p => ({ ...p, templateId: id }))}
                  className={`py-2 px-1 rounded-md text-xs font-medium border transition-all ${
                    state.templateId === id 
                      ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' 
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {id.toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          {/* Media Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
              <ImageIcon size={16} /> ছবি আপলোড করুন
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">ব্যাকগ্রাউন্ড ইমেজ</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'bgImage')} 
                  className="hidden" 
                  id="bg-upload" 
                />
                <label 
                  htmlFor="bg-upload"
                  className="flex items-center justify-center w-full h-24 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-neutral-50 transition-all overflow-hidden relative"
                >
                  {state.bgImage ? (
                    <img src={state.bgImage} alt="Background" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto text-neutral-400 mb-1" size={20} />
                      <span className="text-xs text-neutral-500">ছবি সিলেক্ট করুন</span>
                    </div>
                  )}
                </label>
                {state.bgImage && (
                  <button onClick={() => setState(p => ({ ...p, bgImage: null }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">রিপোর্টার ইমেজ</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'reporterImage')} className="hidden" id="reporter-upload" />
                  <label htmlFor="reporter-upload" className="flex items-center justify-center w-full h-20 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-neutral-50 transition-all overflow-hidden">
                    {state.reporterImage ? (
                      <img src={state.reporterImage} alt="Reporter" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-neutral-400" size={20} />
                    )}
                  </label>
                  {state.reporterImage && (
                    <button onClick={() => setState(p => ({ ...p, reporterImage: null }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">চ্যানেল লোগো</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" id="logo-upload" />
                  <label htmlFor="logo-upload" className="flex items-center justify-center w-full h-20 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-neutral-50 transition-all overflow-hidden">
                    {state.logo ? (
                      <img src={state.logo} alt="Logo" className="h-full object-contain p-2" />
                    ) : (
                      <Plus className="text-neutral-400" size={20} />
                    )}
                  </label>
                  {state.logo && (
                    <button onClick={() => setState(p => ({ ...p, logo: null }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Text Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
              <Type size={16} /> তথ্য লিখুন
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">সংবাদের শিরোনাম (Headline)</label>
              <textarea 
                value={state.headline}
                onChange={(e) => setState(p => ({ ...p, headline: e.target.value }))}
                className="w-full font-bengali p-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm h-24"
                placeholder="শিরোনাম লিখুন..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">উৎসের নাম (Source)</label>
              <input 
                type="text"
                value={state.source}
                onChange={(e) => setState(p => ({ ...p, source: e.target.value }))}
                className="w-full font-bengali p-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="উৎস বা চ্যানেলের নাম..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">ফুটার টেক্সট (Footer)</label>
              <input 
                type="text"
                value={state.footerText}
                onChange={(e) => setState(p => ({ ...p, footerText: e.target.value }))}
                className="w-full p-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="ওয়েবসাইট বা সোশ্যাল মিডিয়া লিঙ্ক..."
              />
            </div>
          </section>

          {/* Customization Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
              <Settings size={16} /> কাস্টমাইজেশন
            </h2>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">ফন্ট সাইজ</label>
              <input 
                type="range" min="20" max="80" 
                value={state.style.headlineSize} 
                onChange={(e) => setState(p => ({ ...p, style: { ...p.style, headlineSize: parseInt(e.target.value) } }))}
                className="accent-red-500"
              />
              <span className="text-xs text-neutral-500 w-8">{state.style.headlineSize}</span>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">শিরোনাম রঙ</label>
              <input 
                type="color" 
                value={state.style.headlineColor}
                onChange={(e) => setState(p => ({ ...p, style: { ...p.style, headlineColor: e.target.value } }))}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={state.style.showAd}
                  onChange={(e) => setState(p => ({ ...p, style: { ...p.style, showAd: e.target.checked } }))}
                  className="rounded text-red-500 border-neutral-300 focus:ring-red-500"
                />
                <span className="text-sm text-neutral-700">বিজ্ঞাপন এরিয়া দেখান</span>
              </label>
              
              {state.style.showAd && (
                <input 
                  type="text"
                  value={state.style.adText}
                  onChange={(e) => setState(p => ({ ...p, style: { ...p.style, adText: e.target.value } }))}
                  className="w-full text-xs p-2 rounded border border-neutral-200"
                  placeholder="বিজ্ঞাপন টেক্সট..."
                />
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="pt-6 space-y-3">
            <button 
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg border-b-4 border-red-800 active:transform active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={20} /> {isExporting ? 'তৈরি হচ্ছে...' : 'কার্ড ডাউনলোড করুন'}
            </button>
            <button 
              onClick={resetState}
              className="w-full bg-neutral-100 text-neutral-600 font-medium py-3 rounded-xl border border-neutral-200 hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} /> রিসেট করুন
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-neutral-200 flex items-start justify-center p-4 md:p-12 order-1 md:order-2">
        <div className="sticky top-12 w-full max-w-[600px] flex flex-col items-center">
          <div className="w-full mb-4 flex justify-between items-center text-neutral-500 font-medium text-sm">
            <div className="flex items-center gap-2">
              <Layout size={16} />
              <span>Preview (1:1 Aspect Ratio)</span>
            </div>
            <div className="px-3 py-1 bg-white rounded-full border border-neutral-300 text-xs shadow-sm">
              HD Export Enabled
            </div>
          </div>

          {/* The Actual News Card */}
          <div 
            ref={cardRef}
            className="w-full aspect-square bg-neutral-900 shadow-2xl relative overflow-hidden select-none"
            id="news-card-capture"
            style={{ width: '100%', maxWidth: '600px' }}
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={state.templateId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                {/* 1. Background Layer */}
                {state.bgImage ? (
                  <img src={state.bgImage} alt="Background" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-700 flex flex-col items-center justify-center p-12 text-center">
                    <ImageIcon size={64} className="text-neutral-600 mb-4 opacity-50" />
                    <p className="text-neutral-500 font-bengali text-lg">অনুগ্রহ করে একটি ব্যাকগ্রাউন্ড ছবি যোগ করুন</p>
                  </div>
                )}

                {/* 2. Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* 3. Logo (Top Right or Top Left depending on template) */}
                {state.logo && (
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`absolute top-6 ${state.templateId === 'minimal' ? 'left-6' : 'right-6'} w-24 h-24 flex items-center justify-center`}
                  >
                    <img src={state.logo} alt="Logo" className="max-w-full max-h-full drop-shadow-lg" />
                  </motion.div>
                )}

                {/* 4. Template Specific Overlays */}
                
                {/* Classic Template: Centered Reporter Overlay */}
                {state.templateId === 'classic' && state.reporterImage && (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="absolute left-6 bottom-44 w-32 h-32 border-4 border-red-600 rounded-lg overflow-hidden shadow-2xl z-10"
                  >
                    <img src={state.reporterImage} alt="Reporter" className="w-full h-full object-cover" />
                  </motion.div>
                )}

                {/* Quote Template: Masked Reporter on Left */}
                {state.templateId === 'quote' && state.reporterImage && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-y-0 left-0 w-1/3 z-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    <img src={state.reporterImage} alt="Reporter" className="w-full h-full object-cover grayscale brightness-75" />
                  </motion.div>
                )}

                {/* 5. Main Content Area */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                  {/* Breaking News Ribbon - Smaller & Left Aligned */}
                  <div className="bg-red-600 py-1 px-3 inline-block ml-0 mb-0 relative z-30 shadow-lg">
                    <span className="font-bengali font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                       ব্রেকিং নিউজ
                    </span>
                  </div>

                  {/* Headline Box - Compact (approx 35% height) */}
                  <div className="bg-red-700/95 backdrop-blur-md p-4 ml-0 mr-0 shadow-2xl flex flex-col justify-center border-t border-red-500/50">
                    <h2 
                      className="font-bengali leading-[1.2] text-left"
                      style={{ 
                        fontSize: `${state.style.headlineSize}px`,
                        color: state.style.headlineColor,
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                      }}
                    >
                      {state.headline}
                    </h2>
                    
                    {/* Source Text - Compact */}
                    <div className="mt-2 flex items-center gap-2">
                      <span 
                        className="font-bengali text-sm font-bold opacity-90"
                        style={{ color: state.style.sourceColor }}
                      >
                        {state.source}
                      </span>
                    </div>
                  </div>

                  {/* Footer Bar - Thin and Small */}
                  <div className="bg-black/90 text-neutral-300 py-1.5 px-4 flex items-center justify-between border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-80">
                      <Globe size={10} className="text-red-500" />
                      <span>{state.footerText}</span>
                    </div>
                    <div className="flex items-center gap-2.5 opacity-70">
                      <Facebook size={12} />
                      <Twitter size={12} />
                      <Instagram size={12} />
                    </div>
                  </div>

                  {/* Ad Banner */}
                  {state.style.showAd && (
                    <div className="bg-yellow-400 text-black text-center py-1.5 px-4 font-bold text-[10px] uppercase tracking-tighter overflow-hidden whitespace-nowrap">
                       AD: {state.style.adText}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-6 text-neutral-500 text-xs text-center max-w-sm">
            সেরা কোয়ালিটির জন্য ৫০০x৫০০ বা তার বেশি রেজোলিউশনের ছবি ব্যবহার করুন। ডাউনলোডের সময় আপনার পিসিতে বা মোবাইলে সেভ করতে ক্লিক করুন।
          </p>
        </div>
      </div>

      {/* Mobile Export FAB */}
      <button 
        onClick={handleDownload}
        disabled={isExporting}
        className="fixed bottom-6 right-6 md:hidden bg-red-600 text-white p-4 rounded-full shadow-2xl z-50 border-4 border-white flex items-center gap-2"
      >
        <Download size={24} />
      </button>
    </div>
  );
}
