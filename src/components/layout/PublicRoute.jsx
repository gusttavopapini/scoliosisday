// src/components/layout/PublicRoute.jsx
// Guarda de rota para páginas públicas (login, cadastro, etc.).
// Se o usuário já está logado, aprovado e sem mustChangePassword → redirect para /.
// Caso contrário, permite renderizar a página pública.

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function PublicRoute() {
  const { user, userData, initializing } = useAuth();

  // Ainda inicializando — não redirect prematuramente
  if (initializing) {
    return null;
  }

  // Usuário logado, aprovado e sem senha pendente → redireciona para dashboard
  if (
    user &&
    userData &&
    userData.status === 'approved' &&
    !userData.mustChangePassword
  ) {
    return <Navigate to="/painel" replace />;
  }

  return <Outlet />;
}
