// LocalStorage persistence, achievements, and game progression state for PLYHUB
import { useState, useEffect, useCallback } from 'react';
import {
  GameScreen,
  PlayerCustomization,
  Achievement,
  ParkourTrial,
  GameProgress,
  SoundSettings,
  GraphicsSettings,
  SupportedLanguage,
} from '../types/game';
import { soundManager } from '../audio/SoundSynth';

const STORAGE_KEY_PROGRESS = 'plyhub_progress_v1';
const STORAGE_KEY_CUSTOM = 'plyhub_customization_v1';
const STORAGE_KEY_SOUND = 'plyhub_sound_v1';
const STORAGE_KEY_GRAPHICS = 'plyhub_graphics_v1';
const STORAGE_KEY_LANG = 'plyhub_lang_v1';

const DEFAULT_CUSTOMIZATION: PlayerCustomization = {
  armorColor: '#00f2fe',
  accentColor: '#fa709a',
  visorColor: '#00f2fe',
  companionType: 'lumi',
  companionColor: '#4facfe',
  trailType: 'stardust',
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_crystal',
    title: 'Spark of Light',
    description: 'Gather your first Celestial Crystal from the floating sanctuary.',
    unlocked: false,
    icon: 'sparkles',
  },
  {
    id: 'crystal_hoarder',
    title: 'Energy Convergence',
    description: 'Collect 5 Celestial Crystals to resonate with ancient structures.',
    unlocked: false,
    icon: 'gem',
  },
  {
    id: 'gateway_awakened',
    title: 'Gate of Horizons',
    description: 'Awaken the Ancient Gateway with pure crystal resonance.',
    unlocked: false,
    icon: 'door-open',
  },
  {
    id: 'sky_summit',
    title: 'Sky High Explorer',
    description: 'Leap across the floating stepping stones and reach the Sky Summit.',
    unlocked: false,
    icon: 'mountain',
  },
  {
    id: 'speed_demon',
    title: 'Chrono Dasher',
    description: 'Complete the Chrono Parkour Trail in under 45 seconds.',
    unlocked: false,
    icon: 'zap',
  },
  {
    id: 'pulse_master',
    title: 'Resonant Pulse',
    description: 'Unleash an Energy Pulse to illuminate hidden celestial resonance.',
    unlocked: false,
    icon: 'radio',
  },
];

const INITIAL_TRIALS: ParkourTrial[] = [
  {
    id: 'chrono_trail_1',
    name: 'Celestial Stepping Stones',
    description: 'Race across 5 aerial platforms and trigger all checkpoint rings.',
    targetSeconds: 45.0,
    bestTime: null,
    completed: false,
  },
];

const DEFAULT_SOUND: SoundSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.85,
  muted: false,
};

const DEFAULT_GRAPHICS: GraphicsSettings = {
  quality: 'high',
  shadows: true,
  postFx: true,
  fieldOfView: 60,
  cameraSensitivity: 1.0,
};

export function useGameState() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [objectiveMessage, setObjectiveMessage] = useState<string>(
    'Awaken the Hub: Collect 5 Celestial Crystals to activate the Ancient Gateway'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customization
  const [customization, setCustomization] = useState<PlayerCustomization>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM);
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMIZATION;
    } catch {
      return DEFAULT_CUSTOMIZATION;
    }
  });

  // Progress
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          crystalsCollected: parsed.crystalsCollected || 0,
          totalCrystals: 10,
          portalActivated: parsed.portalActivated || false,
          gatewaysOpened: parsed.gatewaysOpened || 0,
          unlockedCosmetics: parsed.unlockedCosmetics || ['lumi', 'stardust'],
          achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
          trials: parsed.trials || INITIAL_TRIALS,
          highScore: parsed.highScore || 0,
        };
      }
    } catch {
      // Fallback
    }
    return {
      crystalsCollected: 0,
      totalCrystals: 10,
      portalActivated: false,
      gatewaysOpened: 0,
      unlockedCosmetics: ['lumi', 'stardust'],
      achievements: INITIAL_ACHIEVEMENTS,
      trials: INITIAL_TRIALS,
      highScore: 0,
    };
  });

  // Sound Settings
  const [sound, setSound] = useState<SoundSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      return saved ? JSON.parse(saved) : DEFAULT_SOUND;
    } catch {
      return DEFAULT_SOUND;
    }
  });

  // Graphics Settings
  const [graphics, setGraphics] = useState<GraphicsSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GRAPHICS);
      return saved ? JSON.parse(saved) : DEFAULT_GRAPHICS;
    } catch {
      return DEFAULT_GRAPHICS;
    }
  });

  // Language
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      return (saved as SupportedLanguage) || 'en';
    } catch {
      return 'en';
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customization));
    } catch {}
  }, [customization]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(sound));
      soundManager.updateSettings(sound);
    } catch {}
  }, [sound]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GRAPHICS, JSON.stringify(graphics));
    } catch {}
  }, [graphics]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, language);
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    } catch {}
  }, [language]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setProgress((prev) => {
      const ach = prev.achievements.find((a) => a.id === id);
      if (ach && !ach.unlocked) {
        showToast(`🏆 Achievement Unlocked: ${ach.title}!`);
        soundManager.playPortalOpen();
        return {
          ...prev,
          achievements: prev.achievements.map((a) => (a.id === id ? { ...a, unlocked: true } : a)),
        };
      }
      return prev;
    });
  }, [showToast]);

  const onCrystalCollected = useCallback((count: number, _total: number) => {
    setProgress((prev) => ({
      ...prev,
      crystalsCollected: count,
      highScore: Math.max(prev.highScore, count * 100),
    }));

    if (count === 1) {
      unlockAchievement('first_crystal');
    }
    if (count >= 5) {
      unlockAchievement('crystal_hoarder');
      setObjectiveMessage('Gateway Ready: Approach the Ancient Gateway at the sanctuary edge and activate it!');
    }
    if (count === 10) {
      unlockAchievement('sky_summit');
      showToast('🌟 All Celestial Crystals Gathered! You are a master explorer!');
    }
  }, [unlockAchievement, showToast]);

  const onGatewayActivated = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      portalActivated: true,
      gatewaysOpened: prev.gatewaysOpened + 1,
    }));
    unlockAchievement('gateway_awakened');
    setObjectiveMessage('Ancient Gateway Activated! The Skyway to the Celestial Summit is now open!');
    showToast('✨ The Ancient Gateway hums with celestial energy!');
  }, [unlockAchievement, showToast]);

  const onTrialFinished = useCallback((elapsedSeconds: number) => {
    setProgress((prev) => {
      const trial = prev.trials[0];
      const isNewBest = trial.bestTime === null || elapsedSeconds < trial.bestTime;
      const best = isNewBest ? elapsedSeconds : trial.bestTime;

      return {
        ...prev,
        trials: [
          {
            ...trial,
            completed: true,
            bestTime: best,
          },
        ],
      };
    });

    showToast(`⏱️ Chrono Trail Completed in ${elapsedSeconds.toFixed(2)}s!`);
    if (elapsedSeconds <= 45.0) {
      unlockAchievement('speed_demon');
    }
  }, [unlockAchievement, showToast]);

  return {
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
    showToast,
    unlockAchievement,
    onCrystalCollected,
    onGatewayActivated,
    onTrialFinished,
  };
}
