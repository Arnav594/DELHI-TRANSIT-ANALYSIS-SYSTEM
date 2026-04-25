/**
 * API client for the Delhi Metro backend (Flask).
 * Running locally: http://localhost:5000
 */
const API_BASE = "http://localhost:5000";

export interface StationsResponse {
  stations?: string[];
  error?: string;
}

export interface RouteStation {
  name: string;
  line: string;
  is_interchange: boolean;
}

export interface RouteResponse {
  start?: string;
  end?: string;
  route?: RouteStation[];
  stops?: number;
  interchanges?: number;
  approx_time_minutes?: number;
  route_type?: string;
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

export async function fetchStations(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/stations`);
  const data = await asJson<StationsResponse>(res);
  return data.stations ?? [];
}

export async function fetchRoute(
  start: string,
  end: string,
  routeType: "shortest" | "min_interchange" = "shortest",
): Promise<RouteResponse> {
  const url = `${API_BASE}/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&route_type=${routeType}`;
  const res = await fetch(url);
  return asJson<RouteResponse>(res);
}