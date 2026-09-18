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

* Node.js
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
* [ ] Score and performance analysis
* [ ] Responsive interface
* [ ] osu! API integration

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

