import { type FormEvent, useEffect, useState } from 'react';
import { updateRoomType, getRoomType, assignRoomTypeAmenities } from '../../services/roomService';
import { ApiError } from '../../services/api';
import type { ApiRoomType, ApiAmenity } from '../../types/admin';

interface Props {
  roomType: ApiRoomType;
  onClose: () => void;
  onUpdated: () => void;
}

const inputCls =
  'w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const labelCls = 'block text-xs font-bold uppercase tracking-widest text-secondary mb-1.5';

export default function EditRoomTypeModal({ roomType, onClose, onUpdated }: Props) {
  // ── Campos del formulario ─────────────────────────────────────────────────
  const [name, setName] = useState(roomType.name);
  const [description, setDescription] = useState(roomType.description || '');
  const [basePricePerNight, setBasePricePerNight] = useState<number | ''>(roomType.basePricePerNight);
  const [maxCapacity, setMaxCapacity] = useState<number | ''>(roomType.maxCapacity);
  const [maxAdults, setMaxAdults] = useState<number | ''>(roomType.maxAdults ?? '');
  const [maxChildren, setMaxChildren] = useState<number | ''>(roomType.maxChildren ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Amenities ─────────────────────────────────────────────────────────────
  const [amenities, setAmenities] = useState<ApiAmenity[]>(roomType.amenities ?? []);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const [newAmenityId, setNewAmenityId] = useState('');
  const [isSavingAmenities, setIsSavingAmenities] = useState(false);
  const [amenityError, setAmenityError] = useState<string | null>(null);
  const [amenitySuccess, setAmenitySuccess] = useState(false);

  // Cargar amenities del tipo al abrir el modal (GET /rooms/types/:id incluye amenities[])
  useEffect(() => {
    setIsLoadingAmenities(true);
    getRoomType(roomType.id)
      .then(detail => setAmenities(detail.amenities ?? []))
      .catch(() => {/* mantener las amenities que ya venían en el prop */})
      .finally(() => setIsLoadingAmenities(false));
  }, [roomType.id]);

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

  // ── Guardar datos del tipo ────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || basePricePerNight === '' || maxCapacity === '' || maxAdults === '' || maxChildren === '') return;
    if (capacityError) return;
    setError(null);

    setIsSubmitting(true);
    try {
      await updateRoomType(roomType.id, {
        name,
        basePricePerNight: Number(basePricePerNight),
        maxCapacity: Number(maxCapacity),
        maxAdults: Number(maxAdults),
        maxChildren: Number(maxChildren),
        description,
      });
      onUpdated();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'Revisa los campos — el servidor indicó datos inválidos.'
          : err instanceof ApiError ? err.message : 'No se pudo actualizar el Tipo de Habitación. Intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Gestión de amenities ──────────────────────────────────────────────────
  function handleRemoveAmenity(id: number) {
    setAmenities(prev => prev.filter(a => a.id !== id));
    setAmenitySuccess(false);
  }

  function handleAddAmenityById() {
    const id = parseInt(newAmenityId, 10);
    if (isNaN(id) || id <= 0) return;
    if (amenities.some(a => a.id === id)) {
      setNewAmenityId('');
      return;
    }
    // Añadimos un placeholder; el nombre real lo sabrá el backend
    setAmenities(prev => [...prev, { id, name: `Amenity #${id}`, icon: 'hotel_class' }]);
    setNewAmenityId('');
    setAmenitySuccess(false);
  }

  async function handleSaveAmenities() {
    setAmenityError(null);
    setAmenitySuccess(false);
    setIsSavingAmenities(true);
    try {
      await assignRoomTypeAmenities(roomType.id, amenities.map(a => a.id));
      // Re-fetch para obtener nombres e íconos reales del backend
      const detail = await getRoomType(roomType.id);
      setAmenities(detail.amenities ?? []);
      setAmenitySuccess(true);
    } catch (err) {
      setAmenityError(
        err instanceof ApiError ? err.message : 'No se pudieron guardar los amenities.',
      );
    } finally {
      setIsSavingAmenities(false);
    }
  }

  const disabled = isSubmitting || !name || basePricePerNight === '' || maxCapacity === '' || maxAdults === '' || maxChildren === '' || !!capacityError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/15 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-primary tracking-tight">Editar Tipo</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Actualiza este tipo de habitación.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-5">
            {(error || capacityError) && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
                {error ?? capacityError}
              </div>
            )}

            <div>
              <label className={labelCls}>Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={isSubmitting} className={inputCls} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Precio Base ($)</label>
                <input type="number" step="0.01" value={basePricePerNight} onChange={e => setBasePricePerNight(e.target.value ? Number(e.target.value) : '')} disabled={isSubmitting} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Capacidad Máx</label>
                <input type="number" min="1" value={maxCapacity} onChange={e => setMaxCapacity(e.target.value ? Number(e.target.value) : '')} disabled={isSubmitting} className={inputCls} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Máx. Adultos</label>
                <input type="number" min="0" value={maxAdults} onChange={e => setMaxAdults(e.target.value ? Number(e.target.value) : '')} disabled={isSubmitting} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Máx. Niños</label>
                <input type="number" min="0" value={maxChildren} onChange={e => setMaxChildren(e.target.value ? Number(e.target.value) : '')} disabled={isSubmitting} className={inputCls} required />
              </div>
            </div>

            <div>
              <label className={labelCls}>Descripción</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={isSubmitting} className={inputCls} rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={disabled} className="flex-1 py-3 rounded-lg bg-[#006655] text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>

          {/* ── Sección Amenities ─────────────────────────────────────────── */}
          <div className="px-8 pb-8">
            <div className="border-t border-outline-variant/15 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className={labelCls + ' mb-0'}>Amenities</p>
                {isLoadingAmenities && (
                  <span className="material-symbols-outlined text-outline text-base animate-spin" data-icon="progress_activity">progress_activity</span>
                )}
              </div>

              {amenityError && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-sm" data-icon="error">error</span>
                  {amenityError}
                </div>
              )}
              {amenitySuccess && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed-variant text-xs font-medium">
                  <span className="material-symbols-outlined text-sm" data-icon="check_circle">check_circle</span>
                  Amenities guardados correctamente.
                </div>
              )}

              {/* Chips de amenities actuales */}
              <div className="flex flex-wrap gap-2 min-h-8">
                {amenities.length === 0 && !isLoadingAmenities && (
                  <p className="text-xs text-on-surface-variant">Sin amenities asignados.</p>
                )}
                {amenities.map(a => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full text-xs font-semibold text-on-surface border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-secondary" data-icon={a.icon}>{a.icon}</span>
                    {a.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(a.id)}
                      disabled={isSavingAmenities}
                      className="ml-0.5 text-outline hover:text-error transition-colors disabled:opacity-40"
                      title="Quitar"
                    >
                      <span className="material-symbols-outlined text-sm" data-icon="close">close</span>
                    </button>
                  </span>
                ))}
              </div>

              {/* Añadir por ID */}
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="ID del amenity"
                  value={newAmenityId}
                  onChange={e => setNewAmenityId(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenityById(); } }}
                  disabled={isSavingAmenities}
                  className="flex-1 px-3 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleAddAmenityById}
                  disabled={!newAmenityId || isSavingAmenities}
                  className="px-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm font-bold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-40"
                >
                  Agregar
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant">
                Ingresa el ID numérico del amenity a agregar. Los IDs disponibles son definidos por el servidor.
              </p>

              <button
                type="button"
                onClick={handleSaveAmenities}
                disabled={isSavingAmenities || isLoadingAmenities}
                className="w-full py-2.5 rounded-lg bg-secondary text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingAmenities
                  ? <><span className="material-symbols-outlined text-base animate-spin" data-icon="progress_activity">progress_activity</span> Guardando...</>
                  : <><span className="material-symbols-outlined text-base" data-icon="save">save</span> Guardar Amenities</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
