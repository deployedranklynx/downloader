import React, { useState } from 'react';
import {
  Link2,
  ClipboardPaste,
  ArrowRight,
  Loader2,
  Zap,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { PlatformConfig, PlatformId } from '../types';
import { parsePlatformFromUrl } from '../utils/downloadEngine';

interface UrlInputCardProps {
  currentPlatform: PlatformConfig;
  url: string;
  setUrl: (url: string) => void;
  onPlatformDetected: (platform: PlatformId) => void;
  onAnalyze: (urlToAnalyze: string) => void;
  isLoading: boolean;
  turboEnabled: boolean;
  setTurboEnabled: (val: boolean) => void;
}

export const UrlInputCard: React.FC<UrlInputCardProps> = ({
  currentPlatform,
  url,
  setUrl,
  onPlatformDetected,
  onAnalyze,
  isLoading,
  turboEnabled,
  setTurboEnabled,
}) => {
  const [inputError, setInputError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    setInputError(null);

    if (val.trim()) {
      const detected = parsePlatformFromUrl(val);
      onPlatformDetected(detected);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        const detected = parsePlatformFromUrl(text);
        onPlatformDetected(detected);
        setInputError(null);
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setInputError('Please paste or enter a valid video, post or file URL');
      return;
    }
    onAnalyze(url.trim());
  };

  const handleUseSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setInputError(null);
    onAnalyze(sampleUrl);
  };

  return (
    <div
      className={`w-full rounded-2xl p-4 sm:p-6 transition-all duration-500 border backdrop-blur-xl ${currentPlatform.theme.cardBg} ${currentPlatform.theme.glow}`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {currentPlatform.name} Downloader
            </h2>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${currentPlatform.theme.badgeBg}`}
            >
              {currentPlatform.badge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {currentPlatform.tagline}
          </p>
        </div>

        {/* Turbo Mode accelerator switch */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Zap className={`w-3.5 h-3.5 ${turboEnabled ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
            <span>16x Multi-Thread Turbo</span>
          </div>
          <button
            type="button"
            id="toggle-turbo-mode"
            onClick={() => setTurboEnabled(!turboEnabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              turboEnabled ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                turboEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-5 h-5" />
            </div>
            <input
              id="input-media-url"
              type="text"
              value={url}
              onChange={handleInputChange}
              placeholder={currentPlatform.placeholder}
              className={`w-full pl-11 pr-24 py-3.5 bg-slate-900/90 text-white placeholder-slate-500 text-sm rounded-xl border transition-all duration-300 focus:outline-none ${currentPlatform.theme.borderAccent}`}
            />
            {/* Quick Paste Button inside input */}
            <button
              type="button"
              id="btn-paste-clipboard"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex items-center gap-1 border border-slate-700/60 transition"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>

          {/* Action button */}
          <button
            type="submit"
            id="btn-analyze-url"
            disabled={isLoading}
            className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shrink-0 ${
              currentPlatform.theme.buttonBg
            } ${isLoading ? 'opacity-80 cursor-not-allowed' : 'active:scale-95'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Formats...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get Downloads</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {inputError && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{inputError}</span>
          </div>
        )}

        {/* Sample URLs for Quick Testing */}
        {currentPlatform.sampleUrls && currentPlatform.sampleUrls.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500">Quick Test Samples:</span>
            {currentPlatform.sampleUrls.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                id={`btn-sample-${currentPlatform.id}-${idx}`}
                onClick={() => handleUseSample(sample)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition truncate max-w-[260px]"
              >
                {sample}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
