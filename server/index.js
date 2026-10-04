/**
 * The Week 02 backend — a gift, same as Week 01.
 *
 * It exists so the frontend has a real, multi-endpoint API to route against:
 *   GET /api/health
 *   GET /api/matches?league=&status=&q=&team=
 *   GET /api/matches/:id
 *   GET /api/teams
 *   GET /api/teams/:id
 *   GET /api/predict/:id
 *   GET /api/crest/:teamId   (a PNG, not JSON — see server/crests.js)
 *
 * Every response is JSON. Errors are JSON too: { error: "message" }.
 * API_LATENCY adds a small delay on purpose so loading skeletons are visible.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

import { TEAMS, LEAGUES, getTeam } from "./data/teams.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLIENT_DIST = join(__dirname, "../client/dist");
import { MATCHES, resultOf } from "./data/matches.js";
import { predictMatch, formPoints } from "./predict.js";
import { aiRationale, aiEnabled } from "./ai.js";
import { getCrest, warmCrests } from "./crests.js";

const app = express();
const PORT = Number(process.env.PORT) || 8788;
const LATENCY = Number(process.env.API_LATENCY ?? 350);

// CORS configuration - allow requests from Vercel and localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Fake latency, dev-only teaching aid.
app.use((req, _res, next) => {
  if (!LATENCY) return next();
  setTimeout(next, LATENCY);
});

// ---------- serializers: what the frontend actually receives ----------

function teamSummary(team) {
  return {
    id: team.id,
    name: team.name,
    short: team.short,
    monogram: team.monogram,
    color: team.color,
    // Our own URL, not the provider's. If we ever change crest source, the frontend
    // doesn't notice — and the monogram in `monogram` stays as the fallback.
    crest: `/api/crest/${team.id}`,
    league: team.league,
    rating: team.rating,
    form: team.form,
    formPoints: formPoints(team.form),
  };
}

function serializeMatch(match) {
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  const prediction = predictMatch(match);

  return {
    id: match.id,
    league: match.league,
    stage: match.stage,
    kickoff: match.kickoff,
    venue: home.stadium,
    status: match.status,
    score: match.score,
    result: resultOf(match),
    home: teamSummary(home),
    away: teamSummary(away),
    // A summary of the model so list cards can draw a bar without N extra requests.
    // The full prediction — factors, rationale, expected goals — lives at /api/predict/:id.
    model: {
      pick: prediction.pick,
      confidence: prediction.confidence,
      probabilities: prediction.probabilities,
    },
  };
}

function serializeTeam(team) {
  const played = MATCHES.filter(
    (m) => (m.homeId === team.id || m.awayId === team.id) && m.status === "finished",
  ).map(serializeMatch);

  const upcoming = MATCHES.filter(
    (m) => (m.homeId === team.id || m.awayId === team.id) && m.status === "upcoming",
  ).map(serializeMatch);

  return {
    ...teamSummary(team),
    country: team.country,
    stadium: team.stadium,
    manager: team.manager,
    lastSeason: team.lastSeason,
    results: played.sort((a, b) => new Date(b.kickoff) - new Date(a.kickoff)),
    fixtures: upcoming.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)),
  };
}

// ---------- routes ----------

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    dataset: "synthetic",
    matches: MATCHES.length,
    teams: TEAMS.length,
    leagues: LEAGUES,
    aiRationale: aiEnabled() ? "enabled" : "template",
  });
});

app.get("/api/matches", (req, res) => {
  const { league, status, q, team } = req.query;
  let rows = MATCHES.map(serializeMatch);

  if (league && league !== "all") rows = rows.filter((m) => m.league === league);
  if (status && status !== "all") rows = rows.filter((m) => m.status === status);
  if (team) rows = rows.filter((m) => m.home.id === team || m.away.id === team);
  if (q) {
    const needle = String(q).toLowerCase();
    rows = rows.filter(
      (m) =>
        m.home.name.toLowerCase().includes(needle) ||
        m.away.name.toLowerCase().includes(needle) ||
        m.league.toLowerCase().includes(needle),
    );
  }

  rows.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  res.json({ count: rows.length, leagues: LEAGUES, matches: rows });
});

app.get("/api/matches/:id", (req, res) => {
  const match = MATCHES.find((m) => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: `No match with id "${req.params.id}"` });
  res.json(serializeMatch(match));
});

app.get("/api/teams", (_req, res) => {
  const rows = TEAMS.map((t) => ({
    ...teamSummary(t),
    country: t.country,
    stadium: t.stadium,
    lastSeason: t.lastSeason,
  })).sort((a, b) => b.rating - a.rating);
  res.json({ count: rows.length, leagues: LEAGUES, teams: rows });
});

app.get("/api/teams/:id", (req, res) => {
  const team = getTeam(req.params.id);
  if (!team) return res.status(404).json({ error: `No team with id "${req.params.id}"` });
  res.json(serializeTeam(team));
});

/**
 * The one endpoint that doesn't return JSON.
 *
 * We look the club up by OUR id, so nothing in the URL is ever passed to the file system or
 * the upstream provider — that's what keeps a request like /api/crest/../../etc/passwd
 * harmless. A miss returns 404 and the UI falls back to the monogram crest.
 */
app.get("/api/crest/:teamId", async (req, res) => {
  const team = getTeam(req.params.teamId);
  if (!team) return res.status(404).json({ error: `No team with id "${req.params.teamId}"` });

  const png = await getCrest(team.crestId);
  if (!png) return res.status(404).json({ error: `No crest available for "${team.id}"` });

  res.set("Content-Type", "image/png");
  res.set("Cache-Control", "public, max-age=604800, immutable"); // a week; crests don't move
  res.send(png);
});

app.get("/api/predict/:id", async (req, res) => {
  const match = MATCHES.find((m) => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: `No match with id "${req.params.id}"` });

  const prediction = predictMatch(match);
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);

  const written = await aiRationale({ home, away, match, prediction });
  if (written) {
    prediction.rationale = written;
    prediction.rationaleSource = "ai";
  }

  res.json(prediction);
});

// Unknown API route -> JSON 404 (not an HTML error page).
app.use("/api", (req, res) => {
  res.status(404).json({ error: `Unknown endpoint ${req.method} ${req.originalUrl}` });
});

// Serve static files from client build (optional - only if client/dist exists)
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  
  // SPA fallback: serve index.html for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(join(CLIENT_DIST, "index.html"));
  });
} else {
  // If no client build, just return a message for non-API routes
  app.get("*", (req, res) => {
    res.json({ 
      message: "API Only - No client build available",
      api: "/api/health"
    });
  });
}

app.listen(PORT, async () => {
  console.log(`\n  FIFA Prediction Engine API`);
  console.log(`  http://localhost:${PORT}/api/health`);
  console.log(`  ${MATCHES.length} matches · ${TEAMS.length} teams · rationale: ${aiEnabled() ? "AI" : "template"}`);
  console.log(`  latency simulation: ${LATENCY}ms`);
  console.log(`  CORS allowed origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000'}`);

  // Warm the crest cache in the background. Offline after this, and it never blocks startup.
  const cached = await warmCrests(TEAMS);
  console.log(`  crests ready: ${cached}/${TEAMS.length} (cached in .cache/crests)\n`);
});
