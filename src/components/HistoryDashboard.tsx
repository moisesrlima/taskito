import React, { useState } from 'react';
import { TaskItem, TaskLog } from '../types';
import {
  CheckCircle2,
  Calendar,
  Filter,
  Download,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { getTodayDateString } from '../utils/storage';

interface HistoryDashboardProps {
  logs: TaskLog[];
  tasks: TaskItem[];
  onClearHistory: () => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  logs,
  tasks,
  onClearHistory,
}) => {
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');

  const todayStr = getTodayDateString();

  // Filter logs by task
  const filteredLogs = logs
    .filter((log) => {
      if (selectedTaskFilter !== 'all' && log.taskId !== selectedTaskFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.scheduledTime || '00:00'}`).getTime();
      const dateB = new Date(`${b.date}T${b.scheduledTime || '00:00'}`).getTime();
      return dateB - dateA;
    });

  // Export JSON backup
  const handleExportJSON = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      tasks,
      logs,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskito-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Last 7 days visual chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = getTodayDateString(d);
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dayNumber = d.getDate();
    const dayLogs = logs.filter((l) => l.date === dStr && l.status === 'concluido');
    const isToday = dStr === todayStr;
    return {
      dateStr: dStr,
      dayName,
      dayNumber,
      count: dayLogs.length,
      isToday,
    };
  });

  const maxCountIn7Days = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner with Export / Clear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--app-primary,#7014F2)]" />
            <span>Histórico de Atividades e Consistência</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe o registro das atividades concluídas nos últimos dias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Backup</span>
          </button>
          {logs.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja limpar o histórico de conclusões?')) {
                  onClearHistory();
                }
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
              title="Limpar histórico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 7 Days Bar Chart Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--app-primary,#7014F2)]" />
          <span>Atividades Concluídas nos Últimos 7 Dias</span>
        </h3>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {last7Days.map((day) => {
            const heightPercent = Math.min(100, Math.max(12, Math.round((day.count / maxCountIn7Days) * 100)));
            return (
              <div key={day.dateStr} className="flex flex-col items-center gap-2">
                <div className="w-full h-24 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-end justify-center p-1 relative overflow-hidden">
                  <div
                    className="w-full rounded-lg transition-all duration-300"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: 'var(--app-primary, #7014F2)',
                      opacity: day.isToday ? 1 : 0.35,
                    }}
                  />
                  {day.count > 0 && (
                    <span className="absolute top-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {day.count}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase block">
                    {day.dayName}
                  </span>
                  <span
                    className="text-[10px]"
                    style={day.isToday ? { color: 'var(--app-primary, #7014F2)', fontWeight: 700 } : undefined}
                  >
                    {day.dayNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log History Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--app-primary,#7014F2)]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Registros Concluídos ({filteredLogs.length})
            </span>
          </div>

          {/* Filter by task */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTaskFilter}
              onChange={(e) => setSelectedTaskFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">Todas as tarefas</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Nenhum registro encontrado para o filtro selecionado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                      color: 'var(--app-primary, #7014F2)',
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {log.taskTitle}
                    </span>
                    {log.note && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 italic block truncate">
                        "{log.note}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 shrink-0">
                  <span className="font-mono">{log.scheduledTime}</span>
                  <span className="text-[11px]">{log.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
