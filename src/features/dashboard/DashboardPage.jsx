// src/features/dashboard/DashboardPage.jsx
// Dashboard (seção 11.1) — visão geral da plataforma.
// Cartões de totalização + lista dos eventos editados mais recentemente.
// O cartão de cadastros pendentes só aparece para o administrador.

import { Calendar, Users, Building2, FileText, UserCheck } from 'lucide-react';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { EVENT_STATUS, COLLABORATOR_TYPES } from '../../utils/constants.js';
import { usePermissions } from '../../hooks/usePermissions.js';
import { useEventCounts, useRecentEvents } from '../../hooks/useEvents.js';
import { useCollaboratorCounts } from '../../hooks/useCollaborators.js';
import { useSponsorCount } from '../../hooks/useSponsors.js';
import { useProgrammingCount } from '../../hooks/useProgrammings.js';
import { usePendingStaffCount } from '../../hooks/useStaff.js';
import StatCard from './components/StatCard.jsx';
import RecentEvents from './components/RecentEvents.jsx';

const RECENT_EVENTS_LIMIT = 5;

// Placeholders com as chaves zeradas: enquanto a contagem não chega, os
// detalhamentos mostram 0 em vez de undefined.
const EMPTY_EVENT_COUNTS = {
  total: 0,
  byStatus: {
    [EVENT_STATUS.DRAFT]: 0,
    [EVENT_STATUS.PUBLISHED]: 0,
    [EVENT_STATUS.ARCHIVED]: 0,
  },
};

const EMPTY_COLLABORATOR_COUNTS = {
  total: 0,
  byType: {
    [COLLABORATOR_TYPES.SPEAKER]: 0,
    [COLLABORATOR_TYPES.SCIENTIFIC_CURATOR]: 0,
    [COLLABORATOR_TYPES.ORGANIZER]: 0,
  },
};

export default function DashboardPage() {
  const { can } = usePermissions();
  const isAdmin = can('staff', 'view');

  // Os cartões pedem números, não documentos: getCountFromServer agrega no
  // servidor e a lista de recentes vem com limit(5). Antes, cada cartão
  // arrastava a coleção inteira para contar no cliente.
  const { data: eventCounts = EMPTY_EVENT_COUNTS, isLoading: loadingEvents } = useEventCounts();
  const { data: collaboratorCounts = EMPTY_COLLABORATOR_COUNTS, isLoading: loadingCollaborators } =
    useCollaboratorCounts();
  const { data: sponsorCount = 0, isLoading: loadingSponsors } = useSponsorCount();
  const { data: programmingCount = 0, isLoading: loadingProgrammings } = useProgrammingCount();

  // Só o admin lê users/ — as rules negam para staff, então nem consultamos.
  const { data: pendingCount = 0, isLoading: loadingStaff } = usePendingStaffCount({
    enabled: isAdmin,
  });

  const { data: recentEvents = [], isLoading: loadingRecent } =
    useRecentEvents(RECENT_EVENTS_LIMIT);

  const eventsByStatus = eventCounts.byStatus;
  const collaboratorsByType = collaboratorCounts.byType;

  return (
    <AppShell activeNav="dashboard" breadcrumb={t.dashboard.title}>
      <div className="sda-content">
        {/* ── Cabeçalho ── */}
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              {t.dashboard.title}
            </h1>
            <p className="sd-muted sd-small">{t.dashboard.subtitle}</p>
          </div>
        </header>

        {/* ── Cartões de totalização ── */}
        <div className="sd-grid sd-grid--4">
          <StatCard
            icon={Calendar}
            value={eventCounts.total}
            label={t.dashboard.totalEvents}
            isLoading={loadingEvents}
            to="/painel/eventos"
            breakdown={[
              { label: t.eventStatus.published, value: eventsByStatus[EVENT_STATUS.PUBLISHED] },
              { label: t.eventStatus.draft, value: eventsByStatus[EVENT_STATUS.DRAFT] },
              { label: t.eventStatus.archived, value: eventsByStatus[EVENT_STATUS.ARCHIVED] },
            ]}
          />

          <StatCard
            icon={Users}
            value={collaboratorCounts.total}
            label={t.dashboard.totalCollaborators}
            isLoading={loadingCollaborators}
            to="/painel/colaboradores"
            breakdown={[
              { label: t.collaboratorType.speaker, value: collaboratorsByType[COLLABORATOR_TYPES.SPEAKER] },
              { label: t.collaboratorType.scientific_curator, value: collaboratorsByType[COLLABORATOR_TYPES.SCIENTIFIC_CURATOR] },
              { label: t.collaboratorType.organizer, value: collaboratorsByType[COLLABORATOR_TYPES.ORGANIZER] },
            ]}
          />

          <StatCard
            icon={Building2}
            value={sponsorCount}
            label={t.dashboard.totalSponsors}
            isLoading={loadingSponsors}
            to="/painel/patrocinadores"
          />

          <StatCard
            icon={FileText}
            value={programmingCount}
            label={t.schedules.title}
            isLoading={loadingProgrammings}
            to="/painel/programacoes"
          />

          {/* ── Exclusivo do admin ── */}
          {isAdmin && (
            <StatCard
              icon={UserCheck}
              value={pendingCount}
              label={t.dashboard.pendingStaff}
              isLoading={loadingStaff}
              to="/painel/staff"
              badge={pendingCount}
              highlight={pendingCount > 0}
            />
          )}
        </div>

        {/* ── Separador ── */}
        <div
          className="sd-rule"
          aria-hidden="true"
          style={{ marginTop: 'var(--space-10)', marginBottom: 'var(--space-6)' }}
        >
          <i /><i /><i /><i />
        </div>

        {/* ── Eventos recentes ── */}
        <section aria-labelledby="recent-events-title">
          <h2
            id="recent-events-title"
            className="sd-subtitle"
            style={{ marginBottom: 'var(--space-4)' }}
          >
            {t.dashboard.recentEvents}
          </h2>

          <RecentEvents events={recentEvents} isLoading={loadingRecent} />
        </section>
      </div>
    </AppShell>
  );
}
