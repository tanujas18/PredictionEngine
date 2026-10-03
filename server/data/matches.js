/**
 * Seed fixtures for the FIFA Prediction Engine.
 *
 * SYNTHETIC DATA. Real club names, invented fixtures and invented scorelines —
 * written by hand so the app has both settled and unsettled matches to work with.
 * None of these results happened. Do not present them as real.
 *
 * Two statuses matter to the app:
 *   "finished" — has a score, so a saved prediction can be marked right or wrong
 *   "upcoming" — no score yet, so a saved prediction stays pending
 *
 * That mix is what makes the accuracy scoreboard on /my-predictions meaningful.
 */
export const MATCHES = [
  // ---------- finished · July 2026 summer series ----------
  { id: "m01", league: "Premier League", stage: "Summer Series", kickoff: "2026-07-11T16:00:00Z", homeId: "man-city", awayId: "arsenal", status: "finished", score: { home: 1, away: 1 } },
  { id: "m02", league: "Premier League", stage: "Summer Series", kickoff: "2026-07-12T18:30:00Z", homeId: "liverpool", awayId: "chelsea", status: "finished", score: { home: 3, away: 1 } },
  { id: "m03", league: "Premier League", stage: "Summer Series", kickoff: "2026-07-14T19:00:00Z", homeId: "tottenham", awayId: "newcastle", status: "finished", score: { home: 0, away: 2 } },
  { id: "m04", league: "La Liga", stage: "Summer Series", kickoff: "2026-07-15T19:30:00Z", homeId: "real-madrid", awayId: "athletic", status: "finished", score: { home: 2, away: 0 } },
  { id: "m05", league: "La Liga", stage: "Summer Series", kickoff: "2026-07-17T20:00:00Z", homeId: "barcelona", awayId: "atletico", status: "finished", score: { home: 2, away: 3 } },
  { id: "m06", league: "Serie A", stage: "Summer Series", kickoff: "2026-07-18T18:45:00Z", homeId: "inter", awayId: "milan", status: "finished", score: { home: 1, away: 0 } },
  { id: "m07", league: "Serie A", stage: "Summer Series", kickoff: "2026-07-19T18:45:00Z", homeId: "juventus", awayId: "napoli", status: "finished", score: { home: 1, away: 1 } },
  { id: "m08", league: "Bundesliga", stage: "Summer Series", kickoff: "2026-07-21T17:30:00Z", homeId: "bayern", awayId: "dortmund", status: "finished", score: { home: 4, away: 2 } },
  { id: "m09", league: "Bundesliga", stage: "Summer Series", kickoff: "2026-07-22T17:30:00Z", homeId: "leverkusen", awayId: "dortmund", status: "finished", score: { home: 2, away: 2 } },
  { id: "m10", league: "Ligue 1", stage: "Summer Series", kickoff: "2026-07-24T19:00:00Z", homeId: "psg", awayId: "marseille", status: "finished", score: { home: 3, away: 0 } },
  { id: "m11", league: "Ligue 1", stage: "Summer Series", kickoff: "2026-07-26T19:00:00Z", homeId: "monaco", awayId: "psg", status: "finished", score: { home: 1, away: 2 } },
  { id: "m12", league: "Premier League", stage: "Summer Series", kickoff: "2026-07-28T18:30:00Z", homeId: "arsenal", awayId: "liverpool", status: "finished", score: { home: 2, away: 1 } },

  // ---------- upcoming · August 2026 ----------
  { id: "m13", league: "Premier League", stage: "Matchday 1", kickoff: "2026-08-08T16:30:00Z", homeId: "man-city", awayId: "liverpool", status: "upcoming", score: null },
  { id: "m14", league: "Premier League", stage: "Matchday 1", kickoff: "2026-08-08T19:00:00Z", homeId: "arsenal", awayId: "tottenham", status: "upcoming", score: null },
  { id: "m15", league: "Premier League", stage: "Matchday 1", kickoff: "2026-08-09T15:00:00Z", homeId: "chelsea", awayId: "newcastle", status: "upcoming", score: null },
  { id: "m16", league: "La Liga", stage: "Matchday 1", kickoff: "2026-08-09T20:00:00Z", homeId: "real-madrid", awayId: "barcelona", status: "upcoming", score: null },
  { id: "m17", league: "La Liga", stage: "Matchday 1", kickoff: "2026-08-10T19:30:00Z", homeId: "atletico", awayId: "athletic", status: "upcoming", score: null },
  { id: "m18", league: "Serie A", stage: "Matchday 1", kickoff: "2026-08-11T18:45:00Z", homeId: "inter", awayId: "juventus", status: "upcoming", score: null },
  { id: "m19", league: "Serie A", stage: "Matchday 1", kickoff: "2026-08-12T18:45:00Z", homeId: "napoli", awayId: "milan", status: "upcoming", score: null },
  { id: "m20", league: "Bundesliga", stage: "Matchday 1", kickoff: "2026-08-14T18:30:00Z", homeId: "bayern", awayId: "leverkusen", status: "upcoming", score: null },
  { id: "m21", league: "Ligue 1", stage: "Matchday 1", kickoff: "2026-08-15T19:00:00Z", homeId: "psg", awayId: "monaco", status: "upcoming", score: null },
  { id: "m22", league: "Ligue 1", stage: "Matchday 2", kickoff: "2026-08-16T20:00:00Z", homeId: "marseille", awayId: "monaco", status: "upcoming", score: null },
  { id: "m23", league: "Premier League", stage: "Matchday 2", kickoff: "2026-08-22T16:30:00Z", homeId: "liverpool", awayId: "man-city", status: "upcoming", score: null },
  { id: "m24", league: "Bundesliga", stage: "Matchday 2", kickoff: "2026-08-22T16:30:00Z", homeId: "dortmund", awayId: "bayern", status: "upcoming", score: null },
  { id: "m25", league: "La Liga", stage: "Matchday 2", kickoff: "2026-08-23T20:00:00Z", homeId: "barcelona", awayId: "real-madrid", status: "upcoming", score: null },
  { id: "m26", league: "Serie A", stage: "Matchday 2", kickoff: "2026-08-29T18:45:00Z", homeId: "milan", awayId: "inter", status: "upcoming", score: null },
];

/** "home" | "draw" | "away" | null — the settled outcome of a match. */
export function resultOf(match) {
  if (match.status !== "finished" || !match.score) return null;
  if (match.score.home > match.score.away) return "home";
  if (match.score.home < match.score.away) return "away";
  return "draw";
}
