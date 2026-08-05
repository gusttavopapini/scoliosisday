// src/i18n/pt-BR.js
// Fonte única de verdade para todos os textos da interface.
// Identifique cada string pela chave: t.modulo.chave
// NUNCA coloque string solta no JSX — importe e use t.* sempre.
//
// O painel importa este arquivo direto (é sempre pt-BR). O site público lê o
// dicionário pelo useLanguage(), que troca entre este e en.js — por isso as
// duas chaves precisam existir nos dois arquivos.

const t = {
  common: {
    search: 'Buscar',
    allTypes: 'Todos os tipos',
    actions: 'Ações',
    edit: 'Editar',
    delete: 'Excluir',
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    loading: 'Carregando…',
    createdAt: 'Criado em',
    updatedAt: 'Atualizado em',
    yes: 'Sim',
    no: 'Não',
    back: 'Voltar',
    next: 'Próximo',
    close: 'Fechar',
    noResults: 'Nenhum resultado encontrado.',
    errorGeneric: 'Ocorreu um erro. Tente novamente.',
    deleteConfirmTitle: 'Excluir {name}?',
    deleteConfirmBody: 'Esta ação não pode ser desfeita.',

    // ── Descartar alterações (todos os formulários do painel) ──
    discardTitle: 'Deseja realmente cancelar a edição?',
    discardBody: 'As alterações não salvas serão perdidas. Esta ação não pode ser desfeita.',
    discardConfirm: 'Confirmar cancelamento',
    discardCancel: 'Continuar editando',
  },

  nav: {
    dashboard: 'Dashboard',
    events: 'Eventos',
    collaborators: 'Colaboradores',
    sponsors: 'Patrocinadores',
    schedules: 'Programação',
    testimonials: 'Depoimentos',
    staff: 'Equipe',
    logout: 'Sair',
  },

  auth: {
    // ── Login ──
    loginTitle: 'Acesse o painel',
    loginSubtitle: 'Scoliosis Day — Administrativo',
    email: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    password: 'Senha',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Esqueci minha senha',
    signIn: 'Entrar',
    signingIn: 'Entrando…',

    // ── Cadastro ──
    signUp: 'Criar conta',
    signUpTitle: 'Crie sua conta',
    signUpSubtitle: 'Solicite acesso ao painel administrativo',
    confirmEmail: 'Confirmar e-mail',
    confirmEmailPlaceholder: 'repita o e-mail',
    confirmPassword: 'Confirmar senha',
    confirmPasswordPlaceholder: 'repita a senha',
    signingUp: 'Cadastrando…',
    signUpSuccess: 'Cadastro enviado!',
    signUpSuccessBody: 'Cadastro enviado. Você receberá um e-mail quando o administrador aprovar seu acesso.',
    redirectingToLogin: 'Redirecionando para o login em {seconds}s…',
    backToLogin: 'Voltar para o login',
    alreadyHaveAccount: 'Já tem conta?',

    // ── Recuperação de senha ──
    resetPassword: 'Redefinir senha',
    resetPasswordTitle: 'Esqueceu a senha?',
    resetPasswordBody: 'Digite seu e-mail e enviaremos um link de redefinição.',
    sendResetLink: 'Enviar link',
    sendingResetLink: 'Enviando…',
    resetEmailSent: 'Se este e-mail estiver cadastrado, você receberá as instruções.',

    // ── Definição de senha ──
    setPasswordTitle: 'Defina sua senha',
    setPasswordSubtitle: 'Crie uma senha definitiva para acessar o painel.',
    newPassword: 'Nova senha',
    newPasswordPlaceholder: 'mínimo 8 caracteres',
    confirmNewPassword: 'Confirmar nova senha',
    setPassword: 'Definir senha',
    settingPassword: 'Salvando…',

    // ── Indicador de força ──
    passwordStrength: 'Força da senha',
    strengthWeak: 'Fraca',
    strengthMedium: 'Média',
    strengthStrong: 'Forte',

    // ── Erros ──
    errorInvalidCredentials: 'E-mail ou senha incorretos.',
    errorEmailNotFound: 'E-mail não encontrado.',
    errorWeakPassword: 'A senha deve ter no mínimo 8 caracteres, com pelo menos uma letra e um número.',
    errorPasswordMismatch: 'As senhas não coincidem.',
    errorEmailMismatch: 'Os e-mails não coincidem.',
    errorEmailInUse: 'Este e-mail já está cadastrado.',
    errorTooManyRequests: 'Muitas tentativas. Aguarde alguns minutos.',

    // ── Status de conta ──
    statusPendingTitle: 'Cadastro em análise',
    statusPendingBody: 'Seu cadastro ainda está em análise. Você receberá um e-mail assim que for aprovado.',
    statusRejectedTitle: 'Acesso indisponível',
    statusRejectedBody: 'Este acesso não está disponível. Fale com o administrador.',

    // ── Logout ──
    logoutConfirm: 'Deseja realmente sair?',
  },

  dashboard: {
    title: 'Dashboard',
    subtitle: 'Visão geral da plataforma',
    totalEvents: 'Eventos',
    totalCollaborators: 'Colaboradores',
    totalSponsors: 'Patrocinadores',
    pendingStaff: 'Cadastros pendentes',
    recentEvents: 'Eventos editados recentemente',
  },

  events: {
    title: 'Eventos',
    subtitle: 'Gerencie os eventos da plataforma',
    create: 'Novo evento',
    searchPlaceholder: 'Buscar por nome…',
    filterByStatus: 'Filtrar por status',
    filterByModality: 'Filtrar por modalidade',
    name: 'Nome do evento',
    date: 'Data',
    location: 'Local',
    status: 'Status',
    emptyTitle: 'Nenhum evento cadastrado',
    emptyBody: 'Crie seu primeiro evento para começar.',
    deleteConfirm: "Excluir o evento '{name}'? Esta ação não pode ser desfeita.",
  },

  eventStatus: {
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
  },

  eventModality: {
    in_person: 'Presencial',
    online: 'Online',
    hybrid: 'Híbrido',
  },

  collaborators: {
    title: 'Colaboradores',
    subtitle: 'Palestrantes, curadores e organizadores',
    create: 'Novo colaborador',
    searchPlaceholder: 'Buscar por nome…',
    filterByType: 'Filtrar por tipo',
    name: 'Nome',
    type: 'Tipo',
    emptyTitle: 'Nenhum colaborador cadastrado',
    emptyBody: 'Adicione palestrantes, curadores e organizadores.',
    deleteConfirm: "Excluir o colaborador '{name}'? Esta ação não pode ser desfeita.",
  },

  collaboratorType: {
    speaker: 'Palestrante',
    scientific_curator: 'Curador Científico',
    organizer: 'Organizador',
  },

  sponsors: {
    title: 'Patrocinadores',
    subtitle: 'Empresas e instituições apoiadoras',
    create: 'Novo patrocinador',
    searchPlaceholder: 'Buscar por nome…',
    name: 'Nome',
    website: 'Site',
    emptyTitle: 'Nenhum patrocinador cadastrado',
    emptyBody: 'Adicione os patrocinadores e apoiadores do evento.',
    deleteConfirm: "Excluir o patrocinador '{name}'? Esta ação não pode ser desfeita.",
  },

  schedules: {
    title: 'Programação',
    subtitle: 'Sessões e palestras do evento',
    create: 'Nova programação',
    searchPlaceholder: 'Buscar por título…',
    name: 'Nome da programação',
    sessions: 'Sessões',
    linkedEvents: 'Eventos vinculados',
    emptyTitle: 'Nenhuma programação cadastrada',
    emptyBody: 'Monte a programação do evento adicionando sessões.',
    deleteConfirm: "Excluir a programação '{name}'? Esta ação não pode ser desfeita.",
  },

  testimonials: {
    title: 'Depoimentos',
    subtitle: 'Depoimentos textuais e em vídeo exibidos no site',
    create: 'Novo depoimento',
    tabText: 'Textuais',
    tabVideo: 'Vídeos',
    name: 'Nome',
    role: 'Cargo',
    date: 'Data',
    quote: 'Conteúdo',
    quotePlaceholder: 'O que a pessoa disse sobre o Scoliosis Day…',
    videoUrl: 'URL do vídeo',
    videoUrlHint: 'Link do YouTube, Vimeo, ou envie um arquivo MP4 abaixo.',
    videoUpload: 'Enviar arquivo MP4',
    videoUploadHint: 'MP4 · até 100MB',
    emptyTextTitle: 'Nenhum depoimento textual',
    emptyTextBody: 'Adicione o primeiro depoimento em texto.',
    emptyVideoTitle: 'Nenhum depoimento em vídeo',
    emptyVideoBody: 'Adicione o primeiro depoimento em vídeo.',
    deleteConfirm: "Excluir o depoimento de '{name}'? Esta ação não pode ser desfeita.",
    createSuccess: 'Depoimento criado com sucesso!',
    updateSuccess: 'Depoimento atualizado com sucesso!',
    deleteSuccess: 'Depoimento excluído com sucesso!',
  },

  testimonialType: {
    text: 'Texto',
    video: 'Vídeo',
  },

  staff: {
    title: 'Equipe',
    subtitle: 'Usuários do painel administrativo',
    create: 'Criar membro',
    tabPending: 'Aguardando aprovação',
    tabActive: 'Ativos',
    searchPlaceholder: 'Buscar por nome ou e-mail…',
    email: 'E-mail',
    role: 'Perfil',
    status: 'Status',
    requestDate: 'Data da solicitação',
    approve: 'Aprovar',
    reject: 'Recusar',
    disable: 'Desativar',
    emptyPendingTitle: 'Nenhum cadastro pendente',
    emptyPendingBody: 'Todos os cadastros foram avaliados.',
    emptyActiveTitle: 'Nenhum membro ativo',
    emptyActiveBody: 'Convide membros para gerenciar o painel.',
    deleteConfirm: "Remover '{name}' da equipe? Esta ação não pode ser desfeita.",
    cannotEditSelf: 'Você não pode alterar o próprio perfil por esta tela.',
    initialPassword: 'Senha inicial',
    initialPasswordHint: 'O usuário será obrigado a definir a senha definitiva no primeiro login.',
  },

  staffRole: {
    admin: 'Administrador',
    staff: 'Staff',
  },

  staffStatus: {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Recusado',
    disabled: 'Desativado',
  },

  forbidden: {
    title: 'Acesso restrito',
    body: 'Você não tem permissão para acessar esta página.',
    backToDashboard: 'Voltar ao Dashboard',
  },

  notFound: {
    title: 'Página não encontrada',
    body: 'O endereço que você tentou acessar não existe.',
    backToDashboard: 'Voltar ao Dashboard',
  },

  // ── Site público ──
  site: {
    brand: 'Scoliosis Day',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    languageLabel: 'Idioma',
    cta: 'Inscreva-se',
    home: 'Início',
    editions: 'Edições',
    about: 'Sobre',
    hallOfStars: 'Hall de Estrelas',
    sponsors: 'Patrocinadores',
    testimonials: 'Depoimentos',
    academy: 'Academy',
    // Placeholders das páginas ainda por construir.
    comingSoonTitle: 'Em breve',
    comingSoonBody: 'Esta página está sendo construída.',

    // ── Home · Hero (fallback sem evento atual) ──
    heroTitle: 'O maior encontro sobre escoliose do Brasil',
    heroSubtitle: 'Cirurgiões, fisioterapeutas e profissionais da saúde reunidos pela vanguarda do tratamento da escoliose.',

    // ── Home · O que é o Scoliosis Day ──
    // "Scoliosis Day" no heading é renderizado por <BrandWordmark />, não
    // por este texto — aboutTitleMain é só o que vem antes da marca.
    aboutTitleMain: 'O que é o',
    aboutSubtitle: 'Um encontro que une ciência, prática clínica e formação profissional em torno da escoliose.',
    aboutCard1Title: 'Educação e Ciência de Alto Nível',
    aboutCard1Text: 'O Scoliosis Day é o ponto de encontro global para a vanguarda do tratamento da escoliose. Com uma filosofia pautada na educação e na ciência de alta qualidade, o evento reúne cirurgiões da coluna vertebral, fisioterapeutas, ortesistas de prestígio internacional, residentes e outros profissionais envolvidos no cuidado da escoliose.',
    aboutCard2Title: 'Debate Multidisciplinar',
    aboutCard2Text: 'Essencialmente educativo, o Scoliosis Day promove a atualização científica, a troca de conhecimento e o debate multidisciplinar entre diferentes áreas da saúde. Mais do que um congresso, é um espaço que conecta a prática clínica, a ciência, a indústria, profissionais em formação e especialistas de referência nacional e internacional.',
    aboutCard3Title: 'Apoio da ABTE',
    aboutCard3Text: 'Desde a primeira edição, o Scoliosis Day conta com o apoio da Associação Brasileira de Tratamento da Escoliose (ABTE), reforçando seu compromisso com a comunidade científica dedicada à escoliose no Brasil.',
    // Link no rodapé dos cards "O que é o Scoliosis Day" (Home e Edições).
    learnMore: 'Saiba mais',
    // Abre o modal de detalhes nos cards de pessoa (organizadores, curadoria, Hall de Estrelas).
    viewMore: 'Ver mais',
    // Título da seção de currículo no modal "Ver mais" do PersonCard.
    personModalCurriculumTitle: 'Currículo',

    // ── Edições (/edicoes) ──
    editionsEmptyTitle: 'Nenhuma edição publicada',
    editionsEmptyBody: 'Ainda não há edições publicadas. Volte em breve.',
    starsTitle: 'Presenças Confirmadas',
    // {ordinal} vem de utils/ordinal.js — "1ª", "2ª"...
    editionBadge: '{ordinal} Edição',

    // Modalidades e valores
    pricingInPersonBadge: 'Presencial',
    pricingInPersonText: 'Viva o Scoliosis Day de perto: networking com especialistas e a experiência completa do evento.',
    pricingOnlineBadge: 'Online',
    pricingOnlineText: 'Acesse ao vivo ou revise depois: todas as palestras do Scoliosis Day, disponíveis onde você estiver.',
    pricingPrev: 'Modalidade anterior',
    pricingNext: 'Próxima modalidade',

    // Programação
    scheduleTitle: 'Programação',

    // Patrocinadores
    sponsorsTitle: 'Patrocinadores',

    // Quem faz o Scoliosis Day / Curadoria Científica
    // "Scoliosis Day" no título é <BrandWordmark /> — ver AboutPage/EditionsPage.
    organizersTitleMain: 'Quem faz o',
    curatorsTitle: 'Curadoria Científica',

    // ── Home · Depoimentos ──
    testimonialsTitle: 'Depoimentos',
    testimonialsSubtitle: 'Quem viveu o Scoliosis Day conta o impacto do encontro na sua prática.',
    // Quebra de linha manual do heading, só em /depoimentos (largura cheia,
    // ver TextTestimonials.jsx) — não existe em en.js de propósito: o ponto
    // de quebra é específico desta frase em português, a inglesa quebra
    // naturalmente com outra contagem de palavras.
    testimonialsSubtitleBreakAfter: 'Quem viveu o Scoliosis Day conta o',
    // Duas linhas do rótulo bicolor em .sd-stat (ver .sdp-stat__label) —
    // "Edições realizadas" quebrado em normal + itálico teal de destaque.
    editionsHeldLine1: 'Edições',
    editionsHeldLine2: 'realizadas',
    testimonialPrev: 'Depoimento anterior',
    testimonialNext: 'Próximo depoimento',

    // ── /sobre ──
    aboutPageHeroTitle: 'Sobre Nós',
    aboutPageHeroSubtitle: 'O principal evento científico multidisciplinar do Brasil com foco em conhecimento, inovação e excelência.',
    // "Scoliosis Day" no heading é <BrandWordmark /> (ver aboutTitleMain).
    aboutPageIntroTitleMain: 'Sobre o',
    aboutPageIntroText: 'O Scoliosis Day vem consolidando-se como referência internacional no tratamento das deformidades da coluna vertebral, reunindo grandes nomes da saúde do mundo a favor da educação. O Scoliosis Day é o ponto de encontro global para a vanguarda do tratamento da escoliose. Com uma filosofia pautada na educação e na ciência de alta qualidade, o evento reúne cirurgiões da coluna vertebral, fisioterapeutas, ortesistas de prestígio internacional, residentes e outros profissionais envolvidos no cuidado da escoliose.',
    aboutPageCard1Title: 'Por que participar?',
    aboutPageCard1Text: 'É uma experiência única com os maiores nomes da área, construir networking estratégico e ampliar sua visão sobre os desafios e avanços no cuidado com a escoliose.',
    aboutPageCard2Title: 'Interatividade em foco!',
    aboutPageCard2Text: 'Diferente de um congresso, o Scoliosis Day sempre nos dá a oportunidade de vivência com palestrantes de relevância em toda sua duração. Horas juntos trocando conhecimento de alta qualidade sobre as deformidades da coluna vertebral.',
    aboutPageCard3Title: 'Equipe multidisciplinar',
    aboutPageCard3Text: 'Médicos, Fisioterapeutas, Ortesistas e Psicólogos juntos traçando o futuro do tratamento cirúrgico e conservador das deformidades da coluna vertebral.',
    aboutPageRecifeTitle: 'Recife é onde nascemos',
    aboutPageRecifeText: 'Recife, coração pulsante do Nordeste, é muito mais que um destino: é um polo de inovação, conhecimento e calor humano. Com profissionais de excelência e uma cultura de hospitalidade única, o estado oferece uma experiência completa.',
    aboutPageRecifeImageAlt: 'Recife, Pernambuco',

    // ── /hall-de-estrelas ──
    hallOfStarsPageHeroTitle: 'Hall de Estrelas',
    hallOfStarsPageHeroSubtitle: 'Os maiores nomes do tratamento da escoliose reunidos no Scoliosis Day.',
    hallOfStarsPageFeaturedTitle: 'Palestrantes em Destaque',
    hallOfStarsPageFeaturedBadge: 'Destaque',
    hallOfStarsPageAllTitle: 'Todos os Palestrantes',
    hallOfStarsPageSearchPlaceholder: 'Buscar por nome…',
    hallOfStarsPageEmptyTitle: 'Nenhum palestrante encontrado',
    hallOfStarsPageEmptyBody: 'Ainda não há palestrantes cadastrados nas edições publicadas.',

    // ── /patrocinadores ──
    sponsorsPageHeroTitle: 'Patrocinadores',
    sponsorsPageHeroSubtitle: 'Empresas e instituições que tornam o Scoliosis Day possível.',
    sponsorsPageEmptyTitle: 'Nenhum patrocinador cadastrado',
    sponsorsPageEmptyBody: 'Ainda não há patrocinadores nas edições publicadas.',

    // ── /depoimentos ──
    testimonialsPageHeroTitle: 'Depoimentos',
    testimonialsPageHeroSubtitle: 'O que dizem os participantes do Scoliosis Day.',
    testimonialsPageTextTitle: 'Depoimentos',
    testimonialsPageVideoTitle: 'Depoimentos em Vídeo',

    // Patrocinadores — CTA de captação (/sobre e /edicoes)
    sponsorCta: 'Seja um Patrocinador',

    // Rodapé
    footerTagline: 'O maior encontro sobre escoliose do Brasil, reunindo cirurgiões, fisioterapeutas e profissionais da saúde.',
    footerAbteText: 'Com apoio da Associação Brasileira de Tratamento da Escoliose (ABTE).',
    footerNavLabel: 'Navegação do rodapé',
    footerSiteMap: 'Navegue',
    footerContactTitle: 'Contato',
    contactEmail: 'contato@scoliosisday.com.br',
    contactInstagram: '@scoliosisday',
    footerCopyright: '© {year} Scoliosis Day. Todos os direitos reservados.',

    // 404 do site público
    notFoundTitle: 'Página não encontrada',
    notFoundBody: 'O endereço que você acessou não existe ou foi movido.',
    notFoundBack: 'Voltar para o início',
  },

  toast: {
    saved: 'Salvo com sucesso.',
    deleted: 'Excluído com sucesso.',
    error: 'Erro ao salvar. Tente novamente.',
    uploadSuccess: 'Arquivo enviado com sucesso.',
    uploadError: 'Erro no upload. Verifique o arquivo e tente novamente.',
    inviteSent: 'Convite enviado com sucesso.',
    passwordUpdated: 'Senha atualizada com sucesso.',
    staffApproved: 'Cadastro aprovado com sucesso.',
    staffRejected: 'Cadastro recusado.',
  },
};

export default t;
