import React, { useState } from 'react';
import {
  Download,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Activity,
  FolderDown,
  Layers,
} from 'lucide-react';
import { DownloadTask, SpeedHistoryPoint } from '../types';
import { formatBytes, formatSpeed, triggerDirectDownload } from '../utils/downloadEngine';

interface ActiveDownloadsPanelProps {
  tasks: DownloadTask[];
  totalSpeed: number;
  speedHistory: SpeedHistoryPoint[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onPauseAll: () => void;
  onResumeAll: () => void;
  onClearCompleted: () => void;
  onClose?: () => void;
}

export const ActiveDownloadsPanel: React.FC<ActiveDownloadsPanelProps> = ({
  tasks,
  totalSpeed,
  speedHistory,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onPauseAll,
  onResumeAll,
  onClearCompleted,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showChunkDetails, setShowChunkDetails] = useState<Record<string, boolean>>({});

  const toggleChunkView = (id: string) => {
    setShowChunkDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return t.status === 'downloading' || t.status === 'paused';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const activeCount = tasks.filter((t) => t.status === 'downloading').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const maxHistorySpeed = Math.max(...speedHistory.map((s) => s.speedMBps), 10);

  return (
    <div className="w-full rounded-2xl p-4 sm:p-6 bg-slate-950 border border-slate-800 backdrop-blur-xl shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5 text-sky-400" />
              Download Manager & Accelerator
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {tasks.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-threaded chunked streams with live byte verification
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <button
              type="button"
              id="btn-pause-all"
              onClick={onPauseAll}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause All</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-resume-all"
              onClick={onResumeAll}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resume All</span>
            </button>
          )}

          {completedCount > 0 && (
            <button
              type="button"
              id="btn-clear-completed"
              onClick={onClearCompleted}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Done</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Hide
            </button>
          )}
        </div>
      </div>

      {/* Live Speed Graph & Stats Bar */}
      <div className="my-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Total Speed Metric */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Network Bandwidth
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
              {formatSpeed(totalSpeed)}
            </div>
          </div>
        </div>

        {/* Live sparkline graph */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              Live Throughput Graph
            </span>
            <span className="font-mono text-sky-400">Peak: {maxHistorySpeed.toFixed(1)} MB/s</span>
          </div>
          <div className="h-10 w-full flex items-end gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
            {speedHistory.map((point, idx) => {
              const heightPct = Math.min(100, Math.max(8, (point.speedMBps / maxHistorySpeed) * 100));
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t transition-all duration-200 bg-gradient-to-t from-sky-600 to-indigo-400"
                  style={{ height: `${heightPct}%` }}
                  title={`${point.time}: ${point.speedMBps} MB/s`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-3">
        {(['all', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
              filter === tab
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab} ({tab === 'all' ? tasks.length : tab === 'active' ? activeCount : completedCount})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <FolderDown className="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
          <p className="text-sm font-medium">No downloads in this list</p>
          <p className="text-xs text-slate-600 mt-1">
            Paste any link above or select a sample to begin turbo downloading.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {filteredTasks.map((task) => {
            const isDownloading = task.status === 'downloading';
            const isCompleted = task.status === 'completed';
            const isPaused = task.status === 'paused';
            const showChunks = showChunkDetails[task.id];

            return (
              <div
                key={task.id}
                className="rounded-xl p-3.5 bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition"
              >
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {task.platform}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {task.title}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-300">
                        {formatBytes(task.downloadedBytes)} / {formatBytes(task.totalBytes)}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-semibold text-slate-400">
                        {task.format.label} (.{task.format.ext})
                      </span>
                      <span>•</span>
                      <span className="text-sky-400 font-mono">
                        {task.threads} Connections
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isDownloading && (
                      <button
                        type="button"
                        onClick={() => onPause(task.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}

                    {isPaused && (
                      <button
                        type="button"
                        onClick={() => onResume(task.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDirectDownload(task.title, task.format.ext, task.format.size)
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                        title="Save to device"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save File</span>
                      </button>
                    )}

                    {!isDownloading && (
                      <button
                        type="button"
                        onClick={() => onRetry(task.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                        title="Restart Download"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onCancel(task.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-150 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isPaused
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Progress Details & Speed */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{task.progress}%</span>
                    {isDownloading && (
                      <span className="text-emerald-400 font-mono font-medium">
                        {formatSpeed(task.speedBytesPerSec)}
                      </span>
                    )}
                    {isPaused && <span className="text-amber-400">Paused</span>}
                    {isCompleted && (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isDownloading && task.etaSeconds > 0 && (
                      <span className="flex items-center gap-1 text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        ETA: {task.etaSeconds}s
                      </span>
                    )}

                    {/* Toggle chunk view button */}
                    <button
                      type="button"
                      onClick={() => toggleChunkView(task.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{showChunks ? 'Hide Chunks' : 'Show Threads'}</span>
                    </button>
                  </div>
                </div>

                {/* Multi-thread Chunk Segmentation Visualizer */}
                {showChunks && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/70">
                    <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                      <span>Multi-Connection Segments (Threads 1 - {task.chunks.length})</span>
                      <span>Parallel Acceleration</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {task.chunks.map((chunk) => (
                        <div
                          key={chunk.id}
                          className="bg-slate-950 p-1.5 rounded border border-slate-800 text-center"
                        >
                          <div className="text-[9px] text-slate-400 font-mono">T{chunk.id}</div>
                          <div className="h-1 w-full bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-sky-400 transition-all duration-150"
                              style={{ width: `${chunk.percentage}%` }}
                            />
                          </div>
                          <div className="text-[9px] font-mono text-slate-300 mt-0.5">
                            {chunk.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
