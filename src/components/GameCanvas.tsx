// Isolated WebGL Canvas component for PLYHUB with stable lifecycle and responsive input handling
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { GameWorld, GameWorldCallbacks } from '../game/GameWorld';
import { PlayerCustomization } from '../types/game';
import { InputState } from '../game/PlayerController';

export interface GameCanvasHandle {
  setVirtualStick: (x: number, y: number) => void;
  triggerJump: () => void;
  triggerPulse: () => void;
  resetPlayerPosition: () => void;
  startParkourTrial: () => void;
  getPulseCooldown: () => { current: number; max: number };
  getTrialState: () => { active: boolean; startTime: number; checkpoint: number };
}

interface GameCanvasProps {
  customization: PlayerCustomization;
  isTitleScreen: boolean;
  onCrystalCollected: (count: number, total: number) => void;
  onGatewayActivated: () => void;
  onCheckpointPassed: (index: number, total: number) => void;
  onTrialFinished: (elapsedSeconds: number) => void;
  onInteractionAvailable: (prompt: string | null) => void;
  onObjectiveMessage: (text: string) => void;
  onPauseRequested: () => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  (
    {
      customization,
      isTitleScreen,
      onCrystalCollected,
      onGatewayActivated,
      onCheckpointPassed,
      onTrialFinished,
      onInteractionAvailable,
      onObjectiveMessage,
      onPauseRequested,
    },
    ref
  ) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const gameWorldRef = useRef<GameWorld | null>(null);

    // Callbacks container in ref to avoid re-triggering world init on state update
    const callbacksRef = useRef<GameWorldCallbacks>({
      onCrystalCollected,
      onGatewayActivated,
      onCheckpointPassed,
      onTrialFinished,
      onInteractionAvailable,
      onObjectiveMessage,
    });

    useEffect(() => {
      callbacksRef.current = {
        onCrystalCollected,
        onGatewayActivated,
        onCheckpointPassed,
        onTrialFinished,
        onInteractionAvailable,
        onObjectiveMessage,
      };
    });

    // Input state ref
    const inputStateRef = useRef<InputState>({
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      pulse: false,
      virtualStick: { x: 0, y: 0 },
    });

    // Imperative handle for mobile buttons and external controls
    useImperativeHandle(ref, () => ({
      setVirtualStick: (x: number, y: number) => {
        inputStateRef.current.virtualStick = { x, y };
      },
      triggerJump: () => {
        inputStateRef.current.jump = true;
        setTimeout(() => {
          inputStateRef.current.jump = false;
        }, 150);
      },
      triggerPulse: () => {
        inputStateRef.current.pulse = true;
        setTimeout(() => {
          inputStateRef.current.pulse = false;
        }, 150);
      },
      resetPlayerPosition: () => {
        gameWorldRef.current?.player.respawn();
      },
      startParkourTrial: () => {
        gameWorldRef.current?.startParkourTrial();
      },
      getPulseCooldown: () => {
        const p = gameWorldRef.current?.player;
        return {
          current: p?.pulseCooldown || 0,
          max: p?.maxPulseCooldown || 4.0,
        };
      },
      getTrialState: () => {
        const gw = gameWorldRef.current;
        return {
          active: gw?.isTrialActive || false,
          startTime: gw?.trialStartTime || 0,
          checkpoint: gw?.currentCheckpointIndex || 0,
        };
      },
    }));

