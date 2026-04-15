import { useEffect, useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { listRooms, listRoomTypes, deleteRoom, deleteRoomType } from '../services/roomService';
import type { ApiRoom, ApiRoomType } from '../types/admin';

// Modals
import AddRoomModal from '../components/rooms/AddRoomModal';
import EditRoomModal from '../components/rooms/EditRoomModal';
import ManageImagesModal from '../components/rooms/ManageImagesModal';
import AddRoomTypeModal from '../components/rooms/AddRoomTypeModal';
import EditRoomTypeModal from '../components/rooms/EditRoomTypeModal';

type Tab = 'Habitaciones' | 'Tipos';

export default function RoomManagementScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Habitaciones');
  
  // Data State
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<ApiRoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters (Local)
  const [filterType, setFilterType] = useState('Todos los tipos');
  const [filterStatus, setFilterStatus] = useState('Todos los estados');

  // Modals Visibility
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editRoomData, setEditRoomData] = useState<ApiRoom | null>(null);
  const [manageImagesRoom, setManageImagesRoom] = useState<ApiRoom | null>(null);

  const [showAddRoomType, setShowAddRoomType] = useState(false);
  const [editRoomTypeData, setEditRoomTypeData] = useState<ApiRoomType | null>(null);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [roomsRes, typesRes] = await Promise.all([
        listRooms(1, 50),
        listRoomTypes(1, 50)
      ]);
      setRooms(roomsRes.data);
      setRoomTypes(typesRes.data);
    } catch (err) {
      setError('Error al cargar la información. Intenta recargar.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleDeleteRoom = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta habitación de forma permanente?')) return;
    try {
      await deleteRoom(id);
      loadData();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  const handleDeleteRoomType = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este Tipo de Habitación? Puede causar fallos si hay cuartos asignados a él.')) return;
    try {
      await deleteRoomType(id);
      loadData();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  // Filtrado local
  const filteredRooms = rooms.filter(room => {
    // Tipo
    if (filterType !== 'Todos los tipos' && room.roomType.name !== filterType) return false;
    
    // Status visual maps (Active = Disponible, Inactive = Mantenimiento for this UI sake, normally should come from more robust states)
    if (filterStatus !== 'Todos los estados') {
      if (filterStatus === 'Disponible' && !room.isActive) return false;
      if (filterStatus === 'Mantenimiento' && room.isActive) return false;
    }
    return true;
  });

  const getStatusInfo = (isActive: boolean) => {
    if (isActive) {
      return { text: 'Disponible', color: 'bg-primary-fixed text-on-primary-fixed-variant' };
    }
    return { text: 'Mantenimiento', color: 'bg-error-container text-on-error-container' };
  };

  const getMainImage = (room: ApiRoom) => {
    if (!room.images || !Array.isArray(room.images) || room.images.length === 0) {
      return 'https://placehold.co/100x100/e9e8e5/404941?text=Sin+Foto';
    }
    const primary = room.images.find(i => i.isPrimary) || room.images[0];
    return primary ? primary.url : 'https://placehold.co/100x100/e9e8e5/404941?text=Sin+Foto';
  };

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto mb-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-1">Gestión de Habitaciones</h2>
              <p className="text-on-surface-variant text-sm font-medium">Supervisa la disponibilidad de habitaciones, mantenimiento y tipos.</p>
            </div>
            {activeTab === 'Habitaciones' ? (
              <button onClick={() => setShowAddRoom(true)} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95">
                <span className="material-symbols-outlined text-sm" data-icon="add">add</span> Agregar Habitación
              </button>
            ) : (
              <button onClick={() => setShowAddRoomType(true)} className="bg-secondary text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95">
                <span className="material-symbols-outlined text-sm" data-icon="add">add</span> Nuevo Tipo
              </button>
            )}
          </div>

          {/* Navegación por Pestañas */}
          <div className="flex gap-4 border-b border-outline-variant/20 mb-8">
            <button 
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Habitaciones' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant/70 hover:text-on-surface'}`}
              onClick={() => setActiveTab('Habitaciones')}
            >
              Habitaciones Existentes
            </button>
            <button 
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Tipos' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant/70 hover:text-on-surface'}`}
              onClick={() => setActiveTab('Tipos')}
            >
              Tipos de Habitación
            </button>
          </div>

          {/* Estado Global */}
          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Cargando información del servidor...</p>
          ) : error ? (
            <div className="bg-error-container text-on-error-container p-4 rounded-lg text-sm">{error}</div>
          ) : (
            <>
              {/* TAB: Habitaciones */}
              {activeTab === 'Habitaciones' && (
                <div className="grid grid-cols-12 gap-6">
                  {/* Summary Card Omitted para simplificar la vista, puedes devolverla si el Dashboard lo requiere pero ahora conectamos a API */}

                  <div className="col-span-12 bg-surface-container-low rounded-xl p-1">
                    <div className="bg-surface-container-lowest rounded-[10px] h-full flex flex-col">
                      {/* Filter Bar */}
                      <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-surface-container">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="appearance-none bg-surface-container-low border-none rounded-lg py-2 px-4 pr-10 text-xs font-semibold text-on-surface-variant focus:ring-1 focus:ring-primary cursor-pointer">
                              <option>Todos los tipos</option>
                              {roomTypes.map(rt => (
                                <option key={rt.id}>{rt.name}</option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-sm" data-icon="expand_more">expand_more</span>
                          </div>
                          <div className="relative">
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none bg-surface-container-low border-none rounded-lg py-2 px-4 pr-10 text-xs font-semibold text-on-surface-variant focus:ring-1 focus:ring-primary cursor-pointer">
                              <option>Todos los estados</option>
                              <option>Disponible</option>
                              <option>Mantenimiento</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-sm" data-icon="expand_more">expand_more</span>
                          </div>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-surface-container-low/50">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Habitación</th>
                              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Tipo</th>
                              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Nivel</th>
                              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Estado</th>
                              <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-container">
                            {filteredRooms.map((room) => {
                              const status = getStatusInfo(room.isActive);
                              return (
                                <tr key={room.id} className="hover:bg-surface-container-low/30 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                      <img className="w-12 h-12 rounded-lg object-cover bg-surface-container" alt={`Room ${room.roomNumber}`} src={getMainImage(room)} />
                                      <div>
                                        <div className="font-bold text-primary">{room.roomNumber}</div>
                                        {room.notes && <div className="text-[10px] text-on-surface-variant line-clamp-1">{room.notes}</div>}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-xs font-semibold px-2 py-1 bg-surface-container-high rounded-md text-on-surface-variant">{room.roomType.name}</span>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-secondary text-sm">
                                    Piso {room.floor}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${status.color}`}>
                                      {status.text}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3 text-outline">
                                      <button onClick={() => setManageImagesRoom(room)} className="hover:text-amber-600 transition-colors" title="Imágenes"><span className="material-symbols-outlined text-lg" data-icon="imagesmode">imagesmode</span></button>
                                      <button onClick={() => setEditRoomData(room)} className="hover:text-primary transition-colors" title="Editar"><span className="material-symbols-outlined text-lg" data-icon="edit">edit</span></button>
                                      <button onClick={() => handleDeleteRoom(room.id)} className="hover:text-error transition-colors" title="Borrar"><span className="material-symbols-outlined text-lg" data-icon="delete">delete</span></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {filteredRooms.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant text-sm">
                                  No se encontraron habitaciones.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Tipos */}
              {activeTab === 'Tipos' && (
                <div className="bg-surface-container-lowest rounded-[10px] border border-outline-variant/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-low/50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Nombre</th>
                          <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Capacidad</th>
                          <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Precio / Noche</th>
                          <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Amenities</th>
                          <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Descripción</th>
                          <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant/70 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 border-t border-outline-variant/10">
                        {roomTypes.map(rt => (
                          <tr key={rt.id} className="hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-primary">{rt.name}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-on-surface">
                              <span title={`Adultos: ${rt.maxAdults ?? '—'} · Niños: ${rt.maxChildren ?? '—'}`}>
                                Hasta {rt.maxCapacity} pers.
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-secondary text-sm">
                              ${rt.basePricePerNight}
                            </td>
                            <td className="px-6 py-4">
                              {rt.amenities && rt.amenities.length > 0 ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {rt.amenities.map(a => (
                                    <span key={a.id} title={a.name} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface-container-low border border-outline-variant/20">
                                      <span className="material-symbols-outlined text-sm text-secondary" data-icon={a.icon}>{a.icon}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-on-surface-variant/50">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-on-surface-variant line-clamp-1 max-w-sm">{rt.description || '—'}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-3 text-outline">
                                <button onClick={() => setEditRoomTypeData(rt)} className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg" data-icon="edit">edit</span></button>
                                <button onClick={() => handleDeleteRoomType(rt.id)} className="hover:text-error transition-colors"><span className="material-symbols-outlined text-lg" data-icon="delete">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Render Modals */}
      {showAddRoom && (
        <AddRoomModal roomTypes={roomTypes} onClose={() => setShowAddRoom(false)} onCreated={() => { setShowAddRoom(false); loadData(); }} />
      )}
      {editRoomData && (
        <EditRoomModal room={editRoomData} roomTypes={roomTypes} onClose={() => setEditRoomData(null)} onUpdated={() => { setEditRoomData(null); loadData(); }} />
      )}
      {manageImagesRoom && (
        <ManageImagesModal room={manageImagesRoom} onClose={() => setManageImagesRoom(null)} onUpdated={() => { loadData(); }} />
      )}

      {showAddRoomType && (
        <AddRoomTypeModal onClose={() => setShowAddRoomType(false)} onCreated={() => { setShowAddRoomType(false); loadData(); }} />
      )}
      {editRoomTypeData && (
        <EditRoomTypeModal roomType={editRoomTypeData} onClose={() => setEditRoomTypeData(null)} onUpdated={() => { setEditRoomTypeData(null); loadData(); }} />
      )}

    </AdminLayout>
  );
}
