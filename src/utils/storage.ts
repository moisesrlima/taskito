import { TaskItem, TaskLog, AppSettings } from '../types';

const TASKS_KEY = 'taskito_tasks_agnostic_v1';
const LOGS_KEY = 'taskito_logs_agnostic_v1';
const SETTINGS_KEY = 'taskito_settings_v3';

export const INITIAL_SETTINGS: AppSettings = {
  soundEnabled: true,
  notificationsEnabled: true,
  snoozeMinutes: 10,
  autoPlayChime: true,
  userName: 'Seu nome aqui',
  theme: 'light',
  xp: 0,
  selectedColorThemeId: 'classic-purple',
  mascotMood: 'happy',
};

export const DEFAULT_SAMPLE_TASKS: TaskItem[] = [
  {
    id: 'task-sample-1',
    title: 'Revisar prioridades da semana',
    category: 'Trabalho',
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    times: ['08:30'],
    soundAlert: true,
    persistentAlert: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-2',
    title: 'Responder e-mails importantes',
    category: 'Trabalho',
    url: 'https://mail.google.com',
    linkTarget: 'modal',
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    times: ['09:45'],
    soundAlert: true,
    persistentAlert: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-3',
    title: 'Pausa para alongamento',
    category: 'Saúde',
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    times: ['11:30'],
    soundAlert: true,
    persistentAlert: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-4',
    title: 'Almoço e leitura de artigo',
    category: 'Estudo',
    url: 'https://news.ycombinator.com',
    linkTarget: 'new_tab',
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    times: ['12:30'],
    soundAlert: true,
    persistentAlert: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-sample-5',
    title: 'Revisão e planejamento de amanhã',
    category: 'Trabalho',
    enabled: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    times: ['17:00'],
    soundAlert: true,
    persistentAlert: true,
    createdAt: new Date().toISOString(),
  },
];

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadTasks(): TaskItem[] {
  if (typeof window === 'undefined') return DEFAULT_SAMPLE_TASKS;
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      saveTasks(DEFAULT_SAMPLE_TASKS);
      return DEFAULT_SAMPLE_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_SAMPLE_TASKS;
  } catch {
    return DEFAULT_SAMPLE_TASKS;
  }
}

export function saveTasks(tasks: TaskItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function loadLogs(): TaskLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      const today = getTodayDateString();
      const initialLogs: TaskLog[] = [
        {
          id: 'log-sample-1',
          taskId: 'task-sample-1',
          taskTitle: 'Revisar prioridades da semana',
          scheduledTime: '08:30',
          date: today,
          status: 'concluido',
          completedAt: new Date().toISOString(),
        },
        {
          id: 'log-sample-2',
          taskId: 'task-sample-2',
          taskTitle: 'Responder e-mails importantes',
          scheduledTime: '09:45',
          date: today,
          status: 'concluido',
          completedAt: new Date().toISOString(),
        },
      ];
      saveLogs(initialLogs);
      return initialLogs;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLogs(logs: TaskLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs:', e);
  }
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return INITIAL_SETTINGS;
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
