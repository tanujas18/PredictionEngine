/**
 * Club crests, fetched once and then served from disk.
 *
 * The browser only ever asks our own API: GET /api/crest/liverpool. On the first request we
 * pull the PNG from a public crest provider, write it into .cache/crests, and every request
 * after that is a local file read — so the app works offline and we hit someone else's CDN
 * exactly once per club, ever.
 *
 * Same idea as src/api/cache.js on the frontend, one layer down: key -> already-fetched thing.
 *
 * Note on rights: crests are trademarks of their clubs. Fine for a local teaching demo,
 * not something to ship in a public product without permission.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), ".cache", "crests");
const TIMEOUT_MS = 8000;

const upstream = (crestId) => `https://media.api-sports.io/football/teams/${crestId}.png`;

/** In-flight requests, so ten cards asking at once still make one network call. */
const inFlight = new Map();

async function download(crestId) {
  const res = await fetch(upstream(crestId), { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`crest provider returned ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());

  // Cache write failures are not fatal — we can still serve this response.
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(path.join(CACHE_DIR, `${crestId}.png`), buffer);
  } catch {
    /* read-only disk, or no permission. Serve from memory this time. */
  }

  return buffer;
}

/**
 * @param {number} crestId provider id from server/data/teams.js
 * @returns {Promise<Buffer|null>} the PNG, or null if it couldn't be had
 */
export async function getCrest(crestId) {
  if (!Number.isInteger(crestId)) return null;

  // 1. already on disk?
  try {
    return await readFile(path.join(CACHE_DIR, `${crestId}.png`));
  } catch {
    /* not cached yet — fall through to the network */
  }

  // 2. already being fetched by another request?
  if (inFlight.has(crestId)) return inFlight.get(crestId);

  const job = download(crestId)
    .catch(() => null)
    .finally(() => inFlight.delete(crestId));

  inFlight.set(crestId, job);
  return job;
}

/**
 * Pull every crest in the background on boot, so the first page load is instant and the
 * app is fully offline-capable after one run. Failures are silent by design: a missing
 * crest just means the UI shows its monogram fallback.
 */
export async function warmCrests(teams) {
  const results = await Promise.all(teams.map((team) => getCrest(team.crestId)));
  return results.filter(Boolean).length;
}
