import { request } from './api';
import type {
  ApiAvailableRoom,
  ApiReservation,
  CreateReservationPayload,
  ReservationListResponse,
  ReservationStatus,
} from '../types/admin';

export function getAvailableRooms(
  checkIn: string,
  checkOut: string,
  guestCount: number,
): Promise<ApiAvailableRoom[]> {
  return request<ApiAvailableRoom[]>(
    `/reservations/available?checkIn=${checkIn}&checkOut=${checkOut}&guestCount=${guestCount}`,
  );
}

export function createReservation(payload: CreateReservationPayload): Promise<ApiReservation> {
  return request<ApiReservation, CreateReservationPayload>('/reservations', {
    method: 'POST',
    body: payload,
  });
}

export interface ListReservationsParams {
  page?: number;
  perPage?: number;
  status?: ReservationStatus | '';
  guestId?: number;
  roomId?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export function listReservations(params: ListReservationsParams = {}): Promise<ReservationListResponse> {
  const { page = 1, perPage = 10, status, guestId, roomId, orderBy = 'createdAt', order = 'desc' } = params;
  const qs = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    orderBy,
    order,
  });
  if (status) qs.set('status', status);
  if (guestId) qs.set('guestId', String(guestId));
  if (roomId) qs.set('roomId', String(roomId));

  return request<ReservationListResponse>(`/reservations?${qs.toString()}`);
}

export function getReservation(id: number): Promise<ApiReservation> {
  return request<ApiReservation>(`/reservations/${id}`);
}

export function cancelReservation(id: number): Promise<ApiReservation> {
  return request<ApiReservation>(`/reservations/${id}/cancel`, { method: 'POST' });
}
