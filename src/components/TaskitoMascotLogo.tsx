import React, { useEffect, useRef } from 'react';
import { MascotMood } from '../types';

interface TaskitoMascotLogoProps {
  onClick?: () => void;
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTitle?: boolean;
  wearingHeadphones?: boolean;
  holdingCoffee?: boolean;
  steamHeartActive?: boolean;
  isHopping?: boolean;
}

export const TaskitoMascotLogo: React.FC<TaskitoMascotLogoProps> = ({
  onClick,
  mood = 'happy',
  size = 'md',
  showTitle = true,
  wearingHeadphones = false,
  holdingCoffee = false,
  steamHeartActive = false,
  isHopping = false,
}) => {
  const mascotRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current || !faceRef.current) return;

      const rect = mascotRef.current.getBoundingClientRect();
      const mascotX = rect.left + rect.width / 2;
      const mascotY = rect.top + rect.height / 2;

      // Subtle eye/face tracking offset (max ~6px)
      const angleX = ((e.clientX - mascotX) / window.innerWidth) * 8;
      const angleY = ((e.clientY - mascotY) / window.innerHeight) * 8;

      faceRef.current.style.transform = `translate(${angleX}px, ${angleY}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-12 h-12 rounded-2xl',
    lg: 'w-20 h-20 rounded-3xl',
    xl: 'w-36 h-36 rounded-[2.5rem]',
  };

  const faceScale = {
    sm: 'scale-75',
    md: 'scale-100',
    lg: 'scale-150',
    xl: 'scale-[2.5]',
  };

  return (
    <div
      onClick={onClick}
      className={`taskito-brand flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      }`}
      title="Taskito - Mascote e Rotinas"
    >
      {/* Mascote */}
      <div
        ref={mascotRef}
        className={`${sizeClasses[size]} flex items-center justify-center relative cursor-pointer select-none transition-all duration-300 ease-out ${
          isHopping ? 'animate-mascot-hop' : 'animate-mascot-idle'
        } group-hover:scale-105 group-hover:-translate-y-0.5`}
        style={{
          background: 'linear-gradient(135deg, var(--mascot-from, #7A1BF2) 0%, var(--mascot-to, #6312D6) 100%)',
          boxShadow: '0 6px 18px var(--mascot-glow, rgba(122, 27, 242, 0.35))',
        }}
      >
        {/* Headphone Accessory */}
        {wearingHeadphones && size === 'xl' && (
          <>
            {/* Top band */}
            <div className="absolute -top-3.5 left-3 right-3 h-7 rounded-t-full border-t-[5px] border-x-[5px] border-slate-800 dark:border-slate-200 pointer-events-none z-20" />
            {/* Left ear cushion */}
            <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-3.5 h-10 bg-slate-800 dark:border dark:border-slate-400 dark:bg-slate-200 rounded-l-xl shadow-md pointer-events-none z-20" />
            {/* Right ear cushion */}
            <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-3.5 h-10 bg-slate-800 dark:border dark:border-slate-400 dark:bg-slate-200 rounded-r-xl shadow-md pointer-events-none z-20" />
          </>
        )}

        {/* Coffee / Tea Mug Accessory */}
        {holdingCoffee && size === 'xl' && (
          <div className="absolute -bottom-2 -right-2 z-20 flex items-center justify-center">
            <div className="w-9 h-9 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-700/60 shadow-lg flex items-center justify-center text-lg select-none transform hover:scale-110 transition-transform">
              ☕
            </div>

            {/* Rising Steam Heart */}
            {steamHeartActive && (
              <>
                <span className="absolute -top-7 -right-1 text-base select-none pointer-events-none animate-steam-heart">
                  💖
                </span>
                <span
                  className="absolute -top-11 right-1 text-xs select-none pointer-events-none animate-steam-heart"
                  style={{ animationDelay: '0.35s' }}
                >
                  💨
                </span>
                <span
                  className="absolute -top-14 -left-1 text-[11px] select-none pointer-events-none animate-steam-heart"
                  style={{ animationDelay: '0.65s' }}
                >
                  ✨
                </span>
              </>
            )}
          </div>
        )}

        <div
          ref={faceRef}
          className={`w-6 h-[18px] flex flex-col items-center justify-between transition-transform duration-75 ease-out ${faceScale[size]}`}
        >
          {/* Eyes depending on mood */}
          <div className="flex justify-between w-full px-0.5">
            {mood === 'loving' ? (
              <>
                <span className="text-[10px] leading-none select-none">❤️</span>
                <span className="text-[10px] leading-none select-none">❤️</span>
              </>
            ) : mood === 'focused' ? (
              <>
                <span className="w-1.5 h-1 bg-white rounded-sm inline-block transform rotate-12" />
                <span className="w-1.5 h-1 bg-white rounded-sm inline-block transform -rotate-12" />
              </>
            ) : mood === 'sleepy' ? (
              <>
                <span className="w-1.5 h-0.5 bg-white rounded-full inline-block mt-1" />
                <span className="w-1.5 h-0.5 bg-white rounded-full inline-block mt-1" />
              </>
            ) : mood === 'excited' ? (
              <>
                <span className="text-[9px] leading-none font-bold text-white select-none">★</span>
                <span className="text-[9px] leading-none font-bold text-white select-none">★</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-eye-blink" />
                <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-eye-blink" />
              </>
            )}
          </div>

          {/* Mouth depending on mood */}
          {mood === 'sleepy' ? (
            <div className="w-1.5 h-1.5 rounded-full border border-white" />
          ) : mood === 'excited' ? (
            <svg className="w-3.5 h-2" viewBox="0 0 14 8">
              <path
                d="M 1 2 Q 7 8 13 2 Z"
                fill="#FFFFFF"
              />
            </svg>
          ) : (
            <svg className="w-3 h-1.5" viewBox="0 0 12 6">
              <path
                d="M 1 1 Q 6 6 11 1"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Nome do Site */}
      {showTitle && (
        <span className="font-extrabold text-xl tracking-wider text-slate-900 dark:text-white group-hover:opacity-90 transition-opacity">
          TASKITO
        </span>
      )}
    </div>
  );
};
