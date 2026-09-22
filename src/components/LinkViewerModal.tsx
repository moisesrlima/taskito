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
    <div
      id="link-viewer-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="link-viewer-container"
        className="w-full max-w-5xl h-[88vh] bg-neutral-900 rounded-2xl border border-neutral-700 shadow-2xl flex flex-col overflow-hidden text-neutral-100"
      >
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-neutral-100 truncate">
                {title}
              </h3>
              <p className="text-[11px] font-mono text-neutral-400 truncate max-w-sm sm:max-w-md">
                {url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Reload iframe */}
            <button
              onClick={handleReload}
              title="Recarregar visualização"
              className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Open externally */}
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold border border-neutral-700 transition-colors"
              title="Abrir diretamente em uma nova aba do navegador"
            >
              <span>Abrir em Nova Aba</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-xl transition-colors ml-1"
              title="Fechar visualizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info notice bar */}
        <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/40 text-[11px] text-amber-300 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Visualizando link interno. Caso o site tenha restrições de segurança (X-Frame-Options), clique em "Abrir em Nova Aba".
            </span>
          </div>
        </div>

        {/* Iframe Frame */}
        <div className="flex-1 w-full bg-neutral-950 relative">
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
