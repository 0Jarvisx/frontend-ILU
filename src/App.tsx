import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import HomeScreen from './screens/HomeScreen'
import LoginScreen from './screens/LoginScreen'
import UserManagementScreen from './screens/UserManagementScreen'
import RoleManagementScreen from './screens/RoleManagementScreen'
import RoomManagementScreen from './screens/RoomManagementScreen'
import ReservationScreen from './screens/ReservationScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import ProtectedRoute from './components/shared/ProtectedRoute'
import './App.css'

function App() {
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/checkout/:roomId" element={<CheckoutScreen />} />
      {/* Both authenticated and unauthenticated can see the reservation screen logically, but to fit AdminLayout properly the user may just be testing. I'm adding it as a public route so anyone can see the 'not logged in' state, but passing user works if they are logged in via context */}
      <Route path="/reservaciones" element={<ReservationScreen />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/users" element={<UserManagementScreen />} />
        <Route path="/roles" element={<RoleManagementScreen />} />
        <Route path="/habitaciones" element={<RoomManagementScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
