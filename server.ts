import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Platform URL detection helper
function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.me')) return 'facebook';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('threads.net')) return 'threads';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  return 'direct';
}

// API: Analyze URL & Generate Format List with metadata
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const cleanUrl = url.trim();
  const platform = detectPlatform(cleanUrl);

  let title = 'Downloaded Media';
  let author = 'Creator';
  let thumbnail = '';
  let duration = '0:00';
  let isShortOrReel = false;

  try {
    if (platform === 'youtube') {
      isShortOrReel = cleanUrl.includes('/shorts/');
      // Attempt to fetch public oEmbed
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000),
        });
        if (oembedRes.ok) {
          const data = (await oembedRes.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
          if (data.title) title = data.title;
          if (data.author_name) author = data.author_name;
          if (data.thumbnail_url) thumbnail = data.thumbnail_url;
        }
      } catch (e) {
        // Fallback for YouTube
        const videoIdMatch = cleanUrl.match(/(?:v=|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : 'video';
        title = isShortOrReel ? `YouTube Short #${videoId}` : `YouTube Video (${videoId})`;
        author = 'YouTube Creator';
        thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
      }
      duration = isShortOrReel ? '0:58' : '14:20';
    } else if (platform === 'tiktok') {
      try {
        const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000),
        });
        if (oembedRes.ok) {
          const data = (await oembedRes.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
          if (data.title) title = data.title;
          if (data.author_name) author = data.author_name;
          if (data.thumbnail_url) thumbnail = data.thumbnail_url;
        }
      } catch (e) {
        title = 'TikTok Trending Video';
        author = '@tiktok_creator';
        thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80';
      }
      duration = '0:34';
      isShortOrReel = true;
    } else if (platform === 'instagram') {
      isShortOrReel = cleanUrl.includes('/reel/') || cleanUrl.includes('/reels/');
      title = isShortOrReel ? 'Instagram Reel Clip' : 'Instagram HD Post & Media';
      author = '@instagram_user';
      thumbnail = 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&auto=format&fit=crop&q=80';
      duration = isShortOrReel ? '0:45' : '1:12';
    } else if (platform === 'facebook') {
      isShortOrReel = cleanUrl.includes('/reel/') || cleanUrl.includes('/watch');
      title = isShortOrReel ? 'Facebook Reel Highlight' : 'Facebook Watch HD Video';
      author = 'Facebook Page';
      thumbnail = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80';
      duration = '3:45';
    } else if (platform === 'linkedin') {
      title = 'LinkedIn Professional Video & Slide Presentation';
      author = 'Industry Leader';
      thumbnail = 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=600&auto=format&fit=crop&q=80';
      duration = '2:15';
    } else if (platform === 'threads') {
      title = 'Threads Media & High-Res Attachment';
      author = '@threads_user';
      thumbnail = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80';
      duration = '0:28';
    } else {
      // Direct URL or other file
      try {
        const parsed = new URL(cleanUrl);
        const pathname = parsed.pathname;
        const filename = pathname.split('/').filter(Boolean).pop() || 'file_download';
        title = decodeURIComponent(filename);
        author = parsed.hostname;
      } catch (e) {
        title = 'Direct Fast Download File';
        author = 'Web Server';
      }
      thumbnail = '';
    }
  } catch (err) {
    console.error('Error analyzing URL:', err);
  }

  // Format options customized by platform
  const formats = generateFormats(platform, isShortOrReel);

  return res.json({
    success: true,
    platform,
    url: cleanUrl,
    title,
    author,
    thumbnail,
    duration,
    isShortOrReel,
    formats,
  });
});

