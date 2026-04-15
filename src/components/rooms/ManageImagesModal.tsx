import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { getRoomImages, uploadRoomImage, deleteRoomImage } from '../../services/roomService';
import { ApiError } from '../../services/api';
import type { ApiRoom, ApiRoomImage } from '../../types/admin';

interface Props {
  room: ApiRoom;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ManageImagesModal({ room, onClose, onUpdated }: Props) {
  const [images, setImages] = useState<ApiRoomImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch images ──────────────────────────────────────────────────────────
  async function fetchImages() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRoomImages(room.id);
      setImages(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las imágenes.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchImages();
  }, [room.id]);

  // ── Keyboard nav ──────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) { setLightboxIndex(null); return; }
        onClose();
      }
      if (lightboxIndex !== null && images.length > 1) {
        if (e.key === 'ArrowRight') setLightboxIndex(i => i === null ? 0 : (i + 1) % images.length);
        if (e.key === 'ArrowLeft')  setLightboxIndex(i => i === null ? 0 : (i - 1 + images.length) % images.length);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, lightboxIndex, images.length]);

  // ── Upload ────────────────────────────────────────────────────────────────
  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('El archivo excede el límite de 5MB.'); return; }

    setError(null);
    setIsUploading(true);
    try {
      const isFirst = images.length === 0;
      await uploadRoomImage(room.id, file, isFirst, images.length);
      await fetchImages();
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al subir la imagen.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(imageId: number) {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;
    // Si el lightbox está abierto en esa imagen, cerrarlo
    if (lightboxIndex !== null && images[lightboxIndex]?.id === imageId) setLightboxIndex(null);

    setError(null);
    setDeletingId(imageId);
    try {
      await deleteRoomImage(room.id, imageId);
      await fetchImages();
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar la imagen.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* ── Modal principal ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/15 shrink-0">
            <div>
              <h2 className="text-lg font-extrabold text-primary tracking-tight">
                Imágenes — Habitación {room.roomNumber}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isLoading ? 'Cargando...' : `${images.length} ${images.length === 1 ? 'imagen' : 'imágenes'} · máx. 5 MB por archivo`}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined animate-spin text-xl" data-icon="progress_activity">progress_activity</span>
                Cargando imágenes...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Botón subir */}
                <label className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 aspect-square cursor-pointer transition-colors ${isUploading ? 'border-outline-variant bg-surface-container opacity-50 cursor-not-allowed' : 'border-primary/40 bg-surface-container-lowest hover:border-primary hover:bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-3xl text-primary" data-icon={isUploading ? 'progress_activity' : 'cloud_upload'}>
                    {isUploading ? 'progress_activity' : 'cloud_upload'}
                  </span>
                  <span className="text-xs font-bold text-primary text-center leading-tight px-2">
                    {isUploading ? 'Subiendo...' : 'Subir imagen'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                </label>

                {/* Imágenes */}
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden aspect-square border border-outline-variant/20 bg-surface-container"
                  >
                    {/* Imagen — clic abre lightbox */}
                    <button
                      className="w-full h-full focus:outline-none"
                      onClick={() => setLightboxIndex(idx)}
                      title="Ver en grande"
                    >
                      <img
                        src={img.url}
                        alt={`Habitación ${room.roomNumber} — foto ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </button>

                    {/* Badge principal */}
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm pointer-events-none">
                        Principal
                      </div>
                    )}

                    {/* Overlay acciones */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end translate-y-full group-hover:translate-y-0 transition-transform">
                      <button
                        onClick={() => setLightboxIndex(idx)}
                        className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                        title="Ver"
                      >
                        <span className="material-symbols-outlined text-base" data-icon="zoom_in">zoom_in</span>
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        disabled={deletingId === img.id}
                        className="p-1.5 rounded-lg bg-error text-white hover:bg-error/80 transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-base" data-icon="delete">delete</span>
                      </button>
                    </div>

                    {/* Spinner eliminando */}
                    {deletingId === img.id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="material-symbols-outlined text-white animate-spin text-2xl" data-icon="progress_activity">progress_activity</span>
                      </div>
                    )}
                  </div>
                ))}

                {images.length === 0 && (
                  <div className="col-span-2 md:col-span-2 flex flex-col items-center justify-center gap-2 aspect-square text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-4xl" data-icon="image_not_supported">image_not_supported</span>
                    <p className="text-xs text-center">Sin imágenes aún.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92"
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

          {/* Eliminar desde lightbox */}
          <button
            onClick={e => { e.stopPropagation(); handleDelete(images[lightboxIndex!].id); }}
            disabled={deletingId === images[lightboxIndex].id}
            className="absolute bottom-6 right-6 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error text-white text-sm font-bold hover:bg-error/80 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base" data-icon="delete">delete</span>
            Eliminar
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
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium tabular-nums">
                {lightboxIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
