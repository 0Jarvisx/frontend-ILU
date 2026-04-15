import { useEffect, useState } from 'react';
import type { ApiRoom } from '../../types/admin';

interface Props {
  room: ApiRoom;
  onClose: () => void;
}

export default function RoomGalleryModal({ room, onClose }: Props) {
  const images = [...(room.images ?? [])].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) setLightboxIndex(null);
        else onClose();
      }
      if (lightboxIndex !== null) {
        if (e.key === 'ArrowRight') setLightboxIndex(i => (i === null ? 0 : (i + 1) % images.length));
        if (e.key === 'ArrowLeft') setLightboxIndex(i => (i === null ? 0 : (i - 1 + images.length) % images.length));
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, lightboxIndex, images.length]);

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/15 shrink-0">
            <div>
              <h2 className="text-lg font-extrabold text-primary tracking-tight">
                Galería — Habitación {room.roomNumber}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl" data-icon="image_not_supported">image_not_supported</span>
                <p className="text-sm font-medium">Esta habitación no tiene imágenes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="relative group rounded-xl overflow-hidden aspect-square bg-surface-container border border-outline-variant/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <img src={img.url} alt={`Habitación ${room.roomNumber} — foto ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        Principal
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" data-icon="zoom_in">zoom_in</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <img
            src={images[lightboxIndex].url}
            alt={`Foto ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Cerrar */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-2xl" data-icon="close">close</span>
          </button>

          {/* Navegación */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => i === null ? 0 : (i - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <span className="material-symbols-outlined text-2xl" data-icon="chevron_left">chevron_left</span>
              </button>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => i === null ? 0 : (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <span className="material-symbols-outlined text-2xl" data-icon="chevron_right">chevron_right</span>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
                {lightboxIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
