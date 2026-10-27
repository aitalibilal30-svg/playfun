// Challenges, Parkour Trials, and Achievements Showcase Modal for PLYHUB
import React, { useState } from 'react';
import { X, Trophy, Timer, Award, Sparkles, Zap, Mountain, CheckCircle2, Play } from 'lucide-react';
import { GameProgress } from '../types/game';
import { soundManager } from '../audio/SoundSynth';

interface ChallengesModalProps {
  progress: GameProgress;
  onStartTrial: () => void;
  onClose: () => void;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  progress,
  onStartTrial,
  onClose,
}) => {
  const [tab, setTab] = useState<'trials' | 'achievements' | 'daily'>('trials');

  const trial = progress.trials[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="relative w-full max-w-xl rounded-2xl border border-amber-500/30 bg-[#0d162c] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-display font-bold text-amber-100">Trials & Accolades</h2>
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
              setTab('trials');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'trials'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Chrono Trials</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setTab('achievements');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'achievements'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Achievements</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setTab('daily');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'daily'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Expedition</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-sm">
          {tab === 'trials' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-400/30 bg-[#171f3b] flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-amber-200">
                      {trial?.name || 'Celestial Stepping Stones'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {trial?.description || 'Race across 5 aerial platforms and trigger all checkpoint rings.'}
                    </p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold">
                    Target: {trial?.targetSeconds.toFixed(1)}s
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Best Local Time
                    </span>
                    <span className="text-base font-mono font-bold text-amber-300 tabular-nums">
                      {trial?.bestTime ? `${trial.bestTime.toFixed(2)}s` : 'No Record Yet'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                      Status
                    </span>
                    <span className="text-sm font-semibold flex items-center gap-1 mt-0.5 text-emerald-400">
                      {trial?.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
                        </>
                      ) : (
                        <span className="text-slate-400">Ready to Challenge</span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playPortalOpen();
                    onStartTrial();
                    onClose();
                  }}
                  className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Chrono Trial Now</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'achievements' && (
            <div className="space-y-2.5">
              {progress.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-colors ${
                    ach.unlocked
                      ? 'border-emerald-500/30 bg-[#0f2428] text-slate-100'
                      : 'border-slate-800/80 bg-[#0d152a] text-slate-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      ach.unlocked
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {ach.id.includes('crystal') && <Sparkles className="w-4 h-4" />}
                    {ach.id.includes('gateway') && <Award className="w-4 h-4" />}
                    {ach.id.includes('summit') && <Mountain className="w-4 h-4" />}
                    {ach.id.includes('speed') && <Timer className="w-4 h-4" />}
                    {ach.id.includes('pulse') && <Zap className="w-4 h-4" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-cyan-100">{ach.title}</span>
                      {ach.unlocked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'daily' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-amber-400/20 bg-amber-950/20 text-xs text-amber-200">
                <strong>Local Prototype:</strong> Daily challenges will synchronize with live server timers in the multiplayer expansion.
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-[#0f1933] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-200">Today&apos;s Expedition Goals</span>
                  <span className="text-[10px] text-slate-400 font-mono">Resets in 14h 22m</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span>Gather 5 Celestial Crystals</span>
                    <span className="font-mono text-cyan-300 tabular-nums">
                      {Math.min(5, progress.crystalsCollected)} / 5
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span>Activate the Ancient Gateway</span>
                    <span className="font-mono text-cyan-300">
                      {progress.portalActivated ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span>Perform 3 Energy Pulses</span>
                    <span className="font-mono text-cyan-300">Active</span>
                  </div>
                </div>
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
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
