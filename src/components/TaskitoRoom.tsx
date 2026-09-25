import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, MascotMood } from '../types';
import {
  TASKITO_COLOR_THEMES,
  calculateLevelFromXp,
  XP_PER_TASK,
} from '../utils/themeColors';
import { sounds } from '../utils/audio';
import { TaskitoMascotLogo } from './TaskitoMascotLogo';
import {
  Lock,
  Check,
  Heart,
  Zap,
  Coffee,
  Moon,
  Trophy,
  Palette,
  PartyPopper,
  Headphones,
  Music,
  CloudRain,
  Volume2,
  Volume1,
  VolumeX,
  Play,
  Pause,
  Loader2,
  Radio,
} from 'lucide-react';

interface TaskitoRoomProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  completedTasksToday: number;
  totalTasksToday: number;
}

export interface LofiStation {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  streamUrl?: string;
  isRain?: boolean;
}

export const LOFI_STATIONS: LofiStation[] = [
  {
    id: 'lo-fi-fire-fm',
    name: 'Lo-Fi Fire FM',
    tagline: 'Batidas quentes e aconchegantes ao vivo',
    emoji: '🔥',
    streamUrl: 'https://stream.laut.fm/lo-firefm',
  },
  {
    id: 'radio-record-lofi',
    name: 'Radio Record Lo-Fi',
    tagline: 'Stream clássico e suave de Lo-Fi',
    emoji: '📻',
    streamUrl: 'https://online.radiorecord.com.ua/lofi',
  },
  {
    id: 'lo-fi-radio',
    name: 'Lo-Fi Radio',
    tagline: 'Foco contínuo e batidas tranquilas',
    emoji: '🎧',
    streamUrl: 'https://live.lofiradio.ru/mp3_128',
  },
  {
    id: 'zen-lo-fi',
    name: 'Zen Lo-Fi',
    tagline: 'Paz profunda, meditação e relaxamento',
    emoji: '🧘',
    streamUrl: 'https://stream.zeno.fm/z65dsrrsrg0uv',
  },
  {
    id: 'soft-rain',
    name: 'Chuva Suave (Ambiente)',
    tagline: 'Som natural de chuva relaxante gerado ao vivo',
    emoji: '🌧️',
    isRain: true,
  },
];

interface FloatingHeart {
  id: number;
  xOffset: number;
  emoji: string;
}

