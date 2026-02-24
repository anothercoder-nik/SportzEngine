# ⚡ SportzEngine

> **Real-time sports match tracking & live commentary engine powered by WebSockets**

A full-stack application delivering live match scores, ball-by-ball commentary, and real-time updates using WebSockets. Features Arcjet-powered security, APM monitoring, and a sophisticated seed system for simulating live match feeds.

<br/>

## 🏗️ Architecture

```
┌───────────────────────┐       WebSocket (wss://)        ┌───────────────────────┐
│                       │ ◄──────────────────────────────► │                       │
│   React Frontend      │       REST API (https://)        │   Express Backend     │
│   (Vite + TypeScript) │ ◄──────────────────────────────► │   (Node.js + ESM)     │
│                       │                                  │                       │
└───────────────────────┘                                  └───────────┬───────────┘
                                                                       │
                                                              ┌────────┼────────┐
                                                              ▼        ▼        ▼
                                                         ┌─────────┐ ┌─────┐ ┌──────┐
                                                         │ Neon DB │ │Arcjet│ │ APM  │
                                                         │ (PgSQL) │ │Shield│ │Insight│
                                                         └─────────┘ └─────┘ └──────┘
```

<br/>

## ✨ Features

- **Real-time match updates** via WebSocket push (match creation + commentary)
- **Live commentary feed** — ball-by-ball or minute-by-minute updates with auto-scrolling
- **Match cards** with scores, teams, sport tags (Cricket, Football, Basketball)
- **Match subscription model** — watch/unwatch individual matches
- **Arcjet security** — rate limiting, bot detection, and shield protection (dev/prod modes)
- **APM monitoring** via Site24x7 APMInsight for production observability
- **Seed system** — simulate live match feeds from JSON data across multiple matches
- **Heartbeat ping/pong** to detect and clean up stale WebSocket connections
- **Database indexes** on `matches` and `commentary` tables for optimized queries
- **CORS enabled** for cross-origin frontend deployments
- **Connection status indicator** — instantly see if you're connected

<br/>

## 🛠️ Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | React 19, TypeScript, Vite                    |
| Backend     | Express 5, Node.js (ESM)                      |
| WebSocket   | `ws` library                                  |
| Database    | PostgreSQL (Neon — serverless)                 |
| ORM         | Drizzle ORM + Drizzle Kit                     |
| Validation  | Zod                                           |
| Security    | Arcjet (rate limiting, bot detection, shield)  |
| Monitoring  | Site24x7 APMInsight                           |
| Deployment  | Render / Railway                               |

<br/>

## 📁 Project Structure

```
SportzEngine/
├── backend/
│   ├── index.js                     # Express + HTTP + WebSocket entry point
│   ├── apminsightnode.json          # APM agent configuration
│   ├── drizzle.config.js            # Drizzle Kit configuration
│   ├── package.json
│   ├── RAILWAY_DEPLOYMENT_GUIDE.md  # Step-by-step Railway deploy guide
│   └── src/
│       ├── arcjet.js                # Arcjet security (rate limit, shield, bot detection)
│       ├── db/
│       │   ├── db.js                # PostgreSQL pool + Drizzle instance
│       │   └── schema.js            # matches & commentary tables (with indexes)
│       ├── data/
│       │   └── data.json            # Seed data: 18 matches + 1080 commentary entries
│       ├── router/
│       │   ├── matches.js           # REST: GET/POST matches, PATCH score
│       │   └── commentary.js        # REST: GET/POST commentary per match
│       ├── seed/
│       │   └── seed.js              # Match feed simulator (seeds via API)
│       ├── utils/
│       │   └── match-status.js      # Match status helpers
│       ├── validation/
│       │   ├── matches.js           # Zod schemas for match payloads
│       │   └── commentary.js        # Zod schemas for commentary payloads
│       └── ws/
│           └── server.js            # WebSocket server (attach, broadcast, heartbeat)
│
└── frontend/sportz-frontend/
    ├── index.html
    ├── App.tsx                      # Main application component
    ├── constants.ts                 # API & WS base URLs from env vars
    ├── types.ts                     # TypeScript interfaces
    ├── components/
    │   ├── MatchCard.tsx            # Individual match card UI
    │   ├── LiveFeed.tsx             # Real-time commentary panel
    │   └── StatusIndicator.tsx      # WebSocket connection indicator
    ├── hooks/
    │   ├── useMatchData.ts          # Match data fetching + state management
    │   └── useWebSocket.ts          # WebSocket connection hook
    └── services/
        └── api.ts                   # REST API service layer
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
│ status      ENUM      DEFAULT   │       │ period     TEXT                │
│             'scheduled'         │       │ event_type TEXT                │
│ start_time  TIMESTAMP           │       │ actor      TEXT                │
│ end_time    TIMESTAMP           │       │ team       TEXT                │
│ home_score  INTEGER   DEFAULT 0 │       │ message    TEXT      NOT NULL  │
│ away_score  INTEGER   DEFAULT 0 │       │ metadata   JSONB               │
│ created_at  TIMESTAMP DEFAULT   │       │ tags       TEXT[]              │
│             NOW()               │       │ created_at TIMESTAMP DEFAULT   │
│                                 │       │            NOW()               │
│ 📇 INDEX: created_at           │       │                                 │
│ 📇 INDEX: status               │       │ 📇 INDEX: match_id             │
└─────────────────────────────────┘       │ 📇 INDEX: created_at           │
                                          └─────────────────────────────────┘
```

