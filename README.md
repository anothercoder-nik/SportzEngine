# 🏏🏈 Live Sports API Integration Guide

> How to replace your dummy seed data with **real-time live scores and commentary** from free sports APIs.

---

## 📌 Overview

Your SportzEngine backend is already built for real-time updates. Currently you use `seed.js` to simulate commentary. To go live, you need to:

1. **Poll a sports API** for live match data on a timer (every 10–30 seconds)
2. **INSERT new commentary** into your Neon database
3. **Broadcast via WebSocket** — your existing `broadcastMatchCreated()` handles this

The only new code you need is a **poller service** that replaces `seed.js`.

---

## 🆓 Free Sports APIs

### 🏏 Cricket (Indian Sports — IPL, International)

#### 1. CricAPI (cricapi.com)

| Detail       | Info                                                     |
|--------------|----------------------------------------------------------|
| **URL**      | https://www.cricapi.com                                  |
| **Free Tier**| 100 requests/day                                         |
| **Coverage** | IPL, International Tests, ODIs, T20s                     |
| **Auth**     | API Key (sign up required)                               |
| **Docs**     | https://www.cricapi.com/how-to-use.aspx                  |

**Key Endpoints:**

```
GET https://api.cricapi.com/v1/currentMatches?apikey=YOUR_KEY
GET https://api.cricapi.com/v1/match_scorecard?apikey=YOUR_KEY&id=MATCH_ID
```

**Sample Response:**

```json
{
  "data": [
    {
      "id": "d108ff0c-5243-4e5c-8b8d-c4e1e959c4b0",
      "name": "India vs Australia, 3rd Test",
      "status": "India lead by 42 runs",
      "score": [
        { "r": 263, "w": 10, "o": 78.2, "inning": "India 1st Innings" },
        { "r": 221, "w": 10, "o": 68.4, "inning": "Australia 1st Innings" }
      ]
    }
  ]
}
```

---

#### 2. CricketData.org

| Detail       | Info                                               |
|--------------|----------------------------------------------------|
| **URL**      | https://cricketdata.org                            |
| **Free Tier**| 100 requests/day                                   |
| **Coverage** | International + domestic cricket                   |
| **Auth**     | API Key                                            |
| **Docs**     | https://cricketdata.org/docs                       |

**Key Endpoints:**

```
GET https://api.cricketdata.org/v1/currentMatches?apikey=YOUR_KEY
GET https://api.cricketdata.org/v1/match_info?apikey=YOUR_KEY&id=MATCH_ID
```

---

### ⚽ Football (Soccer — Premier League, La Liga, World Cup)

#### 3. Football-Data.org

| Detail       | Info                                               |
|--------------|----------------------------------------------------|
| **URL**      | https://www.football-data.org                      |
| **Free Tier**| 10 requests/min, covers major leagues              |
| **Coverage** | Premier League, La Liga, Serie A, Bundesliga, UCL  |
| **Auth**     | API Key (header: `X-Auth-Token`)                   |
| **Docs**     | https://www.football-data.org/documentation        |

**Key Endpoints:**

```
GET https://api.football-data.org/v4/matches           # Today's matches
GET https://api.football-data.org/v4/matches/{id}      # Single match detail
GET https://api.football-data.org/v4/competitions/PL/matches?status=LIVE
```

**Sample Response:**

```json
{
  "matches": [
    {
      "id": 436882,
      "homeTeam": { "name": "Manchester City" },
      "awayTeam": { "name": "Arsenal" },
      "score": {
        "fullTime": { "home": 2, "away": 1 }
      },
      "status": "IN_PLAY",
      "minute": 67
    }
  ]
}
```

---

#### 4. API-Football (api-football.com)

| Detail       | Info                                               |
|--------------|----------------------------------------------------|
| **URL**      | https://www.api-football.com                       |
| **Free Tier**| 100 requests/day via RapidAPI                      |
| **Coverage** | 900+ leagues worldwide, including ISL (India)      |
| **Auth**     | RapidAPI Key                                       |
| **Docs**     | https://www.api-football.com/documentation-v3      |

**Key Endpoints:**

```
GET https://v3.football.api-sports.io/fixtures?live=all
GET https://v3.football.api-sports.io/fixtures?id=FIXTURE_ID
GET https://v3.football.api-sports.io/fixtures/events?fixture=FIXTURE_ID
```

> ✅ This API covers **ISL (Indian Super League)** — great for Indian football data.

---

### 🏈 American Football (NFL)

#### 5. ESPN API (Unofficial — Free, No Key)

| Detail       | Info                                               |
|--------------|----------------------------------------------------|
| **URL**      | http://site.api.espn.com                           |
| **Free Tier**| Unlimited (unofficial, no key required)            |
| **Coverage** | NFL, College Football                              |
| **Auth**     | None                                               |

**Key Endpoints:**

```
GET http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard
GET http://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=EVENT_ID
```

**Sample Response:**

```json
{
  "events": [
    {
      "id": "401547417",
      "name": "Kansas City Chiefs at San Francisco 49ers",
      "competitions": [{
        "competitors": [
          { "team": { "displayName": "49ers" }, "score": "22" },
          { "team": { "displayName": "Chiefs" }, "score": "25" }
        ],
        "status": { "type": { "description": "In Progress" } }
      }]
    }
  ]
}
```

---

#### 6. The Sports DB (thesportsdb.com)

