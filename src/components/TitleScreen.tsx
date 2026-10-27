// Cinematic Title Screen for PLYHUB with bespoke SVG title lockup and live 3D world backdrop
import React, { useEffect } from 'react';
import { Play, Palette, Trophy, Users, Settings } from 'lucide-react';
import { soundManager } from '../audio/SoundSynth';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenCustomization: () => void;
  onOpenChallenges: () => void;
  onOpenSocial: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenCustomization,
  onOpenChallenges,
  onOpenSocial,
  onOpenSettings,
}) => {
  // Support Space or Enter to immediately start game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        soundManager.playPortalOpen();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between items-center p-8 select-none font-sans">
      {/* Top Branding Bar */}
      <div className="w-full flex justify-between items-center max-w-6xl">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest px-2.5 py-1 rounded border border-cyan-500/30 bg-[#091124]/80 text-cyan-300 font-bold">
            Created by Bilal
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium px-3 py-1 rounded bg-[#091124]/60 border border-slate-800">
          v1.0 Early Access • Cross-Platform 3D
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-2xl">
        {/* Inline SVG Title Lockup */}
        <div className="mb-2">
          <svg
            className="w-72 sm:w-96 md:w-[460px] h-auto drop-shadow-[0_10px_25px_rgba(0,242,254,0.35)]"
            viewBox="0 0 500 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="45%" stopColor="#4facfe" />
                <stop offset="75%" stopColor="#fee140" />
                <stop offset="100%" stopColor="#fa709a" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <text
              x="250"
              y="95"
              textAnchor="middle"
              fontFamily="'Space Grotesk', system-ui, sans-serif"
              fontSize="92"
              fontWeight="900"
              letterSpacing="6"
              fill="url(#titleGrad)"
              filter="url(#glow)"
            >
              PLYHUB
            </text>
          </svg>
        </div>

        {/* Tagline */}
        <p className="font-display text-sm sm:text-base md:text-lg font-bold tracking-[0.3em] uppercase text-cyan-200/90 mb-8 drop-shadow">
          PLAY YOUR WORLD.
        </p>

        {/* Primary Start CTA Button */}
        <div className="pointer-events-auto flex flex-col items-center gap-4">
          <button
            onClick={() => {
              soundManager.playPortalOpen();
              onStartGame();
            }}
            className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-500 text-slate-950 font-display font-extrabold text-lg sm:text-xl tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(0,242,254,0.5)] flex items-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            <span>ENTER THE WORLD</span>
          </button>

          {/* Secondary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenCustomization();
              }}
              className="px-4 py-2 rounded-xl border border-pink-400/30 bg-[#091124]/85 text-pink-300 hover:bg-[#161c36] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shadow"
            >
              <Palette className="w-4 h-4 text-pink-400" />
              <span>Customize Character</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenChallenges();
              }}
              className="px-4 py-2 rounded-xl border border-amber-400/30 bg-[#091124]/85 text-amber-300 hover:bg-[#161c36] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shadow"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Chrono Trials</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenSocial();
              }}
              className="px-4 py-2 rounded-xl border border-cyan-400/30 bg-[#091124]/85 text-cyan-300 hover:bg-[#161c36] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shadow"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Social & Multiplayer</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenSettings();
              }}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-[#091124]/85 text-slate-300 hover:bg-[#161c36] transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shadow"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flat Control Hint Line (Per Core Game Craft Guidelines) */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-cyan-300/70 font-mono tracking-wide">
          WASD Move &middot; Space Jump &middot; E Energy Pulse &middot; Esc Menu
        </p>
      </div>
    </div>
  );
};
