import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import AddUserModal from '../components/users/AddUserModal';
import EditUserModal from '../components/users/EditUserModal';
import ConfirmModal from '../components/shared/ConfirmModal';
import { listUsers, deactivateUser } from '../services/userService';
import { listRoles } from '../services/roleService';
import type { ApiUser, ApiRole } from '../types/admin';

const LIMIT = 10;

export default function UserManagementScreen() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRoleId, setFilterRoleId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<ApiUser | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let isActive: boolean | undefined = undefined;
      if (filterStatus === 'ACTIVO') isActive = true;
      if (filterStatus === 'INACTIVO') isActive = false;

      const res = await listUsers({
        page,
        perPage: LIMIT,
        email: search || undefined,
        isActive,
        roleId: filterRoleId ? Number(filterRoleId) : undefined,
      });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listRoles(1, 50)
      .then(res => setRoles(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      void fetchUsers();
    }, 300);
    return () => clearTimeout(handler);
  }, [page, search, filterStatus, filterRoleId]);

  async function handleDeactivateConfirm() {
    if (!deactivatingUser) return;
    setIsDeactivating(true);
    try {
      await deactivateUser(deactivatingUser.id);
      setDeactivatingUser(null);
      await fetchUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al desactivar usuario');
    } finally {
      setIsDeactivating(false);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterRoleId(e.target.value);
    setPage(1);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterStatus(e.target.value);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setFilterRoleId('');
    setFilterStatus('');
    setPage(1);
  }

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
              <span>Consola</span>
              <span className="material-symbols-outlined text-[10px]" data-icon="chevron_right">chevron_right</span>
              <span className="text-secondary font-medium">Gestión de Usuarios</span>
            </nav>
            <h2 className="text-3xl font-extrabold text-primary tracking-tight">Gestión de Usuarios</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#006655] hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
            Agregar Usuario
          </button>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-low rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4 shrink-0">
          <div className="flex-1 min-w-[240px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm" data-icon="person_search">person_search</span>
            <input
              className="w-full bg-surface-container-lowest ghost-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
              placeholder="Filtrar por correo..."
              type="text"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest ghost-border rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary min-w-[140px] text-on-surface-variant"
                value={filterRoleId}
                onChange={handleRoleChange}
              >
                <option value="">Todos los Roles</option>
                {roles.map(r => (
                  <option key={r.id} value={String(r.id)}>{r.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest ghost-border rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary min-w-[140px] text-on-surface-variant"
                value={filterStatus}
                onChange={handleStatusChange}
              >
                <option value="">Cualquier Estado</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm" data-icon="filter_list">filter_list</span>
            </div>
          </div>
          <div className="h-6 w-px bg-outline-variant/30 hidden md:block"></div>
          <button onClick={clearFilters} className="text-secondary text-sm font-semibold hover:underline">Limpiar Filtros</button>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden ghost-border shrink-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Creado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-on-surface-variant">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-error">{error}</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-on-surface-variant">No se encontraron usuarios.</td>
                </tr>
              ) : users.map((user) => {
                const isActive = user.isActive;
                const statusColor = isActive
                  ? 'bg-primary-fixed text-on-primary-fixed-variant'
                  : 'bg-surface-container-high text-on-surface-variant';
                const dotColor = isActive ? 'bg-primary animate-pulse' : 'bg-outline';
                const roleName = user.role?.name ?? roles.find(r => r.id === user.roleId)?.name ?? `Rol #${user.roleId}`;
                const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null;
                const initials = user.firstName && user.lastName
                  ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                  : user.email.slice(0, 2).toUpperCase();
                const createdAt = new Date(user.createdAt).toLocaleDateString('es-MX', { dateStyle: 'medium' });

                return (
                  <tr key={user.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {initials}
                        </div>
                        <div>
                          {fullName && <p className="font-semibold text-on-surface text-sm">{fullName}</p>}
                          <p className={fullName ? 'text-xs text-on-surface-variant' : 'font-semibold text-on-surface text-sm'}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold text-on-surface border border-outline-variant/20 uppercase">
                        {roleName}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${statusColor} rounded-full text-[11px] font-bold`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                        {isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-on-surface-variant">{createdAt}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 hover:bg-white rounded-lg text-secondary transition-colors"
                          title="Editar Usuario"
                          onClick={() => setEditingUser(user)}
                        >
                          <span className="material-symbols-outlined text-lg" data-icon="edit">edit</span>
                        </button>
                        {isActive && (
                          <button
                            className="p-2 hover:bg-error-container text-error rounded-lg transition-colors"
                            title="Desactivar Usuario"
                            onClick={() => setDeactivatingUser(user)}
                          >
                            <span className="material-symbols-outlined text-lg" data-icon="person_off">person_off</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-surface-container/30 flex items-center justify-between">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Mostrando {users.length} de {meta?.total ?? 0} usuarios
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={!meta?.hasPrevPage}
                onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center ghost-border hover:bg-white transition-colors text-on-surface-variant disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
              </button>
              <span className="text-xs font-bold px-2">{page}</span>
              <button
                disabled={!meta?.hasNextPage}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center ghost-border hover:bg-white transition-colors text-on-surface-variant disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0 pb-12">
          <div className="md:col-span-1 bg-[#19322F] rounded-xl p-6 text-white">
            <h4 className="text-xs font-bold text-[#f4f3f0]/50 uppercase tracking-widest mb-4">Total de Usuarios</h4>
            <p className="text-4xl font-extrabold mb-1">{meta?.total ?? 0}</p>
          </div>
          <div className="md:col-span-3 bg-surface-container rounded-xl p-6 flex items-center gap-8">
            <div>
              <h4 className="text-sm font-bold text-primary mb-1">Gestión de Accesos</h4>
              <p className="text-xs text-on-surface-variant max-w-md">
                Administra los usuarios del sistema, asigna roles y controla el acceso a cada módulo de la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddUserModal
          roles={roles}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            void fetchUsers();
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          roles={roles}
          onClose={() => setEditingUser(null)}
          onUpdated={() => {
            setEditingUser(null);
            void fetchUsers();
          }}
        />
      )}

      {deactivatingUser && (
        <ConfirmModal
          title="Desactivar Usuario"
          description={`¿Estás seguro de que quieres desactivar a ${deactivatingUser.email}? El usuario perderá acceso al sistema pero sus datos se conservarán.`}
          confirmLabel="Desactivar"
          isDestructive
          isLoading={isDeactivating}
          onConfirm={handleDeactivateConfirm}
          onClose={() => setDeactivatingUser(null)}
        />
      )}
    </AdminLayout>
  );
}
