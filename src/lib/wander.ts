// Currently Wandering helpers: live weather + journey stats.
import type { Env } from './types';
import { haversineKm } from './enrich';

export interface WanderState {
  place: string;
  note?: string;
  since?: string;
  lat?: number;
  lng?: number;
  country?: string;
  timezone?: string;
}

const WEATHER_EMOJI: [number[], string][] = [
  [[0], '☀️'], [[1, 2], '🌤️'], [[3], '☁️'], [[45, 48], '🌫️'],
  [[51, 53, 55, 56, 57], '🌦️'], [[61, 63, 65, 66, 67, 80, 81, 82], '🌧️'],
  [[71, 73, 75, 77, 85, 86], '🌨️'], [[95, 96, 99], '⛈️'],
];

export async function getWeather(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      timezone?: string;
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const tempC = data.current?.temperature_2m;
    if (tempC == null) return null;
    const code = data.current?.weather_code ?? 0;
    const emoji = WEATHER_EMOJI.find(([codes]) => codes.includes(code))?.[1] ?? '🌡️';
    return {
      tempC: Math.round(tempC),
      tempF: Math.round((tempC * 9) / 5 + 32),
      emoji,
      timezone: data.timezone,
    };
  } catch {
    return null;
  }
}

export async function getWanderStats(env: Env, w: WanderState) {
  const since = w.since ?? new Date().toISOString().slice(0, 10);
  const days = Math.max(1, Math.floor((Date.now() - new Date(since).getTime()) / 86_400_000) + 1);

  let miles: number | null = null;
  let homePlace: string | null = null;
  const homeRow = await env.DB.prepare(`SELECT value FROM settings WHERE key = 'home'`).first<{ value: string }>();
  if (homeRow && w.lat != null && w.lng != null) {
    try {
      const home = JSON.parse(homeRow.value) as { lat: number; lng: number; place?: string };
      miles = Math.round(haversineKm(w.lat, w.lng, home.lat, home.lng) * 0.621371);
      homePlace = home.place ?? null;
    } catch { /* ignore */ }
  }

  const cnt = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM moments WHERE captured_at >= ?1`
  ).bind(since).first<{ n: number }>();

  return { days, miles, moments: cnt?.n ?? 0, homePlace };
}

/** Apollo's dynamic wandering: a Moment with GPS far from the current pin moves it. */
export async function maybeUpdateWandering(
  env: Env,
  moment: { lat: number | null; lng: number | null; place: string | null; captured_at: string }
) {
  if (moment.lat == null || moment.lng == null) return;
  const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = 'currently_wandering'`).first<{ value: string }>();
  let current: WanderState | null = null;
  try { current = row ? JSON.parse(row.value) : null; } catch { /* ignore */ }

  const moved =
    !current || current.lat == null || current.lng == null ||
    haversineKm(moment.lat, moment.lng, current.lat, current.lng) > 100;
  if (!moved) return;

  const next: WanderState = {
    place: moment.place ?? 'Somewhere new',
    note: current?.note ?? '',
    since: moment.captured_at.slice(0, 10),
    lat: moment.lat,
    lng: moment.lng,
    country: undefined, // set by the wander Shortcut; photos don't carry it
    timezone: undefined,
  };
  await env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('currently_wandering', ?1, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = ?1, updated_at = datetime('now')`
  ).bind(JSON.stringify(next)).run();
}
