// src/i18n/en.js
// Espelho em inglês de pt-BR.js — mesma árvore de chaves, mesma ordem.
// Só o site público troca de idioma; o painel segue em pt-BR. As chaves do
// painel existem aqui para o espelho ficar completo e nenhum t.* quebrar caso
// uma tela administrativa passe a ser traduzida.

const t = {
  common: {
    search: 'Search',
    allTypes: 'All types',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading…',
    createdAt: 'Created on',
    updatedAt: 'Updated on',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    close: 'Close',
    noResults: 'No results found.',
    errorGeneric: 'Something went wrong. Please try again.',
    deleteConfirmTitle: 'Delete {name}?',
    deleteConfirmBody: 'This action cannot be undone.',

    // ── Descartar alterações (todos os formulários do painel) ──
    discardTitle: 'Are you sure you want to cancel editing?',
    discardBody: 'Unsaved changes will be lost. This action cannot be undone.',
    discardConfirm: 'Confirm cancellation',
    discardCancel: 'Keep editing',
  },

  nav: {
    dashboard: 'Dashboard',
    events: 'Events',
    collaborators: 'Collaborators',
    sponsors: 'Sponsors',
    schedules: 'Schedule',
    testimonials: 'Testimonials',
    staff: 'Team',
    logout: 'Sign out',
  },

  auth: {
    // ── Login ──
    loginTitle: 'Access the panel',
    loginSubtitle: 'Scoliosis Day — Admin',
    email: 'E-mail',
    emailPlaceholder: 'you@email.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Forgot my password',
    signIn: 'Sign in',
    signingIn: 'Signing in…',

    // ── Cadastro ──
    signUp: 'Create account',
    signUpTitle: 'Create your account',
    signUpSubtitle: 'Request access to the admin panel',
    confirmEmail: 'Confirm e-mail',
    confirmEmailPlaceholder: 'repeat the e-mail',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'repeat the password',
    signingUp: 'Signing up…',
    signUpSuccess: 'Registration sent!',
    signUpSuccessBody: 'Registration sent. You will receive an e-mail once an administrator approves your access.',
    redirectingToLogin: 'Redirecting to sign-in in {seconds}s…',
    backToLogin: 'Back to sign-in',
    alreadyHaveAccount: 'Already have an account?',

    // ── Recuperação de senha ──
    resetPassword: 'Reset password',
    resetPasswordTitle: 'Forgot your password?',
    resetPasswordBody: 'Enter your e-mail and we will send you a reset link.',
    sendResetLink: 'Send link',
    sendingResetLink: 'Sending…',
    resetEmailSent: 'If this e-mail is registered, you will receive the instructions.',

    // ── Definição de senha ──
    setPasswordTitle: 'Set your password',
    setPasswordSubtitle: 'Create a permanent password to access the panel.',
    newPassword: 'New password',
    newPasswordPlaceholder: 'minimum 8 characters',
    confirmNewPassword: 'Confirm new password',
    setPassword: 'Set password',
    settingPassword: 'Saving…',

    // ── Indicador de força ──
    passwordStrength: 'Password strength',
    strengthWeak: 'Weak',
    strengthMedium: 'Medium',
    strengthStrong: 'Strong',

    // ── Erros ──
    errorInvalidCredentials: 'Incorrect e-mail or password.',
    errorEmailNotFound: 'E-mail not found.',
    errorWeakPassword: 'The password must be at least 8 characters long, with at least one letter and one number.',
    errorPasswordMismatch: 'The passwords do not match.',
    errorEmailMismatch: 'The e-mails do not match.',
    errorEmailInUse: 'This e-mail is already registered.',
    errorTooManyRequests: 'Too many attempts. Please wait a few minutes.',

    // ── Status de conta ──
    statusPendingTitle: 'Registration under review',
    statusPendingBody: 'Your registration is still under review. You will receive an e-mail once it is approved.',
    statusRejectedTitle: 'Access unavailable',
    statusRejectedBody: 'This access is not available. Please contact the administrator.',

    // ── Logout ──
    logoutConfirm: 'Do you really want to sign out?',
  },

  dashboard: {
    title: 'Dashboard',
    subtitle: 'Platform overview',
    totalEvents: 'Events',
    totalCollaborators: 'Collaborators',
    totalSponsors: 'Sponsors',
    pendingStaff: 'Pending registrations',
    recentEvents: 'Recently edited events',
  },

  events: {
    title: 'Events',
    subtitle: 'Manage the platform events',
    create: 'New event',
    searchPlaceholder: 'Search by name…',
    filterByStatus: 'Filter by status',
    filterByModality: 'Filter by modality',
    name: 'Event name',
    date: 'Date',
    location: 'Location',
    status: 'Status',
    emptyTitle: 'No events registered',
    emptyBody: 'Create your first event to get started.',
    deleteConfirm: "Delete the event '{name}'? This action cannot be undone.",
  },

  eventStatus: {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
  },

  eventModality: {
    in_person: 'In person',
    online: 'Online',
    hybrid: 'Hybrid',
  },

  collaborators: {
    title: 'Collaborators',
    subtitle: 'Speakers, curators and organizers',
    create: 'New collaborator',
    searchPlaceholder: 'Search by name…',
    filterByType: 'Filter by type',
    name: 'Name',
    type: 'Type',
    emptyTitle: 'No collaborators registered',
    emptyBody: 'Add speakers, curators and organizers.',
    deleteConfirm: "Delete the collaborator '{name}'? This action cannot be undone.",
  },

  collaboratorType: {
    speaker: 'Speaker',
    scientific_curator: 'Scientific Curator',
    organizer: 'Organizer',
  },

  sponsors: {
    title: 'Sponsors',
    subtitle: 'Supporting companies and institutions',
    create: 'New sponsor',
    searchPlaceholder: 'Search by name…',
    name: 'Name',
    website: 'Website',
    emptyTitle: 'No sponsors registered',
    emptyBody: 'Add the event sponsors and supporters.',
    deleteConfirm: "Delete the sponsor '{name}'? This action cannot be undone.",
  },

  schedules: {
    title: 'Schedule',
    subtitle: 'Event sessions and talks',
    create: 'New schedule',
    searchPlaceholder: 'Search by title…',
    name: 'Schedule name',
    sessions: 'Sessions',
    linkedEvents: 'Linked events',
    emptyTitle: 'No schedules registered',
    emptyBody: 'Build the event schedule by adding sessions.',
    deleteConfirm: "Delete the schedule '{name}'? This action cannot be undone.",
  },

  testimonials: {
    title: 'Testimonials',
    subtitle: 'Text and video testimonials shown on the site',
    create: 'New testimonial',
    tabText: 'Text',
    tabVideo: 'Videos',
    name: 'Name',
    role: 'Role',
    date: 'Date',
    quote: 'Content',
    quotePlaceholder: 'What the person said about Scoliosis Day…',
    videoUrl: 'Video URL',
    videoUrlHint: 'YouTube or Vimeo link, or upload an MP4 file below.',
    videoUpload: 'Upload MP4 file',
    videoUploadHint: 'MP4 · up to 100MB',
    emptyTextTitle: 'No text testimonials',
    emptyTextBody: 'Add the first text testimonial.',
    emptyVideoTitle: 'No video testimonials',
    emptyVideoBody: 'Add the first video testimonial.',
    deleteConfirm: "Delete the testimonial from '{name}'? This action cannot be undone.",
    createSuccess: 'Testimonial created successfully!',
    updateSuccess: 'Testimonial updated successfully!',
    deleteSuccess: 'Testimonial deleted successfully!',
  },

  testimonialType: {
    text: 'Text',
    video: 'Video',
  },

  staff: {
    title: 'Team',
    subtitle: 'Admin panel users',
    create: 'Create member',
    tabPending: 'Awaiting approval',
    tabActive: 'Active',
    searchPlaceholder: 'Search by name or e-mail…',
    email: 'E-mail',
    role: 'Role',
    status: 'Status',
    requestDate: 'Request date',
    approve: 'Approve',
    reject: 'Reject',
    disable: 'Disable',
    emptyPendingTitle: 'No pending registrations',
    emptyPendingBody: 'All registrations have been reviewed.',
    emptyActiveTitle: 'No active members',
    emptyActiveBody: 'Invite members to manage the panel.',
    deleteConfirm: "Remove '{name}' from the team? This action cannot be undone.",
    cannotEditSelf: 'You cannot change your own role from this screen.',
    initialPassword: 'Initial password',
    initialPasswordHint: 'The user will be required to set a permanent password on first sign-in.',
  },

  staffRole: {
    admin: 'Administrator',
    staff: 'Staff',
  },

  staffStatus: {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    disabled: 'Disabled',
  },

  forbidden: {
    title: 'Restricted access',
    body: 'You do not have permission to access this page.',
    backToDashboard: 'Back to Dashboard',
  },

  notFound: {
    title: 'Page not found',
    body: 'The address you tried to reach does not exist.',
    backToDashboard: 'Back to Dashboard',
  },

  // ── Site público ──
  site: {
    brand: 'Scoliosis Day',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    languageLabel: 'Language',
    cta: 'Register',
    home: 'Home',
    editions: 'Editions',
    about: 'About',
    hallOfStars: 'Hall of Stars',
    sponsors: 'Sponsors',
    testimonials: 'Testimonials',
    academy: 'Academy',
    // Placeholders das páginas ainda por construir.
    comingSoonTitle: 'Coming soon',
    comingSoonBody: 'This page is under construction.',

    // ── Home · Hero (fallback sem evento atual) ──
    heroTitle: 'Brazil’s largest gathering on scoliosis',
    heroSubtitle: 'Surgeons, physiotherapists and health professionals united at the forefront of scoliosis treatment.',

    // ── Home · O que é o Scoliosis Day ──
    aboutTitle: 'What is Scoliosis Day',
    aboutSubtitle: 'A gathering that unites science, clinical practice and professional training around scoliosis.',
    aboutCard1Title: 'High-Level Education and Science',
    aboutCard1Text: 'Scoliosis Day is the global meeting point for the forefront of scoliosis treatment. With a philosophy grounded in education and high-quality science, the event brings together spine surgeons, physiotherapists, internationally renowned orthotists, residents and other professionals involved in scoliosis care.',
    aboutCard2Title: 'Multidisciplinary Debate',
    aboutCard2Text: 'Essentially educational, Scoliosis Day promotes scientific updating, knowledge exchange and multidisciplinary debate across different health fields. More than a congress, it is a space connecting clinical practice, science, industry, professionals in training and national and international reference specialists.',
    aboutCard3Title: 'Supported by ABTE',
    aboutCard3Text: 'Since its first edition, Scoliosis Day has been supported by the Brazilian Scoliosis Treatment Association (ABTE), reinforcing its commitment to the scientific community dedicated to scoliosis in Brazil.',

    // ── Edições (/edicoes) ──
    editionsEmptyTitle: 'No editions published yet',
    editionsEmptyBody: 'There are no published editions yet. Check back soon.',
    starsTitle: 'Confirmed Speakers',
    // {ordinal} comes from utils/ordinal.js — "1st", "2nd"...
    editionBadge: '{ordinal} Edition',

    // Modalidades e valores
    pricingInPersonBadge: 'In Person',
    pricingInPersonText: 'Join us live, network with peers and dive into the full Scoliosis Day experience.',
    pricingOnlineBadge: 'Online',
    pricingOnlineText: 'Access every talk, live and recorded, from anywhere in the world.',
    pricingPrev: 'Previous plan',
    pricingNext: 'Next plan',

    // Programação
    scheduleTitle: 'Schedule',

    // Patrocinadores
    sponsorsTitle: 'Sponsors',

    // Quem faz o Scoliosis Day / Curadoria Científica
    organizersTitle: 'Who Makes Scoliosis Day',
    curatorsTitle: 'Scientific Curation',

    // ── Home · Depoimentos ──
    testimonialsTitle: 'Testimonials',
    testimonialsSubtitle: 'Those who experienced Scoliosis Day share its impact on their practice.',
    editionsHeld: 'Editions held',
    testimonialPrev: 'Previous testimonial',
    testimonialNext: 'Next testimonial',
    // Exibidos quando a edição mais recente ainda não tem depoimentos.
    testimonialsFallback: [
      {
        text: 'A transformative experience for my clinical practice. The scientific level of the speakers is unmatched.',
        author: 'Dr. Carlos Mendes',
        role: 'Spine Surgeon',
      },
      {
        text: 'Scoliosis Day changed the way I treat my patients. The exchange between specialists is unique.',
        author: 'Dr. Ana Lima',
        role: 'Physiotherapist',
      },
    ],

    // ── /sobre ──
    aboutPageHeroTitle: 'About Us',
    aboutPageHeroSubtitle: 'Brazil’s leading multidisciplinary scientific event, focused on knowledge, innovation and excellence.',
    aboutPageIntroTitle: 'About Scoliosis Day',
    aboutPageIntroText: 'Scoliosis Day has established itself as an international reference in the treatment of spinal deformities, bringing together great names in healthcare from around the world in favor of education. Scoliosis Day is the global meeting point for the forefront of scoliosis treatment. With a philosophy grounded in education and high-quality science, the event brings together spine surgeons, physiotherapists, internationally renowned orthotists, residents and other professionals involved in scoliosis care.',
    aboutPageCard1Title: 'Why participate?',
    aboutPageCard1Text: 'It is a unique experience with the biggest names in the field, building strategic networking and broadening your view of the challenges and advances in scoliosis care.',
    aboutPageCard2Title: 'Interactivity in focus!',
    aboutPageCard2Text: 'Unlike a congress, Scoliosis Day always gives us the opportunity to spend time with prominent speakers throughout its entire duration. Hours together exchanging high-quality knowledge about spinal deformities.',
    aboutPageCard3Title: 'Multidisciplinary team',
    aboutPageCard3Text: 'Doctors, physiotherapists, orthotists and psychologists together shaping the future of surgical and conservative treatment of spinal deformities.',
    aboutPageRecifeTitle: 'Recife is where we were born',
    aboutPageRecifeText: 'Recife, the pulsing heart of the Brazilian Northeast, is much more than a destination: it is a hub of innovation, knowledge and human warmth. With top professionals and a unique culture of hospitality, the state offers a complete experience.',
    aboutPageRecifeImageAlt: 'Recife, Pernambuco',

    // ── /hall-de-estrelas ──
    hallOfStarsPageHeroTitle: 'Hall of Stars',
    hallOfStarsPageHeroSubtitle: 'The biggest names in scoliosis treatment gathered at Scoliosis Day.',
    hallOfStarsPageFeaturedTitle: 'Featured Speakers',
    hallOfStarsPageFeaturedBadge: 'Featured',
    hallOfStarsPageAllTitle: 'All Speakers',
    hallOfStarsPageSearchPlaceholder: 'Search by name…',
    hallOfStarsPageEmptyTitle: 'No speakers found',
    hallOfStarsPageEmptyBody: 'There are no speakers registered in published editions yet.',

    // ── /patrocinadores ──
    sponsorsPageHeroTitle: 'Sponsors',
    sponsorsPageHeroSubtitle: 'Companies and institutions that make Scoliosis Day possible.',
    sponsorsPageEmptyTitle: 'No sponsors registered',
    sponsorsPageEmptyBody: 'There are no sponsors in published editions yet.',

    // ── /depoimentos ──
    testimonialsPageHeroTitle: 'Testimonials',
    testimonialsPageHeroSubtitle: 'What Scoliosis Day participants have to say.',
    testimonialsPageTextTitle: 'Testimonials',
    testimonialsPageVideoTitle: 'Video Testimonials',

    // Patrocinadores — CTA de captação (/sobre e /edicoes)
    sponsorCta: 'Become a Sponsor',

    // Rodapé
    footerTagline: 'Brazil’s largest gathering on scoliosis, bringing together surgeons, physiotherapists and health professionals.',
    footerAbteText: 'Supported by the Brazilian Scoliosis Treatment Association (ABTE).',
    footerNavLabel: 'Footer navigation',
    footerSiteMap: 'Browse',
    footerContactTitle: 'Contact',
    contactEmail: 'contato@scoliosisday.com.br',
    contactInstagram: '@scoliosisday',
    footerCopyright: '© {year} Scoliosis Day. All rights reserved.',

    // 404 do site público
    notFoundTitle: 'Page not found',
    notFoundBody: 'The address you visited does not exist or has been moved.',
    notFoundBack: 'Back to home',
  },

  toast: {
    saved: 'Saved successfully.',
    deleted: 'Deleted successfully.',
    error: 'Error while saving. Please try again.',
    uploadSuccess: 'File uploaded successfully.',
    uploadError: 'Upload failed. Check the file and try again.',
    inviteSent: 'Invitation sent successfully.',
    passwordUpdated: 'Password updated successfully.',
    staffApproved: 'Registration approved successfully.',
    staffRejected: 'Registration rejected.',
  },
};

export default t;
