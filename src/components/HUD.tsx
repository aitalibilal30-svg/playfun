// World-matched, low-occlusion HUD for PLYHUB complying with Three.js Skill and Game Craft rules
import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Palette,
  Users,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Compass,
  Timer,
  Zap,
} from 'lucide-react';
import { GameProgress, SoundSettings } from '../types/game';
import { soundManager } from '../audio/SoundSynth';

interface HUDProps {
  progress: GameProgress;
  sound: SoundSettings;
  interactionPrompt: string | null;
  objectiveMessage: string;
  pulseCooldownPercent: number; // 0 to 1
  isTrialActive: boolean;
  trialElapsedTime: number;
  trialCheckpoint: number;
  onOpenCustomization: () => void;
  onOpenChallenges: () => void;
  onOpenSocial: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
  onRespawn: () => void;
  onTriggerPulse: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  progress,
  sound,
  interactionPrompt,
  objectiveMessage,
  pulseCooldownPercent,
  isTrialActive,
  trialElapsedTime,
  trialCheckpoint,
  onOpenCustomization,
  onOpenChallenges,
  onOpenSocial,
  onOpenSettings,
  onToggleMute,
  onRespawn,
  onTriggerPulse,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 md:p-6 select-none font-sans">
      {/* Top Perimeter Status Cluster */}
      <div className="w-full flex items-start justify-between gap-4">
        {/* Top-Left: Game Brand & Crystal Counter */}
        <div className="flex flex-col gap-2">
          {/* Logo & Creator */}
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-base md:text-lg tracking-wider text-cyan-300 drop-shadow">
              PLYHUB
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium px-1.5 py-0.5 rounded border border-cyan-500/20 bg-[#0f172a]/80">
              by Bilal
            </span>
          </div>

          {/* Crystals Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-[#0b1329]/85 text-cyan-100 shadow-md">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <div className="flex items-baseline gap-1 text-sm font-semibold">
              <span className="tabular-nums text-base text-cyan-300">
                {progress.crystalsCollected}
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="tabular-nums text-xs text-slate-400">
                {progress.totalCrystals}
              </span>
              <span className="text-[11px] text-slate-300 ml-1">Crystals</span>
            </div>
            {progress.portalActivated && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                Gateway Open
              </span>
            )}
          </div>
        </div>

        {/* Top-Center: Objective Banner */}
        <div className="max-w-md hidden sm:flex flex-col items-center text-center">
          <div className="px-4 py-1.5 rounded-full border border-cyan-500/25 bg-[#091124]/90 text-xs text-cyan-200 font-medium shadow-md flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{objectiveMessage}</span>
          </div>

          {/* Parkour Timer when active */}
          {isTrialActive && (
            <div className="mt-2 px-4 py-1.5 rounded-lg border border-amber-400/40 bg-[#1e1709]/90 text-amber-200 font-mono text-sm flex items-center gap-3 shadow-lg">
              <Timer className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="tabular-nums font-bold tracking-wider">
                {formatTime(trialElapsedTime)}
              </span>
              <span className="text-xs text-amber-400/80 font-sans font-medium">
                Ring {trialCheckpoint} / 5
              </span>
            </div>
          )}
        </div>

        {/* Top-Right: Action Menu Pills */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenChallenges();
            }}
            title="Challenges & Trials"
            className="p-2 md:px-3 md:py-1.5 rounded-lg border border-amber-400/30 bg-[#0f172a]/85 text-amber-300 hover:bg-[#1a233d] transition-colors flex items-center gap-1.5 text-xs font-semibold shadow"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">Trials</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCustomization();
            }}
            title="Character Customization"
            className="p-2 md:px-3 md:py-1.5 rounded-lg border border-pink-400/30 bg-[#0f172a]/85 text-pink-300 hover:bg-[#1a233d] transition-colors flex items-center gap-1.5 text-xs font-semibold shadow"
          >
            <Palette className="w-4 h-4 text-pink-300" />
            <span className="hidden md:inline">Avatar</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSocial();
            }}
            title="Social & Multiplayer Prototype"
            className="p-2 md:px-3 md:py-1.5 rounded-lg border border-cyan-400/30 bg-[#0f172a]/85 text-cyan-300 hover:bg-[#1a233d] transition-colors flex items-center gap-1.5 text-xs font-semibold shadow"
          >
            <Users className="w-4 h-4 text-cyan-300" />
            <span className="hidden md:inline">Social</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleMute();
            }}
            title={sound.muted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg border border-slate-700 bg-[#0f172a]/85 text-slate-300 hover:bg-[#1a233d] transition-colors shadow"
          >
            {sound.muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            title="Settings & Controls"
            className="p-2 rounded-lg border border-slate-700 bg-[#0f172a]/85 text-slate-300 hover:bg-[#1a233d] transition-colors shadow"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Interaction Prompt */}
      {interactionPrompt && (
        <div className="self-center mb-12">
          <div className="px-5 py-2.5 rounded-xl border-2 border-cyan-400 bg-[#0c162f]/95 text-cyan-100 font-semibold text-sm shadow-2xl flex items-center gap-3">
            <span className="w-6 h-6 rounded bg-cyan-400 text-slate-900 font-mono font-black text-xs flex items-center justify-center">
              E
            </span>
            <span>{interactionPrompt}</span>
          </div>
        </div>
      )}

      {/* Bottom Consolidated Dock (Compliant with Three.js skill: pinned to bottom center, collapsible) */}
      <div className="w-full flex flex-col items-center pointer-events-auto">
        {/* Dock Collapse Toggle */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1 text-[11px] font-semibold text-slate-400 hover:text-cyan-300 px-3 py-0.5 rounded-t-md border border-b-0 border-slate-800 bg-[#091124]/85 flex items-center gap-1 transition-colors"
        >
          {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {isDockCollapsed ? 'Show Controls' : 'Hide Controls'}
        </button>

        {!isDockCollapsed && (
          <div className="max-w-[940px] w-full px-4 py-2.5 rounded-xl border border-cyan-500/25 bg-[#0b1328]/90 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            {/* Control hints */}
            <div className="hidden sm:flex items-center gap-4 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300 font-bold">
                  WASD
                </kbd>
                Move
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300 font-bold">
                  Space
                </kbd>
                Jump
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300 font-bold">
                  E
                </kbd>
                Pulse / Interact
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-cyan-300 font-bold">
                  Mouse Drag
                </kbd>
                Orbit Camera
              </span>
            </div>

            {/* Quick Action: Pulse Ability Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onTriggerPulse();
                }}
                disabled={pulseCooldownPercent > 0}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-semibold transition-all ${
                  pulseCooldownPercent > 0
                    ? 'border-slate-700 bg-slate-900/60 text-slate-500 cursor-not-allowed'
                    : 'border-pink-500/40 bg-pink-950/40 text-pink-300 hover:bg-pink-900/50'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Energy Pulse</span>
                {pulseCooldownPercent > 0 && (
                  <span className="text-[10px] tabular-nums text-slate-400">
                    {(pulseCooldownPercent * 4.0).toFixed(1)}s
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onRespawn();
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-[#0f172a] hover:bg-[#1a233d] text-slate-300 transition-colors text-[11px]"
              >
                Respawn Checkpoint
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
