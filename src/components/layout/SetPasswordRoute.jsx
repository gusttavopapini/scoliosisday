// src/components/layout/SetPasswordRoute.jsx
// Guarda de rota para /definir-senha.
// Requer que o usuário esteja autenticado E que mustChangePassword === true.
// Se não autenticado → /login.
// Se autenticado mas mustChangePassword é false → / (dashboard).

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function SetPasswordRoute() {
  const { user, userData, initializing, loading } = useAuth();

  if (initializing || loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o doc existe e mustChangePassword é false, o usuário não precisa estar aqui
  if (userData && !userData.mustChangePassword) {
    return <Navigate to="/painel" replace />;
  }

  return <Outlet />;
}
