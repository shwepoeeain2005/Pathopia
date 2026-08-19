import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
  const isLoggedIn = Boolean(localStorage.getItem('authToken'))

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
