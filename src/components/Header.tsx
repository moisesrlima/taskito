import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Sun,
  Moon,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { AppSettings } from '../types';
import { sounds } from '../utils/audio';
import { requestNotificationPermission, sendBrowserNotification } from '../utils/notifications';
import { TaskitoMascotLogo } from './TaskitoMascotLogo';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenNewTaskModal: () => void;
  activeTab: 'today' | 'manage' | 'history';
  onTabChange: (tab: 'today' | 'manage' | 'history') => void;
  todayStats: { completed: number; total: number; percent: number };
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  activeTab,
  onTabChange,
}) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );

  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    onUpdateSettings({ ...settings, soundEnabled: nextSound });
    if (nextSound) {
      sounds.playSuccessChime();
    }
  };

  const isDarkMode = settings.theme === 'dark';

  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification('🎉 Notificações do Taskito Ativadas!', {
        body: 'Você receberá avisos pontuais para suas rotinas diárias.',
      });
      sounds.playReminderChime();
    }
  };

  const handleTestAlert = () => {
    if (settings.soundEnabled) {
      sounds.playReminderChime();
    }
    sendBrowserNotification('⏰ Teste do Taskito Funcionando!', {
      body: 'Lembrete push verificado com sucesso!',
      requireInteraction: true,
    });
  };

  return (
    <header className="border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        
        {/* Brand Mascot Logo & Name */}
        <TaskitoMascotLogo
          onClick={() => onTabChange('today')}
          mood={settings.mascotMood || 'happy'}
        />

        {/* Center / Navigation Tabs */}
        <div className="hidden sm:flex items-center bg-slate-50 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => onTabChange('today')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'today'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Checklist Hoje
          </button>
          <button
            onClick={() => onTabChange('manage')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'manage'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Gerenciar Tarefas
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Right Action Icons & Settings */}
        <div className="flex items-center gap-2">
          
          {/* Link para Mais Apps */}
          <a
            href="https://appsforall.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            title="Conheça mais aplicativos em appsforall.vercel.app"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-sm group hover:brightness-105"
            style={{
              backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
              borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.25))',
              color: 'var(--app-primary, #7014F2)',
            }}
          >
            <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">Mais Apps</span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={handleToggleTheme}
            title={settings.theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={settings.soundEnabled ? 'Som ativado (clique para mutar)' : 'Som mudo'}
            className={`p-2 rounded-full border text-xs transition-colors ${
              settings.soundEnabled
                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40'
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-500" />
            )}
          </button>

          {/* Browser Notification Permission Button */}
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:brightness-105"
              style={{
                backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.25))',
                color: 'var(--app-primary, #7014F2)',
              }}
              title="Ativar notificações do navegador"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ativar Avisos</span>
            </button>
          )}

          {notificationPermission === 'granted' && (
            <button
              onClick={handleTestAlert}
              title="Testar aviso sonoro e notificação push"
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <BellRing className="w-4 h-4 text-[var(--app-primary,#7014F2)]" />
            </button>
          )}

          {/* Mobile view tab buttons */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={() => onTabChange('today')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold ${
                activeTab === 'today'
                  ? 'font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              style={
                activeTab === 'today'
                  ? {
                      backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.12))',
                      color: 'var(--app-primary, #7014F2)',
                    }
                  : undefined
              }
            >
              Hoje
            </button>
            <button
              onClick={() => onTabChange('manage')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold ${
                activeTab === 'manage'
                  ? 'font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              style={
                activeTab === 'manage'
                  ? {
                      backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.12))',
                      color: 'var(--app-primary, #7014F2)',
                    }
                  : undefined
              }
            >
              Tarefas
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold ${
                activeTab === 'history'
                  ? 'font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              style={
                activeTab === 'history'
                  ? {
                      backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.12))',
                      color: 'var(--app-primary, #7014F2)',
                    }
                  : undefined
              }
            >
              Histórico
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
