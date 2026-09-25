import React from 'react';
import { TaskItem, DayOfWeek } from '../types';
import {
  Plus,
  Clock,
  Calendar,
  Globe,
  Edit2,
  Trash2,
  Power,
  Layers,
} from 'lucide-react';

interface ManageTasksProps {
  tasks: TaskItem[];
  onAddNewTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskEnabled: (taskId: string) => void;
  onOpenLinkModal: (url: string, title: string) => void;
}

const DAYS_MAP: Record<DayOfWeek, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

export const ManageTasks: React.FC<ManageTasksProps> = ({
  tasks,
  onAddNewTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskEnabled,
  onOpenLinkModal,
}) => {
  const getDayName = (day: DayOfWeek) => DAYS_MAP[day] || `${day}`;

  const handleLinkClick = (task: TaskItem) => {
    if (!task.url) return;
    if (task.linkTarget === 'modal') {
      onOpenLinkModal(task.url, task.title);
    } else {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--app-primary,#7014F2)]" />
            <span>Gerenciar Rotinas e Atividades</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure títulos, horários múltiplos, dias da semana e links com abertura em aba ou modal.
          </p>
        </div>
        <button
          onClick={onAddNewTask}
          className="flex items-center justify-center gap-2 px-5 py-2.5 btn-app-primary text-white rounded-full text-xs font-semibold shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Nova Atividade</span>
        </button>
      </div>

      {/* Task Cards Grid */}
      {tasks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{
              backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
              color: 'var(--app-primary, #7014F2)',
            }}
          >
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Nenhuma atividade cadastrada</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Cadastre suas rotinas definindo horários e o link de acesso.
          </p>
          <button
            onClick={onAddNewTask}
            className="mt-4 px-5 py-2.5 btn-app-primary text-white rounded-full text-xs font-semibold shadow-sm"
          >
            + Cadastrar Atividade Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-all flex flex-col justify-between ${
                task.enabled
                  ? 'border-slate-100 dark:border-slate-800 hover:shadow-md dark:hover:border-slate-700'
                  : 'border-slate-100 dark:border-slate-800/60 opacity-60 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {task.title}
                      </h3>
                      {task.category && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                            color: 'var(--app-primary, #7014F2)',
                            borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.2))',
                          }}
                        >
                          {task.category}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onToggleTaskEnabled(task.id)}
                    title={task.enabled ? 'Desativar rotina' : 'Ativar rotina'}
                    className={`p-1.5 rounded-xl text-xs transition-colors ${
                      task.enabled
                        ? 'text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    style={task.enabled ? { backgroundColor: 'var(--app-primary, #7014F2)' } : undefined}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {/* Days & Times */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Horários:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {task.times.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Dias:</span>
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {task.daysOfWeek.map((d) => (
                        <span
                          key={d}
                          className="px-1.5 py-0.5 rounded font-semibold text-[10px]"
                          style={{
                            backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                            color: 'var(--app-primary, #7014F2)',
                          }}
                        >
                          {getDayName(d)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {task.url && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 truncate pt-1">
                      <Globe className="w-3.5 h-3.5 text-[var(--app-primary,#7014F2)] shrink-0" />
                      <button
                        onClick={() => handleLinkClick(task)}
                        className="hover:underline hover:text-[var(--app-primary,#7014F2)] truncate font-mono"
                      >
                        {task.url}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {task.soundAlert ? 'Com alarme sonoro' : 'Sem alarme sonoro'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Editar atividade"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                    title="Excluir atividade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
