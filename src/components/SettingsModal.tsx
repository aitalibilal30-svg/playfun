// Settings, Audio sliders, Graphics quality, and Language selector for PLYHUB
import React from 'react';
import { X, Volume2, Monitor, Globe, Info } from 'lucide-react';
import { SoundSettings, GraphicsSettings, SupportedLanguage } from '../types/game';
import { soundManager } from '../audio/SoundSynth';

interface SettingsModalProps {
  sound: SoundSettings;
  graphics: GraphicsSettings;
  language: SupportedLanguage;
  onUpdateSound: (s: SoundSettings) => void;
  onUpdateGraphics: (g: GraphicsSettings) => void;
  onUpdateLanguage: (l: SupportedLanguage) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  sound,
  graphics,
  language,
  onUpdateSound,
  onUpdateGraphics,
  onUpdateLanguage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-[#0d162c] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-display font-bold text-slate-100">Settings & Configuration</h2>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-sm">
          {/* Audio Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-bold">
              <Volume2 className="w-4 h-4" />
              <span>Audio Synthesis</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#0f1933] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Mute All Sounds</span>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSound({ ...sound, muted: !sound.muted });
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    sound.muted ? 'bg-red-500/80' : 'bg-cyan-500'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      sound.muted ? 'translate-x-1' : 'translate-x-7'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Master Volume</span>
                  <span className="font-mono text-cyan-300">
                    {Math.round(sound.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sound.masterVolume}
                  onChange={(e) =>
                    onUpdateSound({ ...sound, masterVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Ambient Celestial Music</span>
                  <span className="font-mono text-cyan-300">
                    {Math.round(sound.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sound.musicVolume}
                  onChange={(e) =>
                    onUpdateSound({ ...sound, musicVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Sound Effects (Jump / Crystals / Pulse)</span>
                  <span className="font-mono text-cyan-300">{Math.round(sound.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sound.sfxVolume}
                  onChange={(e) =>
                    onUpdateSound({ ...sound, sfxVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Graphics Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-bold">
              <Monitor className="w-4 h-4" />
              <span>Graphics & Visual Fidelity</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#0f1933] space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-medium">Quality Preset</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'medium', 'low'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        soundManager.playClick();
                        onUpdateGraphics({ ...graphics, quality: q });
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        graphics.quality === q
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>Language / Langue / اللغة</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'fr', label: 'Français' },
                { code: 'ar', label: 'العربية' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateLanguage(item.code as SupportedLanguage);
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    language === item.code
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow'
                      : 'border-slate-800 bg-[#0f1933] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Credits */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-[#091124] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-bold text-slate-200">PLYHUB — PLAY YOUR WORLD</div>
                <div className="text-slate-400 text-[11px]">Created by Bilal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
