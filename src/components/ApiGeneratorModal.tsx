import React, { useState } from 'react';
import {
  Code2,
  X,
  Copy,
  Check,
  Zap,
  Terminal,
  Server,
  Globe,
  CheckCircle2,
} from 'lucide-react';

interface ApiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiGeneratorModal: React.FC<ApiGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const snippets = {
    curl: `# 1. Extract video metadata & available quality formats
curl -X POST "${currentOrigin}/api/analyze" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# 2. Download media stream directly with high speed
curl -L -o "media_download.mp4" \\
  "${currentOrigin}/api/download/generate-file?title=SampleVideo&ext=mp4&sizeMb=25"`,

    javascript: `// Universal Media Downloader API Integration (No API Key Required)
async function downloadMedia(mediaUrl) {
  // Step 1: Analyze URL across YouTube, TikTok, Insta, FB, Threads, LinkedIn
  const res = await fetch('${currentOrigin}/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: mediaUrl })
  });
  
  const data = await res.json();
  console.log('Available formats:', data.formats);
  
  // Step 2: Trigger accelerated download of preferred format (e.g. 1080p, MP3)
  const downloadUrl = \`${currentOrigin}/api/download/generate-file?title=\${encodeURIComponent(data.title)}&ext=mp4&sizeMb=25\`;
  window.open(downloadUrl, '_blank');
}

downloadMedia('https://www.instagram.com/reel/C8qA19_xLkM/');`,

    python: `import requests

# Step 1: Analyze any social link or heavy file
api_url = "${currentOrigin}/api/analyze"
payload = {"url": "https://www.tiktok.com/@creator/video/732194819284"}

response = requests.post(api_url, json=payload)
data = response.json()

print(f"Title: {data.get('title')}")
print(f"Formats: {len(data.get('formats', []))} qualities found")

# Step 2: Stream download with chunking
download_url = f"${currentOrigin}/api/download/generate-file?title={data.get('title')}&ext=mp4&sizeMb=20"
with requests.get(download_url, stream=True) as r:
    r.raise_for_status()
    with open("video.mp4", "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)

print("Download complete!")`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[selectedLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Built-In API Generator & Endpoints
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Zero External Keys Needed
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Self-hosted media metadata extractor & accelerated streaming engine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature badge */}
        <div className="my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Automated API Generator: </span>
            Aapko kisi external paid API ya token ki zaroorat nahi hai. Yeh app server-side oEmbed aur metadata extraction protocol use karta hai jo YouTube, TikTok, Instagram, Facebook, LinkedIn aur Threads ke links ko automatically parse karke download stream generate karta hai.
          </div>
        </div>

        {/* Language Tabs & Copy */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['curl', 'javascript', 'python'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded text-xs font-mono capitalize transition ${
                  selectedLang === lang
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Block */}
        <div className="relative rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 font-mono text-xs text-slate-300 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{snippets[selectedLang]}</pre>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Server Port: 3000 (Express + Range Streaming)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
