import { TaskitoColorTheme } from '../types';

export const TASKITO_COLOR_THEMES: TaskitoColorTheme[] = [
  {
    id: 'classic-purple',
    name: 'Roxo Clássico',
    level: 1,
    xpRequired: 0,
    primaryColor: '#7014F2',
    primaryHover: '#600ed4',
    gradientFrom: '#7A1BF2',
    gradientTo: '#6312D6',
    glowColor: 'rgba(122, 27, 242, 0.4)',
    badgeText: 'Padrão',
    description: 'A cor mística original do Taskito. Perfeita para produtividade diária.',
  },
  {
    id: 'cosmic-blue',
    name: 'Azul Cósmico',
    level: 2,
    xpRequired: 50,
    primaryColor: '#2563EB',
    primaryHover: '#1D4ED8',
    gradientFrom: '#3B82F6',
    gradientTo: '#1D4ED8',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    badgeText: 'Foco Profundo',
    description: 'Inspirado no oceano e no espaço. Traz clareza mental e foco sereno.',
  },
  {
    id: 'zen-emerald',
    name: 'Esmeralda Zen',
    level: 3,
    xpRequired: 125,
    primaryColor: '#059669',
    primaryHover: '#047857',
    gradientFrom: '#10B981',
    gradientTo: '#047857',
    glowColor: 'rgba(5, 150, 105, 0.4)',
    badgeText: 'Equilíbrio',
    description: 'Tons naturais que acalmam a rotina e inspiram bem-estar e vitalidade.',
  },
  {
    id: 'sunset-amber',
    name: 'Pôr do Sol Âmbar',
    level: 4,
    xpRequired: 225,
    primaryColor: '#D97706',
    primaryHover: '#B45309',
    gradientFrom: '#F59E0B',
    gradientTo: '#B45309',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    badgeText: 'Otimismo',
    description: 'Calor e positividade radiante para manter o ânimo alto o dia todo.',
  },
  {
    id: 'neon-pink',
    name: 'Cyber Rosa Neon',
    level: 5,
    xpRequired: 350,
    primaryColor: '#DB2777',
    primaryHover: '#BE185D',
    gradientFrom: '#EC4899',
    gradientTo: '#BE185D',
    glowColor: 'rgba(219, 39, 119, 0.4)',
    badgeText: 'Criatividade',
    description: 'Vibrante e elétrico. Para quem ama estética moderna e inovação.',
  },
  {
    id: 'electric-teal',
    name: 'Ciano Elétrico',
    level: 6,
    xpRequired: 500,
    primaryColor: '#0D9488',
    primaryHover: '#0F766E',
    gradientFrom: '#14B8A6',
    gradientTo: '#0F766E',
    glowColor: 'rgba(13, 148, 136, 0.4)',
    badgeText: 'Fluidez',
    description: 'Refrescante e veloz. Mantém o ritmo das suas tarefas em alta performance.',
  },
  {
    id: 'crimson-ruby',
    name: 'Rubi Carmim',
    level: 7,
    xpRequired: 700,
    primaryColor: '#E11D48',
    primaryHover: '#BE123C',
    gradientFrom: '#F43F5E',
    gradientTo: '#BE123C',
    glowColor: 'rgba(225, 29, 72, 0.4)',
    badgeText: 'Energia Pura',
    description: 'Intensidade, paixão e determinação inabalável para vencer prazos.',
  },
  {
    id: 'fire-orange',
    name: 'Laranja Flamejante',
    level: 8,
    xpRequired: 950,
    primaryColor: '#EA580C',
    primaryHover: '#C2410C',
    gradientFrom: '#FB923C',
    gradientTo: '#C2410C',
    glowColor: 'rgba(234, 88, 12, 0.4)',
    badgeText: 'Hiperfoco',
    description: 'Fogo nos objetivos! Máxima motivação para quebrar recordes diários.',
  },
  {
    id: 'galaxy-indigo',
    name: 'Índigo Galáctico',
    level: 9,
    xpRequired: 1250,
    primaryColor: '#4F46E5',
    primaryHover: '#4338CA',
    gradientFrom: '#6366F1',
    gradientTo: '#4338CA',
    glowColor: 'rgba(79, 70, 229, 0.4)',
    badgeText: 'Mestria',
    description: 'A serenidade dos grandes mestres da produtividade consciente.',
  },
  {
    id: 'legendary-gold',
    name: 'Dourado Lendário',
    level: 10,
    xpRequired: 1600,
    primaryColor: '#CA8A04',
    primaryHover: '#A16207',
    gradientFrom: '#EAB308',
    gradientTo: '#A16207',
    glowColor: 'rgba(202, 138, 4, 0.45)',
    badgeText: 'Troféu Supremo',
    description: 'A cor máxima da dedicação. Exclusiva para verdadeiros campeões de rotina.',
  },
];

export const XP_PER_TASK = 25;

export function getThemeById(id?: string): TaskitoColorTheme {
  return (
    TASKITO_COLOR_THEMES.find((t) => t.id === id) || TASKITO_COLOR_THEMES[0]
  );
}

export function calculateLevelFromXp(xp: number = 0): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  isMaxLevel: boolean;
} {
  let currentLevel = 1;

  for (let i = TASKITO_COLOR_THEMES.length - 1; i >= 0; i--) {
    if (xp >= TASKITO_COLOR_THEMES[i].xpRequired) {
      currentLevel = TASKITO_COLOR_THEMES[i].level;
      break;
    }
  }

  const currentTheme = TASKITO_COLOR_THEMES.find((t) => t.level === currentLevel)!;
  const nextTheme = TASKITO_COLOR_THEMES.find((t) => t.level === currentLevel + 1);

  if (!nextTheme) {
    return {
      level: 10,
      currentLevelXp: xp,
      nextLevelXp: currentTheme.xpRequired,
      progressPercent: 100,
      isMaxLevel: true,
    };
  }

  const prevXpThreshold = currentTheme.xpRequired;
  const nextXpThreshold = nextTheme.xpRequired;
  const xpIntoCurrentLevel = xp - prevXpThreshold;
  const xpNeededForLevel = nextXpThreshold - prevXpThreshold;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpIntoCurrentLevel / xpNeededForLevel) * 100))
  );

  return {
    level: currentLevel,
    currentLevelXp: xp,
    nextLevelXp: nextXpThreshold,
    progressPercent,
    isMaxLevel: false,
  };
}

export function applyThemeVariables(theme: TaskitoColorTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--app-primary', theme.primaryColor);
  root.style.setProperty('--app-primary-hover', theme.primaryHover);
  root.style.setProperty('--mascot-from', theme.gradientFrom);
  root.style.setProperty('--mascot-to', theme.gradientTo);
  root.style.setProperty('--mascot-glow', theme.glowColor);
  root.style.setProperty('--app-primary-10', `${theme.primaryColor}1a`);
  root.style.setProperty('--app-primary-20', `${theme.primaryColor}33`);
}
