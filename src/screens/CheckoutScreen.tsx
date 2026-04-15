import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { getRoom, getRoomType } from '../services/roomService';
import type { ApiRoom, ApiRoomType } from '../types/admin';
import { ApiError } from '../services/api';
import { createReservation } from '../services/reservationService';
import { formatPhone, isValidPhone, isValidEmail } from '../utils/validation';

function getNextFriday() {
  const d = new Date();
  const day = d.getDay();
  const diff = (5 - day + 7) % 7 || 7; 
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function getNextSunday() {
  const d = new Date(getNextFriday() + 'T00:00:00');
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

export default function CheckoutScreen() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState<ApiRoom | null>(null);
  const [roomType, setRoomType] = useState<ApiRoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    getRoom(Number(roomId)).then(res => {
      setRoom(res);
      return getRoomType(res.roomType.id);
    }).then(res => {
      setRoomType(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [roomId]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user ? user.email : '');
  const [phone, setPhone] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (loading) {
    return <AdminLayout><div className="p-12 text-center text-on-surface-variant font-bold text-xl pt-32">Cargando detalles de tu santuario...</div></AdminLayout>;
  }

  if (!room || !roomType) {
    return <AdminLayout><div className="p-12 text-center text-error font-bold pt-32">Esta habitación no está disponible actualmente.</div></AdminLayout>;
  }

  const checkIn = getNextFriday();
  const checkOut = getNextSunday();
  const nights = 2; // Fixed for now based on weekend 

  const pricePerNight = roomType.basePricePerNight;
  const surcharge = 50.00; // Mock surcharge
  const discount = 0;
  const totalAmount = (nights * pricePerNight) + surcharge - discount;
  
  const roomName = `Sala ${room.roomNumber} - ${roomType.name}`;
  const roomStatus = room.isActive ? 'Disponible' : 'Mantenimiento';
  const primaryImage = room.images?.find(i => i.isPrimary) || room.images?.[0];
  const roomImage = primaryImage ? primaryImage.url : 'https://placehold.co/600x400/e9e8e5/404941?text=Sin+Foto';
  const reference = `ILU-${Math.floor(Math.random() * 9000) + 1000}-X`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    if (!user) {
      const errors: Record<string, string> = {};
      if (!isValidEmail(email)) errors.email = 'Ingresa un correo electrónico válido.';
      if (!isValidPhone(phone)) errors.phone = 'El teléfono debe tener el formato ####-#### (ej. 5555-1234).';
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    setFieldErrors({});
    setError(null);

    try {
      const payload = user
        ? {
            roomId: Number(roomId),
            checkIn,
            checkOut,
            guestCount,
          }
        : {
            roomId: Number(roomId),
            checkIn,
            checkOut,
            guestCount,
            guestFirstName: firstName,
            guestLastName: lastName,
            guestEmail: email,
            guestPhone: phone,
          };
      await createReservation(payload);
      alert('Reservación confirmada. ¡Gracias!');
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError('Tu perfil está incompleto. Por favor completa tu nombre y teléfono antes de reservar.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Error al procesar tu reservación. Intenta nuevamente.');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 min-h-screen">
        <div className="max-w-6xl mx-auto">

          <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Confirma tu Estancia</h2>
            <p className="text-on-surface-variant max-w-lg">Por favor revisa los detalles de tu reservación para la {roomName} en Hotel ILU antes de completar tu reserva.</p>
          </div>

          <div className="grid grid-cols-12 gap-12 items-start">

            {/* Left Column: Booking Summary */}
            <section className="col-span-12 lg:col-span-5 space-y-8">
              <div className="bg-surface-container-low rounded-xl p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-1 block">Habitación Seleccionada</span>
                    <h3 className="text-2xl font-bold text-primary tracking-tight">{roomName}</h3>
                  </div>
                  <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{roomStatus}</span>
                </div>

                <div className="relative h-48 w-full rounded-lg overflow-hidden">
                  <img alt={roomName} className="w-full h-full object-cover" src={roomImage} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container rounded-lg">
                    <span className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter mb-1">Llegada</span>
                    <span className="text-primary font-semibold">{checkIn}</span>
                  </div>
                  <div className="p-4 bg-surface-container rounded-lg">
                    <span className="block text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter mb-1">Salida</span>
                    <span className="text-primary font-semibold">{checkOut}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-outline-variant/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">{nights} Noches × ${pricePerNight.toFixed(2)}</span>
                    <span className="font-medium">${(nights * pricePerNight).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Recargo de Fin de Semana</span>
                    <span className="text-secondary font-semibold">+${surcharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Descuento Larga Estancia (10%)</span>
                    <span className="text-emerald-700 font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-primary/10 mt-4">
                    <span className="text-lg font-bold text-primary tracking-tight">Monto Total</span>
                    <span className="text-3xl font-extrabold text-primary tracking-tighter">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Reservation Mockup Display */}
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Referencia de Reservación</p>
                  <p className="text-2xl font-mono font-bold tracking-tighter text-stone-400">{reference}</p>
                </div>
                <div className="bg-surface-container p-3 rounded-full">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                </div>
              </div>
            </section>

            {/* Right Column: Guest Form */}
            <section className="col-span-12 lg:col-span-7">
              <div className="bg-surface-container-lowest rounded-xl p-8 lg:p-12 space-y-10 border border-outline-variant/10">

                {user ? (
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-primary tracking-tight">Completar Reservación</h4>
                    <p className="text-sm text-on-surface-variant">Estás reservando con tu cuenta verificada. Confirma para finalizar este proceso.</p>

                    <div className="mt-8 bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex gap-4 items-center">
                      <span className="material-symbols-outlined text-4xl text-primary opacity-60">account_circle</span>
                      <div>
                        {user.firstName && user.lastName && (
                          <p className="text-sm font-bold text-on-surface">{user.firstName} {user.lastName}</p>
                        )}
                        <p className={user.firstName ? 'text-xs text-on-surface-variant' : 'text-sm font-bold text-on-surface'}>{user.email}</p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Usuario Verificado del Sistema</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-primary tracking-tight">Información del Huésped</h4>
                    <p className="text-sm text-on-surface-variant">Ingresa tus detalles para finalizar la experiencia verde.</p>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                      <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
                      {error}
                    </div>
                  )}
                  {!user && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">Nombre</label>
                          <input
                            type="text"
                            className="w-full bg-surface-container-low border-[0.5px] border-outline-variant/20 rounded-lg px-4 py-3 focus:ring-0 focus:border-primary transition-all placeholder:text-on-surface-variant/40"
                            placeholder="Ej. María"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">Apellido</label>
                          <input
                            type="text"
                            className="w-full bg-surface-container-low border-[0.5px] border-outline-variant/20 rounded-lg px-4 py-3 focus:ring-0 focus:border-primary transition-all placeholder:text-on-surface-variant/40"
                            placeholder="Ej. García"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">Correo Electrónico</label>
                          <input
                            type="email"
                            className={`w-full bg-surface-container-low border-[0.5px] rounded-lg px-4 py-3 focus:ring-0 focus:border-primary transition-all placeholder:text-on-surface-variant/40 ${fieldErrors.email ? 'border-error' : 'border-outline-variant/20'}`}
                            placeholder="maria@correo.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                            }}
                            required
                          />
                          {fieldErrors.email && (
                            <p className="text-xs text-error font-medium pl-1">{fieldErrors.email}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">Teléfono</label>
                          <input
                            type="tel"
                            className={`w-full bg-surface-container-low border-[0.5px] rounded-lg px-4 py-3 focus:ring-0 focus:border-primary transition-all placeholder:text-on-surface-variant/40 ${fieldErrors.phone ? 'border-error' : 'border-outline-variant/20'}`}
                            placeholder="5555-1234"
                            value={phone}
                            onChange={(e) => {
                              setPhone(formatPhone(e.target.value));
                              if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                            }}
                            required
                          />
                          {fieldErrors.phone && (
                            <p className="text-xs text-error font-medium pl-1">{fieldErrors.phone}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">Número de Huéspedes</label>
                    <input
                      type="number"
                      className="w-full bg-surface-container-low border-[0.5px] border-outline-variant/20 rounded-lg px-4 py-3 focus:ring-0 focus:border-primary transition-all"
                      min={1}
                      max={roomType.maxCapacity}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      required
                    />
                    <p className="text-xs text-on-surface-variant pl-1">Máximo {roomType.maxCapacity} huéspedes</p>
                  </div>

                  <div className={`pt-6 space-y-4 ${!user && 'border-t border-outline-variant/10'}`}>
                    <div className="flex items-start gap-3">
                      <input
                        id="terms"
                        type="checkbox"
                        className="mt-1 rounded w-4 h-4 text-primary focus:ring-primary border-outline-variant/50 accent-primary"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                      <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="terms">
                        Acepto los términos de servicio y la política de privacidad de Hotel ILU. Reconozco que el descuento por estadía extendida está sujeto a la duración completa de la estadía.
                      </label>
                    </div>
                    <button type="submit" className="w-full bg-primary-container text-on-primary py-5 rounded-lg text-sm font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary-container/20 hover:scale-[0.99] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                      Confirmar Reservación
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                    </button>
                  </div>
                </form>

                {/* Trust Elements */}
                <div className="pt-10 border-t border-outline-variant/20 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary mb-2 block">security</span>
                    <span className="text-[9px] font-bold uppercase text-on-surface-variant">Pago Seguro</span>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary mb-2 block">verified_user</span>
                    <span className="text-[9px] font-bold uppercase text-on-surface-variant">Propiedad Verificada</span>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-secondary mb-2 block">eco</span>
                    <span className="text-[9px] font-bold uppercase text-on-surface-variant">Estancia Sustentable</span>
                  </div>
                </div>

              </div>
            </section>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
