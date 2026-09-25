import React, { useState } from 'react';
import { ActiveAlert } from '../types';
import {
  BellRing,
  Check,
  X,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface PersistentAlertModalProps {
  alert: ActiveAlert | null;
  soundEnabled?: boolean;
  onComplete: (alert: ActiveAlert, note?: string) => void;
  onSnooze: (alert: ActiveAlert, minutes: number) => void;
  onDismiss: () => void;
  onOpenLinkModal: (url: string, title: string) => void;
}

export const PersistentAlertModal: React.FC<PersistentAlertModalProps> = ({
  alert,
  onComplete,
  onSnooze,
  onDismiss,
  onOpenLinkModal,
}) => {
  const [note, setNote] = useState('');

  if (!alert) return null;

  const handleComplete = () => {
    onComplete(alert, note.trim() || undefined);
    setNote('');
  };

  const handleLinkClick = () => {
    if (!alert.url) return;
    if (alert.linkTarget === 'modal') {
      onOpenLinkModal(alert.url, alert.title);
    } else {
      window.open(alert.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all">
        
        {/* Header Bar */}
        <div
          className="px-6 py-4 flex items-center justify-between text-white"
          style={{
            background: 'linear-gradient(135deg, var(--mascot-from, #7A1BF2) 0%, var(--mascot-to, #6312D6) 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-white/20 rounded-full animate-bounce">
              <BellRing className="w-4 h-4" />
            </span>
            <span className="font-bold text-sm tracking-wide">
              Lembrete Agendado • {alert.scheduledTime}
            </span>
          </div>
          <button
            onClick={() => onDismiss()}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {alert.title}
            </h2>
            {alert.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {alert.description}
              </p>
            )}
          </div>

          {/* If Link Attached */}
          {alert.url && (
            <div
              className="p-3 border rounded-2xl flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.05))',
                borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.2))',
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-[var(--app-primary,#7014F2)] shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-300 truncate font-mono">
                  {alert.url}
                </span>
              </div>
              <button
                onClick={handleLinkClick}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 text-[var(--app-primary,#7014F2)] border text-xs font-semibold rounded-full shadow-sm transition-all shrink-0 flex items-center gap-1 hover:brightness-105"
                style={{ borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.2))' }}
              >
                <span>Abrir</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Quick Note Input */}
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Adicionar nota rápida (opcional)..."
              className="w-full text-xs px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[var(--app-primary,#7014F2)] outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleComplete}
              className="w-full py-3 btn-app-primary text-white font-bold rounded-full flex items-center justify-center gap-2 text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Marcar como Concluída</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSnooze(alert, 5)}
                className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full transition-colors"
              >
                Adiar 5 min
              </button>
              <button
                onClick={() => onDismiss()}
                className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
