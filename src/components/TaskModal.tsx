import React, { useState } from 'react';
import { TaskItem, LinkOpenTarget, DayOfWeek } from '../types';
import { X, Clock, Plus, Trash2, Calendar, Link, Globe, Layers } from 'lucide-react';

interface TaskModalProps {
  task: TaskItem | null; // null if creating
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState(task?.category || 'Geral');
  const [url, setUrl] = useState(task?.url || '');
  const [linkTarget, setLinkTarget] = useState<LinkOpenTarget>(
    task?.linkTarget || 'new_tab'
  );
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(
    task?.daysOfWeek || [1, 2, 3, 4, 5]
  );
  const [times, setTimes] = useState<string[]>(
    task?.times && task.times.length > 0 ? task.times : ['09:00']
  );
  const [newTimeInput, setNewTimeInput] = useState('10:00');
  const [soundAlert, setSoundAlert] = useState(task ? task.soundAlert : true);
  const [persistentAlert, setPersistentAlert] = useState(task ? task.persistentAlert : true);
  const [enabled] = useState(task ? task.enabled : true);

  if (!isOpen) return null;

  const daysList: { label: string; value: DayOfWeek; name: string }[] = [
    { label: 'D', value: 0, name: 'Domingo' },
    { label: 'S', value: 1, name: 'Segunda' },
    { label: 'T', value: 2, name: 'Terça' },
    { label: 'Q', value: 3, name: 'Quarta' },
    { label: 'Q', value: 4, name: 'Quinta' },
    { label: 'S', value: 5, name: 'Sexta' },
    { label: 'S', value: 6, name: 'Sábado' },
  ];

  const toggleDay = (day: DayOfWeek) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const handleSelectWeekdaysOnly = () => {
    setDaysOfWeek([1, 2, 3, 4, 5]);
  };

  const handleSelectAllDays = () => {
    setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSelectMondayOnly = () => {
    setDaysOfWeek([1]);
  };

  const handleAddTime = () => {
    if (!newTimeInput) return;
    if (!times.includes(newTimeInput)) {
      setTimes([...times, newTimeInput].sort());
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (times.length > 1) {
      setTimes(times.filter((t) => t !== timeToRemove));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedTask: TaskItem = {
      id: task?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      url: url.trim() || undefined,
      linkTarget: url.trim() ? linkTarget : undefined,
      daysOfWeek,
      times: times.length > 0 ? times : ['09:00'],
      soundAlert,
      persistentAlert,
      enabled,
      createdAt: task?.createdAt || new Date().toISOString(),
    };

    onSave(updatedTask);
    onClose();
  };

  return (
    <div
      id="task-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div
        id="task-modal-card"
        className="w-full max-w-lg bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700/80 overflow-hidden my-6 text-neutral-100"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div>
            <h3 className="font-bold text-base text-neutral-100">
              {isEditing ? 'Editar Rotina / Lembrete' : 'Cadastrar Nova Rotina no Taskito'}
            </h3>
            <p className="text-xs text-neutral-400">
              Configure horários, dias de repetição, link de ação e alertas
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Checar Banners do Portal, Disparar E-mails, Bater Ponto..."
              className="w-full text-sm px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300">
              Instruções / Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes de como executar ou o que checar ao receber o lembrete..."
              className="w-full text-xs px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none leading-relaxed"
            />
          </div>

          {/* Category Tag & Link URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300">Categoria / Tag</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Trabalho, Operações, Ponto..."
                className="w-full text-xs px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-600 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                <Link className="w-3 h-3 text-amber-400" />
                <span>Link Direto (URL)</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com.br"
                className="w-full text-xs px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder:text-neutral-600 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Target Link Configuration: New Tab vs Modal */}
          {url.trim() && (
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Comportamento ao Clicar no Link</span>
              </label>
              <p className="text-[11px] text-neutral-400">
                Escolha como deseja que o link seja aberto quando você clicar nele na rotina ou no alerta:
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLinkTarget('new_tab')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    linkTarget === 'new_tab'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold block">Abrir em Nova Aba</span>
                  <span className="text-[10px] text-neutral-500 mt-1">
                    Abre em uma nova aba do navegador (recomendado para sites externos)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLinkTarget('modal')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    linkTarget === 'modal'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold block">Abrir em Janela Modal</span>
                  <span className="text-[10px] text-neutral-500 mt-1">
                    Abre direto dentro do Taskito sem precisar sair da página
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Days of Week */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Dias de Execução</span>
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectWeekdaysOnly}
                  className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Seg-Sex
                </button>
                <button
                  type="button"
                  onClick={handleSelectMondayOnly}
                  className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Só Seg
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllDays}
                  className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Todos
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1.5">
              {daysList.map((d) => {
                const isSelected = daysOfWeek.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    title={d.name}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 shadow-xs'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Horários dos Lembretes ({times.length})</span>
              </label>
              <span className="text-[11px] text-neutral-500">
                Você pode cadastrar múltiplos horários (ex: bater ponto 4x)
              </span>
            </div>

            {/* Existing Time Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {times.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono font-bold text-amber-300"
                >
                  <span>{t}</span>
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(t)}
                      className="text-neutral-500 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Add another time slot */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="time"
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="text-xs px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-xl font-mono text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddTime}
                className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Horário</span>
              </button>
            </div>
          </div>

          {/* Alert Options */}
          <div className="pt-2 border-t border-neutral-800 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={persistentAlert}
                onChange={(e) => setPersistentAlert(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-neutral-950 border-neutral-700 focus:ring-amber-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-neutral-200">Alerta Persistente</span>
                <p className="text-neutral-400 text-[11px]">
                  Mantém aviso e som repetitivo na tela até que você confirme ou adie
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlert}
                onChange={(e) => setSoundAlert(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-neutral-950 border-neutral-700 focus:ring-amber-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-neutral-200">Sinal Sonoro Harmonioso</span>
                <p className="text-neutral-400 text-[11px]">
                  Toca aviso de áudio (chime) no horário programado
                </p>
              </div>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            {task && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja remover a rotina "${task.title}"?`)) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/50 rounded-xl transition-colors border border-transparent hover:border-red-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-amber-500 text-neutral-950 rounded-xl hover:bg-amber-400 active:scale-95 transition-all shadow-md"
              >
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Rotina'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
