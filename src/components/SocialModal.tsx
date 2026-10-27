// Social & Multiplayer Architecture Preview Modal for PLYHUB
import React, { useState } from 'react';
import { X, Users, Globe, Share2, ShieldCheck, Terminal, Smile } from 'lucide-react';
import { soundManager } from '../audio/SoundSynth';

interface SocialModalProps {
  onClose: () => void;
}

export const SocialModal: React.FC<SocialModalProps> = ({ onClose }) => {
  const [roomCode, setRoomCode] = useState('PLY-8942');
  const [playerName, setPlayerName] = useState('Explorer_Bilal');
  const [activeTab, setActiveTab] = useState<'hub' | 'emotes' | 'architecture'>('hub');
  const [copied, setCopied] = useState(false);

  const emotes = [
    { name: 'Celestial Wave', icon: '👋', desc: 'Friendly greeting to traveling explorers' },
    { name: 'Star Jump', icon: '✨', desc: 'Excited hop with radiant particle spark' },
    { name: 'Meditate', icon: '🧘', desc: 'Hover cross-legged above the floating grass' },
    { name: 'Celebrate', icon: '🎉', desc: 'Victory dance celebrating gateway activation' },
  ];

  const handleCopyCode = () => {
    soundManager.playClick();
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = () => {
    soundManager.playClick();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setRoomCode(`PLY-${rand}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="relative w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0d162c] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-display font-bold text-cyan-100">Social & Multiplayer</h2>
              <span className="text-[10px] text-cyan-300/70 uppercase tracking-widest font-semibold">
                Prototype & Architecture Preview
              </span>
            </div>
          </div>
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

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('hub');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hub'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Room Lobby</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('emotes');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'emotes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Social Emotes</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('architecture');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Architecture Docs</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-sm">
          {activeTab === 'hub' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-cyan-400/30 bg-[#121c38] text-xs text-cyan-200 leading-relaxed">
                <span className="font-bold text-white">Status Notice:</span> PLYHUB is currently operating in single-player standalone mode with local persistence. Below is the room staging flow for the authoritative WebSocket server deployment.
              </div>

              {/* Player Profile Handle */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Explorer Display Handle
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#091124] text-cyan-100 font-medium focus:border-cyan-400 outline-none text-sm"
                  placeholder="Enter Explorer Name..."
                />
              </div>

              {/* Room Code Staging */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0f1933] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-100">Private Expedition Room Code</span>
                  <button
                    onClick={handleGenerateCode}
                    className="text-xs text-cyan-400 hover:underline cursor-pointer"
                  >
                    Generate New
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-base font-bold text-cyan-300 tracking-wider">
                    {roomCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Safety & Moderation Notice */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs text-slate-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Safe & Friendly: Designed for all ages without loot boxes, gambling, or unmoderated public voice channels.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'emotes' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Unlockable expressive animations to interact with explorers across celestial islands.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {emotes.map((em) => (
                  <button
                    key={em.name}
                    onClick={() => {
                      soundManager.playClick();
                    }}
                    className="p-3 rounded-xl border border-slate-800 bg-[#0f1933] hover:border-cyan-400 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{em.icon}</div>
                    <div className="text-xs font-bold text-cyan-200">{em.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{em.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d1a] space-y-2">
                <div className="text-cyan-400 font-bold">// Multiplayer Synchronization Schema</div>
                <div className="text-slate-400">
                  {`interface PlayerNetState {
  id: string;
  name: string;
  position: [number, number, number];
  rotationY: number;
  velocity: [number, number, number];
  animState: 'idle' | 'walk' | 'jump' | 'pulse';
  customization: PlayerCustomization;
}`}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d1a] space-y-2">
                <div className="text-cyan-400 font-bold">// Authoritative Server Protocol</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Client tick rate: 20-30Hz delta compression over WebSockets</li>
                  <li>Dead reckoning interpolation with cubic Hermite spline</li>
                  <li>Authoritative collection validation preventing duplicate crystal pickups</li>
                  <li>Room instance capped at 16 explorers per floating realm</li>
                </ul>
              </div>
            </div>
          )}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
