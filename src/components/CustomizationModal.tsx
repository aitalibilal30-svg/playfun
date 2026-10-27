// Character & Companion Customization Modal for PLYHUB
import React, { useState } from 'react';
import { X, Check, Sparkles, Shield, Eye, Flame } from 'lucide-react';
import { PlayerCustomization } from '../types/game';
import { soundManager } from '../audio/SoundSynth';

interface CustomizationModalProps {
  customization: PlayerCustomization;
  onUpdate: (updated: PlayerCustomization) => void;
  onClose: () => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  customization,
  onUpdate,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'suit' | 'visor' | 'companion' | 'trail'>('suit');

  const armorColors = [
    { name: 'Celestial Cyan', hex: '#00f2fe' },
    { name: 'Midnight Void', hex: '#151c38' },
    { name: 'Solar Gold', hex: '#fee140' },
    { name: 'Radiant Violet', hex: '#7f00ff' },
    { name: 'Crimson Nebula', hex: '#ff0844' },
    { name: 'Emerald Grove', hex: '#11998e' },
  ];

  const accentColors = [
    { name: 'Cosmic Coral', hex: '#fa709a' },
    { name: 'Electric Turquoise', hex: '#4facfe' },
    { name: 'Pure Platinum', hex: '#e2e8f0' },
    { name: 'Amber Spark', hex: '#f6d365' },
    { name: 'Neon Lime', hex: '#38ef7d' },
  ];

  const visorColors = [
    { name: 'Cyan Horizon', hex: '#00f2fe' },
    { name: 'Solar Amber', hex: '#ffaa00' },
    { name: 'Emerald Pulse', hex: '#00ff88' },
    { name: 'Deep Amethyst', hex: '#bf55ec' },
    { name: 'Ruby Core', hex: '#ff2d55' },
    { name: 'Glacial White', hex: '#ffffff' },
  ];

  const companions = [
    { id: 'lumi', name: 'Lumi the Wisp', desc: 'A celestial wisp drawn to ancient crystal resonances.' },
    { id: 'chrono', name: 'Chrono Drone', desc: 'A miniature gyro guardian that measures planetary chronos.' },
    { id: 'starling', name: 'Starling', desc: 'A radiant prismatic hatchling from the outer rings.' },
    { id: 'pyra', name: 'Pyra the Flare', desc: 'An energetic solar flame that illuminates dark cavern peaks.' },
  ];

  const trails = [
    { id: 'stardust', name: 'Stardust Spark', desc: 'Fine glittering motes of celestial diamond dust.' },
    { id: 'solar', name: 'Solar Flare', desc: 'Warm ribbons of sunlight trailing your jumps.' },
    { id: 'emerald', name: 'Emerald Bloom', desc: 'Luminescent botanical spores drifting behind.' },
    { id: 'void', name: 'Void Spark', desc: 'Deep violet quantum rifts that dissolve quietly.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="relative w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0d162c] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-display font-bold text-cyan-100">Explorer Customization</h2>
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

        {/* Tab Bar */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('suit');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'suit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Suit & Armor</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('visor');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'visor'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visor Glow</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('companion');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'companion'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Companion Pet</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('trail');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'trail'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trail Effect</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-sm">
          {activeTab === 'suit' && (
            <>
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                  Primary Armor Alloy
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {armorColors.map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => {
                        soundManager.playClick();
                        onUpdate({ ...customization, armorColor: col.hex });
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        customization.armorColor === col.hex
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md'
                          : 'border-slate-800 bg-[#0f1933] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-xs font-medium truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                  Secondary Trim & Jetpack
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {accentColors.map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => {
                        soundManager.playClick();
                        onUpdate({ ...customization, accentColor: col.hex });
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        customization.accentColor === col.hex
                          ? 'border-pink-400 bg-pink-950/40 text-pink-200 shadow-md'
                          : 'border-slate-800 bg-[#0f1933] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-xs font-medium truncate">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'visor' && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                Visor HUD & Thruster Glow
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {visorColors.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => {
                      soundManager.playClick();
                      onUpdate({ ...customization, visorColor: col.hex });
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      customization.visorColor === col.hex
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200 shadow-lg'
                        : 'border-slate-800 bg-[#0f1933] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-white/40 shadow-[0_0_10px_currentColor] shrink-0"
                      style={{ backgroundColor: col.hex, color: col.hex }}
                    />
                    <div className="text-left">
                      <div className="text-xs font-semibold">{col.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{col.hex}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'companion' && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Celestial Companion Species
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {companions.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      soundManager.playClick();
                      onUpdate({
                        ...customization,
                        companionType: comp.id as PlayerCustomization['companionType'],
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      customization.companionType === comp.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                        : 'border-slate-800 bg-[#0f1933] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-cyan-100">{comp.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{comp.desc}</div>
                    </div>
                    {customization.companionType === comp.id && (
                      <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Companion Core Resonance
                </h4>
                <div className="flex items-center gap-3">
                  {['#4facfe', '#fee140', '#fa709a', '#38ef7d', '#bf55ec'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => {
                        soundManager.playClick();
                        onUpdate({ ...customization, companionColor: hex });
                      }}
                      className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                        customization.companionColor === hex
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trail' && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                Jump & Dash Particle Trail
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {trails.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundManager.playClick();
                      onUpdate({
                        ...customization,
                        trailType: t.id as PlayerCustomization['trailType'],
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      customization.trailType === t.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                        : 'border-slate-800 bg-[#0f1933] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-cyan-100">{t.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                    </div>
                    {customization.trailType === t.id && (
                      <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
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
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
