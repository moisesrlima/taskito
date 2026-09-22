import React from 'react';
import { TaskItem, TaskLog } from '../types';
import { Check, Clock, Fingerprint } from 'lucide-react';

interface PontoQuickWidgetProps {
  pontoTask?: TaskItem;
  todayLogs: TaskLog[];
  onToggleTimeSlot: (task: TaskItem, scheduledTime: string, currentStatus?: string) => void;
  onEditTask: (task: TaskItem) => void;
}

export const PontoQuickWidget: React.FC<PontoQuickWidgetProps> = ({
  pontoTask,
  todayLogs,
  onToggleTimeSlot,
}) => {
  if (!pontoTask || !pontoTask.enabled) return null;

  const pontoSlots = [
    { label: '1ª Marcação: Entrada', defaultTime: '08:00' },
    { label: '2ª Marcação: Saída Almoço', defaultTime: '12:00' },
    { label: '3ª Marcação: Retorno Almoço', defaultTime: '13:00' },
    { label: '4ª Marcação: Saída Expediente', defaultTime: '17:00' },
  ];

  const times = pontoTask.times.length >= 4 ? pontoTask.times : ['08:00', '12:00', '13:00', '17:00'];

  const slots = pontoSlots.map((slot, index) => {
    const time = times[index] || slot.defaultTime;
    const log = todayLogs.find(
      (l) => l.taskId === pontoTask.id && l.scheduledTime === time
    );
    const isCompleted = log?.status === 'concluido';
    return {
      ...slot,
      time,
      isCompleted,
      completedAt: log?.completedAt,
      log,
    };
  });

  const completedCount = slots.filter((s) => s.isCompleted).length;

  return (
    <div
      id="ponto-quick-widget"
      className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm overflow-hidden text-neutral-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-neutral-100">Bater Ponto Diário (4x ao dia)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 border border-neutral-700">
                Lembretes Manuais
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Registros manuais de expediente com notificações sonoras e push
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Progresso hoje:</span>
          <span className="font-mono text-sm font-bold text-neutral-100 bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded-lg">
            {completedCount} / 4 batidas
          </span>
        </div>
      </div>

      {/* Grid of 4 Batidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {slots.map((slot, idx) => {
          const punchTimeFormatted = slot.completedAt
            ? new Date(slot.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : null;

          return (
            <div
              key={slot.time + idx}
              id={`ponto-slot-${idx}`}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                slot.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-800/60 text-neutral-100'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Ponto {idx + 1}
                  </span>
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300">
                    {slot.time}
                  </span>
                </div>
                <div className="font-semibold text-xs mt-1 text-neutral-200">
                  {slot.label.split(':')[1] || slot.label}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
                {slot.isCompleted ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Feito {punchTimeFormatted ? `às ${punchTimeFormatted}` : ''}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span>Aguardando</span>
                  </div>
                )}

                <button
                  id={`ponto-btn-${idx}`}
                  onClick={() => onToggleTimeSlot(pontoTask, slot.time, slot.log?.status)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    slot.isCompleted
                      ? 'bg-neutral-900 border border-emerald-800/60 text-emerald-300 hover:bg-neutral-800'
                      : 'bg-amber-500 text-neutral-950 hover:bg-amber-400 active:scale-95 shadow-xs'
                  }`}
                >
                  {slot.isCompleted ? 'Desfazer' : 'Bater Agora'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
