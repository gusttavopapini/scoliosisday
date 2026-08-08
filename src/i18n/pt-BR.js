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
    // "Edições", não "Eventos" — rótulo do módulo só no painel; a página
    // pública /edicoes já se chama assim e não muda.
    events: 'Edições',
    collaborators: 'Colaboradores',
    // "Marcas", não "Patrocinadores" — rótulo do módulo só no painel; a
    // página pública /patrocinadores (t.site.sponsors, mais abaixo neste
    // arquivo) não muda.
    sponsors: 'Marcas',
    schedules: 'Programação',
    testimonials: 'Depoimentos',
    banners: 'Banners',
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
    totalEvents: 'Edições',
    totalCollaborators: 'Colaboradores',
    // "Marcas" — corrige um esquecimento da rodada que renomeou o módulo de
    // Patrocinadores (só esse card do dashboard tinha ficado pra trás).
    totalSponsors: 'Marcas',
    pendingStaff: 'Cadastros pendentes',
    recentEvents: 'Edições editadas recentemente',
  },

  events: {
    title: 'Edições',
    subtitle: 'Gerencie as edições da plataforma',
    create: 'Nova edição',
    searchPlaceholder: 'Buscar por nome…',
    filterByStatus: 'Filtrar por status',
    name: 'Nome da edição',
    date: 'Data',
    location: 'Local',
    status: 'Status',
    emptyTitle: 'Nenhuma edição cadastrada',
    emptyBody: 'Crie sua primeira edição para começar.',
    deleteConfirm: "Excluir a edição '{name}'? Esta ação não pode ser desfeita.",
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
    title: 'Marcas',
    subtitle: 'Empresas e instituições patrocinadoras e apoiadoras',
    create: 'Nova marca',
    searchPlaceholder: 'Buscar por nome…',
    name: 'Nome',
    website: 'Site',
    emptyTitle: 'Nenhuma marca cadastrada',
    emptyBody: 'Adicione as marcas patrocinadoras e apoiadoras do evento.',
    deleteConfirm: "Excluir a marca '{name}'? Esta ação não pode ser desfeita.",
  },

  banners: {
    title: 'Banners',
    subtitle: 'Banners manuais do carrossel da Home',
    create: 'Novo banner',
    name: 'Título',
    order: 'Ordem',
    status: 'Status',
    active: 'Ativo',
    inactive: 'Inativo',
    emptyTitle: 'Nenhum banner cadastrado',
    emptyBody: 'Adicione banners para exibir no carrossel da Home.',
    deleteConfirm: "Excluir o banner '{name}'? Esta ação não pode ser desfeita.",
    limitReached: 'Limite de 5 banners ativos atingido (incluindo o banner da edição atual). Desative outro banner antes de ativar este.',
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
    academy: 'Academy',
    // Placeholders das páginas ainda por construir.
    comingSoonTitle: 'Em breve',
    comingSoonBody: 'Esta página está sendo construída.',

    // ── Home · O que é o Scoliosis Day ──
    // "Scoliosis Day" no heading é renderizado por <BrandWordmark />, não
    // por este texto — aboutTitleMain é só o que vem antes da marca.
    aboutTitleMain: 'O que é o',
    aboutSubtitle: 'Um encontro que une ciência, prática clínica e formação profissional em torno da escoliose.',
    aboutCard1Title: 'Educação e Ciência de Alto Nível',
    aboutCard1Text: 'Alto padrão científico do cuidado à escoliose no Brasil. Promove atualização constante baseada em evidências e conecta profissionais da saúde às discussões mais avançadas sobre o tratamento das deformidades da coluna.',
    aboutCard2Title: 'Debate Multidisciplinar',
    aboutCard2Text: 'Ao reunir diferentes especialidades em um só espaço, o Scoliosis Day fortalece uma abordagem integrada ao tratamento da escoliose, unindo prática clínica, ciência e indústria em prol de melhores resultados para o paciente.',
    aboutCard3Title: 'Alcance internacional',
    aboutCard3Text: 'O Scoliosis Day ultrapassa fronteiras. Através do Conteúdo Premium e da transmissão ao vivo do evento, já alcançou profissionais em mais de 10 países, incluindo Espanha, Itália, Alemanha e Estados Unidos.',
    // Link no rodapé dos cards "O que é o Scoliosis Day" (Home e Edições).
    learnMore: 'Saiba mais',
    // Abre o modal de detalhes nos cards de pessoa (organizadores, curadoria, Hall de Estrelas).
    viewMore: 'Ver detalhes',
    // Título da seção de currículo no modal "Ver detalhes" do PersonCard.
    personModalCurriculumTitle: 'Currículo',

    // ── Edições (/edicoes) ──
    editionsEmptyTitle: 'Nenhuma edição publicada',
    editionsEmptyBody: 'Ainda não há edições publicadas. Volte em breve.',
    starsTitle: 'Presenças confirmadas',
    // {ordinal} vem de utils/ordinal.js — "1ª", "2ª"...
    editionBadge: '{ordinal} Edição',

    // Página de arquivo de edição passada (ver EditionArchive.jsx) — só o
    // essencial de acessibilidade; título/subtítulo/estatísticas são
    // conteúdo do admin (traduzido via useTranslatedContent, não daqui).
    archiveGalleryOpenLabel: 'Ver galeria completa',
    // {current}/{total} via .replace(), mesmo padrão de editionBadge acima.
    archiveGalleryCounter: '{current} de {total}',

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

    // Comissão organizadora (só em /sobre) / Curadoria Científica.
    // organizersTitle é texto simples — sem <BrandWordmark />, ao contrário
    // do título antigo ("Quem faz o Scoliosis Day"); ver AboutPage.jsx.
    organizersTitle: 'Comissão organizadora',
    curatorsTitle: 'Curadoria científica',

    // ── Home · Apoiadores (esteira) ──
    supportersTitle: 'Apoiadores',

    // ── Home · Depoimentos ──
    testimonialsTitle: 'Depoimentos',
    testimonialsSubtitle: 'Quem viveu o Scoliosis Day conta o impacto do encontro na sua prática.',
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
    aboutPageIntroTitleMain: 'Estamos fazendo',
    aboutPageIntroTitleAccent: 'história!',
    aboutPageIntroText: 'Em quatro edições, o Scoliosis Day saiu de 63 para 272 participantes e já recebeu nomes como Manuel Rigo, Sanja Schreiber, Sabrina Donzelli e René Castelein. Uma trajetória construída, edição após edição, por quem decidiu levar o debate sobre escoliose a sério no Brasil.',
    aboutPageCard1Title: 'Formato Híbrido e Pré-Congresso',
    aboutPageCard1Text: 'O Scoliosis Day conta com tradução simultânea e modalidade online, ampliando o acesso a profissionais de fora do Brasil. O pré-congresso Conteúdo Premium disponibiliza aulas com especialistas antes mesmo do evento presencial.',
    aboutPageCard2Title: 'Networking Qualificado',
    aboutPageCard2Text: 'Os vínculos construídos durante o Scoliosis Day frequentemente resultam em parcerias clínicas e colaborações científicas que se estendem além da programação oficial.',
    aboutPageCard3Title: 'Atuação Integrada',
    aboutPageCard3Text: 'Cirurgiões da coluna vertebral, fisioterapeutas, ortesistas e psicólogos participam da mesma programação, refletindo a abordagem integrada exigida pelo tratamento da escoliose.',
    // "Recife" é <AccentWord/> (--font-accent itálico) — ver AboutRecife.jsx.
    aboutPageRecifeTitleAccent: 'Recife',
    aboutPageRecifeTitleRest: ' é onde nascemos',
    aboutPageRecifeText: 'Recife, coração pulsante do Nordeste, é muito mais que um destino: é um polo de inovação, conhecimento e calor humano. Com profissionais de excelência e uma cultura de hospitalidade única, o estado oferece uma experiência completa.',
    aboutPageRecifeImageAlt: 'Recife, Pernambuco',

    // ── /hall-de-estrelas ──
    hallOfStarsPageHeroTitle: 'Hall de Estrelas',
    hallOfStarsPageHeroSubtitle: 'Os maiores nomes do tratamento da escoliose reunidos no Scoliosis Day.',
    hallOfStarsPageFeaturedTitle: 'Palestrantes em destaque',
    hallOfStarsPageAllTitle: 'Todos os palestrantes',
    hallOfStarsPageSearchPlaceholder: 'Buscar por nome…',
    hallOfStarsPageEmptyTitle: 'Nenhum palestrante encontrado',
    hallOfStarsPageEmptyBody: 'Ainda não há palestrantes cadastrados nas edições publicadas.',

    // ── /patrocinadores ──
    sponsorsPageHeroTitle: 'Patrocinadores',
    sponsorsPageHeroSubtitle: 'Grandes marcas que fazem parte da nossa história',
    sponsorsPageEmptyTitle: 'Nenhum patrocinador cadastrado',
    sponsorsPageEmptyBody: 'Ainda não há patrocinadores nas edições publicadas.',

    // ── Home · Depoimentos em vídeo (/depoimentos foi removida, ver
    // HomePage.jsx) ──
    testimonialsPageVideoTitle: 'Depoimentos em vídeo',

    // Patrocinadores — CTA de captação (/sobre, /edicoes e /patrocinadores)
    sponsorCta: 'Seja um Patrocinador',
    // Endereço próprio, não ligado ao contato do rodapé — não pode mudar
    // junto só porque o CTA de patrocínio mudou de destino.
    sponsorCtaEmail: 'scoliosisday@gmail.com',

    // Rodapé — coluna "Acompanhe" (antes "Contato") só tem o ícone do
    // Instagram, desde que o e-mail saiu dela numa rodada anterior — o
    // rótulo mudou pra refletir isso (ver PublicFooter.jsx).
    footerTagline: 'O maior encontro multidisciplinar sobre escoliose do Brasil. Ciência, prática clínica e alcance internacional, com a visão de transformar o padrão de cuidado ao paciente.',
    footerNavLabel: 'Navegação do rodapé',
    footerSiteMap: 'Navegue',
    footerFollowTitle: 'Acompanhe',
    // Não é exibido como texto — vira aria-label do link-ícone do
    // Instagram no rodapé (ver PublicFooter.jsx).
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
