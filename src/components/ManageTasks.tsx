import React from 'react';
import { TaskItem, DayOfWeek } from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Globe,
  Clock,
  Calendar,
  BellRing,
  Tag,
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

export const ManageTasks: React.FC<ManageTasksProps> = ({
  tasks,
  onAddNewTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskEnabled,
  onOpenLinkModal,
}) => {
  const getDayName = (d: DayOfWeek) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[d];
  };

  const handleLinkClick = (task: TaskItem) => {
    if (!task.url) return;
    if (task.linkTarget === 'modal') {
      onOpenLinkModal(task.url, task.title);
    } else {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6 text-neutral-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Configurações das Tarefas Cadastradas</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Configure suas tarefas agnósticas, defina horários diários, URLs de acesso e escolha se cada link abre em nova aba ou em modal interno.
          </p>
        </div>
        <button
          onClick={onAddNewTask}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Nova Tarefa</span>
        </button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="p-10 text-center bg-neutral-900 rounded-2xl border border-dashed border-neutral-800">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-neutral-200 text-sm">Nenhuma tarefa cadastrada</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Cadastre suas rotinas (como verificar portais, disparar e-mails ou bater ponto) definindo horários e o link de acesso.
          </p>
          <button
            onClick={onAddNewTask}
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            + Cadastrar Tarefa Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                task.enabled
                  ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  : 'bg-neutral-950/60 border-neutral-800/60 opacity-60'
              }`}
            >
              {/* Top row: Title + Enabled switch */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-neutral-100 truncate">
                        {task.title}
                      </h3>
                      {task.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-neutral-400" />
                          {task.category}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Toggle Enabled */}
                  <button
                    onClick={() => onToggleTaskEnabled(task.id)}
                    title={task.enabled ? 'Pausar tarefa' : 'Ativar tarefa'}
                    className={`p-1.5 rounded-xl border transition-colors shrink-0 ${
                      task.enabled
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {/* Schedules info */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-neutral-400">Horários:</span>
                    <div className="flex flex-wrap gap-1 font-mono text-[11px] font-bold text-neutral-200">
                      {task.times.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-300">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-400">Dias:</span>
                    <span className="text-neutral-200">
                      {task.daysOfWeek.map(getDayName).join(', ')}
                    </span>
                  </div>

                  {/* Link Target behavior info */}
                  {task.url && (
                    <div className="flex items-center gap-2 pt-1 text-neutral-300">
                      {task.linkTarget === 'modal' ? (
                        <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="text-neutral-400">Comportamento do link:</span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-950 border border-neutral-700 text-neutral-200">
                        {task.linkTarget === 'modal'
                          ? 'Janela Modal'
                          : 'Nova Aba'}
                      </span>
                    </div>
                  )}

                  {/* Persistence Badge */}
                  <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                    <span className="text-neutral-400">Alertas:</span>
                    {task.persistentAlert && (
                      <span className="text-amber-400 font-medium">🔔 Persistente</span>
                    )}
                    {task.soundAlert && (
                      <span className="text-neutral-300">🔊 Som</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action bar */}
              <div className="pt-4 mt-3 border-t border-neutral-800 flex items-center justify-between">
                {task.url ? (
                  <button
                    onClick={() => handleLinkClick(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-200 transition-colors"
                  >
                    {task.linkTarget === 'modal' ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        <span>Testar Modal</span>
                      </>
                    ) : (
                      <>
                        <span>Testar Link</span>
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-[11px] text-neutral-500 italic">Sem URL configurada</div>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditTask(task)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remover permanentemente a tarefa "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                    title="Excluir tarefa"
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
