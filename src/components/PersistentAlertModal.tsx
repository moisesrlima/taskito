import React, { useEffect, useState } from 'react';
import { ActiveAlert } from '../types';
import { sounds } from '../utils/audio';
import { BellRing, Check, ExternalLink, Clock, X, MessageSquare, Globe } from 'lucide-react';

interface PersistentAlertModalProps {
  alert: ActiveAlert | null;
  soundEnabled: boolean;
  onComplete: (alert: ActiveAlert, note?: string) => void;
  onSnooze: (alert: ActiveAlert, minutes: number) => void;
  onDismiss: (alert: ActiveAlert) => void;
  onOpenLinkModal?: (url: string, title: string) => void;
}

export const PersistentAlertModal: React.FC<PersistentAlertModalProps> = ({
  alert,
  soundEnabled,
  onComplete,
  onSnooze,
  onDismiss,
  onOpenLinkModal,
}) => {
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    if (!alert) {
      setNote('');
      setShowNoteInput(false);
      return;
    }

    // Play chime immediately
    if (soundEnabled) {
      sounds.playPersistentAlarm();
    }

    // Play repeating chime every 12 seconds if user leaves alert unacknowledged
    const interval = setInterval(() => {
      if (soundEnabled) {
        sounds.playPersistentAlarm();
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [alert, soundEnabled]);

  if (!alert) return null;

  const handleComplete = () => {
    onComplete(alert, note.trim() || undefined);
    setNote('');
  };

  const handleLinkClick = () => {
    if (!alert.url) return;
    if (alert.linkTarget === 'modal' && onOpenLinkModal) {
      onOpenLinkModal(alert.url, alert.title);
    } else {
      window.open(alert.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      id="persistent-alert-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-neutral-100"
    >
      <div
        id="persistent-alert-card"
        className="w-full max-w-lg bg-neutral-900 rounded-2xl shadow-2xl border-2 border-amber-500 overflow-hidden transform transition-all"
      >
        {/* Urgent header bar */}
        <div className="bg-amber-500 px-6 py-3.5 flex items-center justify-between text-neutral-950">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-neutral-950 text-amber-400 rounded-lg animate-pulse">
              <BellRing className="w-5 h-5" />
            </span>
            <span className="font-extrabold text-sm tracking-wide uppercase">
              Lembrete Manual • {alert.scheduledTime}
            </span>
          </div>
          <button
            id="alert-close-btn"
            onClick={() => onDismiss(alert)}
            className="text-neutral-950/70 hover:text-neutral-950 p-1 rounded-lg hover:bg-amber-600/50 transition-colors"
            title="Dispensar aviso"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Hora de executar manualmente
            </span>
            <h2 className="text-xl font-extrabold text-neutral-100 mt-2.5">
              {alert.title}
            </h2>
            {alert.description && (
              <p className="text-sm text-neutral-300 mt-1.5 leading-relaxed">
                {alert.description}
              </p>
            )}
          </div>

          {/* Quick link button if available */}
          {alert.url && (
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-2">
              <div className="text-xs text-neutral-400 truncate max-w-xs">
                Acesse o link configurado: <span className="font-mono text-amber-300">{alert.url}</span>
              </div>
              <button
                id="alert-action-url-btn"
                onClick={handleLinkClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs font-semibold text-neutral-100 transition-colors shadow-xs shrink-0"
              >
                {alert.linkTarget === 'modal' ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ver no Modal</span>
                  </>
                ) : (
                  <>
                    <span>Abrir em Nova Aba</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Note Input Toggle */}
          {showNoteInput ? (
            <div className="space-y-1.5">
              <label htmlFor="alert-note-input" className="text-xs font-semibold text-neutral-300">
                Observação de conclusão (opcional):
              </label>
              <input
                id="alert-note-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Executado com sucesso / Sem anomalias..."
                className="w-full text-xs px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>
          ) : (
            <button
              id="alert-add-note-btn"
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Adicionar observação ao histórico</span>
            </button>
          )}

          {/* Main Action Buttons */}
          <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center gap-2">
            <button
              id="alert-done-btn"
              onClick={handleComplete}
              className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Marcar como Feito Agora</span>
            </button>

            <button
              id="alert-snooze-btn"
              onClick={() => onSnooze(alert, 10)}
              className="w-full sm:w-auto py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Adiar 10m</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