// Format generator helper
function generateFormats(platform: string, isShort: boolean) {
  if (platform === 'direct') {
    return [
      { id: 'direct-accel', label: 'Multi-Thread Turbo Accelerated', quality: 'Original Max Speed', ext: 'file', size: '1.45 GB', type: 'file', threads: 16 },
      { id: 'direct-standard', label: 'Direct Single Stream', quality: 'Normal Speed', ext: 'file', size: '1.45 GB', type: 'file', threads: 1 },
    ];
  }

  const base = [
    {
      id: 'video-4k',
      label: '4K Ultra HD (2160p)',
      quality: '2160p 60fps Ultra Clarity',
      ext: 'mp4',
      size: isShort ? '48.2 MB' : '385.4 MB',
      type: 'video',
      threads: 8,
      recommended: true,
    },
    {
      id: 'video-1080p',
      label: 'Full HD (1080p)',
      quality: '1080p 60fps Crisp',
      ext: 'mp4',
      size: isShort ? '22.8 MB' : '142.1 MB',
      type: 'video',
      threads: 8,
    },
    {
      id: 'video-720p',
      label: 'HD (720p)',
      quality: '720p Fast Download',
      ext: 'mp4',
      size: isShort ? '11.4 MB' : '74.6 MB',
      type: 'video',
      threads: 4,
    },
    {
      id: 'audio-mp3-320',
      label: 'Audio Only (MP3 320kbps)',
      quality: 'Studio Lossless Audio',
      ext: 'mp3',
      size: isShort ? '2.4 MB' : '9.8 MB',
      type: 'audio',
      threads: 4,
    },
    {
      id: 'audio-m4a',
      label: 'Apple AAC / M4A (256kbps)',
      quality: 'High Efficiency Audio',
      ext: 'm4a',
      size: isShort ? '1.8 MB' : '7.2 MB',
      type: 'audio',
      threads: 4,
    },
    {
      id: 'image-original',
      label: 'Original Media Poster / Frame',
      quality: 'High Resolution HD',
      ext: 'jpg',
      size: '2.1 MB',
      type: 'image',
      threads: 2,
    },
  ];

  if (platform === 'tiktok') {
    base.unshift({
      id: 'video-nowatermark',
      label: 'HD Video (No Watermark)',
      quality: 'Original Clean HD',
      ext: 'mp4',
      size: '24.6 MB',
      type: 'video',
      threads: 8,
      recommended: true,
    });
  }

  if (platform === 'linkedin') {
    base.push({
      id: 'doc-pdf',
      label: 'Slide Document / Presentation',
      quality: 'Print Ready Vector',
      ext: 'pdf',
      size: '14.2 MB',
      type: 'file',
      threads: 4,
      recommended: false,
    });
  }

  return base;
}

// API: Stream simulated chunk or direct file payload with real bytes for true browser file saving
app.get('/api/download/generate-file', (req, res) => {
  const { title = 'download', ext = 'mp4', sizeMb = '5' } = req.query;
  const safeTitle = (title as string).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const safeExt = (ext as string).replace(/[^a-zA-Z0-9]/g, '') || 'mp4';
  const mb = Math.min(Math.max(parseFloat(sizeMb as string) || 5, 0.5), 50); // limit payload to 50MB max for instant demo
  const totalBytes = Math.floor(mb * 1024 * 1024);

  const contentTypeMap: Record<string, string> = {
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
    zip: 'application/zip',
    iso: 'application/x-iso9660-image',
  };

  const contentType = contentTypeMap[safeExt] || 'application/octet-stream';

  res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${safeExt}"`);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', totalBytes.toString());
  res.setHeader('Accept-Ranges', 'bytes');

  // Stream synthesized buffer with high throughput
  const chunkSize = 64 * 1024; // 64KB buffer chunks
  const chunk = Buffer.alloc(chunkSize, 0x5a); // pattern
  let bytesWritten = 0;

  function writeNext() {
    let ok = true;
    while (bytesWritten < totalBytes && ok) {
      const remaining = totalBytes - bytesWritten;
      const currentChunkSize = Math.min(chunkSize, remaining);
      bytesWritten += currentChunkSize;
      if (currentChunkSize < chunkSize) {
        ok = res.write(chunk.subarray(0, currentChunkSize));
      } else {
        ok = res.write(chunk);
      }
    }
    if (bytesWritten >= totalBytes) {
      res.end();
    } else {
      res.once('drain', writeNext);
    }
  }

  writeNext();
});

// API: Multi-thread chunk tester endpoint
app.get('/api/download/chunk', (req, res) => {
  const { chunkIndex = '0', totalChunks = '4', chunkSize = '1048576' } = req.query;
  const size = Math.min(parseInt(chunkSize as string) || 1048576, 10485760);
  const buf = Buffer.alloc(size, (parseInt(chunkIndex as string) || 0) % 255);

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', size.toString());
  res.setHeader('X-Chunk-Index', chunkIndex as string);
  res.setHeader('X-Total-Chunks', totalChunks as string);
  res.send(buf);
});

async function startServer() {
  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
