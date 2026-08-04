// src/app/router.jsx
// Definição central de rotas — seção 13.
//
// Duas árvores independentes:
//   • Site público — raiz (/), dentro de PublicLayout. Sem autenticação.
//   • Painel — prefixo /painel, atrás de ProtectedRoute, mais as telas de
//     autenticação (/login, /cadastro, …) que ficam na raiz por herança.
//
// O prefixo existe porque o site público reivindica / e /patrocinadores, que
// antes eram do painel. Qualquer rota nova do painel entra sob /painel.
//
// Todas as páginas entram por React.lazy: cada tela vira um chunk próprio e
// o primeiro carregamento não arrasta o painel inteiro (TipTap, dnd-kit e o
// resto só chegam quando a tela que os usa é aberta). O <Suspense> fica em
// volta do elemento de rota, com PageSkeleton como fallback.

// Este arquivo é um manifesto de rotas, não um módulo de componentes: os
// React.lazy abaixo não são exportados e o aviso de fast refresh não se aplica.
// oxlint-disable react/only-export-components

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../components/public/PublicLayout.jsx';
import PublicRoute from '../components/layout/PublicRoute.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import SetPasswordRoute from '../components/layout/SetPasswordRoute.jsx';
import PageSkeleton from '../components/ui/PageSkeleton.jsx';

// ── Páginas do site público (carregadas sob demanda) ──
const HomePage = lazy(() => import('../features/public/HomePage.jsx'));
const EditionsPage = lazy(() => import('../features/public/EditionsPage.jsx'));
const AboutPage = lazy(() => import('../features/public/AboutPage.jsx'));
const HallOfStarsPage = lazy(() => import('../features/public/HallOfStarsPage.jsx'));
const PublicSponsorsPage = lazy(() => import('../features/public/PublicSponsorsPage.jsx'));
const TestimonialsPage = lazy(() => import('../features/public/TestimonialsPage.jsx'));
const NotFoundPublicPage = lazy(() => import('../features/public/NotFoundPublicPage.jsx'));

// ── Páginas do painel (carregadas sob demanda) ──
const LoginPage = lazy(() => import('../features/auth/LoginPage.jsx'));
const SignupPage = lazy(() => import('../features/auth/SignupPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage.jsx'));
const SetPasswordPage = lazy(() => import('../features/auth/SetPasswordPage.jsx'));
const NotFoundPage = lazy(() => import('../features/auth/NotFoundPage.jsx'));
const UIDevPage = lazy(() => import('../features/dev/UIDevPage.jsx'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage.jsx'));
const CollaboratorsPage = lazy(() => import('../features/collaborators/CollaboratorsPage.jsx'));
const CreateCollaboratorPage = lazy(() => import('../features/collaborators/CreateCollaboratorPage.jsx'));
const EditCollaboratorPage = lazy(() => import('../features/collaborators/EditCollaboratorPage.jsx'));
const EventsPage = lazy(() => import('../features/events/EventsPage.jsx'));
const CreateEventPage = lazy(() => import('../features/events/CreateEventPage.jsx'));
const EditEventPage = lazy(() => import('../features/events/EditEventPage.jsx'));
const SponsorsPage = lazy(() => import('../features/sponsors/SponsorsPage.jsx'));
const CreateSponsorPage = lazy(() => import('../features/sponsors/CreateSponsorPage.jsx'));
const EditSponsorPage = lazy(() => import('../features/sponsors/EditSponsorPage.jsx'));
const ProgrammingsPage = lazy(() => import('../features/programmings/ProgrammingsPage.jsx'));
const CreateProgrammingPage = lazy(() => import('../features/programmings/CreateProgrammingPage.jsx'));
const EditProgrammingPage = lazy(() => import('../features/programmings/EditProgrammingPage.jsx'));
const StaffPage = lazy(() => import('../features/staff/StaffPage.jsx'));

/** Envolve uma página no limite de Suspense usado por todas as rotas. */
function suspended(Page) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Page />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // ── Site público ──
  // PublicLayout traz o LanguageProvider e o navbar; as filhas só rendem miolo.
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: suspended(HomePage) },
      { path: '/edicoes', element: suspended(EditionsPage) },
      { path: '/sobre', element: suspended(AboutPage) },
      { path: '/hall-de-estrelas', element: suspended(HallOfStarsPage) },
      { path: '/patrocinadores', element: suspended(PublicSponsorsPage) },
      { path: '/depoimentos', element: suspended(TestimonialsPage) },

      // Academy ainda não tem página. A rota fica de pé para não quebrar
      // links já divulgados, mas não aparece mais no menu (ver NAV_LINKS
      // em PublicNavbar.jsx).
      { path: '/academy', element: <Navigate to="/" replace /> },

      // 404 do site. O splat aqui é o mais genérico do router: qualquer rota
      // estática ou /painel/* declarada abaixo é mais específica e ganha dele
      // no ranking do React Router, independente da ordem.
      { path: '*', element: suspended(NotFoundPublicPage) },
    ],
  },

  // ── Autenticação do painel (não acessível se já logado) ──
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: suspended(LoginPage) },
      { path: '/cadastro', element: suspended(SignupPage) },
      { path: '/esqueci-a-senha', element: suspended(ForgotPasswordPage) },
    ],
  },

  // ── Rota bloqueante de definição de senha ──
  {
    element: <SetPasswordRoute />,
    children: [
      { path: '/definir-senha', element: suspended(SetPasswordPage) },
    ],
  },

  // ── Rotas protegidas (admin + staff) ──
  {
    element: <ProtectedRoute />,
    children: [
      // Dashboard
      { path: '/painel', element: suspended(DashboardPage) },

      // Módulos (placeholder de telas — Fases 4–8)
      { path: '/painel/eventos', element: suspended(EventsPage) },
      { path: '/painel/eventos/novo', element: suspended(CreateEventPage) },
      { path: '/painel/eventos/:id/editar', element: suspended(EditEventPage) },
      { path: '/painel/colaboradores', element: suspended(CollaboratorsPage) },
      { path: '/painel/colaboradores/novo', element: suspended(CreateCollaboratorPage) },
      { path: '/painel/colaboradores/:id/editar', element: suspended(EditCollaboratorPage) },
      { path: '/painel/patrocinadores', element: suspended(SponsorsPage) },
      { path: '/painel/patrocinadores/novo', element: suspended(CreateSponsorPage) },
      { path: '/painel/patrocinadores/:id/editar', element: suspended(EditSponsorPage) },
      { path: '/painel/programacoes', element: suspended(ProgrammingsPage) },
      { path: '/painel/programacoes/novo', element: suspended(CreateProgrammingPage) },
      { path: '/painel/programacoes/:id/editar', element: suspended(EditProgrammingPage) },

      // Desenvolvimento
      { path: '/painel/dev/ui', element: suspended(UIDevPage) },

      // 404 do painel: /painel/qualquer-coisa continua atrás do
      // ProtectedRoute e mostra a tela com copy de painel, não a do site.
      { path: '/painel/*', element: suspended(NotFoundPage) },
    ],
  },

  // ── Rota admin-only ──
  {
    element: <ProtectedRoute adminOnly />,
    children: [
      { path: '/painel/staff', element: suspended(StaffPage) },
    ],
  },
]);
