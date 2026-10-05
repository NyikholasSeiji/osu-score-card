export const en = {
  locale: 'en-US',
  name: 'English',

  app: {
    title: 'osu! card generator — turn a score into a shareable card',
    description:
      'Paste a link to an osu! standard score and get a customisable card ready to share. Faithful data from the official API, your visual style.',
    github: 'GitHub',
    language: 'Language',
    footer:
      'Not affiliated with osu! or ppy Pty Ltd. Data comes from the official osu! API.',
  },

  intro: {
    heading: 'Turn an osu! score into a card to share',
    lead: 'Paste a link to an osu! standard play. The data comes straight from the official API; you only change the visuals.',
    placeholder: 'Score link or ID',
    inputLabel: 'Score link or ID',
    generate: 'Generate card',
    loading: 'Loading…',
    startLabel: 'Start here',
    startHint:
      'Any osu! standard score works — even a random ID, if you want to dig up an unusual old play.',
    readyLabel: 'Card ready',
    scoreId: 'Score #{id}',
  },

  nav: {
    home: 'Home',
    myPlays: 'My plays',
    github: 'GitHub',
  },

  topbar: {
    playerSearch: 'Search a player (e.g. mrekk)…',
    searching: 'Searching…',
    noResults: 'No player with that name.',
    searchFailed: 'Could not search players right now.',
  },

  player: {
    viewing: 'Browsing the plays of',
    profile: 'Profile on osu!',
    close: 'Close',
    empty: 'No osu! standard plays here yet.',
    loading: 'Loading plays…',
  },

  auth: {
    login: 'Log in with osu!',
    loginHint: 'to pick one of your own plays',
    logout: 'Log out',
    loggedInAs: 'Logged in as',
    picker: 'Your plays',
    recent: 'Recent',
    best: 'Top performances',
    checking: 'Checking login…',
    hide: 'Hide',
    show: 'Pick one of my plays',
    use: 'Use this play',
    denied: 'Login cancelled.',
    failed: 'Could not log in with osu!. Try again.',
    state: 'The login session expired. Try again.',
  },

  actions: {
    download: 'Download PNG',
    exporting: 'Exporting…',
    reset: 'Reset style',
    viewOnOsu: 'View on osu!',
    hidden: 'Hidden:',
  },

  errors: {
    invalidInput:
      'Paste a score link like https://osu.ppy.sh/scores/123456 or just the score number.',
    exportFailed: 'Could not export the image: {error}',
    imageFailed: 'Could not read the image: {error}',
    skinFailed: 'Could not read the skin: {error}',
    SKIN_EMPTY:
      'This skin has no rank or mod icons (ranking-*.png / selection-mod-*.png).',
    SKIN_UNSUPPORTED:
      'This browser cannot unpack .osk files; try a current Chrome, Edge, Firefox or Safari.',
    request: 'Error {status} while fetching the score.',
    NOT_LOGGED_IN: 'You need to log in with osu! first.',
    OSU_LOGIN_FAILED: 'Could not log in with osu!. Try again.',
    SCORE_NOT_FOUND: 'Score not found.',
    UNSUPPORTED_RULESET: 'Only osu! standard scores are supported for now.',
    OSU_API_FAILED: 'Could not reach the osu! API.',
    PLAYER_NOT_FOUND: 'Player not found.',
    OSU_CREDENTIALS_MISSING:
      'osu! API credentials are not configured on the server (OSU_CLIENT_ID and OSU_CLIENT_SECRET).',
  },

  panel: {
    hint: 'Click a block on the card to select it, drag to move it and press {delete} or {close} to hide it.',
    background: 'Background',
    backgrounds: {
      beatmap: 'Beatmap cover',
      user: 'Profile cover',
      custom: 'Uploaded image',
      solid: 'Solid colour',
    },
    upload: 'Upload image…',
    pasteHint:
      'You can also paste an image with {shortcut} or drag it onto the card.',
    backgroundColor: 'Background colour',
    darken: 'Darken',
    blur: 'Blur',
    appearance: 'Appearance',
    accent: 'Accent colour',
    textColor: 'Text colour',
    font: 'Font',
    fonts: {
      sans: 'Modern',
      rounded: 'Rounded',
      mono: 'Monospace',
    },
    radius: 'Corner radius',
    layout: 'Layout',
    layouts: {
      classic: 'Classic (960px)',
      compact: 'Compact (640px)',
    },
    scoreMode: 'Score',
    scoreModes: {
      classic: 'Classic',
      standardised: 'Standardised (lazer)',
    },
    icons: 'Icons',
    skinImport: 'Import osu! skin (.osk)…',
    skinLoading: 'Reading skin…',
    skinRemove: 'Use default icons',
    skinHint:
      'Rank and mod icons come from the skin (ranking-*.png, selection-mod-*.png). Anything the skin lacks keeps the default icon. The skin stays saved in this browser.',
    skinLoaded: 'Skin "{name}": {count} icons replaced, the rest use the defaults.',
    blocks: 'Blocks',
    show: 'Show',
    hide: 'Hide',
    resetOffsets: {
      one: 'Move 1 block back into place',
      other: 'Move {count} blocks back into place',
    },
  },

  block: {
    resetPosition: 'Back to the original position',
    hide: 'Hide this block',
    labels: {
      header: 'Map title',
      starRating: 'Star rating',
      grade: 'Grade',
      mods: 'Mods',
      score: 'Score',
      meta: 'Date, client and BPM',
      globalRank: 'Global rank',
      player: 'Player',
      accuracy: 'Accuracy',
      combo: 'Combo',
      pp: 'PP',
      statistics: 'Great/Ok/Meh/Misses',
    },
  },

  card: {
    by: 'by {artist}',
    mappedBy: 'mapped by {creator}',
    playedBy: 'Played by',
    submittedOn: 'Submitted on',
    playedOn: 'Played on',
    bpmLength: 'BPM / length',
    globalRank: 'Global ranking',
    accuracy: 'Accuracy',
    maxCombo: 'Max combo',
    pp: 'PP',
    great: 'Great',
    ok: 'Ok',
    meh: 'Meh',
    miss: 'Misses',
  },
}

export type Messages = typeof en
