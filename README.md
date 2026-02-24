# ⚡ SportzEngine

> **Real-time sports match tracking powered by WebSockets**

A full-stack application that delivers live match scores, commentary, and real-time updates using WebSockets. Built with a modern Node.js backend and React frontend.

<br/>

## 🏗️ Architecture

```
┌───────────────────────┐       WebSocket (wss://)        ┌───────────────────────┐
│                       │ ◄──────────────────────────────► │                       │
│   React Frontend      │       REST API (https://)        │   Express Backend     │
│   (Vite + TypeScript) │ ◄──────────────────────────────► │   (Node.js)           │
│                       │                                  │                       │
└───────────────────────┘                                  └───────────┬───────────┘
                                                                       │
                                                                       ▼
                                                           ┌───────────────────────┐
                                                           │  PostgreSQL (Neon)     │
                                                           │  via Drizzle ORM      │
                                                           └───────────────────────┘
```

<br/>

## ✨ Features

- **Real-time match updates** via WebSocket push notifications
- **Live match cards** with scores, teams, and sport tags (Cricket, Football, Basketball)
- **Live commentary feed** panel with auto-scrolling
- **Match subscription model** — watch/unwatch individual matches
- **Heartbeat ping/pong** to detect and clean up stale connections
- **Paginated match listing** with responsive grid layout
- **Connection status indicator** — instantly see if you're connected

<br/>

## 🛠️ Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 19, TypeScript, Vite                |
| Backend    | Express 5, Node.js (ESM)                  |
| WebSocket  | `ws` library                              |
| Database   | PostgreSQL (Neon — serverless)             |
| ORM        | Drizzle ORM + Drizzle Kit                 |
| Validation | Zod                                       |
| Deployment | Render (frontend + backend separately)    |

<br/>

## 📁 Project Structure

```
SportzEngine/
├── backend/
│   ├── index.js                  # Express + HTTP server entry point
│   ├── drizzle.config.js         # Drizzle Kit configuration
│   ├── package.json
│   └── src/
│       ├── db/
│       │   ├── db.js             # PostgreSQL pool + Drizzle instance
│       │   └── schema.js         # matches & commentary table definitions
│       ├── router/
│       │   └── matches.js        # REST endpoints for matches
│       ├── utils/
│       │   └── match-status.js   # Match status helpers
│       ├── validation/
│       │   ├── matches.js        # Zod schemas for match payloads
│       │   └── commentary.js     # Zod schemas for commentary payloads
│       └── ws/
│           └── server.js         # WebSocket server (attach, broadcast, heartbeat)
│
└── frontend/sportz-frontend/
    ├── index.html
    ├── App.tsx                   # Main application component
    ├── constants.ts              # API & WS base URLs
    ├── types.ts                  # TypeScript interfaces
    ├── components/
    │   ├── MatchCard.tsx         # Individual match card component
    │   ├── LiveFeed.tsx          # Real-time commentary panel
    │   └── StatusIndicator.tsx   # WebSocket connection indicator
    ├── hooks/
    │   ├── useMatchData.ts       # Match data fetching + state management
    │   └── useWebSocket.ts       # WebSocket connection hook
    └── services/
        └── api.ts                # REST API service layer
```

<br/>

## 🗄️ Database Schema

```sql
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│           matches               │       │          commentary             │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id          SERIAL    PK        │◄──────│ match_id   INTEGER   FK → id   │
│ sport       TEXT      NOT NULL  │       │ id         SERIAL    PK        │
│ home_team   TEXT      NOT NULL  │       │ minute     INTEGER             │
│ away_team   TEXT      NOT NULL  │       │ sequence   INTEGER             │
│ status      ENUM      DEFAULT   │       │ period     INTEGER             │
│ start_time  TIMESTAMP           │       │ event_type TEXT                │
│ end_time    TIMESTAMP           │       │ actor      TEXT                │
│ home_score  INTEGER   DEFAULT 0 │       │ team       TEXT                │
│ away_score  INTEGER   DEFAULT 0 │       │ message    TEXT      NOT NULL  │
│ created_at  TIMESTAMP DEFAULT   │       │ metadata   JSONB               │
│             NOW()               │       │ tags       TEXT[]              │
└─────────────────────────────────┘       │ created_at TIMESTAMP DEFAULT   │
                                          │            NOW()               │
                                          └─────────────────────────────────┘
```

<br/>

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **Neon** PostgreSQL database ([neon.tech](https://neon.tech))

### 1. Clone the Repository

```bash
git clone https://github.com/anothercoder-nik/SportzEngine.git
cd SportzEngine
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:pass@your-neon-host/dbname?sslmode=require
PORT=8000
HOST=0.0.0.0
```

Run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

Start the server:

```bash
npm start
```

The server will be running at `http://localhost:8000` with WebSocket at `ws://localhost:8000/ws`.

### 3. Setup Frontend

```bash
cd frontend/sportz-frontend
npm install
```

Create a `.env` file:

```env
# Local Development
VITE_API_BASE_URL="http://localhost:8000"
VITE_WS_BASE_URL="ws://localhost:8000/ws"
```

Start the dev server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

<br/>

## 🔌 WebSocket Protocol

### Connection

Connect to `ws://localhost:8000/ws`. On successful connection, the server sends:

```json
{ "type": "welcome", "payload": { "message": "Welcome to the WebSocket Server" } }
```

### Server → Client Events

| Event Type      | Description                    | Payload                |
|-----------------|--------------------------------|------------------------|
| `welcome`       | Sent on connection             | `{ message: string }`  |
| `match.created` | New match added to the system  | Full match object      |

### Heartbeat

The server sends a `ping` every **30 seconds**. Clients that don't respond with `pong` are automatically terminated.

<br/>

## 📦 Available Scripts

### Backend

| Script           | Command                     | Description                  |
|------------------|-----------------------------|------------------------------|
| `npm start`      | `nodemon index.js`          | Start server (auto-reload)   |
| `npm run db:generate` | `drizzle-kit generate` | Generate SQL migrations      |
| `npm run db:migrate`  | `drizzle-kit migrate`  | Apply migrations to database |

### Frontend

| Script           | Command          | Description                  |
|------------------|------------------|------------------------------|
| `npm run dev`    | `vite`           | Start dev server             |
| `npm run build`  | `vite build`     | Production build             |
| `npm run preview`| `vite preview`   | Preview production build     |

<br/>

## 🌐 Deployment

Both frontend and backend are deployed separately on **Render**.

> **Important:** When deploying, use `wss://` (secure WebSocket) instead of `ws://` for production.

```env
# Production frontend .env
VITE_API_BASE_URL="https://your-backend.onrender.com"
VITE_WS_BASE_URL="wss://your-backend.onrender.com/ws"
```

<br/>

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br/>

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/anothercoder-nik">anothercoder-nik</a>
</p>
