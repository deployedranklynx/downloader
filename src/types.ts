export type PlatformId =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'linkedin'
  | 'threads'
  | 'twitter'
  | 'direct';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  badge: string;
  iconName: string;
  tagline: string;
  placeholder: string;
  sampleUrls: string[];
  theme: {
    name: string;
    primaryHex: string;
    gradient: string;
    badgeBg: string;
    badgeText: string;
    borderAccent: string;
    glow: string;
    buttonBg: string;
    buttonHover: string;
    cardBg: string;
    activeTab: string;
  };
  supportedTypes: ('video' | 'shorts' | 'audio' | 'image' | 'file')[];
}

export interface MediaFormat {
  id: string;
  label: string;
  quality: string;
  ext: string;
  size: string;
  type: 'video' | 'audio' | 'image' | 'file';
  threads: number;
  recommended?: boolean;
}

export interface MediaAnalysisResult {
  success: boolean;
  platform: PlatformId;
  url: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: string;
  isShortOrReel: boolean;
  formats: MediaFormat[];
}

export interface ChunkProgress {
  id: number;
  startByte: number;
  endByte: number;
  downloadedBytes: number;
  percentage: number;
  status: 'pending' | 'downloading' | 'completed';
}

export interface DownloadTask {
  id: string;
  url: string;
  title: string;
  platform: PlatformId;
  format: MediaFormat;
  totalBytes: number;
  downloadedBytes: number;
  progress: number; // 0 - 100
  speedBytesPerSec: number; // in bytes/sec
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';
  threads: number;
  chunks: ChunkProgress[];
  startTime: number;
  endTime?: number;
  etaSeconds: number;
  error?: string;
  blobUrl?: string;
}

export interface SpeedHistoryPoint {
  time: string;
  speedMBps: number;
}
