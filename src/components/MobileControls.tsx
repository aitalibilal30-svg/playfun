// Touch Virtual Joystick and Action Buttons for Mobile / Tablet devices
import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, Zap } from 'lucide-react';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onJump: () => void;
  onPulse: () => void;
  pulseCooldownPercent: number; // 0 (ready) to 1 (full cooldown)
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onJump,
  onPulse,
  pulseCooldownPercent,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const radius = 50;

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (touchIdRef.current === null || !joystickBaseRef.current) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current) {
          const rect = joystickBaseRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          let dx = touch.clientX - centerX;
          let dy = touch.clientY - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > radius) {
            dx = (dx / dist) * radius;
            dy = (dy / dist) * radius;
          }

          setKnobPos({ x: dx, y: dy });
          onMove(dx / radius, dy / radius);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          touchIdRef.current = null;
          setIsDragging(false);
          setKnobPos({ x: 0, y: 0 });
          onMove(0, 0);
          break;
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onMove]);

  const handleBaseTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        dx = (dx / dist) * radius;
        dy = (dy / dist) * radius;
      }

      setKnobPos({ x: dx, y: dy });
      onMove(dx / radius, dy / radius);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-6 select-none">
      {/* Virtual Joystick (Left) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleBaseTouchStart}
        className="pointer-events-auto relative w-32 h-32 rounded-full border-2 border-cyan-400/30 bg-[#0e1628]/60 flex items-center justify-center shadow-lg"
      >
        <div
          className={`w-14 h-14 rounded-full bg-cyan-400/80 border border-white/60 shadow-md transform transition-transform ${
            isDragging ? 'scale-110 bg-cyan-300' : ''
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
        <span className="absolute bottom-2 text-[10px] uppercase tracking-wider text-cyan-200/50 font-semibold pointer-events-none">
          Move
        </span>
      </div>

      {/* Action Buttons (Right) */}
      <div className="pointer-events-auto flex items-center gap-4 mb-2">
        {/* Energy Pulse Button */}
        <button
          onClick={onPulse}
          disabled={pulseCooldownPercent > 0}
          className={`relative w-16 h-16 rounded-full border flex flex-col items-center justify-center font-bold transition-all active:scale-95 ${
            pulseCooldownPercent > 0
              ? 'border-pink-500/20 bg-[#161224]/70 text-pink-400/40 cursor-not-allowed'
              : 'border-pink-400/60 bg-[#281530]/80 text-pink-300 hover:bg-[#341b3e] shadow-lg shadow-pink-500/20'
          }`}
        >
          {pulseCooldownPercent > 0 && (
            <div
              className="absolute inset-0 rounded-full border-2 border-pink-400 border-t-transparent animate-spin"
            />
          )}
          <Zap className="w-6 h-6 mb-0.5" />
          <span className="text-[9px] uppercase tracking-wider">Pulse</span>
        </button>

        {/* Jump Button */}
        <button
          onClick={onJump}
          className="w-18 h-18 rounded-full border-2 border-cyan-400/80 bg-[#0d2a45]/85 text-cyan-200 flex flex-col items-center justify-center font-bold active:scale-95 transition-transform shadow-lg shadow-cyan-500/20"
        >
          <ArrowUp className="w-7 h-7 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider">Jump</span>
        </button>
      </div>
    </div>
  );
};
