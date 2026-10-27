/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// PLYHUB — 3D Social Adventure Game created by Bilal. "PLAY YOUR WORLD."
import { useState, useRef, useEffect } from 'react';
import { GameCanvas, GameCanvasHandle } from './components/GameCanvas';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { CustomizationModal } from './components/CustomizationModal';
import { ChallengesModal } from './components/ChallengesModal';
import { SocialModal } from './components/SocialModal';
import { SettingsModal } from './components/SettingsModal';
import { useGameState } from './hooks/useGameState';
import { soundManager } from './audio/SoundSynth';

export default function App() {
  const gameCanvasRef = useRef<GameCanvasHandle | null>(null);

  const {
    screen,
    setScreen,
    progress,
    customization,
    setCustomization,
    sound,
    setSound,
    graphics,
    setGraphics,
    language,
    setLanguage,
    interactionPrompt,
    setInteractionPrompt,
    objectiveMessage,
    setObjectiveMessage,
    toastMessage,
    onCrystalCollected,
    onGatewayActivated,
    onTrialFinished,
  } = useGameState();

  // Active Modals
  const [modal, setModal] = useState<'customization' | 'challenges' | 'social' | 'settings' | null>(null);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [pulseCooldownPct, setPulseCooldownPct] = useState(0);

  // Parkour trial HUD states
  const [trialActive, setTrialActive] = useState(false);
  const [trialElapsed, setTrialElapsed] = useState(0);
  const [trialCheckpoint, setTrialCheckpoint] = useState(0);

  // Detect touch capability
  useEffect(() => {
    const checkTouch = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Update cooldown and trial timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameCanvasRef.current) {
        const cd = gameCanvasRef.current.getPulseCooldown();
        setPulseCooldownPct(cd.current / cd.max);

        const tr = gameCanvasRef.current.getTrialState();
        setTrialActive(tr.active);
        setTrialCheckpoint(tr.checkpoint);
        if (tr.active) {
          setTrialElapsed((performance.now() - tr.startTime) / 1000);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Ambient music toggle
  useEffect(() => {
    if (screen === 'playing' && !sound.muted) {
      soundManager.startAmbientMusic();
    } else {
      soundManager.stopAmbientMusic();
    }
  }, [screen, sound.muted]);

  const handleStartGame = () => {
    soundManager.startAmbientMusic();
    setScreen('playing');
  };

  const handleToggleMute = () => {
    setSound({ ...sound, muted: !sound.muted });
  };

  const handleStartParkourTrial = () => {
    gameCanvasRef.current?.startParkourTrial();
  };

  const handleRespawn = () => {
    gameCanvasRef.current?.resetPlayerPosition();
  };

  const handleTriggerPulse = () => {
    gameCanvasRef.current?.triggerPulse();
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0f1d] select-none text-slate-100">
      {/* 3D WebGL Canvas (Isolated, stable lifecycle, never torn down) */}
      <GameCanvas
        ref={gameCanvasRef}
        customization={customization}
        isTitleScreen={screen === 'title'}
        onCrystalCollected={onCrystalCollected}
        onGatewayActivated={onGatewayActivated}
        onCheckpointPassed={(idx, _total) => {
          setTrialCheckpoint(idx);
        }}
        onTrialFinished={onTrialFinished}
        onInteractionAvailable={setInteractionPrompt}
        onObjectiveMessage={setObjectiveMessage}
        onPauseRequested={() => {
          if (screen === 'playing') {
            setModal('settings');
          }
        }}
      />

      {/* Title Screen Overlay */}
      {screen === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenCustomization={() => setModal('customization')}
          onOpenChallenges={() => setModal('challenges')}
          onOpenSocial={() => setModal('social')}
          onOpenSettings={() => setModal('settings')}
        />
      )}

      {/* In-Game HUD Overlay */}
      {screen === 'playing' && (
        <>
          <HUD
            progress={progress}
            sound={sound}
            interactionPrompt={interactionPrompt}
            objectiveMessage={objectiveMessage}
            pulseCooldownPercent={pulseCooldownPct}
            isTrialActive={trialActive}
            trialElapsedTime={trialElapsed}
            trialCheckpoint={trialCheckpoint}
            onOpenCustomization={() => setModal('customization')}
            onOpenChallenges={() => setModal('challenges')}
            onOpenSocial={() => setModal('social')}
            onOpenSettings={() => setModal('settings')}
            onToggleMute={handleToggleMute}
            onRespawn={handleRespawn}
            onTriggerPulse={handleTriggerPulse}
          />

          {/* On-screen Touch Controls (Mobile / Tablet) */}
          {isMobile && (
            <MobileControls
              onMove={(x, y) => {
                gameCanvasRef.current?.setVirtualStick(x, y);
              }}
              onJump={() => {
                gameCanvasRef.current?.triggerJump();
              }}
              onPulse={() => {
                gameCanvasRef.current?.triggerPulse();
              }}
              pulseCooldownPercent={pulseCooldownPct}
            />
          )}
        </>
      )}

      {/* Modals */}
      {modal === 'customization' && (
        <CustomizationModal
          customization={customization}
          onUpdate={setCustomization}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'challenges' && (
        <ChallengesModal
          progress={progress}
          onStartTrial={handleStartParkourTrial}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'social' && (
        <SocialModal onClose={() => setModal(null)} />
      )}

      {modal === 'settings' && (
        <SettingsModal
          sound={sound}
          graphics={graphics}
          language={language}
          onUpdateSound={setSound}
          onUpdateGraphics={setGraphics}
          onUpdateLanguage={setLanguage}
          onClose={() => setModal(null)}
        />
      )}

      {/* Global Achievement & Milestone Toast Banner */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
          <div className="px-5 py-2.5 rounded-full border border-amber-400/40 bg-[#161226]/95 text-amber-200 text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </main>
  );
}
