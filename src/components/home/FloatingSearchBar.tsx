import { useState } from 'react';

function toLocalISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() {
  return toLocalISODate(new Date());
}

function addDays(date: string, n: number) {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toLocalISODate(d);
}

function getNextFriday() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun … 5=Fri 6=Sat
  const diff = (5 - day + 7) % 7 || 7; // always next Friday, never today
  d.setDate(d.getDate() + diff);
  return toLocalISODate(d);
}

function getNextSunday() {
  const friday = getNextFriday();
  const d = new Date(friday + 'T00:00:00');
  d.setDate(d.getDate() + 2);
  return toLocalISODate(d);
}

interface Props {
  onSearch: (checkIn: string, checkOut: string, guests: number) => void;
  isSearching?: boolean;
}

export default function FloatingSearchBar({ onSearch, isSearching = false }: Props) {
  const [checkIn, setCheckIn] = useState(getNextFriday());
  const [checkOut, setCheckOut] = useState(getNextSunday());
  const [guests, setGuests] = useState(2);

  return (
    <section className="relative z-20 -mt-16 px-12 max-w-7xl mx-auto w-full">
      <div className="bg-surface-container-lowest dark:bg-stone-900 rounded-xl shadow-2xl p-6 flex flex-wrap lg:flex-nowrap items-center gap-6 border-[0.5px] border-outline-variant/20 dark:border-stone-800">
        {/* Check-in */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] uppercase tracking-widest text-secondary dark:text-stone-400 font-bold mb-2">Entrada</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-stone-500 text-sm" data-icon="calendar_today">calendar_today</span>
            <input
              type="date"
              value={checkIn}
              min={today()}
              onChange={e => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) setCheckOut(addDays(e.target.value, 1));
              }}
              className="w-full bg-surface-container-low dark:bg-stone-800 border-[0.5px] border-outline-variant/20 dark:border-stone-700 text-on-surface dark:text-stone-100 rounded-lg py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] uppercase tracking-widest text-secondary dark:text-stone-400 font-bold mb-2">Salida</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-stone-500 text-sm" data-icon="calendar_today">calendar_today</span>
            <input
              type="date"
              value={checkOut}
              min={addDays(checkIn, 1)}
              onChange={e => setCheckOut(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-stone-800 border-[0.5px] border-outline-variant/20 dark:border-stone-700 text-on-surface dark:text-stone-100 rounded-lg py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] uppercase tracking-widest text-secondary dark:text-stone-400 font-bold mb-2">Huéspedes</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-stone-500 text-sm" data-icon="person">person</span>
            <select
              value={guests}
              onChange={e => setGuests(Number(e.target.value))}
              className="w-full bg-surface-container-low dark:bg-stone-800 border-[0.5px] border-outline-variant/20 dark:border-stone-700 text-on-surface dark:text-stone-100 rounded-lg py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary appearance-none transition-all"
            >
              <option value={1}>1 Adulto</option>
              <option value={2}>2 Adultos</option>
              <option value={3}>2 Adultos, 1 Niño</option>
              <option value={4}>2 Adultos, 2 Niños</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="pt-6">
          <button
            onClick={() => onSearch(checkIn, checkOut, guests)}
            disabled={isSearching || checkOut <= checkIn}
            className="bg-primary-container text-on-primary font-bold px-10 py-3 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching
              ? <><span className="material-symbols-outlined text-lg animate-spin" data-icon="progress_activity">progress_activity</span> Buscando...</>
              : <><span className="material-symbols-outlined text-lg" data-icon="search">search</span> Buscar</>
            }
          </button>
        </div>
      </div>
    </section>
  );
}
