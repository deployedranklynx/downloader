import React, { useState } from 'react';
import {
  Zap,
  HardDrive,
  Cpu,
  Layers,
  Gauge,
  Download,
  CheckCircle,
  FileArchive,
  Terminal,
} from 'lucide-react';
import { MediaFormat, PlatformConfig } from '../types';

interface HeavyFileAcceleratorProps {
  currentPlatform: PlatformConfig;
  onStartDownload: (url: string, title: string, format: MediaFormat, threads: number) => void;
}

export const HeavyFileAccelerator: React.FC<HeavyFileAcceleratorProps> = ({
  currentPlatform,
  onStartDownload,
}) => {
  const [directUrl, setDirectUrl] = useState('');
  const [selectedThreads, setSelectedThreads] = useState(16);
  const [chunkSizeMb, setChunkSizeMb] = useState(4);
  const [fileSizePreset, setFileSizePreset] = useState<'10MB' | '25MB' | '50MB' | '100MB'>('25MB');

  const handleTestDownload = () => {
    const sizeMap = {
      '10MB': { label: '10 MB Benchmark File', size: '10 MB', ext: 'bin' },
      '25MB': { label: '25 MB Turbo Payload', size: '25 MB', ext: 'zip' },
      '50MB': { label: '50 MB High Speed Stream', size: '50 MB', ext: 'iso' },
      '100MB': { label: '100 MB Heavy File Benchmark', size: '100 MB', ext: 'tar' },
    };

    const preset = sizeMap[fileSizePreset];
    const format: MediaFormat = {
      id: `heavy-${fileSizePreset.toLowerCase()}`,
      label: preset.label,
      quality: `${selectedThreads}x Accelerated Threads`,
      ext: preset.ext,
      size: preset.size,
      type: 'file',
      threads: selectedThreads,
      recommended: true,
    };

    onStartDownload(
      `/api/download/generate-file?title=${preset.label}&ext=${preset.ext}&sizeMb=${preset.size.replace(' MB', '')}`,
      preset.label,
      format,
      selectedThreads
    );
  };

  const handleCustomDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;

    let filename = 'heavy_download_file.zip';
    try {
      const parsed = new URL(directUrl);
      const name = parsed.pathname.split('/').filter(Boolean).pop();
      if (name) filename = name;
    } catch (e) {
      // ignore
    }

    const format: MediaFormat = {
      id: `custom-file-${Date.now()}`,
      label: filename,
      quality: `${selectedThreads}x Chunk Acceleration`,
      ext: filename.split('.').pop() || 'file',
      size: '250.0 MB',
      type: 'file',
      threads: selectedThreads,
    };

    onStartDownload(directUrl.trim(), filename, format, selectedThreads);
    setDirectUrl('');
  };

  return (
    <div className="w-full rounded-2xl p-4 sm:p-6 bg-slate-950 border border-slate-800 backdrop-blur-xl shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5 fill-emerald-400 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Turbo Heavy File Acceleration Engine
            </h3>
            <p className="text-xs text-slate-400">
              Split heavy ISO, ZIP, 4K Raw files into parallel chunk streams for maximum bandwidth
            </p>
          </div>
        </div>
      </div>

      {/* Engine Config Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        {/* Threads Selector */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Parallel Connections
            </span>
            <span className="text-emerald-400 font-mono font-bold">{selectedThreads} Threads</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[4, 8, 16, 32].map((threads) => (
              <button
                key={threads}
                type="button"
                onClick={() => setSelectedThreads(threads)}
                className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                  selectedThreads === threads
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {threads}x
              </button>
            ))}
          </div>
        </div>

        {/* Chunk Buffer Size */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Chunk Segment Size
            </span>
            <span className="text-sky-400 font-mono font-bold">{chunkSizeMb} MB/Chunk</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 4, 8].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setChunkSizeMb(size)}
                className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                  chunkSizeMb === size
                    ? 'bg-sky-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {size}MB
              </button>
            ))}
          </div>
        </div>

        {/* Acceleration Mode */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              Stream Architecture
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              ACTIVE
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            HTTP Range byte offsets + asynchronous stream pipelining
          </div>
        </div>
      </div>

      {/* Instant Benchmark Speed Test */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-900/50 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <FileArchive className="w-4 h-4 text-emerald-400" />
              Test Heavy File Download Throughput
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instantly benchmarks your connection with simulated multi-thread payload saving
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
              {(['10MB', '25MB', '50MB'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFileSizePreset(preset)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                    fileSizePreset === preset
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <button
              type="button"
              id="btn-run-benchmark"
              onClick={handleTestDownload}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Launch {fileSizePreset} Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct File Link Input */}
      <form onSubmit={handleCustomDownload} className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Direct Heavy URL (ISO, ZIP, APK, MP4, DMG, EXE):
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            placeholder="https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso"
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Accelerate URL</span>
          </button>
        </div>
      </form>
    </div>
  );
};
