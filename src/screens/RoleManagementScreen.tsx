import { useEffect, useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import AddRoleModal from '../components/roles/AddRoleModal';
import { listRoles, getRole, assignPermissions } from '../services/roleService';
import { listPermissions } from '../services/permissionService';
import type { ApiRole, ApiPermission } from '../types/admin';

export default function RoleManagementScreen() {
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [allPermissions, setAllPermissions] = useState<ApiPermission[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeRole = roles.find(r => r.id === activeRoleId) ?? null;

  async function fetchRoleDetail(id: number) {
    setIsLoadingRole(true);
    try {
      const full = await getRole(id);
      setSelectedPermIds(new Set(full.permissions?.map(p => p.id) ?? []));
    } catch {
      // mantener selección vacía si falla
    } finally {
      setIsLoadingRole(false);
    }
  }

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        listRoles(1, 50),
        listPermissions(1, 50),
      ]);
      setRoles(rolesRes.data);
      setAllPermissions(permsRes.data);
      if (rolesRes.data.length > 0) {
        const first = rolesRes.data[0];
        setActiveRoleId(first.id);
        await fetchRoleDetail(first.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function selectRole(role: ApiRole) {
    setActiveRoleId(role.id);
    await fetchRoleDetail(role.id);
  }

  function togglePermission(permId: number) {
    setSelectedPermIds(prev => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!activeRoleId) return;
    setIsSaving(true);
    try {
      const updated = await assignPermissions(activeRoleId, {
        permissionIds: Array.from(selectedPermIds),
      });
      // Update local role list with new permissions
      setRoles(prev =>
        prev.map(r => (r.id === activeRoleId ? { ...r, permissions: updated.permissions } : r))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar permisos');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    if (!activeRole) return;
    setSelectedPermIds(new Set(activeRole.permissions?.map(p => p.id) ?? []));
  }

  const roleIcons: Record<string, string> = {
    admin: 'admin_panel_settings',
    administrador: 'admin_panel_settings',
    recepcionista: 'concierge',
    receptionist: 'concierge',
    gerente: 'business_center',
    manager: 'business_center',
    limpieza: 'cleaning_services',
    housekeeping: 'cleaning_services',
    guest: 'person',
  };

  function iconForRole(name: string): string {
    return roleIcons[name.toLowerCase()] ?? 'manage_accounts';
  }

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Roles y Permisos</h2>
            <p className="text-on-surface-variant font-medium">Define niveles de acceso y límites funcionales para el personal de tu hotel.</p>
          </div>

          {isLoading ? (
            <p className="text-sm text-on-surface-variant">Cargando roles...</p>
          ) : error ? (
            <p className="text-sm text-error">{error}</p>
          ) : (
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Left: Role List */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-surface-container-low rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Roles Activos</h3>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="text-xs font-bold text-secondary flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                      NUEVO ROL
                    </button>
                  </div>
                  <div className="space-y-2">
                    {roles.map((role) => {
                      const isActive = activeRoleId === role.id;
                      const icon = iconForRole(role.name);
                      if (isActive) {
                        return (
                          <button key={role.id} onClick={() => selectRole(role)} className="w-full text-left p-4 rounded-lg bg-[#19322F] text-white flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <span className="material-symbols-outlined text-secondary" data-icon={icon}>{icon}</span>
                              <span className="font-semibold text-sm">{role.name}</span>
                            </div>
                            <span className="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
                          </button>
                        );
                      }
                      return (
                        <button key={role.id} onClick={() => selectRole(role)} className="w-full text-left p-4 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-on-surface-variant/40" data-icon={icon}>{icon}</span>
                            <span className="font-semibold text-sm">{role.name}</span>
                          </div>
                          <span className="material-symbols-outlined text-xs text-outline-variant" data-icon="chevron_right">chevron_right</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Permission Matrix */}
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                  <div className="bg-surface-container-high p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-primary">Permisos</h3>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Configurando acceso para <span className="text-secondary">{activeRole?.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-0">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container/50">
                        <tr>
                          <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">Permiso</th>
                          <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">Descripción</th>
                          <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold text-center">Asignado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {isLoadingRole ? (
                          <tr>
                            <td colSpan={3} className="px-8 py-8 text-center text-sm text-on-surface-variant">Cargando permisos...</td>
                          </tr>
                        ) : allPermissions.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-8 py-8 text-center text-sm text-on-surface-variant">
                              No hay permisos configurados en el sistema.
                            </td>
                          </tr>
                        ) : allPermissions.map((perm) => (
                          <tr key={perm.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-8 py-4">
                              <p className="text-sm font-bold text-on-surface font-mono">{perm.name}</p>
                            </td>
                            <td className="px-8 py-4">
                              <p className="text-xs text-on-surface-variant">{perm.description ?? '—'}</p>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={selectedPermIds.has(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="rounded w-5 h-5 border-outline-variant focus:ring-primary/20 accent-[#006655]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-8 border-t border-outline-variant/10 flex flex-wrap justify-between items-center gap-4 bg-surface-container-lowest">
                    <p className="text-xs text-on-surface-variant/60 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" data-icon="info">info</span>
                      Los roles de administrador tienen acceso inherente para anular sistemas principales.
                    </p>
                    <div className="flex gap-4 ml-auto">
                      <button onClick={handleDiscard} className="px-6 py-3 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                        Restablecer
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#006655] text-white px-8 py-3 rounded-lg text-sm font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-60"
                      >
                        {isSaving ? 'Guardando...' : `Actualizar Rol ${activeRole?.name}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <AddRoleModal 
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            void loadData(); // Reloads roles so the new role appears in the list
          }}
        />
      )}
    </AdminLayout>
  );
}
