// src/utils/constants.js
// Enums e constantes compartilhadas por toda a aplicação.

// ---- Avatar — paleta determinística (seção 12.7) ----
// Cores verificadas para contraste >= 4.5:1 contra branco (WCAG AA).
export const AVATAR_COLORS = [
  'var(--teal-700)',   // ~4.6:1 ✓
  'var(--teal-800)',   // ~5.8:1 ✓
  'var(--teal-900)',   // ~7.4:1 ✓
  'var(--orange-700)', // ~3.1:1 ⚠ usar --orange-800 em texto pequeno
  'var(--orange-800)', // ~5.9:1 ✓
  'var(--gray-600)',   // ~5.2:1 ✓
  'var(--gray-800)',   // ~8.3:1 ✓
  'var(--teal-600)',   // ~2.9:1 ⚠ apenas em badges grandes
];

// ---- Roles de usuário (seção 5.1) ----
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

// ---- Status de usuário (seção 5.1) ----
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISABLED: 'disabled',
};

// ---- Tipos de colaborador (seção 5.2) ----
export const COLLABORATOR_TYPES = {
  SPEAKER: 'speaker',
  SCIENTIFIC_CURATOR: 'scientific_curator',
  ORGANIZER: 'organizer',
};

// ---- Status de evento (seção 5.5) ----
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// ---- Modalidade de evento (seção 5.5) ----
export const EVENT_MODALITY = {
  IN_PERSON: 'in_person',
  ONLINE: 'online',
  HYBRID: 'hybrid',
};

// ---- Matriz de permissões (seção 9) ----
// A UI esconde o que o usuário não pode fazer.
// As Security Rules bloqueiam de verdade.
export const PERMISSIONS = {
  admin: {
    event:        ['view', 'create', 'update', 'delete', 'duplicate'],
    staff:        ['view', 'create', 'update', 'delete', 'approve'],
    collaborator: ['view', 'create', 'update', 'delete', 'setType'],
    sponsor:      ['view', 'create', 'update', 'delete'],
    schedule:     ['view', 'create', 'update', 'delete', 'duplicate'],
  },
  staff: {
    event:        ['view', 'create', 'update', 'delete', 'duplicate'],
    staff:        [],
    collaborator: ['view', 'create', 'update', 'delete', 'setType'],
    sponsor:      ['view', 'create', 'update', 'delete'],
    schedule:     ['view', 'create', 'update', 'delete', 'duplicate'],
  },
};

// ---- Validação de senha (seção 8.2) ----
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d)/;

// ---- Paginação ----
export const PAGE_SIZE = 20;

// ---- Ícones dos cards de apresentação do evento (Passo 3 do wizard) ----
// Vocabulário fechado: o Passo 3 só deixa escolher entre estes, e o site
// público (utils/presentationIcons.js) só sabe resolver estes — os dois
// lados leem daqui para não haver como divergir.
export const PRESENTATION_ICONS = [
  'Zap',
  'Globe',
  'Users',
  'Star',
  'Rocket',
  'Heart',
  'Lightbulb',
  'Shield',
  'Award',
  'TrendingUp',
];
