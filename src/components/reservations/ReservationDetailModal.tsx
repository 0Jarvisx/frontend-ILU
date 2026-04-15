import { useEffect, useState } from 'react';
import { cancelReservation } from '../../services/reservationService';
import { ApiError } from '../../services/api';
import ConfirmModal from '../shared/ConfirmModal';
import type { ApiReservation, ReservationStatus } from '../../types/admin';

interface Props {
  reservation: ApiReservation;
  onClose: () => void;
  onCancelled: (updated: ApiReservation) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-GT', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

function statusBadge(status: ReservationStatus) {
  switch (status) {
    case 'PENDING':
      return { label: 'Pendiente', cls: 'bg-surface-container-high text-secondary' };
    case 'CONFIRMED':
      return { label: 'Confirmada', cls: 'bg-primary-fixed text-on-primary-fixed-variant' };
    case 'CANCELLED':
      return { label: 'Cancelada', cls: 'bg-error-container text-on-error-container' };
  }
}

export default function ReservationDetailModal({ reservation, onClose, onCancelled }: Props) {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && !showConfirmCancel) onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, showConfirmCancel]);

  async function handleCancel() {
    setCancelError(null);
    setIsCancelling(true);
    try {
      const updated = await cancelReservation(reservation.id);
      setShowConfirmCancel(false);
      onCancelled(updated);
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : 'No se pudo cancelar la reservación.');
      setShowConfirmCancel(false);
    } finally {
      setIsCancelling(false);
    }
  }

  const badge = statusBadge(reservation.status);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/15 shrink-0">
            <div>
              <h2 className="text-lg font-extrabold text-primary tracking-tight font-mono">
                {reservation.confirmationCode}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {cancelError && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
                {cancelError}
              </div>
            )}

            {/* Datos principales */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Habitación</p>
                <p className="text-sm font-bold text-primary">#{reservation.roomId}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Huéspedes</p>
                <p className="text-sm font-bold text-primary">{reservation.guestCount}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Check-in</p>
                <p className="text-sm font-semibold text-on-surface">{formatDate(reservation.checkIn)}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Check-out</p>
                <p className="text-sm font-semibold text-on-surface">{formatDate(reservation.checkOut)}</p>
              </div>
            </div>

            {/* Desglose por noches */}
            {reservation.nightlyPrices.length > 0 && (
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Desglose por noches</p>
                <div className="bg-surface-container-low rounded-xl overflow-hidden divide-y divide-outline-variant/10">
                  {reservation.nightlyPrices.map(n => (
                    <div key={n.id} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-on-surface-variant">
                        {new Date(n.date + 'T00:00:00').toLocaleDateString('es-GT', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </span>
                      <span className="font-semibold text-on-surface">${n.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-4 py-3 bg-surface-container">
                    <span className="text-sm font-bold text-on-surface">Total</span>
                    <span className="text-lg font-extrabold text-primary">${reservation.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            {reservation.notes && (
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Notas</p>
                <p className="text-sm text-on-surface bg-surface-container-low rounded-xl px-4 py-3">{reservation.notes}</p>
              </div>
            )}

            {/* IDs internos */}
            <div className="text-[10px] text-on-surface-variant/50 space-y-0.5">
              <p>ID: {reservation.id} · Guest ID: {reservation.guestId} · User ID: {reservation.userId}</p>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="px-8 py-5 border-t border-outline-variant/15 shrink-0 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
              Cerrar
            </button>
            {reservation.status !== 'CANCELLED' && (
              <button
                onClick={() => setShowConfirmCancel(true)}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-lg bg-error text-on-error text-sm font-bold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base" data-icon="cancel">cancel</span>
                Cancelar reservación
              </button>
            )}
          </div>
        </div>
      </div>

      {showConfirmCancel && (
        <ConfirmModal
          title="¿Cancelar esta reservación?"
          description={`Se cancelará la reservación ${reservation.confirmationCode}. La habitación volverá a estar disponible para esas fechas.`}
          confirmLabel="Sí, cancelar"
          isDestructive
          isLoading={isCancelling}
          onConfirm={handleCancel}
          onClose={() => setShowConfirmCancel(false)}
        />
      )}
    </>
  );
}
