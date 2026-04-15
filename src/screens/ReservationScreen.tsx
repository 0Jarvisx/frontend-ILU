import { useEffect, useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { listReservations, cancelReservation } from '../services/reservationService';
import { ApiError } from '../services/api';
import ReservationDetailModal from '../components/reservations/ReservationDetailModal';
import ConfirmModal from '../components/shared/ConfirmModal';
import type { ApiReservation, ReservationStatus } from '../types/admin';

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  PENDING: 'bg-surface-container-high text-secondary',
  CONFIRMED: 'bg-primary-fixed text-on-primary-fixed-variant',
  CANCELLED: 'bg-error-container text-on-error-container',
};

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReservationScreen() {
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [detailReservation, setDetailReservation] = useState<ApiReservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ApiReservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  async function loadReservations(p = 1, status: ReservationStatus | '' = statusFilter) {
    setIsLoading(true);
    setListError(null);
    try {
      const res = await listReservations({ page: p, perPage: 10, status });
      setReservations(res.data);
      setTotalPages(res.totalPages ?? 1);
      setPage(p);
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Error al cargar reservaciones.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReservations(1, statusFilter);
  }, [statusFilter]);

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelReservation(cancelTarget.id);
      setCancelTarget(null);
      loadReservations(page);
    } catch {
      setCancelTarget(null);
    } finally {
      setIsCancelling(false);
    }
  }

  function handleDetailCancelled(updated: ApiReservation) {
    setDetailReservation(updated);
    setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
  }

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto mb-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-1">Reservaciones</h2>
              <p className="text-on-surface-variant text-sm font-medium">Consulta y gestiona todas las reservaciones.</p>
            </div>
          </div>

          {/* Filtro de estado */}
          <div className="flex items-center gap-3 flex-wrap mb-5">
            {(['', 'PENDING', 'CONFIRMED', 'CANCELLED'] as (ReservationStatus | '')[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${statusFilter === s ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
              >
                {s === '' ? 'Todas' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {listError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium mb-5">
              <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
              {listError}
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined animate-spin text-xl" data-icon="progress_activity">progress_activity</span>
                Cargando...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low/50">
                    <tr>
                      {['Código', 'Hab.', 'Entrada', 'Salida', 'Huéspedes', 'Total', 'Estado', ''].map(h => (
                        <th key={h} className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {reservations.map(r => (
                      <tr key={r.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold text-primary">{r.confirmationCode}</span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-on-surface">#{r.room.roomNumber}</td>
                        <td className="px-5 py-4 text-sm text-on-surface-variant whitespace-nowrap">{formatDateShort(r.checkIn)}</td>
                        <td className="px-5 py-4 text-sm text-on-surface-variant whitespace-nowrap">{formatDateShort(r.checkOut)}</td>
                        <td className="px-5 py-4 text-sm text-center text-on-surface">{r.guestCount}</td>
                        <td className="px-5 py-4 font-bold text-secondary text-sm whitespace-nowrap">${r.totalPrice.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${STATUS_BADGE[r.status]}`}>
                            {STATUS_LABELS[r.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-outline">
                            <button onClick={() => setDetailReservation(r)} className="hover:text-primary transition-colors" title="Ver detalles">
                              <span className="material-symbols-outlined text-lg" data-icon="visibility">visibility</span>
                            </button>
                            {r.status !== 'CANCELLED' && (
                              <button onClick={() => setCancelTarget(r)} className="hover:text-error transition-colors" title="Cancelar">
                                <span className="material-symbols-outlined text-lg" data-icon="cancel">cancel</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-on-surface-variant">
                          No se encontraron reservaciones.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => loadReservations(page - 1)}
                disabled={page <= 1 || isLoading}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-40 transition-colors"
              >
                <span className="material-symbols-outlined text-base" data-icon="chevron_left">chevron_left</span> Anterior
              </button>
              <span className="text-xs text-on-surface-variant font-medium">Página {page} de {totalPages}</span>
              <button
                onClick={() => loadReservations(page + 1)}
                disabled={page >= totalPages || isLoading}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-40 transition-colors"
              >
                Siguiente <span className="material-symbols-outlined text-base" data-icon="chevron_right">chevron_right</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {detailReservation && (
        <ReservationDetailModal
          reservation={detailReservation}
          onClose={() => setDetailReservation(null)}
          onCancelled={handleDetailCancelled}
        />
      )}

      {cancelTarget && (
        <ConfirmModal
          title="¿Cancelar esta reservación?"
          description={`Se cancelará la reservación ${cancelTarget.confirmationCode}. La habitación volverá a estar disponible para esas fechas.`}
          confirmLabel="Sí, cancelar"
          isDestructive
          isLoading={isCancelling}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
