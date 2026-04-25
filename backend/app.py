from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from db import get_connection
from collections import defaultdict
import heapq
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

STATION_TIME = 2
INTERCHANGE_TIME = 7


def clean(name: str) -> str:
    return name.split("[")[0].strip()


def build_graph():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT station_id, station_name, metro_line
        FROM delhi_metro_stations
        ORDER BY metro_line, station_id;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    graph: dict[str, list] = {}

    for i in range(len(rows) - 1):
        _, a_name, a_line = rows[i]
        _, b_name, b_line = rows[i + 1]
        if a_line == b_line:
            graph.setdefault(a_name, []).append((b_name, a_line))
            graph.setdefault(b_name, []).append((a_name, a_line))

    by_clean: dict[str, list[str]] = defaultdict(list)
    for node in list(graph.keys()):
        by_clean[clean(node)].append(node)

    for group in by_clean.values():
        if len(group) > 1:
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    graph.setdefault(group[i], []).append((group[j], "INTERCHANGE"))
                    graph.setdefault(group[j], []).append((group[i], "INTERCHANGE"))

    return graph, rows


def resolve_nodes(graph, clean_name: str) -> list[str]:
    return [n for n in graph if clean(n) == clean_name]


def get_line_for_node(rows, node_name: str) -> str:
    """Get the metro line for a raw node name from DB rows."""
    for _, name, line in rows:
        if name == node_name:
            return line
    return ""


def build_route_details(path: list[str], graph, rows) -> list[dict]:
    """
    Build per-station detail list with correct line info.
    For interchange stations (empty line), carry forward the previous line
    until a real line is found — this ensures no empty lines in output.
    """
    details = []

    for i, station in enumerate(path):
        # Find the best line for this station:
        # 1. Try to get it from the edge COMING INTO this station
        # 2. Try to get it from the edge GOING OUT of this station
        # 3. Fall back to DB lookup

        line = ""

        # From incoming edge (previous → current)
        if i > 0:
            prev = path[i - 1]
            for nb, l in graph.get(prev, []):
                if nb == station and l != "INTERCHANGE":
                    line = l
                    break

        # From outgoing edge (current → next)
        if not line and i < len(path) - 1:
            nxt = path[i + 1]
            for nb, l in graph.get(station, []):
                if nb == nxt and l != "INTERCHANGE":
                    line = l
                    break

        # DB fallback
        if not line:
            line = get_line_for_node(rows, station)

        # Last resort: carry forward from previous station
        if not line and details:
            line = details[-1]["line"]

        # Determine if this is an interchange point
        is_ic = False
        if details and line and details[-1]["line"] and line != details[-1]["line"]:
            is_ic = True

        details.append({
            "name": clean(station),
            "line": line,
            "is_interchange": is_ic,
        })

    return details


def dijkstra_shortest(graph, start_clean: str, end_clean: str):
    starts = resolve_nodes(graph, start_clean)
    ends   = set(resolve_nodes(graph, end_clean))
    if not starts or not ends:
        return None, None, None

    pq = [(0, n, None, [n], 0) for n in starts]
    heapq.heapify(pq)
    visited: dict[tuple, int] = {}

    while pq:
        time, cur, prev_line, path, ics = heapq.heappop(pq)
        state = (cur, prev_line)
        if state in visited and visited[state] <= time:
            continue
        visited[state] = time

        if cur in ends:
            return path, time, ics

        for nb, line in graph.get(cur, []):
            add_time = STATION_TIME
            add_ic   = 0
            if prev_line and prev_line != line and line != "INTERCHANGE":
                add_time += INTERCHANGE_TIME
                add_ic    = 1
            heapq.heappush(pq, (time + add_time, nb, line, path + [nb], ics + add_ic))

    return None, None, None


def dijkstra_min_interchange(graph, start_clean: str, end_clean: str):
    starts = resolve_nodes(graph, start_clean)
    ends   = set(resolve_nodes(graph, end_clean))
    if not starts or not ends:
        return None, None, None

    pq = [(0, 0, n, None, [n]) for n in starts]
    heapq.heapify(pq)
    visited: set[tuple] = set()

    while pq:
        ics, time, cur, prev_line, path = heapq.heappop(pq)
        state = (cur, prev_line)
        if state in visited:
            continue
        visited.add(state)

        if cur in ends:
            return path, time, ics

        for nb, line in graph.get(cur, []):
            add_time = STATION_TIME
            add_ic   = 0
            if prev_line and prev_line != line and line != "INTERCHANGE":
                add_time += INTERCHANGE_TIME
                add_ic    = 1
            heapq.heappush(pq, (ics + add_ic, time + add_time, nb, line, path + [nb]))

    return None, None, None


@app.get("/stations")
def get_stations():
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute("SELECT station_name FROM delhi_metro_stations;")
        raw     = [r[0] for r in cur.fetchall()]
        cleaned = sorted(set(clean(n) for n in raw))
        cur.close(); conn.close()
        return jsonify({"stations": cleaned})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/route")
def get_route():
    start      = request.args.get("start", "").strip()
    end        = request.args.get("end",   "").strip()
    route_type = request.args.get("route_type", "shortest")

    if not start or not end:
        return jsonify({"error": "start and end are required"}), 400
    if clean(start) == clean(end):
        return jsonify({"error": "Start and destination must be different"}), 400

    try:
        graph, rows = build_graph()

        if route_type == "min_interchange":
            path, total_time, interchanges = dijkstra_min_interchange(graph, clean(start), clean(end))
        else:
            path, total_time, interchanges = dijkstra_shortest(graph, clean(start), clean(end))

        if not path:
            return jsonify({"error": "No route found between these stations"}), 404

        # Deduplicate consecutive same-cleaned-name hops
        deduped: list[str] = []
        prev_clean = None
        for station in path:
            c = clean(station)
            if c != prev_clean:
                deduped.append(station)
            prev_clean = c

        details = build_route_details(deduped, graph, rows)

        return jsonify({
            "start":               clean(start),
            "end":                 clean(end),
            "route":               details,
            "stops":               len(details) - 1,
            "interchanges":        interchanges,
            "approx_time_minutes": total_time,
            "route_type":          route_type,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)