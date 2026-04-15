import { useEffect } from 'react';

interface Props {
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirmar',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-surface rounded-2xl shadow-xl border border-outline-variant/20 p-8">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${
          isDestructive ? 'bg-error-container' : 'bg-primary/10'
        }`}>
          <span
            className={`material-symbols-outlined text-2xl ${isDestructive ? 'text-error' : 'text-primary'}`}
            data-icon={isDestructive ? 'person_off' : 'help'}
          >
            {isDestructive ? 'person_off' : 'help'}
          </span>
        </div>

        <h2 className="text-lg font-extrabold text-on-surface mb-2">{title}</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-8">{description}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              isDestructive
                ? 'bg-error text-on-error hover:opacity-90'
                : 'bg-primary text-on-primary hover:opacity-90'
            }`}
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base" data-icon="progress_activity">progress_activity</span>
                Procesando...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
