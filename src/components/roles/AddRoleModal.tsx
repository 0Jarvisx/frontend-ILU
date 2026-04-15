import { type FormEvent, useEffect, useState } from 'react';
import { createRole } from '../../services/roleService';
import { ApiError } from '../../services/api';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const inputCls =
  'w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const labelCls = 'block text-xs font-bold uppercase tracking-widest text-secondary mb-1.5';

export default function AddRoleModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await createRole({ 
        name, 
        description: description.trim() === '' ? undefined : description 
      });
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'Revisa los datos — el servidor indicó datos inválidos.'
          : 'No se pudo crear el rol. Intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = isSubmitting || !name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-role-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/15">
          <div>
            <h2 id="add-role-title" className="text-lg font-extrabold text-primary tracking-tight">
              Crear Nuevo Rol
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Define un perfil para agrupar permisos en el sistema.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
              <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
              {error}
            </div>
          )}

          <div>
            <label className={labelCls} htmlFor="role-name">Nombre del Rol *</label>
            <input
              id="role-name"
              type="text"
              autoComplete="off"
              placeholder="ej. supervisor, cajero"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isSubmitting}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="role-desc">Descripción (Opcional)</label>
            <textarea
              id="role-desc"
              rows={3}
              placeholder="ej. Gestiona turnos y emite reportes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isSubmitting}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="flex-1 py-3 rounded-lg bg-[#006655] text-white text-sm font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base" data-icon="progress_activity">progress_activity</span>
                  Creando...
                </>
              ) : (
                'Crear Rol'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
