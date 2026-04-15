import RoomCard from '../rooms/RoomCard';
import type { ApiRoom, ApiRoomType, ApiAvailableRoom } from '../../types/admin';

interface Props {
  rooms: ApiRoom[];
  roomTypes: ApiRoomType[];
  availableRooms?: ApiAvailableRoom[] | null;
  checkIn?: string;
  checkOut?: string;
  isSearching?: boolean;
  searchError?: string | null;
}

export default function SanctuariesGrid({
  rooms,
  roomTypes,
  availableRooms,
  checkIn,
  checkOut,
  isSearching = false,
  searchError = null,
}: Props) {
  const isSearchMode = isSearching || searchError !== null || (availableRooms !== null && availableRooms !== undefined);

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
      : 0;

  // Default mode: join rooms with their full type info
  const joinedRooms = rooms
    .map(room => ({ ...room, typeInfo: roomTypes.find(t => t.id === room.roomType.id) }))
    .filter(room => room.typeInfo);

  // Search mode: map ApiAvailableRoom → JoinedRoom shape for RoomCard
  const joinedAvailable = (availableRooms ?? []).map(room => ({
    id: room.id,
    roomNumber: room.roomNumber,
    floor: room.floor,
    isActive: room.isActive,
    notes: room.notes ?? undefined,
    roomType: { id: room.roomType.id, name: room.roomType.name },
    images: room.images,
    typeInfo: {
      id: room.roomType.id,
      name: room.roomType.name,
      basePricePerNight: room.roomType.basePricePerNight,
      maxCapacity: room.roomType.maxCapacity,
      maxAdults: room.roomType.maxAdults,
      maxChildren: room.roomType.maxChildren,
      amenities: room.roomType.amenities,
    },
  }));

  const displayRooms = isSearchMode ? joinedAvailable : joinedRooms;
  const subtitle = isSearching
    ? 'Buscando habitaciones disponibles...'
    : isSearchMode
      ? `${joinedAvailable.length} habitación${joinedAvailable.length !== 1 ? 'es' : ''} disponible${joinedAvailable.length !== 1 ? 's' : ''} · ${nights} noche${nights !== 1 ? 's' : ''}`
      : `${joinedRooms.length} habitaciones en Hotel ILU.`;

  return (
    <section className="px-12 py-20 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <h3 className="text-primary dark:text-emerald-400 text-3xl font-bold tracking-tight">
            {isSearchMode ? 'Disponibilidad' : 'Santuarios Disponibles'}
          </h3>
          <p className="text-on-surface-variant dark:text-stone-400 mt-2 font-medium">{subtitle}</p>
        </div>
        {!isSearchMode && (
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary dark:text-emerald-400 border-[0.5px] border-primary/20 dark:border-emerald-400/20 rounded-full hover:bg-primary/5 dark:hover:bg-emerald-400/10 transition-colors">Filtrar</button>
            <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary dark:text-emerald-400 border-[0.5px] border-primary/20 dark:border-emerald-400/20 rounded-full hover:bg-primary/5 dark:hover:bg-emerald-400/10 transition-colors">Ordenar por Precio</button>
          </div>
        )}
      </div>

      {searchError && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium mb-6">
          <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
          {searchError}
        </div>
      )}

      {isSearching && (
        <div className="flex items-center justify-center gap-2 py-20 text-on-surface-variant text-sm">
          <span className="material-symbols-outlined animate-spin text-xl" data-icon="progress_activity">progress_activity</span>
          Buscando disponibilidad...
        </div>
      )}

      {!isSearching && isSearchMode && joinedAvailable.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30" data-icon="hotel_class">hotel_class</span>
          <p className="text-sm font-medium">Sin disponibilidad para las fechas seleccionadas.</p>
        </div>
      )}

      {!isSearching && displayRooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayRooms.map(room => (
            <RoomCard key={room.id} room={room as any} />
          ))}
        </div>
      )}
    </section>
  );
}
