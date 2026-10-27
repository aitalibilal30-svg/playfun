export type GameScreen = 'title' | 'playing' | 'paused' | 'customization' | 'challenges' | 'social' | 'settings' | 'victory';

export interface PlayerCustomization {
  armorColor: string; // Hex color for suit
  accentColor: string; // Hex color for highlights
  visorColor: string; // Glowing visor color
  companionType: 'lumi' | 'chrono' | 'starling' | 'pyra';
  companionColor: string;
  trailType: 'stardust' | 'solar' | 'emerald' | 'void';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface ParkourTrial {
  id: string;
  name: string;
  description: string;
  targetSeconds: number;
  bestTime: number | null; // in seconds
  completed: boolean;
}

export interface GameProgress {
  crystalsCollected: number;
  totalCrystals: number;
  portalActivated: boolean;
  gatewaysOpened: number;
  unlockedCosmetics: string[];
  achievements: Achievement[];
  trials: ParkourTrial[];
  highScore: number;
}

export interface SoundSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface GraphicsSettings {
  quality: 'high' | 'medium' | 'low';
  shadows: boolean;
  postFx: boolean;
  fieldOfView: number;
  cameraSensitivity: number;
}

export type SupportedLanguage = 'en' | 'fr' | 'ar';
