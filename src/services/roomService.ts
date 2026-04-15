import { request } from './api';
import type {
  ApiRoom,
  ApiRoomType,
  CreateRoomPayload,
  UpdateRoomPayload,
  CreateRoomTypePayload,
  UpdateRoomTypePayload,
  AssignAmenitiesPayload,
  Paginated,
} from '../types/admin';

// ── Room Types ────────────────────────────────────────────────────────────────

export function listRoomTypes(page = 1, perPage = 50): Promise<Paginated<ApiRoomType>> {
  return request<Paginated<ApiRoomType>>(`/rooms/types?page=${page}&perPage=${perPage}`);
}

export function getRoomType(id: number): Promise<ApiRoomType> {
  return request<ApiRoomType>(`/rooms/types/${id}`);
}

export function createRoomType(payload: CreateRoomTypePayload): Promise<ApiRoomType> {
  return request<ApiRoomType, CreateRoomTypePayload>('/rooms/types', {
    method: 'POST',
    body: payload,
  });
}

export function updateRoomType(id: number, payload: UpdateRoomTypePayload): Promise<ApiRoomType> {
  return request<ApiRoomType, UpdateRoomTypePayload>(`/rooms/types/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteRoomType(id: number): Promise<void> {
  return request<void>(`/rooms/types/${id}`, { method: 'DELETE' });
}

export function assignRoomTypeAmenities(id: number, amenityIds: number[]): Promise<void> {
  return request<void, AssignAmenitiesPayload>(`/rooms/types/${id}/amenities`, {
    method: 'PUT',
    body: { amenityIds },
  });
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export function listRooms(page = 1, perPage = 50): Promise<Paginated<ApiRoom>> {
  return request<Paginated<ApiRoom>>(`/rooms?page=${page}&perPage=${perPage}`);
}

export function getRoom(id: number): Promise<ApiRoom> {
  return request<ApiRoom>(`/rooms/${id}`);
}

export function createRoom(payload: CreateRoomPayload): Promise<ApiRoom> {
  return request<ApiRoom, CreateRoomPayload>('/rooms', {
    method: 'POST',
    body: payload,
  });
}

export function updateRoom(id: number, payload: UpdateRoomPayload): Promise<ApiRoom> {
  return request<ApiRoom, UpdateRoomPayload>(`/rooms/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteRoom(id: number): Promise<void> {
  return request<void>(`/rooms/${id}`, { method: 'DELETE' });
}

// ── Room Images ───────────────────────────────────────────────────────────────

export function getRoomImages(roomId: number): Promise<import('../types/admin').ApiRoomImage[]> {
  return request<import('../types/admin').ApiRoomImage[]>(`/rooms/${roomId}/images`);
}

export function uploadRoomImage(
  roomId: number,
  file: File,
  isPrimary?: boolean,
  sortOrder?: number,
): Promise<void> {
  const formData = new FormData();
  formData.append('image', file);
  if (isPrimary !== undefined) {
    formData.append('isPrimary', String(isPrimary));
  }
  if (sortOrder !== undefined) {
    formData.append('sortOrder', String(sortOrder));
  }

  // Axios will automatically handle the headers when given FormData
  return request<void, FormData>(`/rooms/${roomId}/images`, {
    method: 'POST',
    body: formData,
  });
}

export function deleteRoomImage(roomId: number, imageId: number): Promise<void> {
  return request<void>(`/rooms/${roomId}/images/${imageId}`, { method: 'DELETE' });
}
