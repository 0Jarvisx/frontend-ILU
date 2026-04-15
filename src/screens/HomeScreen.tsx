import { useEffect, useState } from 'react';
import SideNavBar from '../components/layout/SideNavBar';
import TopNavBar from '../components/layout/TopNavBar';
import HeroSection from '../components/home/HeroSection';
import FloatingSearchBar from '../components/home/FloatingSearchBar';
import SanctuariesGrid from '../components/home/SanctuariesGrid';
//import MapSection from '../components/home/MapSection';
import { listRooms, listRoomTypes } from '../services/roomService';
import { getAvailableRooms } from '../services/reservationService';
import { ApiError } from '../services/api';
import type { ApiRoom, ApiRoomType, ApiAvailableRoom } from '../types/admin';

function toLocalISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

export default function HomeScreen() {
  // ── All rooms (default view) ───────────────────────────────────────────────
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<ApiRoomType[]>([]);

  useEffect(() => {
    Promise.all([listRooms(1, 100), listRoomTypes(1, 50)])
      .then(([rRes, tRes]) => {
        setRooms(rRes.data.filter(r => r.isActive));
        setRoomTypes(tRes.data);
      })
      .catch(console.error);
  }, []);

  // ── Search / availability ──────────────────────────────────────────────────
  const [checkIn, setCheckIn] = useState(getNextFriday());
  const [checkOut, setCheckOut] = useState(getNextSunday());
  const [_guests, _setGuests] = useState(2);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<ApiAvailableRoom[] | null>(null);

  async function handleSearch(ci: string, co: string, guests: number) {
    setCheckIn(ci);
    setCheckOut(co);
    setSearchError(null);
    setIsSearching(true);
    setAvailableRooms(null);
    try {
      const result = await getAvailableRooms(ci, co, guests);
      setAvailableRooms(result);
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : 'Error al buscar disponibilidad.');
    } finally {
      setIsSearching(false);
    }
  }

  // Load available rooms for next weekend by default on mount
  useEffect(() => {
    handleSearch(getNextFriday(), getNextSunday(), 2);
  }, []);

  return (
    <div className="bg-background dark:bg-stone-950 text-on-surface dark:text-stone-100 antialiased min-h-screen flex">
      <SideNavBar />
      <main className="w-full md:pl-64 min-h-screen pb-16 md:pb-0">
        <TopNavBar />
        <HeroSection />
        <FloatingSearchBar onSearch={handleSearch} isSearching={isSearching} />

        <SanctuariesGrid
          rooms={rooms}
          roomTypes={roomTypes}
          availableRooms={availableRooms}
          checkIn={checkIn}
          checkOut={checkOut}
          isSearching={isSearching}
          searchError={searchError}
        />
        {/* <MapSection /> */}
      </main>
    </div>
  );
}