<br/>

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **Neon** PostgreSQL database ([neon.tech](https://neon.tech))
- An **Arcjet** API key ([arcjet.com](https://arcjet.com)) — for security features

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
# Database
DATABASE_URL=postgresql://user:pass@your-neon-host/dbname?sslmode=require

# Server
PORT=8000
HOST=0.0.0.0

# Arcjet Security
ARCJET_KEY=your_arcjet_key_here
ARCJET_MODE=development
ARCJET_ENV=development
NODE_ENV=development

# Seed Configuration
API_URL="http://localhost:8000"
DELAY_MS="250"
```

Run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

Start the server:

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

The server will be running at `http://localhost:8000` with WebSocket at `ws://localhost:8000/ws`.

### 3. Seed the Database

With the server running, open a new terminal:

```bash
npm run seed
```

This reads `src/data/data.json` (18 matches across football, cricket, basketball) and inserts commentary entries one-by-one via the API, simulating a live feed with a 250ms delay between events.

### 4. Setup Frontend

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

The frontend will be available at `http://localhost:5173`.

<br/>

## 🔒 Security (Arcjet)

Arcjet provides three layers of protection with **separate configurations for development and production**:

| Feature         | Development         | Production                                   |
|-----------------|---------------------|----------------------------------------------|
| **Rate Limit**  | ✅ 50 req/10s (HTTP) | ✅ 50 req/10s (HTTP)                         |
| **WS Rate Limit** | ✅ 5 req/2s       | ✅ 5 req/2s                                   |
| **Shield**      | ❌ Disabled          | ✅ Active                                     |
| **Bot Detection** | ❌ Disabled        | ✅ Active (allows search engines & previews)  |

Toggle via `ARCJET_MODE` in `.env`. The security middleware is currently commented out in `index.js` — uncomment `app.use(securityMiddleware())` to enable.

<br/>

## 🔌 WebSocket Protocol

### Connection

Connect to `ws://localhost:8000/ws`. On successful connection, the server sends:

```json
{ "type": "welcome", "payload": { "message": "Welcome to the WebSocket Server" } }
```

### Server → Client Events

| Event Type         | Description                          | Payload             |
|--------------------|--------------------------------------|---------------------|
| `welcome`          | Sent on connection                   | `{ message }`       |
| `match.created`    | New match added to the system        | Full match object   |
| `commentary.added` | New commentary for a subscribed match | Commentary object  |

### Heartbeat

The server sends a `ping` every **30 seconds**. Clients that don't respond with `pong` are automatically terminated.

<br/>

## 📡 REST API Endpoints

### Matches

| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| GET    | `/matches`             | List matches (with `?limit=N`) |
| POST   | `/matches`             | Create a new match             |
| PATCH  | `/matches/:id/score`   | Update match score (live only) |

### Commentary

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/matches/:id/commentary`         | List commentary (with `?limit=N`)  |
| POST   | `/matches/:id/commentary`         | Add commentary entry               |

<br/>

## 📦 Available Scripts

### Backend

| Script               | Command                      | Description                        |
|----------------------|------------------------------|------------------------------------|
| `npm start`          | `node index.js`              | Start production server            |
| `npm run dev`        | `nodemon index.js`           | Start dev server (auto-reload)     |
| `npm run db:generate`| `drizzle-kit generate`       | Generate SQL migrations            |
| `npm run db:migrate` | `drizzle-kit migrate`        | Apply migrations to database       |
| `npm run seed`       | `node src/seed/seed.js`      | Seed matches + commentary via API  |

### Frontend

| Script              | Command         | Description               |
|---------------------|-----------------|---------------------------|
| `npm run dev`       | `vite`          | Start dev server          |
| `npm run build`     | `vite build`    | Production build          |
| `npm run preview`   | `vite preview`  | Preview production build  |

<br/>

## 🌐 Deployment

### Render

Deploy frontend and backend separately on **Render**.

```env
# Production frontend .env
VITE_API_BASE_URL="https://sportzengine.onrender.com"
VITE_WS_BASE_URL="wss://sportzengine.onrender.com/ws"
```

### Railway

A detailed step-by-step guide is available at **[`backend/RAILWAY_DEPLOYMENT_GUIDE.md`](./backend/RAILWAY_DEPLOYMENT_GUIDE.md)**.

> **⚠️ Important:** Always use `wss://` (secure WebSocket) for production deployments over HTTPS.

<br/>

## 📊 Monitoring (APM)

The backend uses **Site24x7 APMInsight** for application performance monitoring. Configuration is in `apminsightnode.json`. The agent is loaded at the top of `index.js` before any other imports:

```javascript
import AgentApi from 'apminsight';
AgentApi.config();
```

<br/>

## 🌱 Seed System

The seed system (`src/seed/seed.js`) is a sophisticated match feed simulator:

- Reads 18 matches and 1080+ commentary entries from `src/data/data.json`
- Creates matches via the REST API with **live-compatible timestamps** (auto-adjusted by `SEED_FORCE_LIVE`)
- Inserts commentary one entry at a time with configurable delays (`DELAY_MS`)
- **Randomizes** commentary across matches to simulate a multi-game live feed
- **Cricket-aware**: normalizes innings order and handles batting team logic
- **Clones commentary** from template matches to cover all sports without duplicating data

### Seed Environment Variables

| Variable                      | Default       | Description                         |
|-------------------------------|---------------|-------------------------------------|
| `API_URL`                     | *(required)*  | Backend URL to seed against         |
| `DELAY_MS`                    | `250`         | Ms between commentary insertions    |
| `SEED_FORCE_LIVE`             | `true`        | Auto-adjust times to make matches live |
| `SEED_MATCH_DURATION_MINUTES` | `120`         | Default match duration in minutes   |

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
