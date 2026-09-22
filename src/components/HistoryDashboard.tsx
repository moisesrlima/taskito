import React, { useState } from 'react';
import { TaskItem, TaskLog } from '../types';
import {
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Filter,
  Clock,
  Download,
  Trash2,
  MessageSquare,
  TrendingUp,
  Tag,
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

  // Calculate Agnostic Metrics
  const completedLogs = logs.filter((l) => l.status === 'concluido');
  const totalCompletedCount = completedLogs.length;

  // Streak calculation (consecutive days with at least 1 completed task)
  const uniqueDatesWithCompletion = Array.from(
    new Set(completedLogs.map((l) => l.date))
  ).sort().reverse();

  let streak = 0;
  let checkDate = new Date();
  
  for (let i = 0; i < 30; i++) {
    const dStr = getTodayDateString(checkDate);
    if (uniqueDatesWithCompletion.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (i === 0 && dStr === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // Find most executed task dynamically
  const taskCounts: { [title: string]: number } = {};
  completedLogs.forEach((l) => {
    taskCounts[l.taskTitle] = (taskCounts[l.taskTitle] || 0) + 1;
  });
  let topTask = '-';
  let topCount = 0;
  Object.entries(taskCounts).forEach(([title, count]) => {
    if (count > topCount) {
      topCount = count;
      topTask = title;
    }
  });

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

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskito-historico-${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-neutral-100">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Concluídas */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Total Concluídas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-neutral-100 font-mono">
            {totalCompletedCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Execuções registradas</span>
          </div>
        </div>

        {/* Sequência Ativa */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Sequência Ativa</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-neutral-100 font-mono">
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Dias consecutivos ativos
          </div>
        </div>

        {/* Dias com Atividade */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Dias com Registros</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-neutral-100 font-mono">
            {uniqueDatesWithCompletion.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Histórico acumulado no app
          </div>
        </div>

        {/* Tarefa Mais Concluída */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Rotina Mais Frequente</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-sm font-bold text-neutral-200 truncate" title={topTask}>
            {topTask}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono">
            {topCount > 0 ? `${topCount} conclusões` : 'Nenhuma ainda'}
          </div>
        </div>
      </div>

      {/* 7-Days Activity Strip */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Visão Semanal de Atividades</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Número de tarefas concluídas nos últimos 7 dias
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {last7Days.map((day) => (
            <div
              key={day.dateStr}
              className={`p-3 rounded-xl border text-center flex flex-col justify-between transition-all ${
                day.isToday
                  ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40'
                  : day.count > 0
                  ? 'bg-neutral-950 border-neutral-800'
                  : 'bg-neutral-950/40 border-neutral-800/60'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  {day.dayName}
                </span>
                <span className="font-bold text-xs text-neutral-200">
                  {day.dayNumber}
                </span>
              </div>

              <div className="mt-3">
                <span
                  className={`inline-block font-mono text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    day.count >= 4
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : day.count > 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-neutral-900 text-neutral-500'
                  }`}
                >
                  {day.count}
                </span>
                <span className="block text-[10px] text-neutral-500 mt-0.5">
                  {day.count === 1 ? 'tarefa' : 'tarefas'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Log Table & Feed */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-4">
        {/* Table Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="font-bold text-sm text-neutral-100">Histórico de Conclusão Detalhado</h3>
            <p className="text-xs text-neutral-400">
              Registros locais salvos no navegador com horários de marcação
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Filter by task */}
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-700 px-2.5 py-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={selectedTaskFilter}
                onChange={(e) => setSelectedTaskFilter(e.target.value)}
                className="bg-transparent border-none text-neutral-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-neutral-900 text-neutral-200">Todas as Rotinas</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-neutral-900 text-neutral-200">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Export JSON button */}
            <button
              id="export-history-btn"
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition-colors"
              title="Baixar cópia de segurança em JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>

            {/* Clear History */}
            {logs.length > 0 && (
              <button
                id="clear-history-btn"
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar todo o histórico de conclusões salvas?')) {
                    onClearHistory();
                  }
                }}
                className="p-1.5 text-neutral-400 hover:text-red-400 rounded-xl hover:bg-red-950/50 transition-colors border border-transparent hover:border-red-900/50"
                title="Limpar histórico"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-neutral-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Nenhum registro encontrado no histórico.</p>
            <p className="text-[11px] text-neutral-600 mt-1">Conforme você executa suas tarefas diárias, os registros aparecerão aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {filteredLogs.map((log) => {
              const formattedDate = new Date(`${log.date}T12:00:00`).toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
              });

              const executionTime = log.completedAt
                ? new Date(log.completedAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null;

              return (
                <div
                  key={log.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-neutral-950/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-neutral-200">
                          {log.taskTitle}
                        </span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-300">
                          Horário: {log.scheduledTime}
                        </span>
                      </div>

                      {log.note && (
                        <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                          <MessageSquare className="w-3 h-3 text-neutral-500" />
                          <span className="italic">"{log.note}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-400 pl-9 sm:pl-0">
                    <span className="capitalize">{formattedDate}</span>
                    {executionTime && (
                      <span className="font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md font-medium">
                        Feito às {executionTime}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
