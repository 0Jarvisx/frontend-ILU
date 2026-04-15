// ─── Admin API Types ───────────────────────────────────────────────────────────

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── Permissions ───────────────────────────────────────────────────────────────

export interface ApiPermission {
  id: number;
  name: string;
  description?: string;
}

export interface CreatePermissionPayload {
  name: string;
  description?: string;
}

export interface UpdatePermissionPayload {
  name?: string;
  description?: string;
}

// ── Roles ─────────────────────────────────────────────────────────────────────

export interface ApiRole {
  id: number;
  name: string;
  description?: string;
  permissions?: ApiPermission[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export interface AssignPermissionsPayload {
  permissionIds: number[];
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dpi?: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: ApiRole;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  roleId: number;
  firstName: string;
  lastName: string;
  phone: string;
  dpi: string;
}

export interface UpdateUserPayload {
  email?: string;
  roleId?: number;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dpi?: string;
}

// ── Rooms & Types ─────────────────────────────────────────────────────────────

export interface ApiAmenity {
  id: number;
  name: string;
  icon: string;
}

export interface ApiRoomType {
  id: number;
  name: string;
  basePricePerNight: number;
  maxCapacity: number;
  maxAdults: number;
  maxChildren: number;
  description?: string;
  amenities?: ApiAmenity[];
}

export interface CreateRoomTypePayload {
  name: string;
  basePricePerNight: number;
  maxCapacity: number;
  maxAdults: number;
  maxChildren: number;
  description?: string;
}

export interface UpdateRoomTypePayload {
  name?: string;
  basePricePerNight?: number;
  maxCapacity?: number;
  maxAdults?: number;
  maxChildren?: number;
  description?: string;
}

export interface AssignAmenitiesPayload {
  amenityIds: number[];
}

export interface ApiRoomImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ApiRoom {
  id: number;
  roomNumber: string;
  floor: number;
  isActive: boolean;
  notes?: string;
  roomType: {
    id: number;
    name: string;
  };
  images: ApiRoomImage[];
}

export interface CreateRoomPayload {
  roomNumber: string;
  roomTypeId: number;
  floor: number;
  isActive: boolean;
  notes?: string;
}

export interface UpdateRoomPayload {
  roomNumber?: string;
  roomTypeId?: number;
  floor?: number;
  isActive?: boolean;
  notes?: string;
}

// ── Reservations ──────────────────────────────────────────────────────────────

export interface ApiAvailableRoom {
  id: number;
  roomNumber: string;
  floor: number;
  isActive: boolean;
  notes: string | null;
  roomType: {
    id: number;
    name: string;
    basePricePerNight: number;
    maxCapacity: number;
    maxAdults: number;
    maxChildren: number;
    amenities: ApiAmenity[];
  };
  images: Array<{ id: number; url: string; isPrimary: boolean }>;
}

export interface ApiNightlyPrice {
  id: number;
  date: string;
  price: number;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface ApiReservation {
  id: number;
  confirmationCode: string;
  guestId: number;
  roomId: number;
  userId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  status: ReservationStatus;
  notes?: string;
  version: number;
  room: {
    id:number,
    roomNumber: string;
    roomType:{
      name: string;
      basePricePerNight: string;
    }
  }
  nightlyPrices: ApiNightlyPrice[];
}

export interface ReservationListResponse {
  data: ApiReservation[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CreateReservationPayload {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail?: string;
  guestPhone?: string;
  notes?: string;
}
