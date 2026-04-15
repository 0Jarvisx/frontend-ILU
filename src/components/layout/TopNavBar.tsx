import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // Sincronizar el estado en caso de remount (ej. cambiar entre pantallas)
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const formattedDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).replace(/^\w/, (c) => c.toUpperCase());

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md flex justify-between items-center h-16 px-8 gap-6 font-['Inter'] text-sm font-medium">
      <div className="flex items-center gap-4">
        <span className="text-on-surface-variant dark:text-stone-400 italic font-light tracking-wide hidden sm:inline-block">Bienvenido, {user ? user.email : 'Invitado'}</span>
        <span className="h-1 w-1 bg-outline-variant dark:bg-stone-700 rounded-full hidden sm:inline-block"></span>
        <span className="text-primary dark:text-emerald-400 font-semibold tracking-tight">{formattedDate}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-stone-500 dark:text-stone-400">
          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary dark:text-emerald-400 hover:bg-primary/5 dark:hover:bg-emerald-400/10 rounded-full transition-colors"
            >
              Log In
            </button>
          )}
          <span
            className="material-symbols-outlined cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 select-none"
            onClick={toggleTheme}
            data-icon={isDark ? 'light_mode' : 'bedtime'}
          >
            {isDark ? 'light_mode' : 'bedtime'}
          </span>
        </div>

        {user && (
          <div className="relative group cursor-pointer flex items-center gap-2" onClick={async () => { await logout(); navigate('/'); }}>
            <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-emerald-900/40 flex items-center justify-center border border-primary/20 dark:border-emerald-700/50">
              <span className="material-symbols-outlined text-primary dark:text-emerald-400 text-lg" data-icon="person">person</span>
            </div>
            {/* Role badge */}
            <span className="hidden sm:inline-block text-xs font-semibold text-primary/70 dark:text-emerald-500 capitalize">{user.role.name}</span>
            {/* Logout tooltip */}
            <div className="absolute top-10 right-0 w-max bg-surface-container-high dark:bg-stone-800 text-on-surface-variant dark:text-stone-300 text-xs font-bold py-1 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Cerrar sesión
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
