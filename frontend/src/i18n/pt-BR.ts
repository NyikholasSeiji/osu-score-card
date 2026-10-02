import type { Messages } from './en.ts'

export const ptBR: Messages = {
  locale: 'pt-BR',
  name: 'Português (Brasil)',

  app: {
    title: 'osu! card generator — crie um card do seu score',
    description:
      'Cole o link de um score de osu! standard e gere um card personalizável para compartilhar. Dados fiéis da API oficial, visual do seu jeito.',
    github: 'GitHub',
    language: 'Idioma',
    footer:
      'Não afiliado ao osu! ou à ppy Pty Ltd. Dados obtidos pela API oficial do osu!.',
  },

  intro: {
    heading: 'Transforme um score do osu! em um card para compartilhar',
    lead: 'Cole o link de uma jogada de osu! standard. Os dados vêm direto da API oficial; você só muda o visual.',
    placeholder: 'Link ou ID do score',
    inputLabel: 'Link ou ID do score',
    generate: 'Gerar card',
    loading: 'Buscando…',
    startLabel: 'Comece aqui',
    startHint:
      'Vale qualquer score de osu! standard — até um ID aleatório, se quiser garimpar uma jogada antiga inusitada.',
    readyLabel: 'Card pronto',
    scoreId: 'Score #{id}',
  },

  nav: {
    home: 'Início',
    myPlays: 'Minhas jogadas',
    github: 'GitHub',
  },

  topbar: {
    playerSearch: 'Pesquisar um jogador (ex.: mrekk)…',
    searching: 'Pesquisando…',
    noResults: 'Nenhum jogador com esse nome.',
    searchFailed: 'Não foi possível pesquisar jogadores agora.',
  },

  player: {
    viewing: 'Vendo as jogadas de',
    profile: 'Perfil no osu!',
    close: 'Fechar',
    empty: 'Nenhuma jogada de osu! standard por aqui ainda.',
    loading: 'Carregando jogadas…',
  },

  auth: {
    login: 'Entrar com osu!',
    loginHint: 'para escolher uma jogada sua',
    logout: 'Sair',
    loggedInAs: 'Logado como',
    picker: 'Suas jogadas',
    recent: 'Recentes',
    best: 'Melhores performances',
    checking: 'Verificando login…',
    hide: 'Esconder',
    show: 'Escolher uma jogada minha',
    use: 'Usar esta jogada',
    denied: 'Login cancelado.',
    failed: 'Não foi possível entrar com o osu!. Tente de novo.',
    state: 'A sessão de login expirou. Tente de novo.',
  },

  actions: {
    download: 'Baixar PNG',
    exporting: 'Exportando…',
    reset: 'Restaurar padrão',
    viewOnOsu: 'Ver no osu!',
    hidden: 'Escondidos:',
  },

  errors: {
    invalidInput:
      'Cole um link como https://osu.ppy.sh/scores/123456 ou só o número do score.',
    exportFailed: 'Falha ao exportar a imagem: {error}',
    imageFailed: 'Não foi possível ler a imagem: {error}',
    request: 'Erro {status} ao buscar o score.',
    NOT_LOGGED_IN: 'Você precisa entrar com o osu! primeiro.',
    OSU_LOGIN_FAILED: 'Não foi possível entrar com o osu!. Tente de novo.',
    SCORE_NOT_FOUND: 'Score não encontrado.',
    UNSUPPORTED_RULESET:
      'Por enquanto, apenas scores de osu! standard são suportados.',
    OSU_API_FAILED: 'Falha ao consultar a API do osu!.',
    PLAYER_NOT_FOUND: 'Jogador não encontrado.',
    OSU_CREDENTIALS_MISSING:
      'Credenciais da API do osu! não configuradas no servidor (OSU_CLIENT_ID e OSU_CLIENT_SECRET).',
  },

  panel: {
    hint: 'Clique num bloco do card para selecioná-lo, arraste para mover e use {delete} ou o {close} para escondê-lo.',
    background: 'Fundo',
    backgrounds: {
      beatmap: 'Capa do mapa',
      user: 'Capa do perfil',
      custom: 'Imagem enviada',
      solid: 'Cor sólida',
    },
    upload: 'Enviar imagem…',
    pasteHint:
      'Você também pode colar uma imagem com {shortcut} ou arrastá-la para cima do card.',
    backgroundColor: 'Cor de fundo',
    darken: 'Escurecer',
    blur: 'Desfoque',
    appearance: 'Aparência',
    accent: 'Cor de destaque',
    textColor: 'Cor do texto',
    font: 'Fonte',
    fonts: {
      sans: 'Moderna',
      rounded: 'Arredondada',
      mono: 'Monoespaçada',
    },
    radius: 'Cantos arredondados',
    layout: 'Layout',
    layouts: {
      classic: 'Clássico (960px)',
      compact: 'Compacto (640px)',
    },
    scoreMode: 'Pontuação',
    scoreModes: {
      classic: 'Clássica',
      standardised: 'Padronizada (lazer)',
    },
    blocks: 'Blocos',
    show: 'Mostrar',
    hide: 'Esconder',
    resetOffsets: {
      one: 'Recolocar 1 bloco no lugar',
      other: 'Recolocar {count} blocos no lugar',
    },
  },

  block: {
    resetPosition: 'Voltar para a posição original',
    hide: 'Esconder este bloco',
    labels: {
      header: 'Título do mapa',
      starRating: 'Estrelas',
      grade: 'Rank',
      mods: 'Mods',
      score: 'Pontuação',
      meta: 'Data, cliente e BPM',
      globalRank: 'Ranking global',
      player: 'Jogador',
      accuracy: 'Precisão',
      combo: 'Combo',
      pp: 'PP',
      statistics: 'Great/Ok/Meh/Erros',
    },
  },

  card: {
    by: 'por {artist}',
    mappedBy: 'mapeado por {creator}',
    playedBy: 'Jogado por',
    submittedOn: 'Enviado em',
    playedOn: 'Jogado no',
    bpmLength: 'BPM / duração',
    globalRank: 'Ranking global',
    accuracy: 'Precisão',
    maxCombo: 'Combo máximo',
    pp: 'PP',
    great: 'Great',
    ok: 'Ok',
    meh: 'Meh',
    miss: 'Erros',
  },
}
