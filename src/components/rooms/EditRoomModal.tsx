import { type FormEvent, useEffect, useState } from 'react';
import { updateRoom } from '../../services/roomService';
import { ApiError } from '../../services/api';
import type { ApiRoom, ApiRoomType } from '../../types/admin';

interface Props {
  room: ApiRoom;
  roomTypes: ApiRoomType[];
  onClose: () => void;
  onUpdated: () => void;
}

const inputCls =
  'w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const labelCls = 'block text-xs font-bold uppercase tracking-widest text-secondary mb-1.5';

export default function EditRoomModal({ room, roomTypes, onClose, onUpdated }: Props) {
  const [roomNumber, setRoomNumber] = useState(room.roomNumber);
  const [roomTypeId, setRoomTypeId] = useState<string>(String(room.roomType.id));
  const [floor, setFloor] = useState<number | ''>(room.floor);
  const [isActive, setIsActive] = useState(room.isActive);
  const [notes, setNotes] = useState(room.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!roomNumber || !roomTypeId || floor === '') return;
    setError(null);

    setIsSubmitting(true);
    try {
      await updateRoom(room.id, {
        roomNumber,
        roomTypeId: Number(roomTypeId),
        floor: Number(floor),
        isActive,
        notes
      });
      onUpdated();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'Revisa los campos — el servidor indicó datos inválidos.'
          : err instanceof ApiError ? err.message : 'No se pudo actualizar la Habitación. Intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = isSubmitting || !roomNumber || !roomTypeId || floor === '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/15">
          <div>
            <h2 className="text-lg font-extrabold text-primary tracking-tight">Editar Habitación</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Actualiza la información de la habitación.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
              <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Número</label>
              <input type="text" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} disabled={isSubmitting} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Piso</label>
              <input type="number" min="0" value={floor} onChange={e => setFloor(e.target.value ? Number(e.target.value) : '')} disabled={isSubmitting} className={inputCls} required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Tipo de Habitación</label>
            <div className="relative">
              <select value={roomTypeId} onChange={e => setRoomTypeId(e.target.value)} disabled={isSubmitting || roomTypes.length === 0} className="appearance-none w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors disabled:opacity-50" required>
                {!roomTypes.length && <option value="">Sin tipos disponibles</option>}
                {roomTypes.map(rt => (
                  <option key={rt.id} value={String(rt.id)}>{rt.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 select-none cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} disabled={isSubmitting} className="rounded w-5 h-5 border-outline-variant focus:ring-primary/20 accent-[#006655]" />
              <span className="text-sm font-bold text-on-surface">Activa</span>
            </label>
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} disabled={isSubmitting} className={inputCls} rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={disabled} className="flex-1 py-3 rounded-lg bg-[#006655] text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex justify-center items-center">
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
