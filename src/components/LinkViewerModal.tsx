import React, { useState } from 'react';
import { X, ExternalLink, RotateCcw, Globe, AlertCircle } from 'lucide-react';

interface LinkViewerModalProps {
  url: string | null;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LinkViewerModal: React.FC<LinkViewerModalProps> = ({
  url,
  title,
  isOpen,
  onClose,
}) => {
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen || !url) return null;

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white">
        
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.1))',
                color: 'var(--app-primary, #7014F2)',
              }}
            >
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-sm sm:max-w-md">
                {url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Reload iframe */}
            <button
              onClick={handleReload}
              title="Recarregar"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Open externally */}
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              title="Abrir diretamente em uma nova aba do navegador"
            >
              <span>Abrir em Nova Aba</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors ml-1"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice bar */}
        <div
          className="px-4 py-2 border-b text-[11px] flex items-center justify-between gap-2 shrink-0"
          style={{
            backgroundColor: 'var(--app-primary-10, rgba(112, 20, 242, 0.06))',
            borderColor: 'var(--app-primary-20, rgba(112, 20, 242, 0.15))',
            color: 'var(--app-primary, #7014F2)',
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Visualização interna. Se o site bloquear exibição em moldura (X-Frame-Options), clique em "Abrir em Nova Aba".
            </span>
          </div>
        </div>

        {/* Iframe Frame */}
        <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 relative">
          <iframe
            key={iframeKey}
            src={url}
            title={title}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
