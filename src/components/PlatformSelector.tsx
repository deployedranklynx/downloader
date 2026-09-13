import React from 'react';
import {
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  AtSign,
  Twitter,
  Zap,
  Music2,
} from 'lucide-react';
import { PLATFORMS } from '../constants/platforms';
import { PlatformId } from '../types';

interface PlatformSelectorProps {
  selectedPlatform: PlatformId;
  onSelectPlatform: (id: PlatformId) => void;
}

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  Youtube: Youtube,
  Instagram: Instagram,
  Music2: Music2,
  Facebook: Facebook,
  Linkedin: Linkedin,
  AtSign: AtSign,
  Twitter: Twitter,
  Zap: Zap,
};

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onSelectPlatform,
}) => {
  const platformList = Object.values(PLATFORMS);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Select Platform & Dynamic Theme
        </span>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Theme adapts automatically when URL is pasted
        </span>
      </div>

      {/* Scrollable on mobile, flex grid on desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {platformList.map((platform) => {
          const isSelected = platform.id === selectedPlatform;
          const IconComp = ICON_COMPONENTS[platform.iconName] || Zap;

          return (
            <button
              key={platform.id}
              id={`platform-btn-${platform.id}`}
              onClick={() => onSelectPlatform(platform.id)}
              className={`snap-start shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border ${
                isSelected
                  ? `${platform.theme.activeTab} border-transparent scale-105`
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isSelected ? 'text-inherit' : 'text-slate-400'}`} />
              <span>{platform.name}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
