import React, { useState, useEffect, useRef } from 'react';
import {
  TaskItem,
  TaskLog,
  AppSettings,
  ActiveAlert,
  DayOfWeek,
} from './types';
import {
  loadTasks,
  saveTasks,
  loadLogs,
  saveLogs,
  loadSettings,
  saveSettings,
  getTodayDateString,
} from './utils/storage';
import { sounds } from './utils/audio';
import { sendBrowserNotification } from './utils/notifications';
import { Header } from './components/Header';
import { PontoQuickWidget } from './components/PontoQuickWidget';
import { TodayTasks } from './components/TodayTasks';
import { ManageTasks } from './components/ManageTasks';
import { HistoryDashboard } from './components/HistoryDashboard';
import { PersistentAlertModal } from './components/PersistentAlertModal';
import { TaskModal } from './components/TaskModal';
import { LinkViewerModal } from './components/LinkViewerModal';
import { ShieldCheck, Sparkles, Plus, Clock } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadTasks());
  const [logs, setLogs] = useState<TaskLog[]>(() => loadLogs());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<'today' | 'manage' | 'history'>('today');

  // Active persistent alert modal
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);

  // In-app Link Viewer Modal (when linkTarget is 'modal')
  const [linkModalState, setLinkModalState] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({
    isOpen: false,
    url: '',
    title: '',
  });

  // Modal for new/edit task
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Set of already notified reminders today: "YYYY-MM-DD|taskId|HH:mm"
  const notifiedRemindersRef = useRef<Set<string>>(new Set());

  const todayStr = getTodayDateString();
  const currentDayOfWeek = new Date().getDay() as DayOfWeek;

  // Persist tasks changes
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Persist logs changes
  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  // Persist settings changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Dynamic Browser Tab Title based on active alert
  useEffect(() => {
    if (activeAlert) {
      document.title = `⏰ (1) Taskito: ${activeAlert.title}!`;
    } else {
      document.title = 'Taskito - Lembretes e Rotinas Diárias';
    }
  }, [activeAlert]);

  // Background reminder scheduler loop
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeSlot = `${currentHours}:${currentMinutes}`;
      const dayOfWeek = now.getDay() as DayOfWeek;
      const todayDate = getTodayDateString(now);

      tasks.forEach((task) => {
        if (!task.enabled) return;
        if (!task.daysOfWeek.includes(dayOfWeek)) return;

        // Check if current time slot matches any of task's scheduled times
        if (task.times.includes(currentTimeSlot)) {
          const reminderKey = `${todayDate}|${task.id}|${currentTimeSlot}`;

          // If already alerted for this minute today, don't re-trigger
          if (notifiedRemindersRef.current.has(reminderKey)) {
            return;
          }

          // Check if already marked as completed today
          const alreadyDone = logs.some(
            (l) =>
              l.taskId === task.id &&
              l.scheduledTime === currentTimeSlot &&
              l.date === todayDate &&
              l.status === 'concluido'
          );

          if (!alreadyDone) {
            notifiedRemindersRef.current.add(reminderKey);

            // Trigger In-App persistent alert
            setActiveAlert({
              id: reminderKey,
              taskId: task.id,
              title: task.title,
              description: task.description,
              scheduledTime: currentTimeSlot,
              url: task.url,
              linkTarget: task.linkTarget,
              timestamp: Date.now(),
            });

            // Send native browser push notification
            sendBrowserNotification(`⏰ Taskito: Hora de ${task.title}!`, {
              body: task.description || `Lembrete agendado para ${currentTimeSlot}. Clique para abrir o Taskito.`,
              requireInteraction: task.persistentAlert,
              onClick: () => {
                window.focus();
              },
            });

            // Sound chime
            if (settings.soundEnabled && task.soundAlert) {
              sounds.playPersistentAlarm();
            }
          }
        }
      });
    };

    // Check immediately and every 10 seconds
    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, [tasks, logs, settings]);

  // Logs for today
  const todayLogs = logs.filter((l) => l.date === todayStr);

  // Today stats
  const todayActiveTasks = tasks.filter(
    (t) => t.enabled && t.daysOfWeek.includes(currentDayOfWeek)
  );

  // Total expected slots today
  const totalSlotsToday = todayActiveTasks.reduce(
    (acc, t) => acc + t.times.length,
    0
  );

  const completedSlotsToday = todayLogs.filter((l) => l.status === 'concluido').length;
  const todayPercent = totalSlotsToday > 0 ? Math.round((completedSlotsToday / totalSlotsToday) * 100) : 0;

  // Toggle complete for a task time slot
  const handleToggleComplete = (task: TaskItem, timeSlot: string, currentStatus?: string) => {
    if (currentStatus === 'concluido') {
      // Unmark
      setLogs((prev) =>
        prev.filter(
          (l) => !(l.taskId === task.id && l.scheduledTime === timeSlot && l.date === todayStr)
        )
      );
    } else {
      // Mark as completed
      if (settings.soundEnabled) {
        sounds.playSuccessChime();
      }

      const newLog: TaskLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        taskId: task.id,
        taskTitle: task.title,
        scheduledTime: timeSlot,
        date: todayStr,
        status: 'concluido',
        completedAt: new Date().toISOString(),
      };

      setLogs((prev) => [
        ...prev.filter(
          (l) => !(l.taskId === task.id && l.scheduledTime === timeSlot && l.date === todayStr)
        ),
        newLog,
      ]);

      // If active alert matches this, dismiss it
      if (activeAlert && activeAlert.taskId === task.id && activeAlert.scheduledTime === timeSlot) {
        setActiveAlert(null);
      }
    }
  };

  // Trigger test/manual alert
  const handleTriggerManualAlert = (task: TaskItem, timeSlot: string) => {
    setActiveAlert({
      id: `manual-${task.id}-${timeSlot}-${Date.now()}`,
      taskId: task.id,
      title: task.title,
      description: task.description,
      scheduledTime: timeSlot,
      url: task.url,
      linkTarget: task.linkTarget,
      timestamp: Date.now(),
    });

    sendBrowserNotification(`⏰ Taskito: ${task.title}`, {
      body: task.description || `Lembrete para ${task.title} (${timeSlot})`,
      requireInteraction: true,
    });

    if (settings.soundEnabled) {
      sounds.playPersistentAlarm();
    }
  };

  // Complete from persistent alert modal
  const handleAlertComplete = (alert: ActiveAlert, note?: string) => {
    if (settings.soundEnabled) {
      sounds.playSuccessChime();
    }

    const newLog: TaskLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taskId: alert.taskId,
      taskTitle: alert.title,
      scheduledTime: alert.scheduledTime,
      date: todayStr,
      status: 'concluido',
      completedAt: new Date().toISOString(),
      note,
    };

    setLogs((prev) => [
      ...prev.filter(
        (l) =>
          !(l.taskId === alert.taskId && l.scheduledTime === alert.scheduledTime && l.date === todayStr)
      ),
      newLog,
    ]);

    setActiveAlert(null);
  };

  // Snooze alert
  const handleAlertSnooze = (alert: ActiveAlert, minutes: number) => {
    setActiveAlert(null);

    setTimeout(() => {
      setActiveAlert(alert);
      if (settings.soundEnabled) {
        sounds.playPersistentAlarm();
      }
      sendBrowserNotification(`⏰ Taskito (Adiado): ${alert.title}`, {
        body: `Lembrete adiado por ${minutes} minutos. Hora de executar!`,
        requireInteraction: true,
      });
    }, minutes * 60 * 1000);
  };

  // Save/Create task
  const handleSaveTask = (taskToSave: TaskItem) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === taskToSave.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = taskToSave;
        return next;
      }
      return [...prev, taskToSave];
    });
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Toggle enable task
  const handleToggleTaskEnabled = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  // Save log note
  const handleSaveNote = (logId: string, note: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, note: note.trim() || undefined } : l))
    );
  };

  // Clear all history
  const handleClearHistory = () => {
    setLogs([]);
  };

  // Open link in modal
  const handleOpenLinkModal = (url: string, title: string) => {
    setLinkModalState({
      isOpen: true,
      url,
      title,
    });
  };

  // Find ponto task if user configured one
  const pontoTask = tasks.find(
    (t) =>
      t.category?.toLowerCase() === 'ponto' ||
      t.title.toLowerCase().includes('ponto') ||
      t.id === 'bater-ponto-4x'
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Header Bar */}
      <Header
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        todayStats={{
          completed: completedSlotsToday,
          total: totalSlotsToday,
          percent: todayPercent,
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Agnostic Status Bar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-neutral-100">
                Taskito • Lembretes Manuais com Notificações Persistentes
              </h2>
              <p className="text-xs text-neutral-400">
                Cadastre suas tarefas diárias com link direto e escolha abertura em aba ou em modal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Armazenamento:</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold">
              localStorage Local
            </span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Quick Ponto Tracker Widget if user created a ponto task */}
            {pontoTask && (
              <PontoQuickWidget
                pontoTask={pontoTask}
                todayLogs={todayLogs}
                onToggleTimeSlot={handleToggleComplete}
                onEditTask={(t) => {
                  setEditingTask(t);
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {/* Today's Tasks Timeline */}
            <TodayTasks
              tasks={tasks}
              todayLogs={todayLogs}
              currentDayOfWeek={currentDayOfWeek}
              onToggleComplete={handleToggleComplete}
              onTriggerManualAlert={handleTriggerManualAlert}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onAddNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onSaveNote={handleSaveNote}
              onOpenLinkModal={handleOpenLinkModal}
            />
          </div>
        )}

        {activeTab === 'manage' && (
          <ManageTasks
            tasks={tasks}
            onAddNewTask={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={(t) => {
              setEditingTask(t);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onToggleTaskEnabled={handleToggleTaskEnabled}
            onOpenLinkModal={handleOpenLinkModal}
          />
        )}

        {activeTab === 'history' && (
          <HistoryDashboard
            logs={logs}
            tasks={tasks}
            onClearHistory={handleClearHistory}
          />
        )}

      </main>

      {/* Persistent Alert Dialog Modal */}
      <PersistentAlertModal
        alert={activeAlert}
        soundEnabled={settings.soundEnabled}
        onComplete={handleAlertComplete}
        onSnooze={handleAlertSnooze}
        onDismiss={() => setActiveAlert(null)}
        onOpenLinkModal={handleOpenLinkModal}
      />

      {/* In-App Link Viewer Modal */}
      <LinkViewerModal
        isOpen={linkModalState.isOpen}
        url={linkModalState.url}
        title={linkModalState.title}
        onClose={() =>
          setLinkModalState({
            isOpen: false,
            url: '',
            title: '',
          })
        }
      />

      {/* Task Creation & Edit Modal */}
      <TaskModal
        task={editingTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-4 text-center text-xs text-neutral-400 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Taskito • Aplicativo agnóstico para lembretes e rotinas diárias manuais</span>
          <span className="text-neutral-500">Sem banco de dados • Dados salvos no navegador</span>
        </div>
      </footer>

    </div>
  );
}
