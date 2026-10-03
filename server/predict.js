/**
 * The prediction "engine".
 *
 * Deliberately simple and deterministic: same match in, same numbers out. No API key
 * needed, nothing random. It turns rating + recent form + home advantage into
 * win/draw/loss percentages, a likely scoreline, and the factors behind the call —
 * which is exactly the shape the frontend needs to draw an insight.
 */
import { getTeam } from "./data/teams.js";
import { MATCHES, resultOf } from "./data/matches.js";

const HOME_ADVANTAGE = 4; // rating points, roughly "playing at home is worth this much"
const BASE_GOALS = 1.35; // league-average goals per team per game

/** Last five results -> points. W=3, D=1, L=0. Max 15. */
export function formPoints(form = []) {
  return form.reduce((sum, r) => sum + (r === "W" ? 3 : r === "D" ? 1 : 0), 0);
}

/** Rating nudged by recent form. 7.5 points from five games is "average form". */
function strength(team) {
  return team.rating + (formPoints(team.form) - 7.5) * 0.8;
}

/** Turn three raw shares into whole percentages that add up to exactly 100. */
function toPercents(raw) {
  const entries = Object.entries(raw);
  const scaled = entries.map(([k, v]) => [k, v * 100]);
  const floored = scaled.map(([k, v]) => [k, Math.floor(v), v - Math.floor(v)]);
  let remainder = 100 - floored.reduce((s, [, whole]) => s + whole, 0);
  // Largest-remainder method: hand the leftover points to the biggest fractions.
  const order = [...floored].sort((a, b) => b[2] - a[2]);
  const bump = new Map();
  for (const [k] of order) {
    if (remainder <= 0) break;
    bump.set(k, 1);
    remainder -= 1;
  }
  return Object.fromEntries(floored.map(([k, whole]) => [k, whole + (bump.get(k) ?? 0)]));
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/** Head-to-head record between two teams, from the finished matches in our dataset. */
export function headToHead(homeId, awayId) {
  const meetings = MATCHES.filter(
    (m) =>
      m.status === "finished" &&
      ((m.homeId === homeId && m.awayId === awayId) || (m.homeId === awayId && m.awayId === homeId)),
  );

  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;

  for (const m of meetings) {
    const result = resultOf(m);
    if (result === "draw") draws += 1;
    else if ((result === "home" && m.homeId === homeId) || (result === "away" && m.awayId === homeId)) homeWins += 1;
    else awayWins += 1;
  }

  return { played: meetings.length, homeWins, draws, awayWins };
}

function buildFactors({ home, away, h2h }) {
  const factors = [];

  const ratingGap = home.rating - away.rating;
  factors.push({
    label: "Squad rating",
    detail: `${home.short} ${home.rating} vs ${away.short} ${away.rating}`,
    impact: ratingGap === 0 ? "neutral" : ratingGap > 0 ? "home" : "away",
    weight: clamp(Math.round(Math.abs(ratingGap) * 6), 6, 40),
  });

  const homeForm = formPoints(home.form);
  const awayForm = formPoints(away.form);
  factors.push({
    label: "Recent form",
    detail: `${home.short} ${homeForm}/15 · ${away.short} ${awayForm}/15 from the last five`,
    impact: homeForm === awayForm ? "neutral" : homeForm > awayForm ? "home" : "away",
    weight: clamp(Math.round(Math.abs(homeForm - awayForm) * 3), 5, 30),
  });

  factors.push({
    label: "Home advantage",
    detail: `${home.stadium} — worth about ${HOME_ADVANTAGE} rating points`,
    impact: "home",
    weight: 14,
  });

  const homeGaPerGame = home.lastSeason.ga / home.lastSeason.played;
  const awayGaPerGame = away.lastSeason.ga / away.lastSeason.played;
  factors.push({
    label: "Defensive record",
    detail: `Goals conceded per game last season: ${homeGaPerGame.toFixed(2)} vs ${awayGaPerGame.toFixed(2)}`,
    impact:
      Math.abs(homeGaPerGame - awayGaPerGame) < 0.05 ? "neutral" : homeGaPerGame < awayGaPerGame ? "home" : "away",
    weight: clamp(Math.round(Math.abs(homeGaPerGame - awayGaPerGame) * 25), 5, 25),
  });

  if (h2h.played > 0) {
    factors.push({
      label: "Head to head",
      detail: `${h2h.played} meeting${h2h.played === 1 ? "" : "s"} in our data: ${h2h.homeWins}W ${h2h.draws}D ${h2h.awayWins}L for ${home.short}`,
      impact: h2h.homeWins === h2h.awayWins ? "neutral" : h2h.homeWins > h2h.awayWins ? "home" : "away",
      weight: clamp(h2h.played * 8, 8, 24),
    });
  }

  return factors.sort((a, b) => b.weight - a.weight);
}

function templateRationale({ home, away, probs, pick, scoreline, confidence }) {
  const leader = pick === "home" ? home : pick === "away" ? away : null;
  const opening = leader
    ? `${leader.name} are favoured here at ${probs[pick]}%.`
    : `This one is close enough that a draw is the single most likely outcome (${probs.draw}%).`;

  const formLine =
    formPoints(home.form) === formPoints(away.form)
      ? "Both sides arrive in similar form"
      : formPoints(home.form) > formPoints(away.form)
        ? `${home.short} carry the better recent form`
        : `${away.short} carry the better recent form`;

  return [
    opening,
    `${formLine}, and the model leans on squad rating, the last five results and home advantage at ${home.stadium}.`,
    `Most likely scoreline: ${scoreline.home}-${scoreline.away}. Confidence is ${confidence} — ${
      confidence === "high"
        ? "the gap between these sides is wide."
        : confidence === "medium"
          ? "there is a clear favourite, but not a safe one."
          : "treat this as close to a coin flip."
    }`,
  ].join(" ");
}

/**
 * @param {object} match a raw match from data/matches.js
 * @returns prediction payload — see README for the shape
 */
export function predictMatch(match) {
  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);
  if (!home || !away) throw new Error(`Unknown team on match ${match.id}`);

  const edge = strength(home) + HOME_ADVANTAGE - strength(away);

  // Logistic on the rating edge gives "home beats away, ignoring draws".
  const headToHeadWin = 1 / (1 + Math.exp(-edge / 9));
  // The closer those two are, the more likely a draw becomes.
  const evenness = 1 - Math.abs(headToHeadWin - 0.5) * 2;
  const drawShare = 0.16 + 0.14 * evenness;

  const probs = toPercents({
    home: headToHeadWin * (1 - drawShare),
    draw: drawShare,
    away: (1 - headToHeadWin) * (1 - drawShare),
  });

  const pick = ["home", "draw", "away"].reduce((best, key) => (probs[key] > probs[best] ? key : best), "home");
  const top = probs[pick];
  const confidence = top >= 55 ? "high" : top >= 45 ? "medium" : "low";

  const xgHome = clamp(BASE_GOALS + edge * 0.035, 0.3, 3.8);
  const xgAway = clamp(BASE_GOALS - edge * 0.035, 0.3, 3.8);
  const scoreline = { home: Math.round(xgHome), away: Math.round(xgAway) };

  const h2h = headToHead(match.homeId, match.awayId);
  const factors = buildFactors({ home, away, h2h });

  return {
    matchId: match.id,
    probabilities: probs,
    pick,
    confidence,
    expectedGoals: { home: Number(xgHome.toFixed(2)), away: Number(xgAway.toFixed(2)) },
    scoreline,
    edge: Number(edge.toFixed(2)),
    headToHead: h2h,
    factors,
    rationale: templateRationale({ home, away, probs, pick, scoreline, confidence }),
    rationaleSource: "model",
    dataset: "synthetic",
  };
}