| Detail       | Info                                               |
|--------------|----------------------------------------------------|
| **URL**      | https://www.thesportsdb.com/api.php                |
| **Free Tier**| Free for non-commercial use                        |
| **Coverage** | NFL, NBA, Cricket, Football — multi-sport          |
| **Auth**     | Free key: `1` for testing                          |

**Key Endpoints:**

```
GET https://www.thesportsdb.com/api/v1/json/1/livescore.php?s=Soccer
GET https://www.thesportsdb.com/api/v1/json/1/livescore.php?s=Cricket
GET https://www.thesportsdb.com/api/v1/json/1/livescore.php?s=NFL
```

---

## 🔧 Integration Architecture

Here's how to wire a live API into your existing backend:

```
                    Every 15 seconds
                   ┌──────────────┐
                   │  Poller Job  │ ──► fetch() from Sports API
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Compare     │ ──► Check if score/events changed
                   │  with DB     │
                   └──────┬───────┘
                          │ (if changed)
                          ▼
              ┌───────────────────────┐
              │ INSERT new commentary │
              │ UPDATE match score    │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ broadcastToAll(wss)   │ ──► Push to all connected clients
              └───────────────────────┘
```

---

## 💻 Example: Poller Service Code

Create a file `backend/src/services/livePoller.js`:

```javascript
import { db } from "../db/db.js";
import { matches, commentary } from "../db/schema.js";
import { eq } from "drizzle-orm";

const POLL_INTERVAL_MS = 15_000; // 15 seconds
const CRICKET_API_KEY = process.env.CRICKET_API_KEY;
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

// ─── Cricket Poller ───────────────────────────────────

async function pollCricket() {
    const res = await fetch(
        `https://api.cricapi.com/v1/currentMatches?apikey=${CRICKET_API_KEY}`
    );
    const { data } = await res.json();

    for (const match of data) {
        // Upsert match into your DB
        // Compare scores, insert commentary if changed
        // Call broadcastCommentary() if new events
    }
}

// ─── Football Poller ──────────────────────────────────

async function pollFootball() {
    const res = await fetch(
        "https://api.football-data.org/v4/matches?status=LIVE",
        { headers: { "X-Auth-Token": FOOTBALL_API_KEY } }
    );
    const { matches: liveMatches } = await res.json();

    for (const match of liveMatches) {
        // Map to your schema format
        // Compare with DB, insert new commentary
        // Broadcast updates
    }
}

// ─── NFL Poller (No Key Required) ─────────────────────

async function pollNFL() {
    const res = await fetch(
        "http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
    );
    const { events } = await res.json();

    for (const event of events) {
        // Extract teams, scores, status
        // Update your DB
        // Broadcast via WebSocket
    }
}

// ─── Start Polling ────────────────────────────────────

export function startPolling(broadcastFn) {
    setInterval(async () => {
        try {
            await Promise.allSettled([
                pollCricket(),
                pollFootball(),
                pollNFL(),
            ]);
        } catch (err) {
            console.error("Polling error:", err);
        }
    }, POLL_INTERVAL_MS);

    console.log(`📡 Live polling started (every ${POLL_INTERVAL_MS / 1000}s)`);
}
```

Then in `index.js`, wire it up:

```javascript
import { startPolling } from './src/services/livePoller.js';

// ... existing setup ...

const { broadcastMatchCreated } = attachWebSocketServer(server);
startPolling(broadcastMatchCreated);
```

---

## 📋 API Comparison Summary

| API                | Sport              | Free Limit      | Key Required | Indian Sports | American Sports |
|--------------------|--------------------|-----------------|-------------|---------------|-----------------|
| **CricAPI**        | Cricket            | 100 req/day     | ✅          | ✅ IPL, Intl  | ❌              |
| **CricketData.org**| Cricket            | 100 req/day     | ✅          | ✅ IPL, Intl  | ❌              |
| **Football-Data**  | Football/Soccer    | 10 req/min      | ✅          | ❌            | ❌              |
| **API-Football**   | Football/Soccer    | 100 req/day     | ✅          | ✅ ISL        | ❌              |
| **ESPN (Unofficial)** | NFL, Multi    | Unlimited       | ❌          | ❌            | ✅ NFL          |
| **TheSportsDB**    | Multi-sport        | Unlimited*      | ❌          | ✅ Cricket    | ✅ NFL          |

\* Free for non-commercial use

---

## 🎯 Recommended Combination

For your project (Indian + American sports), use:

1. **CricAPI** — for IPL and international cricket live scores
2. **Football-Data.org** — for Premier League, La Liga, UCL
3. **ESPN API** — for NFL (no API key needed!)
4. **API-Football** — as a bonus for ISL (Indian Super League)

This gives you coverage across **Cricket, Football, and American Football** — all with free tiers.

---

## ⚠️ Important Notes

1. **Rate Limits** — Most free APIs have daily/minute limits. Cache responses and only poll every 15–30 seconds.
2. **No Real-time Push** — These APIs don't offer WebSocket push; you must **poll** on an interval.
3. **Terms of Service** — ESPN API is unofficial. For production use, consider paid APIs like SportRadar or Opta.
4. **Data Mapping** — Each API returns data in a different format. You'll need adapter functions to map their responses to your `matches` and `commentary` schema.

---

<p align="center">
  <strong>Your WebSocket infrastructure is ready — just plug in the data source! 🚀</strong>
</p>
