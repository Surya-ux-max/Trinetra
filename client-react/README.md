# TRINETRA — React Frontend

Modern React frontend for the TRINETRA AI Border Surveillance System.

## Features

- **Landing Page** — Full marketing site with animated Indian flag, capabilities, architecture, and mission sections
- **Login Page** — Secure PIN-based authentication with keypad interface
- **Dashboard** — Real-time command center with:
  - Live alert feed via WebSocket
  - Statistics cards (total alerts, high threats, persons, vehicles)
  - 3 sector video upload panels (Alpha, Bravo, Charlie)
  - System status panel
  - Officer command dispatch
  - Evidence archiving

## Tech Stack

- **React 18** with Vite
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **WebSocket** for real-time updates
- **Canvas API** for animated flag

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Environment Configuration

The API base URL is configured in `src/utils/api.js`:

```javascript
const API_BASE = 'http://localhost:8000';
export const WS_URL = 'ws://localhost:8000/ws';
```

Update these if your backend runs on a different host/port.

## Default Login PIN

```
000000
```

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components (Ticker, WavingFlag)
│   ├── dashboard/        # Dashboard-specific components
│   └── landing/          # Landing page sections (if needed)
├── hooks/                # Custom React hooks (useWebSocket)
├── pages/                # Page components (Landing, Login, Dashboard)
├── utils/                # Utilities (API client)
├── App.jsx               # Main app with routing
├── main.jsx              # Entry point
└── index.css             # Global styles + Tailwind
```

## API Endpoints Used

- `GET /alerts/history` — Load alert history
- `DELETE /alerts/history` — Clear alert history
- `POST /command` — Send officer command
- `POST /upload-sector-video/{sector}` — Upload sector video
- `GET /sectors/status` — Get sector processing status
- `WS /ws` — WebSocket for real-time updates

## WebSocket Message Types

- `alert` — New alert detected
- `command` — Command broadcast
- `sector_progress` — Video processing progress
- `sector_done` — Video processing complete

## License

Classified — Ministry of Defence, Government of India
