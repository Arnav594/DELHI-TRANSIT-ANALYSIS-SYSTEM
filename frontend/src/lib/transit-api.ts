/**
 * API client for the Delhi Metro backend (Flask).
 *
 * Configure the base URL via VITE_API_BASE in .env files:
 *   .env.development → VITE_API_BASE=http://localhost:5000
 *   .env.production  → VITE_API_BASE=https://delhi-transit-analysis-system.onrender.com
 *
 * Falls back to the deployed Render URL if not set.
 */
const API_BASE = "http://localhost:5000";

export interface StationsResponse {
  stations?: string[];
  error?: string;
}

export interface RouteResponse {
  start?: string;
  end?: string;
  route?: {
    name: string;
    line: string;
  }[];
  stops?: number;
  interchanges?: number;
  approx_time_minutes?: number;
  error?: string;
}

async function asJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    throw new Error(`Invalid JSON from ${res.url} (${res.status})`);
  }
  if (!res.ok) {
    const msg =
      (data as { error?: string })?.error ??
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * GET /stations  →  { stations: string[] }
 * The backend ignores `mode` (always metro), but we keep the signature
 * so the existing components don't need to change.
 */
export async function fetchStations(_mode: string = "metro"): Promise<string[]> {
  const res = await fetch(`${API_BASE}/stations`);
  const data = await asJson<StationsResponse>(res);
  return data.stations ?? [];
}

/**
 * GET /route?start=...&end=...
 * Returns the full route, stop count, interchange count and ETA.
 */
export async function fetchRoute(
  _mode: string,
  start: string,
  end: string,
): Promise<RouteResponse> {
  const url = `${API_BASE}/route?start=${encodeURIComponent(
    start,
  )}&end=${encodeURIComponent(end)}`;
  const res = await fetch(url);
  return asJson<RouteResponse>(res);
}
