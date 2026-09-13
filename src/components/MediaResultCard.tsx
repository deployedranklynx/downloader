import React, { useState } from 'react';
import {
  Download,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  Clock,
  User,
  Zap,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { MediaAnalysisResult, MediaFormat, PlatformConfig } from '../types';

interface MediaResultCardProps {
  media: MediaAnalysisResult;
  currentPlatform: PlatformConfig;
  turboEnabled: boolean;
  onDownloadFormat: (format: MediaFormat, directSave?: boolean) => void;
}

export const MediaResultCard: React.FC<MediaResultCardProps> = ({
  media,
  currentPlatform,
  turboEnabled,
  onDownloadFormat,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'audio' | 'image' | 'file'>('all');
  const [threadCount, setThreadCount] = useState<number>(turboEnabled ? 16 : 8);

  const filteredFormats = media.formats.filter((f) => {
    if (activeFilter === 'all') return true;
    return f.type === activeFilter;
  });

  const getFormatIcon = (type: MediaFormat['type']) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4 text-sky-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-amber-400" />;
      case 'file':
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div
      className={`w-full rounded-2xl p-4 sm:p-6 border backdrop-blur-xl transition-all duration-500 ${currentPlatform.theme.cardBg} ${currentPlatform.theme.glow}`}
    >
      {/* Media Metadata Preview */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 pb-6 border-b border-slate-800">
        {/* Thumbnail preview */}
        <div className="relative w-full md:w-64 h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
          {media.thumbnail ? (
            <img
              src={media.thumbnail}
              alt={media.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
              <Film className="w-12 h-12 mb-2 text-slate-600" />
              <span className="text-xs">Media Preview</span>
            </div>
          )}

          {/* Duration badge */}
          {media.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1 border border-white/10">
              <Clock className="w-3 h-3 text-slate-300" />
              <span>{media.duration}</span>
            </div>
          )}

          {/* Platform badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md backdrop-blur-md shadow ${currentPlatform.theme.badgeBg}`}
            >
              {currentPlatform.name}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
              {media.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300 font-medium">{media.author}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Multi-Thread Acceleration Ready
              </span>
            </div>
          </div>

          {/* Thread control */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-slate-300 font-medium">Parallel Download Streams:</span>
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                {[4, 8, 16].map((threads) => (
                  <button
                    key={threads}
                    type="button"
                    onClick={() => setThreadCount(threads)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      threadCount === threads
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {threads}x
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              High speed chunking: <span className="text-emerald-400 font-medium">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Format Filter Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {(['all', 'video', 'audio', 'image'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                activeFilter === filter
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          {filteredFormats.length} Available Download Formats
        </span>
      </div>

      {/* Formats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {filteredFormats.map((format) => (
          <div
            key={format.id}
            className={`group relative rounded-xl p-3.5 bg-slate-900/90 border transition-all duration-200 flex flex-col justify-between ${
              format.recommended
                ? 'border-sky-500/40 shadow-sm shadow-sky-500/10 hover:border-sky-400'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {format.recommended && (
              <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-sky-500 text-slate-950 flex items-center gap-1 shadow">
                <CheckCircle2 className="w-2.5 h-2.5" /> Best Quality
              </span>
            )}

            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-800/80">
                    {getFormatIcon(format.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{format.label}</h4>
                    <p className="text-[11px] text-slate-400">{format.quality}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-slate-300 font-medium">{format.size}</span>
                <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  .{format.ext}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                id={`btn-dl-${format.id}`}
                onClick={() =>
                  onDownloadFormat({ ...format, threads: threadCount }, true)
                }
                className="flex-1 py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Fast Save</span>
              </button>

              <button
                type="button"
                id={`btn-queue-${format.id}`}
                onClick={() =>
                  onDownloadFormat({ ...format, threads: threadCount }, false)
                }
                className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition flex items-center justify-center gap-1 border border-slate-700 active:scale-95"
                title="Add to background download queue"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Queue</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
