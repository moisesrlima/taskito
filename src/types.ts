export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Segunda, etc.

export type LinkOpenTarget = 'new_tab' | 'modal';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category?: string; // Agnostic custom category / tag (e.g. Trabalho, Monitoramento, Rotina)
  url?: string; // Optional direct link to open
  linkTarget?: LinkOpenTarget; // 'new_tab' | 'modal'
  enabled: boolean;
  daysOfWeek: DayOfWeek[]; // [0..6]
  times: string[]; // HH:mm format, e.g. ["09:00", "15:00"]
  soundAlert: boolean;
  persistentAlert: boolean; // Keep alerting until acknowledged
  createdAt: string;
}

export type TaskLogStatus = 'concluido' | 'atrasado' | 'adiado' | 'dispensado';

export interface TaskLog {
  id: string;
  taskId: string;
  taskTitle: string;
  scheduledTime: string; // HH:mm
  date: string; // YYYY-MM-DD
  status: TaskLogStatus;
  completedAt?: string; // ISO string
  note?: string;
}

export interface ActiveAlert {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  scheduledTime: string;
  url?: string;
  linkTarget?: LinkOpenTarget;
  timestamp: number;
}

export interface TaskitoColorTheme {
  id: string;
  name: string;
  level: number;
  xpRequired: number;
  primaryColor: string;
  primaryHover: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  badgeText: string;
  description: string;
}

export type MascotMood = 'happy' | 'focused' | 'sleepy' | 'excited' | 'loving';

export interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  snoozeMinutes: number;
  autoPlayChime: boolean;
  userName?: string;
  theme?: 'light' | 'dark';
  xp?: number;
  selectedColorThemeId?: string;
  mascotMood?: MascotMood;
}
