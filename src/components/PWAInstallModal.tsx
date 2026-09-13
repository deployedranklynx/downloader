import React from 'react';
import {
  X,
  Smartphone,
  Apple,
  Monitor,
  Share2,
  PlusSquare,
  Download,
  CheckCircle,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  onNativeInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isIOS,
  onNativeInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Install App</h3>
              <p className="text-xs text-slate-400">Run on Desktop, Android & Apple iOS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Install Button for Chromium / Android */}
        {isInstallable && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-sky-950/40 border border-emerald-800/50">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Direct 1-Click Install Ready
            </h4>
            <p className="text-[11px] text-slate-300 mt-1">
              Click below to install as a standalone native app on your device.
            </p>
            <button
              type="button"
              id="btn-confirm-native-install"
              onClick={async () => {
                const ok = await onNativeInstall();
                if (ok) onClose();
              }}
              className="mt-3 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Install to Home Screen / Desktop</span>
            </button>
          </div>
        )}

        {/* Platform Instructions */}
        <div className="mt-4 space-y-3">
          {/* iOS Safari Guide */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1.5">
              <Apple className="w-4 h-4 text-slate-300" />
              <span>Apple iPhone & iPad (iOS Safari)</span>
            </div>
            <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside pl-1">
              <li>
                Open this app in <strong className="text-white">Safari</strong>.
              </li>
              <li>
                Tap the <Share2 className="w-3 h-3 inline text-sky-400 mx-0.5" /> <strong className="text-white">Share</strong> button at bottom bar.
              </li>
              <li>
                Scroll down and tap <PlusSquare className="w-3 h-3 inline text-emerald-400 mx-0.5" /> <strong className="text-white">Add to Home Screen</strong>.
              </li>
            </ol>
          </div>

          {/* Android Guide */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Android (Chrome / Brave / Samsung Internet)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tap the 3 dots menu <strong className="text-white">⋮</strong> and choose <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
            </p>
          </div>

          {/* Desktop Guide */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1.5">
              <Monitor className="w-4 h-4 text-sky-400" />
              <span>Windows / macOS / Linux Desktop</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Click the install icon <strong className="text-white">⊕</strong> in your browser's URL address bar to run as a desktop application window.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
