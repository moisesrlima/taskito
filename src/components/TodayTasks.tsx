import React, { useState } from 'react';
import { TaskItem, TaskLog, DayOfWeek } from '../types';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  BellRing,
  Plus,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Edit2,
  Check,
  Globe,
  Tag,
} from 'lucide-react';

interface TodayTasksProps {
  tasks: TaskItem[];
  todayLogs: TaskLog[];
  currentDayOfWeek: DayOfWeek;
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
  onToggleComplete,
  onTriggerManualAlert,
  onEditTask,
  onAddNewTask,
  onSaveNote,
  onOpenLinkModal,
}) => {
  const [editingNoteForLogId, setEditingNoteForLogId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Filter tasks that are enabled and apply to today's day of week
  const todayTasks = tasks.filter(
    (t) => t.enabled && t.daysOfWeek.includes(currentDayOfWeek)
  );

  // Other tasks that are active but not scheduled for today
  const otherDayTasks = tasks.filter(
    (t) => t.enabled && !t.daysOfWeek.includes(currentDayOfWeek)
  );

  const getLogForSlot = (taskId: string, timeSlot: string) => {
    return todayLogs.find((l) => l.taskId === taskId && l.scheduledTime === timeSlot);
  };

  const getDayName = (d: DayOfWeek) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[d];
  };

  const handleStartEditNote = (logId: string, existingNote: string = '') => {
    setEditingNoteForLogId(logId);
    setNoteText(existingNote);
  };

  const handleSaveNoteSubmit = (logId: string) => {
    onSaveNote(logId, noteText);
    setEditingNoteForLogId(null);
    setNoteText('');
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
      {/* Today's Routines Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight">
              Rotinas Agendadas para Hoje
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              {todayTasks.length} {todayTasks.length === 1 ? 'tarefa' : 'tarefas'}
            </span>
          </div>
          <button
            onClick={onAddNewTask}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar tarefa</span>
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-neutral-900 rounded-2xl border border-dashed border-neutral-800">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-200 text-sm">Nenhuma tarefa cadastrada para hoje</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 leading-relaxed">
              O Taskito é agnóstico. Cadastre suas tarefas diárias com os horários desejados, links de acesso e escolha se devem abrir em aba ou em janela modal.
            </p>
            <button
              onClick={onAddNewTask}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              + Cadastrar Primeira Tarefa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {todayTasks.map((task) => {
              return task.times.map((timeSlot) => {
                const log = getLogForSlot(task.id, timeSlot);
                const isDone = log?.status === 'concluido';
                const cardKey = `${task.id}-${timeSlot}`;

                // Check if time has passed
                const [h, m] = timeSlot.split(':').map(Number);
                const now = new Date();
                const isPast =
                  now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
                const isOverdue = isPast && !isDone;

                return (
                  <div
                    key={cardKey}
                    id={`task-card-${task.id}-${timeSlot.replace(':', '')}`}
                    className={`rounded-2xl border p-4 transition-all relative flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDone
                        ? 'border-emerald-800/50 bg-emerald-950/20'
                        : isOverdue
                        ? 'border-amber-500/50 bg-amber-950/20 shadow-xs'
                        : 'border-neutral-800 bg-neutral-900/90 hover:border-neutral-700'
                    }`}
                  >
                    {/* Left: Checkbox + Time + Details */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Checkbox trigger button */}
                      <button
                        id={`check-btn-${task.id}-${timeSlot.replace(':', '')}`}
                        onClick={() => onToggleComplete(task, timeSlot, log?.status)}
                        title={isDone ? 'Clique para reabrir tarefa' : 'Marcar como concluída agora'}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                          isDone
                            ? 'bg-emerald-500 text-neutral-950 ring-2 ring-emerald-500/30 font-bold'
                            : 'border-2 border-neutral-700 hover:border-emerald-400 bg-neutral-950 text-transparent hover:text-emerald-400'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-amber-300">
                            {timeSlot}
                          </span>

                          <h3
                            className={`font-bold text-sm text-neutral-100 truncate ${
                              isDone ? 'line-through text-neutral-500' : ''
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Category Tag */}
                          {task.category && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5 text-neutral-400" />
                              {task.category}
                            </span>
                          )}

                          {/* Status Badge */}
                          {isDone ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Concluído {log?.completedAt ? `às ${new Date(log.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                            </span>
                          ) : isOverdue ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Aguardando execução
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 flex items-center gap-1 border border-neutral-700/50">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              Agendado
                            </span>
                          )}

                          {task.persistentAlert && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400 border border-neutral-700"
                              title="Alerta persistente na tela até confirmação"
                            >
                              🔔 Persistente
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Note attached to this completion */}
                        {log?.note && editingNoteForLogId !== log.id && (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-950 px-2.5 py-1 rounded-lg w-fit mt-1 border border-neutral-800">
                            <MessageSquare className="w-3 h-3 text-amber-400" />
                            <span className="italic font-medium">"{log.note}"</span>
                            <button
                              onClick={() => handleStartEditNote(log.id, log.note)}
                              className="text-[10px] text-neutral-400 hover:text-neutral-200 ml-1 underline"
                            >
                              editar
                            </button>
                          </div>
                        )}

                        {/* Inline note edit form */}
                        {editingNoteForLogId === log?.id && log && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Observação (ex: executado sem problemas)..."
                              className="text-xs px-2.5 py-1 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:ring-1 focus:ring-amber-500 outline-none w-64"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNoteSubmit(log.id)}
                              className="text-xs px-2.5 py-1 bg-amber-500 text-neutral-950 rounded-lg font-bold"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingNoteForLogId(null)}
                              className="text-xs text-neutral-400 hover:text-neutral-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex items-center flex-wrap gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800 justify-end shrink-0">
                      {/* Direct Link button */}
                      {task.url && (
                        <button
                          id={`link-${task.id}-${timeSlot.replace(':', '')}`}
                          onClick={() => handleLinkClick(task)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition-colors"
                          title={
                            task.linkTarget === 'modal'
                              ? 'Abrir link em janela modal interna'
                              : 'Abrir link em nova aba externa'
                          }
                        >
                          {task.linkTarget === 'modal' ? (
                            <>
                              <Globe className="w-3.5 h-3.5 text-amber-400" />
                              <span>Ver no Modal</span>
                            </>
                          ) : (
                            <>
                              <span>Abrir Link</span>
                              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Add note button if done but no note yet */}
                      {isDone && !log?.note && (
                        <button
                          onClick={() => handleStartEditNote(log.id)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
                          title="Adicionar observação sobre a execução"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}

                      {/* Trigger reminder now test */}
                      <button
                        id={`test-alert-btn-${task.id}-${timeSlot.replace(':', '')}`}
                        onClick={() => onTriggerManualAlert(task, timeSlot)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-amber-300 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors font-medium"
                        title="Tocar som e abrir alerta desta tarefa agora para testar"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Disparar Alerta</span>
                      </button>

                      {/* Edit Task Settings */}
                      <button
                        id={`edit-btn-${task.id}`}
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
                        title="Configurar horários, dias e notificações desta tarefa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        )}
      </div>

      {/* Other Configured Routines for Other Days */}
      {otherDayTasks.length > 0 && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-200">
                Outras Rotinas Cadastradas (Dias Diferentes de Hoje)
              </h3>
              <p className="text-xs text-neutral-400">
                Tarefas ativas que só disparam em outros dias da semana
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {otherDayTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/70 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-neutral-200 truncate">
                      {t.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300">
                      {t.times.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    <span>Dias: {t.daysOfWeek.map(getDayName).join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onTriggerManualAlert(t, t.times[0] || '09:00')}
                    className="p-1.5 text-neutral-400 hover:text-amber-300 rounded-lg hover:bg-neutral-800"
                    title="Disparar lembrete de teste agora"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditTask(t)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800"
                    title="Editar rotina"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
