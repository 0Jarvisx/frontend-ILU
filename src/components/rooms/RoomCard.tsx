import { useNavigate } from 'react-router-dom';
import type { ApiRoom, ApiRoomType } from '../../types/admin';

interface JoinedRoom extends ApiRoom {
  typeInfo: ApiRoomType;
}

interface RoomCardProps {
  room: JoinedRoom;
}

function getBadgeStyle(typeName: string): { bg: string; text: string; border: string; star: boolean } {
  const name = typeName.toLowerCase();
  if (name.includes('premium')) {
    return { bg: 'bg-[#C9922A]', text: 'text-white', border: '', star: true };
  }
  if (name.includes('suite')) {
    return { bg: 'bg-[#1A5C38]', text: 'text-white', border: '', star: false };
  }
  return { bg: 'bg-white', text: 'text-on-surface', border: 'border border-outline-variant/30', star: false };
}

export default function RoomCard({ room }: RoomCardProps) {
  const navigate = useNavigate();

  const primaryImage = room.images?.find(i => i.isPrimary) || room.images?.[0];
  const imageUrl = primaryImage
    ? primaryImage.url
    : 'https://placehold.co/600x400/e9e8e5/404941?text=Sin+Foto';

  const badge = getBadgeStyle(room.roomType.name);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-md border border-outline-variant/10 flex flex-col group">
      {/* Imagen */}
      <div className="relative h-52 overflow-hidden">
        <img
          alt={room.roomType.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={imageUrl}
        />
        {/* Badge de categoría */}
        <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full ${badge.bg} ${badge.text} ${badge.border}`}>
          <span className="text-[9px] font-extrabold uppercase tracking-widest">
            {room.roomType.name}
          </span>
          {badge.star && (
            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Número de habitación + huéspedes */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="font-bold text-lg text-on-surface dark:text-stone-100 leading-tight">
            Hab. {room.roomNumber}
          </h4>
          <div className="flex items-center gap-1 text-on-surface-variant dark:text-stone-400 text-xs shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-sm" data-icon="group">group</span>
            {room.typeInfo?.maxCapacity} Huéspedes
          </div>
        </div>

        {/* Amenities */}
        {room.typeInfo?.amenities && room.typeInfo.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.typeInfo.amenities.slice(0, 5).map(a => (
              <span
                key={a.id}
                title={a.name}
                className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container dark:bg-stone-800 rounded-full text-[10px] font-medium text-on-surface-variant dark:text-stone-400 border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-xs text-secondary dark:text-amber-400" data-icon={a.icon}>{a.icon}</span>
                {a.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-outline dark:text-stone-500 font-bold mb-0.5">
              Por noche
            </span>
            <span className="text-2xl font-extrabold text-primary dark:text-emerald-400 tracking-tight">
              ${room.typeInfo?.basePricePerNight}
            </span>
          </div>
          <button
            onClick={() => navigate(`/checkout/${room.id}`)}
            className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
