import { type FormEvent, useEffect, useState } from 'react';
import { createRoomType } from '../../services/roomService';
import { ApiError } from '../../services/api';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const inputCls =
  'w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const labelCls = 'block text-xs font-bold uppercase tracking-widest text-secondary mb-1.5';

export default function AddRoomTypeModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePricePerNight, setBasePricePerNight] = useState<number | ''>('');
  const [maxCapacity, setMaxCapacity] = useState<number | ''>('');
  const [maxAdults, setMaxAdults] = useState<number | ''>('');
  const [maxChildren, setMaxChildren] = useState<number | ''>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const capacityError =
    maxAdults !== '' && maxChildren !== '' && maxCapacity !== '' &&
    Number(maxAdults) + Number(maxChildren) > Number(maxCapacity)
      ? 'La capacidad máx. debe ser ≥ adultos + niños.'
      : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || basePricePerNight === '' || maxCapacity === '' || maxAdults === '' || maxChildren === '') return;
    if (capacityError) return;
    setError(null);

    setIsSubmitting(true);
    try {
      await createRoomType({
        name,
        basePricePerNight: Number(basePricePerNight),
        maxCapacity: Number(maxCapacity),
        maxAdults: Number(maxAdults),
        maxChildren: Number(maxChildren),
        description,
      });
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 400
            ? 'Revisa los campos — el servidor indicó datos inválidos.'
            : err.message
          : 'No se pudo crear el Tipo de Habitación. Intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled =
    isSubmitting ||
    !name ||
    basePricePerNight === '' ||
    maxCapacity === '' ||
    maxAdults === '' ||
    maxChildren === '' ||
    !!capacityError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/15">
          <div>
            <h2 className="text-lg font-extrabold text-primary tracking-tight">Nuevo Tipo</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Configura un nuevo tipo de habitación.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-5">
          {(error || capacityError) && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
              <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
              {error ?? capacityError}
            </div>
          )}

          <div>
            <label className={labelCls}>Nombre</label>
            <input
              type="text"
              placeholder="Ej. Suite Presidencial"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isSubmitting}
              className={inputCls}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Precio Base ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                value={basePricePerNight}
                onChange={e => setBasePricePerNight(e.target.value ? Number(e.target.value) : '')}
                disabled={isSubmitting}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Capacidad Máx</label>
              <input
                type="number"
                min="1"
                placeholder="3"
                value={maxCapacity}
                onChange={e => setMaxCapacity(e.target.value ? Number(e.target.value) : '')}
                disabled={isSubmitting}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Máx. Adultos</label>
              <input
                type="number"
                min="0"
                placeholder="2"
                value={maxAdults}
                onChange={e => setMaxAdults(e.target.value ? Number(e.target.value) : '')}
                disabled={isSubmitting}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Máx. Niños</label>
              <input
                type="number"
                min="0"
                placeholder="1"
                value={maxChildren}
                onChange={e => setMaxChildren(e.target.value ? Number(e.target.value) : '')}
                disabled={isSubmitting}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              placeholder="Detalles sobre el tipo de habitación..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isSubmitting}
              className={inputCls}
              rows={3}
            />
          </div>

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
              className="flex-1 py-3 rounded-lg bg-[#006655] text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Creando...' : 'Crear Tipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
