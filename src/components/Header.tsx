import React from 'react';
import {
  Download,
  Zap,
  Smartphone,
  Monitor,
  Apple,
  Code2,
  Share2,
} from 'lucide-react';
import { PlatformConfig } from '../types';

interface HeaderProps {
  currentPlatform: PlatformConfig;
  activeCount: number;
  totalSpeed: number;
  onOpenQueue: () => void;
  onOpenApiGenerator: () => void;
  onOpenInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlatform,
  activeCount,
  totalSpeed,
  onOpenQueue,
  onOpenApiGenerator,
  onOpenInstall,
}) => {
  const formattedSpeed = (totalSpeed / (1024 * 1024)).toFixed(1);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-all duration-500 bg-gradient-to-br ${currentPlatform.theme.gradient}`}
          >
            <Download className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Fast<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">DL</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Turbo 16x
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Universal Heavy & Social Media Download Engine
            </p>
          </div>
        </div>

        {/* Device compatibility badges */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
          <span className="text-[11px] font-medium text-slate-500">Cross-Platform:</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Monitor className="w-3.5 h-3.5 text-sky-400" /> Desktop
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Android
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Apple className="w-3.5 h-3.5 text-slate-200" /> Apple iOS
          </span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Generator button */}
          <button
            id="btn-api-generator"
            onClick={onOpenApiGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition"
            title="Auto API Generator & Endpoints"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">API Generator</span>
          </button>

          {/* Install PWA button */}
          <button
            id="btn-install-app"
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition"
            title="Install for Desktop, Android, iOS"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Install App</span>
          </button>

          {/* Active Download Queue badge */}
          <button
            id="btn-toggle-queue"
            onClick={onOpenQueue}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition shadow-sm"
          >
            <Download className={`w-4 h-4 ${activeCount > 0 ? 'text-sky-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Queue</span>
            {activeCount > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500 text-slate-950">
                  {activeCount}
                </span>
                <span className="text-emerald-400 font-mono hidden sm:inline">
                  {formattedSpeed} MB/s
                </span>
              </span>
            ) : (
              <span className="text-slate-400 hidden sm:inline">Idle</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
