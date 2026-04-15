import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  /** Si se define, el ítem solo se muestra cuando el usuario tiene este permiso */
  permission?: string;
}

const navItems: NavItem[] = [
/*   { to: '/panel',          icon: 'dashboard',       label: 'Panel' },
  { to: '/calendario',     icon: 'calendar_month',  label: 'Calendario' }, */
  { to: '/reservaciones',  icon: 'book_online',     label: 'Reservaciones',   permission: 'reservation:create' },
  { to: '/',               icon: 'search',          label: 'Buscar' },
  { to: '/habitaciones',   icon: 'bed',             label: 'Habitaciones',    permission: 'rooms:manage' },
  { to: '/users',          icon: 'group',           label: 'Usuarios',        permission: 'user:manage' },
  { to: '/roles',          icon: 'shield_person',   label: 'Roles y Permisos',permission: 'role:manage' },
];

export default function SideNavBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const userPermissions = user?.role?.permissions?.map(p => p.name) ?? [];

  const visibleItems = navItems.filter(item =>
    !item.permission || userPermissions.includes(item.permission)
  );

  return (
    <>
      <aside className="bg-stone-100 dark:bg-stone-900 font-['Inter'] antialiased tracking-tight h-screen w-64 fixed left-0 top-0 border-r border-stone-200/20 dark:border-stone-800/20 flex flex-col py-8 px-6 z-50 hidden md:flex">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tighter text-emerald-900 dark:text-emerald-100">ILU</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold mt-1">El Santuario Verde</p>
        </div>
        <nav className="flex-1 space-y-1">
          {visibleItems.map(({ to, icon, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={
                  isActive
                    ? 'flex items-center gap-3 h-12 text-emerald-900 dark:text-emerald-400 font-semibold border-l-2 border-amber-600 pl-4 bg-stone-200/50 dark:bg-stone-800/50 rounded-r-lg'
                    : 'flex items-center gap-3 h-12 text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 pl-4 transition-colors hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-lg'
                }
              >
                <span className="material-symbols-outlined" data-icon={icon}>{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
        {/* <div className="mt-auto space-y-1 pt-8 border-t border-stone-200/20">
          <Link to="/configuracion" className="flex items-center gap-3 h-10 text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 pl-4 transition-colors">
            <span className="material-symbols-outlined text-xl" data-icon="settings">settings</span>
            <span className="text-xs font-medium">Configuración</span>
          </Link>
          <Link to="/soporte" className="flex items-center gap-3 h-10 text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 pl-4 transition-colors">
            <span className="material-symbols-outlined text-xl" data-icon="help">help</span>
            <span className="text-xs font-medium">Soporte</span>
          </Link>
        </div> */}
      </aside>

      {/* BottomNavBar (Hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex justify-around items-center h-16 z-50">
        <Link to="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-emerald-900' : 'text-stone-400'}`}>
          <span className="material-symbols-outlined" data-icon="search" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
          <span className="text-[10px] font-bold">Buscar</span>
        </Link>
        <Link to="/viajes" className={`flex flex-col items-center gap-1 ${pathname === '/viajes' ? 'text-emerald-900' : 'text-stone-400'}`}>
          <span className="material-symbols-outlined" data-icon="event_available">event_available</span>
          <span className="text-[10px] font-bold">Viajes</span>
        </Link>
        <Link to="/perfil" className={`flex flex-col items-center gap-1 ${pathname === '/perfil' ? 'text-emerald-900' : 'text-stone-400'}`}>
          <span className="material-symbols-outlined" data-icon="person">person</span>
          <span className="text-[10px] font-bold">Perfil</span>
        </Link>
      </nav>
    </>
  );
}
