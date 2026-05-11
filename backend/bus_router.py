"""
Bus routing module for Delhi Transit Analysis System.
Builds a graph from BUSstationdataset.csv and provides:
  - get_bus_stops()     → sorted list of all unique stop names
  - find_bus_route()    → Dijkstra shortest path between two stops
"""

import csv
import heapq
import os
from collections import defaultdict
from functools import lru_cache

# ── Path to bus data ──────────────────────────────────────────────────────────
_CSV_PATH = os.path.join(
    os.path.dirname(__file__),
    "Data", "BUSstationdataset.csv"
)

# ── Module-level cache (built once at import time) ────────────────────────────
_graph: dict[str, list[tuple[str, str]]] = {}   # stop -> [(neighbor, route_id)]
_all_stops: list[str] = []                       # sorted unique stop names
_built = False


def _build_graph() -> None:
    global _graph, _all_stops, _built
    if _built:
        return

    raw: dict[str, list[dict]] = defaultdict(list)

    with open(_CSV_PATH, encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) < 6:
                continue
            if row[0] in ("stop_id", "\ufeffstop_id"):
                continue
            try:
                stop_id  = int(row[0])
            except ValueError:
                continue
            raw[row[2]].append({          # key = trip_id
                "route_id":  row[1].strip(),
                "stop_id":   stop_id,
                "stop_name": row[5].strip(),
            })

    graph: dict[str, set] = defaultdict(set)

    for trip_id, stops in raw.items():
        ordered = sorted(stops, key=lambda s: s["stop_id"])
        route   = ordered[0]["route_id"]
        for i in range(len(ordered) - 1):
            a = ordered[i]["stop_name"]
            b = ordered[i + 1]["stop_name"]
            graph[a].add((b, route))
            graph[b].add((a, route))

    # Convert sets → lists for pickling / consistent iteration
    _graph     = {k: list(v) for k, v in graph.items()}
    _all_stops = sorted(_graph.keys())
    _built     = True


# ── Public API ────────────────────────────────────────────────────────────────

def get_bus_stops() -> list[str]:
    """Return sorted list of all unique bus stop names."""
    _build_graph()
    return _all_stops


def fuzzy_match(query: str, stops: list[str], limit: int = 20) -> list[str]:
    """
    Case-insensitive substring match.
    Returns up to `limit` stop names that contain the query string.
    """
    q = query.lower()
    return [s for s in stops if q in s.lower()][:limit]


def find_bus_route(
    start: str,
    end:   str,
    mode:  str = "shortest",   # "shortest" | "min_interchange"
) -> dict:
    """
    Find a bus route from `start` to `end`.

    Returns a dict with keys:
        start, end, route (list of {stop, route_number, is_change}),
        stops, changes, approx_time_minutes, error (if any)
    """
    _build_graph()

    if start not in _graph:
        return {"error": f"Stop '{start}' not found in bus network"}
    if end not in _graph:
        return {"error": f"Stop '{end}' not found in bus network"}
    if start == end:
        return {"error": "Start and destination must be different"}

    # ── Dijkstra ─────────────────────────────────────────────────────────────
    # priority key depends on mode:
    #   shortest      → (stops, changes, current, prev_route, path)
    #   min_interchange → (changes, stops, current, prev_route, path)

    INF = float("inf")

    if mode == "min_interchange":
        # (changes, stops, current, prev_route, path)
        pq = [(0, 0, start, None, [start])]
        visited: set[tuple] = set()

        while pq:
            changes, stops, cur, prev_route, path = heapq.heappop(pq)
            state = (cur, prev_route)
            if state in visited:
                continue
            visited.add(state)

            if cur == end:
                return _build_result(path, changes, start, end)

            for nb, route in _graph.get(cur, []):
                new_changes = changes + (1 if prev_route and prev_route != route else 0)
                heapq.heappush(pq, (new_changes, stops + 1, nb, route, path + [nb]))

    else:  # shortest — minimise total stops
        # (stops, changes, current, prev_route, path)
        pq = [(0, 0, start, None, [start])]
        visited: set[tuple] = set()

        while pq:
            stops, changes, cur, prev_route, path = heapq.heappop(pq)
            state = (cur, prev_route)
            if state in visited:
                continue
            visited.add(state)

            if cur == end:
                return _build_result(path, changes, start, end)

            for nb, route in _graph.get(cur, []):
                new_changes = changes + (1 if prev_route and prev_route != route else 0)
                heapq.heappush(pq, (stops + 1, new_changes, nb, route, path + [nb]))

    return {"error": "No route found between these stops"}


def _build_result(path: list[str], changes: int, start: str, end: str) -> dict:
    """
    Annotate each stop in the path with its route number and
    whether a route change happens here.
    """
    # Walk path again to assign route numbers
    route_details = []
    prev_route = None

    for i, stop in enumerate(path):
        if i == len(path) - 1:
            route_id   = prev_route or ""
            is_change  = False
        else:
            next_stop  = path[i + 1]
            # Find the route connecting stop → next_stop
            candidates = [r for nb, r in _graph.get(stop, []) if nb == next_stop]
            # Prefer continuing on same route if possible
            if prev_route and prev_route in candidates:
                route_id = prev_route
            else:
                route_id = candidates[0] if candidates else (prev_route or "")

            is_change = bool(prev_route and route_id != prev_route)
            prev_route = route_id

        route_details.append({
            "stop":         stop,
            "route_number": route_id,
            "is_change":    is_change,
        })

    stops             = len(path) - 1
    approx_time_mins  = stops * 3   # ~3 min per bus stop on average

    return {
        "start":               start,
        "end":                 end,
        "route":               route_details,
        "stops":               stops,
        "changes":             changes,
        "approx_time_minutes": approx_time_mins,
    }