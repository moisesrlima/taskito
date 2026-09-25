import React, { useState, useMemo, useEffect } from 'react';
import { TaskItem, TaskLog, DayOfWeek, AppSettings } from '../types';
import { calculateLevelFromXp } from '../utils/themeColors';
import { TaskitoRoom } from './TaskitoRoom';
import {
  Check,
  Clock,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  BellRing,
  Flame,
  CheckCircle2,
  Link as LinkIcon,
  Pencil,
  Sparkles,
} from 'lucide-react';

interface TodayTasksProps {
  tasks: TaskItem[];
  todayLogs: TaskLog[];
  currentDayOfWeek: DayOfWeek;
  userName?: string;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateUserName?: (name: string) => void;
  onToggleComplete: (task: TaskItem, timeSlot: string, currentStatus?: string) => void;
  onTriggerManualAlert: (task: TaskItem, timeSlot: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewTask: () => void;
  onSaveNote: (logId: string, note: string) => void;
  onOpenLinkModal: (url: string, title: string) => void;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({
  tasks,
  todayLogs,
  currentDayOfWeek,
  userName = 'Seu nome aqui',
  settings,
  onUpdateSettings,
  onUpdateUserName,
  onToggleComplete,
  onTriggerManualAlert,
  onEditTask,
  onDeleteTask,
  onAddNewTask,
  onOpenLinkModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const currentXp = settings.xp || 0;
  const { level } = calculateLevelFromXp(currentXp);

  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  // Active tasks for today
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.enabled) return false;
      return t.daysOfWeek.includes(currentDayOfWeek);
    });
  }, [tasks, currentDayOfWeek]);

  // Expand tasks by their reminder times (multi-schedule)
  const todaySlots = useMemo(() => {
    const slots: {
      task: TaskItem;
      timeSlot: string;
      isCompleted: boolean;
      log?: TaskLog;
    }[] = [];

    todayTasks.forEach((t) => {
      const times = t.times && t.times.length > 0 ? t.times : ['09:00'];
      times.forEach((timeStr) => {
        const matchingLog = todayLogs.find(
          (l) => l.taskId === t.id && l.scheduledTime === timeStr
        );
        slots.push({
          task: t,
          timeSlot: timeStr,
          isCompleted: matchingLog?.status === 'concluido',
          log: matchingLog,
        });
      });
    });

    // Sort chronologically by schedule time
    return slots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [todayTasks, todayLogs]);

  // Completion metrics
  const completedSlots = useMemo(
    () => todaySlots.filter((s) => s.isCompleted),
    [todaySlots]
  );
  const completedCount = completedSlots.length;
  const totalCount = todaySlots.length;
  const remainingSlots = totalCount - completedCount;
  const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Formatted date string in Portuguese
  const formattedTodayDate = useMemo(() => {
    const now = new Date();
    const weekdays = [
      'Domingo',
      'Segunda-Feira',
      'Terça-Feira',
      'Quarta-Feira',
      'Quinta-Feira',
      'Sexta-Feira',
      'Sábado',
    ];
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${weekdays[now.getDay()]}, ${now.getDate()} De ${months[now.getMonth()]}`;
  }, []);

  // Standard categories in order: Todas, Trabalho, Pessoal, Saúde, Estudo
  const standardCategories = ['Todas', 'Trabalho', 'Pessoal', 'Saúde', 'Estudo'];

  // Extra categories if user created custom ones
  const extraCategories = useMemo(() => {
    const extraCats = new Set<string>();
    todayTasks.forEach((t) => {
      if (t.category && !standardCategories.includes(t.category)) {
        extraCats.add(t.category);
      }
    });
    return Array.from(extraCats);
  }, [todayTasks]);

  // Filtered slots according to tab
  const filteredSlots = useMemo(() => {
    if (selectedCategory === 'Todas' || selectedCategory === '__taskito__') {
      return todaySlots;
    }
    return todaySlots.filter((s) => s.task.category === selectedCategory);
  }, [todaySlots, selectedCategory]);

  const handleNameSave = () => {
    if (nameInput.trim() && onUpdateUserName) {
      onUpdateUserName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleOpenLink = (e: React.MouseEvent, task: TaskItem) => {
    e.stopPropagation();
    if (!task.url) return;

    if (task.linkTarget === 'modal') {
      onOpenLinkModal(task.url, task.title);
    } else {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Editable User Name Greeting */}
          <div className="flex items-center gap-2 group">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[var(--app-primary,#7014F2)]"
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="px-3 py-1 btn-app-primary text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Olá, {userName}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="opacity-40 group-hover:opacity-100 p-1 text-slate-500 hover:text-[var(--app-primary,#7014F2)] transition-opacity"
                  title="Editar nome"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider mt-1">
            {formattedTodayDate}
          </p>
        </div>

        {/* Add New Task Button */}
        <div>
          <button
            onClick={onAddNewTask}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-app-primary text-white font-medium px-5 py-2.5 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova atividade</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Completed Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Concluídas Hoje
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {completedCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                de {totalCount} atividades
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Remaining Today */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Pendentes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {remainingSlots}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                para finalizar
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Taxa de Sucesso
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {completionPercentage}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {totalCount === 0 ? 'Sem tarefas' : completedCount === totalCount ? 'Perfeito!' : 'Em andamento'}
              </span>
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
              color: 'var(--app-primary, #7014F2)',
            }}
          >
            <Flame className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Main Tasks Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        
        {/* Title and Progress Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Rotina Diária
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {totalCount === 0
                ? 'Nenhuma atividade programada para hoje.'
                : completedCount === totalCount
                ? 'Todas as atividades concluídas! 🎉'
                : `${remainingSlots} ${remainingSlots === 1 ? 'atividade restante' : 'atividades restantes'}`}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span
              className="text-xs sm:text-sm font-bold"
              style={{ color: 'var(--app-primary, #7014F2)' }}
            >
              {completionPercentage}%
            </span>
            <div className="w-20 sm:w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${completionPercentage}%`,
                  backgroundColor: 'var(--app-primary, #7014F2)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills: Todas, Trabalho, Pessoal, Saúde, Estudo + ABA DESTAQUE TASKITO & XP + Extras */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {standardCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.12))',
                        color: 'var(--app-primary, #7014F2)',
                      }
                    : undefined
                }
              >
                {cat}
              </button>
            );
          })}

          {/* ABA DESTAQUE TASKITO & XP (colocada exatamente depois de Estudo) */}
          <button
            key="taskito-highlight-tab"
            onClick={() => setSelectedCategory('__taskito__')}
            title="Interagir com o Taskito, ver XP e personalizar as cores"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === '__taskito__'
                ? 'bg-gradient-to-r from-[var(--mascot-from,#7A1BF2)] to-[var(--mascot-to,#6312D6)] text-white shadow-lg ring-2 ring-white/20 scale-105'
                : 'text-[var(--app-primary,#7014F2)] border hover:brightness-105'
            }`}
            style={
              selectedCategory !== '__taskito__'
                ? {
                    backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                    borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.25))',
                    color: 'var(--app-primary, #7014F2)',
                  }
                : undefined
            }
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Taskito & XP</span>
            <span
              className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold"
              style={
                selectedCategory === '__taskito__'
                  ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }
                  : {
                      backgroundColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.2))',
                      color: 'var(--app-primary, #7014F2)',
                    }
              }
            >
              Nv. {level}
            </span>
          </button>

          {/* Any other custom categories */}
          {extraCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.12))',
                        color: 'var(--app-primary, #7014F2)',
                      }
                    : undefined
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Content: Taskito Room OR Tasks List */}
        {selectedCategory === '__taskito__' ? (
          <div className="pt-2">
            <TaskitoRoom
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              completedTasksToday={completedCount}
              totalTasksToday={totalCount}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSlots.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Nenhuma atividade para esta categoria hoje.
                </p>
                <button
                  onClick={onAddNewTask}
                  className="mt-3 text-xs font-semibold hover:underline"
                  style={{ color: 'var(--app-primary, #7014F2)' }}
                >
                  + Adicionar nova atividade
                </button>
              </div>
            ) : (
              filteredSlots.map((item) => {
                const { task, timeSlot, isCompleted } = item;
                return (
                  <div
                    key={`${task.id}-${timeSlot}`}
                    className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 px-2 sm:px-3 rounded-xl transition-colors"
                  >
                    {/* Left: Checkbox + Title + Category + Time + Link */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      
                      {/* Circular Checkbox */}
                      <button
                        onClick={() => onToggleComplete(task, timeSlot, isCompleted ? 'concluido' : undefined)}
                        className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-[var(--app-primary,#7014F2)] text-white shadow-sm'
                            : 'border-2 border-slate-300 dark:border-slate-700 hover:border-[var(--app-primary,#7014F2)]'
                        }`}
                        title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
                      >
                        {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Title & Metadata */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold transition-all truncate ${
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {task.title}
                          </span>

                          {/* Category Badge */}
                          {task.category && (
                            <span
                              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                                color: 'var(--app-primary, #7014F2)',
                                borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.2))',
                              }}
                            >
                              {task.category}
                            </span>
                          )}

                          {/* Link Button if task has URL */}
                          {task.url && (
                            <button
                              onClick={(e) => handleOpenLink(e, task)}
                              className="flex items-center gap-1 transition-colors hover:brightness-125"
                              style={{ color: 'var(--app-primary, #7014F2)' }}
                              title={`Abrir link (${task.linkTarget === 'modal' ? 'em modal' : 'em nova aba'})`}
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              <span className="text-xs truncate max-w-[120px] sm:max-w-[200px]">
                                {task.url.replace(/^https?:\/\//, '')}
                              </span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </button>
                          )}
                        </div>

                        {/* Scheduled Time */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeSlot}</span>
                        </div>
                      </div>

                    </div>

                    {/* Right Action Icons: Alert chime, Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Manual Reminder Chime Test */}
                      <button
                        onClick={() => onTriggerManualAlert(task, timeSlot)}
                        title="Disparar lembrete sonoro de teste"
                        className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        style={{ color: 'var(--app-primary, #7014F2)' }}
                      >
                        <BellRing className="w-4 h-4" />
                      </button>

                      {/* Edit Task Button */}
                      <button
                        onClick={() => onEditTask(task)}
                        title="Editar tarefa"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Task Button */}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Excluir tarefa"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

    </div>
  );
};
