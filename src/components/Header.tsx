import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Plus, Clock, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { AppSettings } from '../types';
import { sounds } from '../utils/audio';
import { requestNotificationPermission, sendBrowserNotification } from '../utils/notifications';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenNewTaskModal: () => void;
  activeTab: 'today' | 'history' | 'manage';
  onTabChange: (tab: 'today' | 'history' | 'manage') => void;
  todayStats: { completed: number; total: number; percent: number };
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenNewTaskModal,
  activeTab,
  onTabChange,
  todayStats,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    onUpdateSettings({ ...settings, soundEnabled: nextSound });
    if (nextSound) {
      sounds.playSuccessChime();
    }
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification('🎉 Notificações do Taskito Ativadas!', {
        body: 'Você receberá avisos push pontuais para suas tarefas diárias.',
      });
      sounds.playReminderChime();
    }
  };

  const handleTestAlert = () => {
    if (settings.soundEnabled) {
      sounds.playReminderChime();
    }
    sendBrowserNotification('⏰ Teste do Taskito Funcionando!', {
      body: 'Lembrete push verificado com sucesso! Suas rotinas estão monitoradas.',
      requireInteraction: true,
    });
  };

  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const formattedHours = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl leading-none select-none flex items-center justify-center transition-transform hover:scale-110" aria-label="Logo Taskito">
              👆
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-neutral-100">Taskito</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-amber-400 border border-neutral-700 px-2 py-0.5 rounded-full">
                  100% Local • Agnóstico
                </span>
              </div>
              <p className="text-xs text-neutral-400">Lembretes pontuais para suas rotinas manuais</p>
            </div>
          </div>

          {/* Mobile Time Pill */}
          <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono font-medium text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formattedHours.slice(0, 5)}</span>
          </div>
        </div>

        {/* Center Live Clock & Progress */}
        <div className="hidden md:flex items-center gap-4 bg-neutral-900/80 border border-neutral-800 px-4 py-1.5 rounded-xl text-neutral-200">
          <div className="flex items-center gap-2 text-neutral-300">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="font-mono text-sm font-semibold tracking-wide text-neutral-100">{formattedHours}</div>
            <span className="text-neutral-700">|</span>
            <span className="text-xs capitalize text-neutral-400">{formattedDate}</span>
          </div>
          <div className="h-4 w-px bg-neutral-800" />
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-neutral-100">{todayStats.completed}/{todayStats.total}</span>
            <span className="text-neutral-400">feitas ({todayStats.percent}%)</span>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Tab Selector */}
          <div className="inline-flex p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-medium">
            <button
              id="tab-today-btn"
              onClick={() => onTabChange('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'today'
                  ? 'bg-neutral-800 text-amber-300 font-bold border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Rotinas de Hoje
            </button>
            <button
              id="tab-manage-btn"
              onClick={() => onTabChange('manage')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'manage'
                  ? 'bg-neutral-800 text-amber-300 font-bold border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Configurar Tarefas
            </button>
            <button
              id="tab-history-btn"
              onClick={() => onTabChange('history')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-neutral-800 text-amber-300 font-bold border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Dashboard
            </button>
          </div>

          {/* Sound Mute/Unmute */}
          <button
            id="toggle-sound-btn"
            onClick={handleToggleSound}
            title={settings.soundEnabled ? 'Silenciar alertas sonoros' : 'Ativar alertas sonoros'}
            className={`p-2 rounded-xl border transition-colors ${
              settings.soundEnabled
                ? 'bg-neutral-900 border-neutral-800 text-amber-400 hover:bg-neutral-800'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notification Permission Pill */}
          {notificationPermission !== 'granted' ? (
            <button
              id="enable-notifications-btn"
              onClick={handleRequestPermission}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-colors animate-pulse"
              title="Clique para permitir notificações no navegador"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Ativar Push</span>
            </button>
          ) : (
            <button
              id="test-notification-btn"
              onClick={handleTestAlert}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Notificações ativas. Clique para testar agora!"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Testar Push</span>
            </button>
          )}

          {/* Add New Task Button */}
          <button
            id="new-task-btn"
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>
    </header>
  );
};