    // Initialize GameWorld once on mount
    useEffect(() => {
      if (!mountRef.current) return;

      const world = new GameWorld(mountRef.current, customization, {
        onCrystalCollected: (c, t) => callbacksRef.current.onCrystalCollected(c, t),
        onGatewayActivated: () => callbacksRef.current.onGatewayActivated(),
        onCheckpointPassed: (i, t) => callbacksRef.current.onCheckpointPassed(i, t),
        onTrialFinished: (e) => callbacksRef.current.onTrialFinished(e),
        onInteractionAvailable: (p) => callbacksRef.current.onInteractionAvailable(p),
        onObjectiveMessage: (m) => callbacksRef.current.onObjectiveMessage(m),
      });

      world.setScreenMode(isTitleScreen ? 'title' : 'playing');
      gameWorldRef.current = world;

      // Input event listeners
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        const key = e.key.toLowerCase();

        if (key === 'w' || key === 'arrowup') inputStateRef.current.forward = true;
        if (key === 's' || key === 'arrowdown') inputStateRef.current.backward = true;
        if (key === 'a' || key === 'arrowleft') inputStateRef.current.left = true;
        if (key === 'd' || key === 'arrowright') inputStateRef.current.right = true;
        if (key === ' ' || key === 'spacebar') {
          inputStateRef.current.jump = true;
          e.preventDefault();
        }
        if (key === 'e' || key === 'q') {
          inputStateRef.current.pulse = true;
        }
        if (key === 'escape') {
          onPauseRequested();
        }
      };

      const onKeyUp = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') inputStateRef.current.forward = false;
        if (key === 's' || key === 'arrowdown') inputStateRef.current.backward = false;
        if (key === 'a' || key === 'arrowleft') inputStateRef.current.left = false;
        if (key === 'd' || key === 'arrowright') inputStateRef.current.right = false;
        if (key === ' ' || key === 'spacebar') inputStateRef.current.jump = false;
        if (key === 'e' || key === 'q') inputStateRef.current.pulse = false;
      };

      const onBlur = () => {
        // Clear all held keys on window blur
        inputStateRef.current = {
          forward: false,
          backward: false,
          left: false,
          right: false,
          jump: false,
          pulse: false,
          virtualStick: { x: 0, y: 0 },
        };
      };

      // Mouse drag camera control
      let isDragging = false;
      let lastMouseX = 0;
      let lastMouseY = 0;

      const onMouseDown = (e: MouseEvent) => {
        // Allow drag on canvas
        if (e.button === 0 || e.button === 2) {
          isDragging = true;
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging || !gameWorldRef.current) return;
        const deltaX = (e.clientX - lastMouseX) * 0.005;
        const deltaY = (e.clientY - lastMouseY) * 0.005;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        gameWorldRef.current.player.rotateCamera(deltaX, deltaY);
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const onContextMenu = (e: MouseEvent) => {
        e.preventDefault(); // Prevent right-click context menu in game
      };

      // Touch drag camera control on right half of canvas
      let touchCamId: number | null = null;
      let lastTouchX = 0;
      let lastTouchY = 0;

      const onTouchStart = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          // If touch is on right 55% of screen, use for camera look
          if (t.clientX > window.innerWidth * 0.45 && touchCamId === null) {
            touchCamId = t.identifier;
            lastTouchX = t.clientX;
            lastTouchY = t.clientY;
          }
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (touchCamId === null || !gameWorldRef.current) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchCamId) {
            const deltaX = (t.clientX - lastTouchX) * 0.006;
            const deltaY = (t.clientY - lastTouchY) * 0.006;
            lastTouchX = t.clientX;
            lastTouchY = t.clientY;
            gameWorldRef.current.player.rotateCamera(deltaX, deltaY);
          }
        }
      };

      const onTouchEnd = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchCamId) {
            touchCamId = null;
          }
        }
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('blur', onBlur);

      const dom = mountRef.current;
      dom.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      dom.addEventListener('contextmenu', onContextMenu);

      dom.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });

      // Frame tick hook for gameplay controller
      let animId = 0;
      let lastT = performance.now();
      const inputTick = (now: number) => {
        const dt = Math.min((now - lastT) / 1000, 0.05);
        lastT = now;
        if (gameWorldRef.current) {
          gameWorldRef.current.updateGameplay(dt, inputStateRef.current);
        }
        animId = requestAnimationFrame(inputTick);
      };
      animId = requestAnimationFrame(inputTick);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', onBlur);

        dom.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        dom.removeEventListener('contextmenu', onContextMenu);

        dom.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);

        world.destroy();
        gameWorldRef.current = null;
      };
    }, []);

    // Sync title mode changes
    useEffect(() => {
      if (gameWorldRef.current) {
        gameWorldRef.current.setScreenMode(isTitleScreen ? 'title' : 'playing');
      }
    }, [isTitleScreen]);

    // Sync customization updates
    useEffect(() => {
      if (gameWorldRef.current) {
        gameWorldRef.current.updateCustomization(customization);
      }
    }, [customization]);

    return (
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full overflow-hidden select-none touch-none bg-[#0a0f1d]"
      />
    );
  }
);
GameCanvas.displayName = 'GameCanvas';
