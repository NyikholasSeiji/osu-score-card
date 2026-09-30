# OsuScore

A web application for viewing and analyzing osu! player performance and scores.

## About

OsuScore is a full-stack project built around the osu! API. The application allows users to search for osu! players and visualize relevant profile and score information in a simple and organized interface.

## Tech Stack

### Frontend

* React
* Vite
* TypeScript

### Backend

* Node.js 22 or newer
* NestJS
* TypeScript

### API

* osu! API

## Project Structure

```text
osu-score-card/
├── frontend/
└── backend/
```

* `frontend/` — User interface and client-side application.
* `backend/` — REST API and integration with the osu! API.

## Features

* [ ] Search for osu! players
* [ ] Display player profiles
* [ ] Display player statistics
* [ ] Display recent scores
* [ ] Display best scores
* [x] Score card for a single osu! standard score (visual customization + PNG export)
* [ ] Score and performance analysis
* [ ] Responsive interface
* [x] osu! API integration

## Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm

### Clone the repository

```bash
git clone <repository-url>
cd osu-score-card
```

### Backend

Create an OAuth application at https://osu.ppy.sh/home/account/edit#oauth, copy `backend/.env.example` to `backend/.env` and fill in `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET`.

To enable "Log in with osu!" (picking a score from your own recent plays or top performances), register the **Application Callback URL** on that same page as `<APP_URL>/api/auth/osu/callback` — with the defaults that is `http://localhost:5173/api/auth/osu/callback`. Set `APP_URL` in `.env` when the frontend is served from another address. The client secret and the user tokens stay on the backend; the browser only gets an opaque session cookie.

```bash
cd backend
npm install
npm run start:dev
```

Endpoints:

* `GET /api/scores/:id` — osu! standard score normalized for the card (from `GET /scores/{id}` and, for mods that change difficulty, `POST /beatmaps/{id}/attributes`; cached for 10 minutes).
* `GET /api/images?url=` — proxy for `assets.ppy.sh`, `a.ppy.sh` and `osu.ppy.sh` images so the card can be exported as PNG.
* `GET /api/auth/osu` — starts the osu! OAuth login; `GET /api/auth/osu/callback` finishes it and redirects back to `APP_URL`; `POST /api/auth/logout` revokes the token.
* `GET /api/me` — the logged-in user; `GET /api/me/scores?type=recent|best` — their osu! standard scores for the picker (each one is then loaded through `GET /api/scores/:id`).

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:3000`. Paste a score link (e.g. `https://osu.ppy.sh/scores/1485666113`), adjust the appearance and download the card as PNG. Score data is read-only; only the background, colors, layout and visible fields can be changed.

## Development

The project is divided into two independent applications:

```text
Frontend → Backend → osu! API
```

The frontend communicates with the NestJS backend, which is responsible for handling requests and communicating with the osu! API.

## Status

The project is currently under development.

New features, improvements, and documentation will be added as development progresses.

## License

© 2026 **Dunha / Nyikholas Seiji**. All rights reserved.

This project is intended for educational and portfolio purposes.

