// src/components/layout/ProtectedRoute.jsx
// Guarda de rota para páginas autenticadas do painel.
// - Se loading → skeleton.
// - Se !user → redirect /login.
// - Se status !== 'approved' → signOut + redirect /login.
// - Se mustChangePassword → redirect /definir-senha.
// - Se adminOnly e role !== 'admin' → 403.
// - Caso contrário → render children.

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import ForbiddenPage from '../../features/auth/ForbiddenPage.jsx';

function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--surface-page)',
      }}
    >
      <div className="sda-skeleton" style={{ width: 200, height: 24, borderRadius: 'var(--radius-pill)' }} />
    </div>
  );
}

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, userData, loading, initializing } = useAuth();

  // Ainda inicializando o listener de auth
  if (initializing || loading) {
    return <LoadingScreen />;
  }

  // Não autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Usuário autenticado mas sem doc ou não aprovado
  if (!userData || userData.status !== 'approved') {
    return <Navigate to="/login" replace />;
  }

  // Precisa definir senha definitiva
  if (userData.mustChangePassword) {
    return <Navigate to="/definir-senha" replace />;
  }

  // Rota exclusiva do admin
  if (adminOnly && userData.role !== 'admin') {
    return <ForbiddenPage />;
  }

  return <Outlet />;
}
