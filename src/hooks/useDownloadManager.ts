import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { DownloadTask, MediaFormat, PlatformId, SpeedHistoryPoint } from '../types';
import { createDownloadTask, triggerDirectDownload } from '../utils/downloadEngine';

const STORAGE_KEY = 'ufdm_download_tasks';

export function useDownloadManager() {
  const [tasks, setTasks] = useState<DownloadTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((t: DownloadTask) => ({
          ...t,
          status: t.status === 'downloading' ? 'paused' : t.status,
          speedBytesPerSec: 0,
        }));
      }
    } catch (e) {
      console.error('Failed to load tasks from storage', e);
    }
    return [];
  });

  const [speedHistory, setSpeedHistory] = useState<SpeedHistoryPoint[]>([
    { time: '0s', speedMBps: 0 },
    { time: '1s', speedMBps: 0 },
    { time: '2s', speedMBps: 0 },
    { time: '3s', speedMBps: 0 },
    { time: '4s', speedMBps: 0 },
  ]);

  const [turboMultiplier, setTurboMultiplier] = useState<number>(4); // 1x, 4x, 8x, 16x

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to persist tasks', e);
    }
  }, [tasks]);

  // Main active download simulation loop
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const hasActive = tasks.some((t) => t.status === 'downloading');
    if (!hasActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTasks((prevTasks) => {
        let totalCurrentSpeedBytes = 0;

        const updated = prevTasks.map((task) => {
          if (task.status !== 'downloading') return task;

          // Compute chunk speed based on threads and turboMultiplier
          // base speed per thread ~ 1.5MB - 4.5MB/s
          const threadSpeedBase = 2.2 * 1024 * 1024 * (turboMultiplier / 4);
          const jitter = 0.85 + Math.random() * 0.35;
          const taskSpeedBytes = Math.floor(task.threads * threadSpeedBase * jitter);
          totalCurrentSpeedBytes += taskSpeedBytes;

          // Progress addition in this tick (100ms interval)
          const tickDeltaBytes = Math.floor(taskSpeedBytes / 10);
          const newDownloaded = Math.min(task.totalBytes, task.downloadedBytes + tickDeltaBytes);
          const progress = Math.min(100, Math.floor((newDownloaded / task.totalBytes) * 100));

          // Distribute across chunks
          const chunkShare = Math.floor(newDownloaded / task.chunks.length);
          const updatedChunks = task.chunks.map((chunk, idx) => {
            const isLast = idx === task.chunks.length - 1;
            const chunkTotal = chunk.endByte - chunk.startByte + 1;
            const chunkDownloaded = isLast
              ? Math.min(chunkTotal, newDownloaded - (task.chunks.length - 1) * chunkShare)
              : Math.min(chunkTotal, chunkShare);
            const chunkPct = Math.min(100, Math.floor((chunkDownloaded / chunkTotal) * 100));
            return {
              ...chunk,
              downloadedBytes: chunkDownloaded,
              percentage: chunkPct,
              status: chunkPct >= 100 ? 'completed' : 'downloading',
            };
          });

          const remainingBytes = task.totalBytes - newDownloaded;
          const etaSeconds = taskSpeedBytes > 0 ? Math.ceil(remainingBytes / taskSpeedBytes) : 0;

          const isComplete = newDownloaded >= task.totalBytes;

          if (isComplete) {
            // Trigger confetti
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#38BDF8', '#818CF8', '#F43F5E', '#10B981'],
              });
            } catch (e) {
              // Ignore
            }

            return {
              ...task,
              downloadedBytes: task.totalBytes,
              progress: 100,
              speedBytesPerSec: 0,
              status: 'completed',
              endTime: Date.now(),
              etaSeconds: 0,
              chunks: updatedChunks.map((c) => ({ ...c, status: 'completed', percentage: 100 })),
            };
          }

          return {
            ...task,
            downloadedBytes: newDownloaded,
            progress,
            speedBytesPerSec: taskSpeedBytes,
            etaSeconds,
            chunks: updatedChunks,
          };
        });

        // Update speed history
        const currentMBps = Number((totalCurrentSpeedBytes / (1024 * 1024)).toFixed(1));
        const now = new Date();
        const timeLabel = `${now.getSeconds()}s`;

        setSpeedHistory((prev) => {
          const next = [...prev.slice(-14), { time: timeLabel, speedMBps: currentMBps }];
          return next;
        });

        return updated;
      });
    }, 150);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tasks, turboMultiplier]);

  const startDownload = (
    url: string,
    title: string,
    platform: PlatformId,
    format: MediaFormat,
    threads = 8,
    saveToDiskImmediately = true
  ) => {
    const newTask = createDownloadTask(url, title, platform, format, threads);
    setTasks((prev) => [newTask, ...prev]);

    if (saveToDiskImmediately) {
      triggerDirectDownload(title, format.ext, format.size);
    }

    return newTask.id;
  };

  const pauseTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'paused', speedBytesPerSec: 0 } : t
      )
    );
  };

  const resumeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'downloading', startTime: Date.now() } : t
      )
    );
  };

  const cancelTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const retryTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'downloading',
              downloadedBytes: 0,
              progress: 0,
              startTime: Date.now(),
            }
          : t
      )
    );
  };

  const pauseAll = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.status === 'downloading' ? { ...t, status: 'paused', speedBytesPerSec: 0 } : t
      )
    );
  };

  const resumeAll = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.status === 'paused' ? { ...t, status: 'downloading' } : t
      )
    );
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => t.status !== 'completed'));
  };

  const activeDownloadsCount = tasks.filter((t) => t.status === 'downloading').length;
  const totalSpeed = tasks
    .filter((t) => t.status === 'downloading')
    .reduce((sum, t) => sum + t.speedBytesPerSec, 0);

  return {
    tasks,
    activeDownloadsCount,
    totalSpeed,
    speedHistory,
    turboMultiplier,
    setTurboMultiplier,
    startDownload,
    pauseTask,
    resumeTask,
    cancelTask,
    retryTask,
    pauseAll,
    resumeAll,
    clearCompleted,
  };
}
