import { type FormEvent, useEffect, useState } from 'react';
import { createReservation } from '../../services/reservationService';
import { ApiError } from '../../services/api';
import type { ApiAvailableRoom, ApiReservation } from '../../types/admin';

interface Props {
  room: ApiAvailableRoom;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  onClose: () => void;
  onCreated: (reservation: ApiReservation) => void;
}

const inputCls =
  'w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const labelCls = 'block text-xs font-bold uppercase tracking-widest text-secondary mb-1.5';

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-GT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function CreateReservationModal({ room, checkIn, checkOut, guestCount, onClose, onCreated }: Props) {
  const nights = nightsBetween(checkIn, checkOut);
  const estimatedTotal = room.roomType.basePricePerNight * nights;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [notes, setNotes]         = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const primaryImage = room.images.find(i => i.isPrimary) ?? room.images[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await createReservation({
        roomId: room.id,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestEmail: email,
        guestPhone: phone || undefined,
        checkIn,
        checkOut,
        guestCount,
        notes: notes || undefined,
      });
      onCreated(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('La habitación ya no está disponible para las fechas seleccionadas.');
      } else {
        setError(err instanceof ApiError ? err.message : 'No se pudo crear la reservación. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = isSubmitting || !firstName || !lastName || !email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/15 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-primary tracking-tight">Nueva Reservación</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Hab. {room.roomNumber} · {room.roomType.name} · {nights} {nights === 1 ? 'noche' : 'noches'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-outline-variant/15">

            {/* ── Panel izquierdo: resumen ─────────────────────────────── */}
            <div className="md:col-span-2 p-6 space-y-4 bg-surface-container-low/40">
              {/* Imagen */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface-container">
                {primaryImage ? (
                  <img src={primaryImage.url} alt={`Hab. ${room.roomNumber}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                    <span className="material-symbols-outlined text-4xl" data-icon="image_not_supported">image_not_supported</span>
                  </div>
                )}
              </div>

              {/* Info tipo */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-0.5">{room.roomType.name}</p>
                <p className="text-xl font-extrabold text-primary">Hab. {room.roomNumber}</p>
                <p className="text-xs text-on-surface-variant mt-1">Piso {room.floor}</p>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-surface-container rounded-lg">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Entrada</p>
                  <p className="text-sm font-semibold text-primary">{formatDate(checkIn)}</p>
                </div>
                <div className="p-3 bg-surface-container rounded-lg">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Salida</p>
                  <p className="text-sm font-semibold text-primary">{formatDate(checkOut)}</p>
                </div>
              </div>

              {/* Huéspedes */}
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-secondary" data-icon="group">group</span>
                {guestCount} {guestCount === 1 ? 'huésped' : 'huéspedes'}
              </div>

              {/* Amenities */}
              {room.roomType.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {room.roomType.amenities.map(a => (
                    <span key={a.id} title={a.name} className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container rounded-full text-[10px] font-semibold text-on-surface-variant border border-outline-variant/20">
                      <span className="material-symbols-outlined text-xs text-secondary" data-icon={a.icon}>{a.icon}</span>
                      {a.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Desglose de precio */}
              <div className="pt-3 border-t border-outline-variant/20 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">${room.roomType.basePricePerNight} × {nights} noches</span>
                  <span className="font-medium">${estimatedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total estimado</span>
                  <span className="text-xl font-extrabold text-primary">${estimatedTotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/60">El precio final lo confirma el servidor.</p>
              </div>
            </div>

            {/* ── Panel derecho: formulario ────────────────────────────── */}
            <form onSubmit={handleSubmit} noValidate className="md:col-span-3 p-6 space-y-5 flex flex-col">
              <div>
                <p className="text-sm font-bold text-on-surface mb-0.5">Datos del Huésped</p>
                <p className="text-xs text-on-surface-variant">Completa la información del huésped principal.</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                  <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input type="text" placeholder="María" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={isSubmitting} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Apellido</label>
                  <input type="text" placeholder="García" value={lastName} onChange={e => setLastName(e.target.value)} disabled={isSubmitting} className={inputCls} required />
                </div>
              </div>

              <div>
                <label className={labelCls}>Correo Electrónico</label>
                <input type="email" placeholder="maria@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isSubmitting} className={inputCls} required />
              </div>

              <div>
                <label className={labelCls}>Teléfono <span className="normal-case font-normal text-on-surface-variant">(opcional)</span></label>
                <input type="tel" placeholder="+502 5555-0000" value={phone} onChange={e => setPhone(e.target.value)} disabled={isSubmitting} className={inputCls} />
              </div>

              <div className="flex-1">
                <label className={labelCls}>Notas <span className="normal-case font-normal text-on-surface-variant">(opcional)</span></label>
                <textarea placeholder="Ej. Llegada tardía aprox. 11pm" value={notes} onChange={e => setNotes(e.target.value)} disabled={isSubmitting} className={inputCls} rows={3} />
              </div>

              <div className="flex gap-3 pt-2 mt-auto">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={disabled} className="flex-1 py-3 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting
                    ? <><span className="material-symbols-outlined text-base animate-spin" data-icon="progress_activity">progress_activity</span> Creando...</>
                    : <><span className="material-symbols-outlined text-base" data-icon="check_circle">check_circle</span> Confirmar Reservación</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
