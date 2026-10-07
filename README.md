# osu! card generator

Turn any osu! standard score into a polished, shareable card — straight from the official osu! API.

**Live:** https://osu-score-card.onrender.com

## About

Paste a score link (or ID), search for a player, or log in with your osu! account to pick one of your own plays. The app fetches the official data, renders a card you can restyle freely and exports it as a PNG.

The score data is **read-only**: you can change how the card looks, never what it says.

## Features

### Finding a score

* Paste a score link or ID — works for any public osu! standard score, from any player (even a random ID, if you want to dig up an old play).
* Search a player by name in the top bar and browse their public **Recent** and **Best** performances, no login needed.
* **Log in with osu!** (OAuth) to pick from your own Recent / Best plays. The client secret and tokens never leave the server; the browser only holds a session cookie.

### The card

* Grade, score, mods, accuracy, max combo, PP, hit counts, global ranking, player, beatmap, star rating (recalculated for mods such as DT/HR), date and client (Stable / Lazer).
* Classic (960 px) and Compact (640 px) layouts.
* Classic or standardised (Lazer) score display.
* Consistent icons for every rank (SS/SSH/S/SH/A–F) and mod returned by the API, with a text fallback for unknown acronyms.
* **Import an osu! skin (`.osk`)** to use its `ranking-*` and `selection-mod-*` icons; whatever the skin lacks keeps the default icon. The skin is kept in the browser.

### Visual editor

* Background: beatmap cover, profile cover, solid colour, or your own image (upload, **paste with Ctrl+V**, or drag and drop). Darken and blur sliders.
* Accent colour, text colour, font (Modern / Rounded / Monospace) and corner radius.
* Click any block on the card to select it, drag to move it, press Delete (or ✕) to hide it, and bring it back from the Blocks list.
* **Undo / Redo** for every change (Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y).
* Touch screens: press and hold a block for half a second to select it, then drag — a quick tap or swipe just scrolls.
* **Download PNG** exports exactly what you see, without the editor controls.

### App

* English (default) and Português (Brasil).
* Responsive layout for desktop and mobile.
* Deployable as a single service (Render blueprint included).

## Tech Stack

| Layer    | Stack                                                                                  |
| -------- | -------------------------------------------------------------------------------------- |
| Frontend | React 19, Vite, TypeScript, `html-to-image` (PNG export), ESLint                       |
| Backend  | Node.js 22+, NestJS, TypeScript, `osu-api-v2-js` (osu! API v2), Vitest, oxlint         |
| Data     | [osu! API v2](https://osu.ppy.sh/docs/index.html) — client credentials + OAuth authorization code |
| Hosting  | Render (one web service: the backend serves the built frontend)                        |

## Project Structure

```text
osu-score-card/
├── frontend/      # Vite + React UI: search, card, visual editor, PNG export, i18n
├── backend/       # NestJS REST API: osu! API integration, OAuth, image proxy
└── render.yaml    # Render blueprint (single web service)
```

## Getting Started

### Prerequisites

* Node.js 22 or newer (`node -v`)
* npm
* An osu! OAuth application: https://osu.ppy.sh/home/account/edit#oauth

### Clone the repository

```bash
git clone https://github.com/NyikholasSeiji/osu-score-card.git
cd osu-score-card
```

### Backend

Copy `backend/.env.example` to `backend/.env` and fill in `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET`.

To enable **Log in with osu!**, register the **Application Callback URL** of your OAuth app as `<APP_URL>/api/auth/osu/callback` — with the defaults that is `http://localhost:5173/api/auth/osu/callback`. Set `APP_URL` in `.env` when the frontend is served from another address. Player search and link/ID lookup work without login.

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to `http://localhost:3000`.

### Useful scripts

| Where      | Command             | What it does                 |
| ---------- | ------------------- | ---------------------------- |
| `backend/` | `npm run lint`      | oxlint                       |
| `backend/` | `npm test`          | Vitest unit tests            |
| `backend/` | `npm run build`     | Compile to `dist/`           |
| `frontend/`| `npm run lint`      | ESLint                       |
| `frontend/`| `npm run build`     | Type-check and build `dist/` |

## API

All routes are served by the backend under `/api`.

| Method | Route                                 | Description                                                                                                                |
| ------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/scores/:id`                     | osu! standard score normalised for the card (star rating recalculated for difficulty-changing mods). Cached for 10 minutes. |
| GET    | `/api/images?url=`                    | Proxy for `assets.ppy.sh`, `a.ppy.sh` and `osu.ppy.sh` images, so the card can be exported as PNG.                          |
| GET    | `/api/users/search?q=`                | Public player search (2+ characters, up to 8 results).                                                                      |
| GET    | `/api/users/:id/scores?type=recent\|best` | A player's public osu! standard scores.                                                                                  |
| GET    | `/api/auth/osu`                       | Starts the osu! OAuth login.                                                                                                |
| GET    | `/api/auth/osu/callback`              | Finishes the login and redirects back to `APP_URL`.                                                                         |
| POST   | `/api/auth/logout`                    | Revokes the token and clears the session.                                                                                   |
| GET    | `/api/me`                             | The logged-in user.                                                                                                         |
| GET    | `/api/me/scores?type=recent\|best`    | The logged-in user's osu! standard scores.                                                                                  |

Only osu! standard scores are supported for now. Scores from Stable show the classic total score; the standardised (Lazer) value is available in the editor.

## Deploying (Render)

Both apps run as **one** Render web service: the build compiles the frontend and the backend, and the backend serves the frontend's `dist/` (`STATIC_DIR`) next to `/api`, so the session cookie stays on a single origin. `render.yaml` describes the service.

1. On Render choose **New → Blueprint**, pick this repository and apply. Fill in `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET` when prompted (`APP_URL` is not needed: the backend falls back to `RENDER_EXTERNAL_URL`).
2. On https://osu.ppy.sh/home/account/edit#oauth set the **Application Callback URL** to `https://<your-service>.onrender.com/api/auth/osu/callback`.

The same layout works anywhere else: build both apps, then start the backend with `STATIC_DIR=../frontend/dist` and `APP_URL=https://<public-url>`.

Login sessions are kept in memory, so a restart (or the free plan spinning down) logs everyone out. Generating a card from a link never needs a login.

## Architecture

```text
Browser (React) ──/api──▶ NestJS ──▶ osu! API v2
```

The frontend never talks to osu! directly: the backend holds the app credentials, normalises the score data, proxies images and manages OAuth sessions.

## Roadmap

* [ ] Other game modes (taiko, catch, mania)
* [ ] Player profile cards
* [ ] More languages
* [ ] Shareable card links

## Status

Under active development. The score card, player search, osu! login, visual editor, skin import and PNG export are live at https://osu-score-card.onrender.com.

## License

© 2026 **Dunha / Nyikholas Seiji**. All rights reserved.

This project is intended for educational and portfolio purposes. Not affiliated with osu! or ppy Pty Ltd; score data comes from the official osu! API.
