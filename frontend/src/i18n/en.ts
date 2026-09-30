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
    request: 'Error {status} while fetching the score.',
    SCORE_NOT_FOUND: 'Score not found.',
    UNSUPPORTED_RULESET: 'Only osu! standard scores are supported for now.',
    OSU_API_FAILED: 'Could not reach the osu! API.',
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