export const TaskitoRoom: React.FC<TaskitoRoomProps> = ({
  settings,
  onUpdateSettings,
  completedTasksToday,
  totalTasksToday,
}) => {
  const currentXp = settings.xp || 0;
  const currentThemeId = settings.selectedColorThemeId || 'classic-purple';
  const currentMood = settings.mascotMood || 'happy';

  const { level, nextLevelXp, progressPercent, isMaxLevel } =
    calculateLevelFromXp(currentXp);

  // Friendly desk companion speech
  const [activeSpeech, setActiveSpeech] = useState<string>(() => {
    if (completedTasksToday > 0 && completedTasksToday === totalTasksToday) {
      return 'Você zerou todas as rotinas hoje! Agora é hora de relaxar e descansar sem culpa ☕✨';
    }
    if (completedTasksToday > 0) {
      return `Que bom ter você aqui! Já concluímos ${completedTasksToday} ${
        completedTasksToday === 1 ? 'atividade' : 'atividades'
      } hoje. Estou aqui ao seu lado!`;
    }
    return 'Oi! Eu sou seu companheiro de mesa de trabalho digital. Sem cobrança, no seu ritmo! ☕✨';
  });

  // Coffee & Tea state
  const [holdingCoffee, setHoldingCoffee] = useState(false);
  const [steamHeartActive, setSteamHeartActive] = useState(false);
  const [beverageType, setBeverageType] = useState<'cafe' | 'cha'>('cafe');

  // Petting & hopping state
  const [isHopping, setIsHopping] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const heartCounterRef = useRef(0);
  const lastPetTimeRef = useRef(0);

  // Native HTML5 Stream Audio Player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState<LofiStation>(LOFI_STATIONS[0]);
  const [lofiVolume, setLofiVolume] = useState<number>(0.75);
  const [lofiMuted, setLofiMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = lofiMuted ? 0 : lofiVolume;
    }
  }, [lofiVolume, lofiMuted]);

  // Handle Radio Stream / Rain Ambient Playback
  useEffect(() => {
    if (!isLofiPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      sounds.stopRainAmbient();
      setIsBuffering(false);
      setStreamError(null);
      return;
    }

    if (selectedStation.isRain) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      sounds.startRainAmbient();
      setIsBuffering(false);
      setStreamError(null);
    } else if (selectedStation.streamUrl) {
      sounds.stopRainAmbient();
      if (audioRef.current) {
        setIsBuffering(true);
        setStreamError(null);
        audioRef.current.src = selectedStation.streamUrl;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => {
            setIsBuffering(false);
          })
          .catch((err) => {
            console.warn('Live stream autoplay error:', err);
            setIsBuffering(false);
            setStreamError('Clique no botão Play para iniciar o stream');
          });
      }
    }
  }, [isLofiPlaying, selectedStation]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      sounds.stopRainAmbient();
    };
  }, []);

  // 1. Action: ☕ Oferecer Café/Chá
  const handleOfferDrink = (type: 'cafe' | 'cha' = 'cafe') => {
    setBeverageType(type);
    setHoldingCoffee(true);
    setSteamHeartActive(true);
    onUpdateSettings({ ...settings, mascotMood: 'happy' });

    if (settings.soundEnabled) {
      sounds.playCoffeeChime();
    }

    if (type === 'cafe') {
      const phrases = [
        'Huuuum... um cafezinho quentinho! Obrigado pelo carinho! ☕❤️',
        '*Slurp*... que delícia! Recarregando a mente para focar leve ☕✨',
        'Café aceito com amor! Respire fundo, estamos juntos nessa ☕🤍',
      ];
      setActiveSpeech(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      const phrases = [
        'Um chazinho relaxante para acalmar a mente... Que paz! 🍵💚',
        '*Slurp*... quentinho e reconfortante! O momento perfeito para desacelerar 🍵🌿',
      ];
      setActiveSpeech(phrases[Math.floor(Math.random() * phrases.length)]);
    }

    spawnHearts(['💖', '☕', '✨']);

    setTimeout(() => {
      setSteamHeartActive(false);
    }, 4000);
  };

  // 2. Action: ✨ Fazer Carinho
  const handlePet = (isHoverTrigger = false) => {
    const now = Date.now();
    if (isHoverTrigger && now - lastPetTimeRef.current < 1200) {
      return;
    }
    lastPetTimeRef.current = now;

    setIsHopping(true);
    onUpdateSettings({ ...settings, mascotMood: 'loving' });

    if (settings.soundEnabled) {
      sounds.playPetChime();
    }

    const phrases = [
      'Aaaahn... que cafuné gostoso! Meu coração ficou quentinho! 🥰✨',
      'Você é demais! Obrigado por me ter como seu parceiro de mesa ❤️',
      'Pulinho de alegria! Seu carinho recarrega qualquer dia cansativo ✨💖',
      'Aconchego quentinho! Lembre-se de tomar água e relaxar os ombros 🥰',
    ];
    setActiveSpeech(phrases[Math.floor(Math.random() * phrases.length)]);

    spawnHearts(['💖', '❤️', '✨', '🥰']);

    setTimeout(() => {
      setIsHopping(false);
    }, 600);
  };

  // Helper to spawn floating hearts
  const spawnHearts = (emojis: string[]) => {
    const newItems: FloatingHeart[] = [];
    for (let i = 0; i < 4; i++) {
      heartCounterRef.current += 1;
      newItems.push({
        id: heartCounterRef.current,
        xOffset: (Math.random() - 0.5) * 110,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }
    setFloatingHearts((prev) => [...prev, ...newItems]);

    setTimeout(() => {
      setFloatingHearts((prev) =>
        prev.filter((h) => !newItems.some((n) => n.id === h.id))
      );
    }, 1500);
  };

  // 3. Action: 🎧 Modo Lofi Toggle
  const handleToggleLofi = () => {
    const nextState = !isLofiPlaying;
    setIsLofiPlaying(nextState);

    if (nextState) {
      setActiveSpeech(
        `Coloquei meus fones! Tocando "${selectedStation.name}" ao vivo 🎧🎵`
      );
      if (settings.soundEnabled) {
        sounds.playReminderChime();
      }
    } else {
      setActiveSpeech(
        'Pausa no streaming. O silêncio também é muito aconchegante! 🤍'
      );
    }
  };

  const handleSelectStation = (station: LofiStation) => {
    setSelectedStation(station);
    setIsLofiPlaying(true);
    setActiveSpeech(
      `Sintonizado em "${station.name}"! Respire, relaxe e curta a vibe 🎧✨`
    );
  };

  const handleSetMood = (mood: MascotMood, speech: string) => {
    onUpdateSettings({ ...settings, mascotMood: mood });
    setActiveSpeech(speech);
    if (settings.soundEnabled) {
      sounds.playReminderChime();
    }
  };

  const handleSelectTheme = (themeId: string, requiredXp: number) => {
    if (currentXp < requiredXp) return;
    onUpdateSettings({
      ...settings,
      selectedColorThemeId: themeId,
    });
    if (settings.soundEnabled) {
      sounds.playSuccessChime();
    }
    setActiveSpeech('Uau! Essa nova cor ficou maravilhosa em nós! Combina perfeitamente com seu estilo!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hidden Native Audio Element for live radio streams */}
      <audio
        ref={audioRef}
        preload="none"
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setStreamError(null);
        }}
        onError={() => {
          setIsBuffering(false);
          setStreamError('Não foi possível carregar o áudio. Tente outra estação.');
        }}
      />

      {/* 1. Header Hero Banner - Café & Carinho */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
              color: 'var(--app-primary, #7014F2)',
              borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.25))',
            }}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Café & Carinho • Tamagotchi Ultraminimalista</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Seu Companheiro de Mesa de Trabalho
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Sem cobranças ou notificações agressivas. Ofereça um café, faça carinho e ligue o player de streaming Lo-Fi ao vivo enquanto você trabalha ou descansa.
          </p>
        </div>

        {/* Level & XP Gauge */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 w-full md:w-72 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Nível {level}</span>
            </span>
            <span style={{ color: 'var(--app-primary, #7014F2)' }}>
              {currentXp} XP {isMaxLevel ? '(Máximo!)' : `/ ${nextLevelXp} XP`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--app-primary, #7014F2)',
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            <span>+{XP_PER_TASK} XP por tarefa</span>
            <span>{isMaxLevel ? '100% Concluído' : `${nextLevelXp - currentXp} XP para Nv. ${level + 1}`}</span>
          </div>
        </div>
      </div>

      {/* 2. O Palco Central do Taskito (Companheiro de Mesa) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
        
        {/* Floating Musical Notes when Lofi is playing */}
        {isLofiPlaying && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
            <span
              className="absolute top-16 left-1/4 text-lg text-[var(--app-primary,#7014F2)] animate-note-float opacity-80"
              style={{ animationDelay: '0s' }}
            >
              🎵
            </span>
            <span
              className="absolute top-20 right-1/4 text-xl text-pink-500 animate-note-float opacity-80"
              style={{ animationDelay: '0.8s' }}
            >
              🎶
            </span>
            <span
              className="absolute top-28 left-1/3 text-sm text-amber-400 animate-note-float opacity-80"
              style={{ animationDelay: '1.4s' }}
            >
              ♬
            </span>
          </div>
        )}

        {/* Floating Hearts Particle Layer */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute top-28 select-none pointer-events-none z-30 animate-heart-float text-2xl"
            style={{
              transform: `translateX(${heart.xOffset}px)`,
            }}
          >
            {heart.emoji}
          </div>
        ))}

        {/* Mascot Speech Bubble */}
        <div className="relative mb-6 max-w-md bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 px-5 py-3.5 rounded-2xl shadow-sm text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
          <p>"{activeSpeech}"</p>
          {/* Bubble triangle tip */}
          <div className="w-3 h-3 bg-slate-50 dark:bg-slate-800/90 border-r border-b border-slate-200/80 dark:border-slate-700/80 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
        </div>

        {/* The Big Mascot (Interactive on hover & click) */}
        <div
          onMouseEnter={() => handlePet(true)}
          onClick={() => handlePet(false)}
          className="relative group cursor-pointer my-3 transform transition-transform"
          title="Passe o mouse ou clique para fazer carinho no Taskito!"
        >
          <TaskitoMascotLogo
            mood={currentMood}
            size="xl"
            showTitle={false}
            wearingHeadphones={isLofiPlaying}
            holdingCoffee={holdingCoffee}
            steamHeartActive={steamHeartActive}
            isHopping={isHopping}
          />

          {/* Interactive Hint on hover */}
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-slate-900/85 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
            ✨ Passe o mouse ou clique para carinho!
          </span>
        </div>

        {/* 3 Ultra-Simple 1-Click Main Actions (Café & Carinho) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          
          {/* Action 1: ☕ Oferecer Café/Chá */}
          <div className="inline-flex rounded-full shadow-sm p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleOfferDrink('cafe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                holdingCoffee && beverageType === 'cafe'
                  ? 'btn-app-primary text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
              }`}
              title="Oferecer um café quentinho para o Taskito"
            >
              <Coffee className="w-4 h-4 text-amber-500" />
              <span>Oferecer Café</span>
            </button>
            <button
              onClick={() => handleOfferDrink('cha')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all ${
                holdingCoffee && beverageType === 'cha'
                  ? 'btn-app-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
              }`}
              title="Oferecer um chá relaxante para o Taskito"
            >
              <span>🍵 Chá</span>
            </button>
          </div>

          {/* Action 2: ✨ Fazer Carinho */}
          <button
            onClick={() => handlePet(false)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95"
            style={{
              borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.25))',
            }}
          >
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
            <span>Fazer Carinho ✨</span>
          </button>

          {/* Action 3: 🎧 Modo Lofi (Com equalizador sonoro) */}
          <button
            onClick={handleToggleLofi}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
              isLofiPlaying
                ? 'btn-app-primary text-white scale-105 ring-2 ring-white/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>{isLofiPlaying ? 'Modo Lofi: Ligado' : '🎧 Modo Lofi'}</span>

            {/* Soundwave Bars Indicator when playing */}
            {isLofiPlaying && (
              <div className="flex items-end gap-0.5 h-3.5 px-0.5">
                <span className="w-1 bg-white rounded-full animate-soundwave-1" />
                <span className="w-1 bg-white rounded-full animate-soundwave-2" />
                <span className="w-1 bg-white rounded-full animate-soundwave-3" />
                <span className="w-1 bg-white rounded-full animate-soundwave-4" />
              </div>
            )}
          </button>

        </div>

        {/* Native Official Live Stream Player */}
        {isLofiPlaying && (
          <div className="mt-6 w-full max-w-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-inner space-y-4 animate-fade-in text-left">
            
            {/* Player Main Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
              
              {/* Station Info & Live Status */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: 'var(--app-primary, #7014F2)' }}
                >
                  {isBuffering ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : selectedStation.isRain ? (
                    <CloudRain className="w-5 h-5" />
                  ) : (
                    <Radio className="w-5 h-5 animate-pulse" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedStation.emoji} {selectedStation.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Ao Vivo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {selectedStation.tagline}
                  </p>
                </div>
              </div>

              {/* Playback Controls & Volume */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                {/* Play / Pause Toggle */}
                <button
                  onClick={handleToggleLofi}
                  className="w-8 h-8 rounded-full flex items-center justify-center btn-app-primary text-white shadow-sm transition-transform active:scale-95"
                  title={isLofiPlaying ? 'Pausar áudio' : 'Tocar áudio'}
                >
                  {isLofiPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  )}
                </button>

                {/* Volume & Mute Controls */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-full px-2.5 py-1">
                  <button
                    onClick={() => setLofiMuted(!lofiMuted)}
                    className="p-0.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title={lofiMuted ? 'Desmutar' : 'Mutar áudio'}
                  >
                    {lofiMuted || lofiVolume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-500" />
                    ) : lofiVolume < 0.5 ? (
                      <Volume1 className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={lofiMuted ? 0 : lofiVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setLofiVolume(val);
                      if (lofiMuted && val > 0) setLofiMuted(false);
                    }}
                    className="w-16 sm:w-20 h-1 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--app-primary, #7014F2)' }}
                    title={`Volume: ${Math.round((lofiMuted ? 0 : lofiVolume) * 100)}%`}
                  />
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 w-6 text-right">
                    {Math.round((lofiMuted ? 0 : lofiVolume) * 100)}%
                  </span>
                </div>
              </div>

            </div>

            {/* Error banner if any */}
            {streamError && (
              <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <span>{streamError}</span>
                <button
                  onClick={() => handleSelectStation(selectedStation)}
                  className="font-bold underline text-xs ml-2"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Official Radio Stream Stations */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Escolha a Rádio Oficial de Streaming:
              </span>
              <div className="flex flex-wrap gap-2">
                {LOFI_STATIONS.map((station) => {
                  const isCurrent = selectedStation.id === station.id;
                  return (
                    <button
                      key={station.id}
                      onClick={() => handleSelectStation(station)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'btn-app-primary text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{station.emoji}</span>
                      <span>{station.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Secondary Moods (Clean & compact) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 w-full max-w-xl">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
            Outras Vontades do Taskito
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() =>
                handleSetMood(
                  'focused',
                  'Modo Hiperfoco! Vamos riscar uma tarefa com calma e foco ⚡'
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                currentMood === 'focused'
                  ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Foco Total</span>
            </button>

            <button
              onClick={() =>
                handleSetMood(
                  'excited',
                  'Aaaaaah que empolgação boa! Cada passo seu merece uma comemoração! 🎉🚀'
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                currentMood === 'excited'
                  ? 'shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              style={
                currentMood === 'excited'
                  ? {
                      backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.12))',
                      borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.3))',
                      color: 'var(--app-primary, #7014F2)',
                    }
                  : undefined
              }
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-500" />
              <span>Celebrar</span>
            </button>

            <button
              onClick={() =>
                handleSetMood(
                  'sleepy',
                  'Zzz... descansar também faz parte da produtividade saudável! Bons sonhos e paz 🌙'
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                currentMood === 'sleepy'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Descanso</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. The 10 Color Themes Palette Wardrobe */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-[var(--app-primary,#7014F2)]" />
              <span>Guarda-Roupa do Taskito: 10 Cores e Temas Desbloqueáveis</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desbloqueie novas tonalidades ao concluir seus checklists diários (+25 XP por tarefa).
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-center">
            {TASKITO_COLOR_THEMES.filter((t) => currentXp >= t.xpRequired).length} / 10 Desbloqueados
          </span>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {TASKITO_COLOR_THEMES.map((theme) => {
            const isUnlocked = currentXp >= theme.xpRequired;
            const isEquipped = currentThemeId === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => isUnlocked && handleSelectTheme(theme.id, theme.xpRequired)}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isEquipped
                    ? 'border-2 border-[var(--app-primary,#7014F2)] bg-white dark:bg-slate-900 shadow-md ring-2'
                    : isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer hover:shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/60 opacity-65 cursor-not-allowed'
                }`}
                style={isEquipped ? { boxShadow: `0 4px 14px ${theme.glowColor}` } : undefined}
              >
                {/* Top: Mini Mascot Preview & Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
                      boxShadow: `0 4px 10px ${theme.glowColor}`,
                    }}
                  >
                    <span className="text-xs font-black select-none">T</span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Nv. {theme.level}
                  </span>
                </div>

                {/* Theme Name & Details */}
                <div className="space-y-1 mb-3">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {theme.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2">
                    {theme.description}
                  </p>
                </div>

                {/* Action button / Status */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {isEquipped ? (
                    <div
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold"
                      style={{
                        backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                        color: 'var(--app-primary, #7014F2)',
                      }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Equipado</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTheme(theme.id, theme.xpRequired);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Equipar
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 py-1 font-medium">
                      <Lock className="w-3 h-3" />
                      <span>{theme.xpRequired} XP</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
