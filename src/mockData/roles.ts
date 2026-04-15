export interface Permission {
  id: string;
  category: string;
  description: string;
  icon: string;
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  icon: string;
  permissions: Permission[];
}

export const mockRoles: Role[] = [
  {
    id: 'r1',
    name: 'Administrador',
    icon: 'admin_panel_settings',
    permissions: [
      { id: 'p1', category: 'Reservaciones', description: 'Motor de reservas y gestión de estadías', icon: 'event', read: true, create: true, edit: true, delete: true },
      { id: 'p2', category: 'Facturación', description: 'Facturas, reembolsos y configuración de terminales', icon: 'payments', read: true, create: true, edit: true, delete: false },
      { id: 'p3', category: 'Gestión de Usuarios', description: 'Perfiles del personal y asignación de roles', icon: 'person_search', read: true, create: true, edit: true, delete: true },
      { id: 'p4', category: 'Inventario y Activos', description: 'Inventario de habitaciones, amenidades y logística', icon: 'inventory_2', read: true, create: true, edit: false, delete: false },
      { id: 'p5', category: 'Reportes', description: 'Ingresos, ocupación y métricas de huéspedes', icon: 'analytics', read: true, create: false, edit: false, delete: false },
    ]
  },
  {
    id: 'r2',
    name: 'Recepcionista',
    icon: 'concierge',
    permissions: []
  },
  {
    id: 'r3',
    name: 'Gerente',
    icon: 'business_center',
    permissions: []
  },
  {
    id: 'r4',
    name: 'Limpieza',
    icon: 'cleaning_services',
    permissions: []
  }
];
