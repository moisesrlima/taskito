import React, { useState, useEffect } from 'react';
import { TaskItem, DayOfWeek, LinkOpenTarget } from '../types';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Link,
  Globe,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  task?: TaskItem | null;
  onDelete?: (taskId: string) => void;
}

const DAYS_OF_WEEK: { label: string; value: DayOfWeek }[] = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  onDelete,
}) => {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState<LinkOpenTarget>('new_tab');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [newTimeInput, setNewTimeInput] = useState('14:00');
  const [soundAlert, setSoundAlert] = useState(true);
  const [persistentAlert, setPersistentAlert] = useState(true);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category || '');
      setUrl(task.url || '');
      setLinkTarget(task.linkTarget || 'new_tab');
      setSelectedDays(task.daysOfWeek || [1, 2, 3, 4, 5]);
      setTimes(task.times && task.times.length > 0 ? task.times : ['09:00']);
      setSoundAlert(task.soundAlert ?? true);
      setPersistentAlert(task.persistentAlert ?? true);
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setUrl('');
      setLinkTarget('new_tab');
      setSelectedDays([1, 2, 3, 4, 5]);
      setTimes(['09:00']);
      setSoundAlert(true);
      setPersistentAlert(true);
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Must have at least 1 day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleAddTime = () => {
    if (!newTimeInput) return;
    if (!times.includes(newTimeInput)) {
      setTimes([...times, newTimeInput].sort());
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (times.length === 1) return; // Keep at least one
    setTimes(times.filter((t) => t !== timeToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: task ? task.id : `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      url: url.trim() || undefined,
      linkTarget,
      daysOfWeek: selectedDays,
      times,
      soundAlert,
      persistentAlert,
      enabled: task ? task.enabled : true,
      createdAt: task ? task.createdAt : new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                color: 'var(--app-primary, #7014F2)',
              }}
            >
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Título da Atividade *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pausa para alongamento, Enviar relatório..."
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[var(--app-primary,#7014F2)] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Category & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Trabalho, Pessoal, Saúde, Estudo"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[var(--app-primary,#7014F2)] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Link className="w-3 h-3 text-[var(--app-primary,#7014F2)]" />
                <span>Link Externo (Opcional)</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[var(--app-primary,#7014F2)] outline-none font-mono"
              />
            </div>
          </div>

          {/* Link Open Target */}
          {url.trim() && (
            <div
              className="p-3 rounded-xl border space-y-2"
              style={{
                backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.05))',
                borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.2))',
              }}
            >
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[var(--app-primary,#7014F2)]" />
                <span>Como abrir o link</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLinkTarget('new_tab')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    linkTarget === 'new_tab'
                      ? 'bg-white dark:bg-slate-800 border-[var(--app-primary,#7014F2)] text-[var(--app-primary,#7014F2)] shadow-sm font-semibold'
                      : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xs block">Nova Aba</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Recomendado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLinkTarget('modal')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    linkTarget === 'modal'
                      ? 'bg-white dark:bg-slate-800 border-[var(--app-primary,#7014F2)] text-[var(--app-primary,#7014F2)] shadow-sm font-semibold'
                      : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-xs block">Modal Interno</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Dentro do app</span>
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Instruções / Anotações</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhes, orientações ou passo-a-passo da atividade..."
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[var(--app-primary,#7014F2)] outline-none"
            />
          </div>

          {/* Days of Week */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dias da Semana</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'btn-app-primary text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Times */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Horários Agendados</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {times.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                    color: 'var(--app-primary, #7014F2)',
                    borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.2))',
                  }}
                >
                  <span>{t}</span>
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(t)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}

              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[var(--app-primary,#7014F2)] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Persistent Alert & Sound */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlert}
                onChange={(e) => setSoundAlert(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--app-primary, #7014F2)' }}
              />
              <span>Alarme sonoro ao chegar a hora</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(task!.id);
                  onClose();
                }}
                className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold btn-app-primary rounded-full transition-all"
              >
                {isEditing ? 'Salvar Alterações' : 'Criar Atividade'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
