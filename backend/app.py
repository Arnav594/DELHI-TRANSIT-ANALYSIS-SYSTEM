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

# Time configuration
STATION_TIME = 2          # minutes between consecutive stations
INTERCHANGE_TIME = 7      # penalty for changing lines


# -----------------------------
# Utility: Clean station name
# -----------------------------
def clean_station_name(name):
    return name.split("[")[0].strip()


# -----------------------------
# Build Metro Graph
# -----------------------------
def build_metro_graph():
    conn = get_connection()
    cur = conn.cursor()

    graph = {}

    cur.execute("""
        SELECT station_id, station_name, metro_line
        FROM delhi_metro_stations
        ORDER BY metro_line, station_id;
    """)

    rows = cur.fetchall()

    # 1️⃣ Connect consecutive stations on same line
    for i in range(len(rows) - 1):
        _, current_name, current_line = rows[i]
        _, next_name, next_line = rows[i + 1]

        if current_line == next_line:
            graph.setdefault(current_name, []).append((next_name, current_line))
            graph.setdefault(next_name, []).append((current_name, current_line))

    # 2️⃣ Connect interchange stations (same cleaned name)
    station_groups = defaultdict(list)

    for station in graph.keys():
        cleaned = clean_station_name(station)
        station_groups[cleaned].append(station)

    for group in station_groups.values():
        if len(group) > 1:
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    graph[group[i]].append((group[j], "INTERCHANGE"))
                    graph[group[j]].append((group[i], "INTERCHANGE"))

    cur.close()
    conn.close()

    return graph


# -----------------------------
# Dijkstra: Minimize Total Time
# -----------------------------
def shortest_path(graph, start_clean, end_clean):
    pq = []
    visited = {}

    # Find backend nodes matching cleaned names
    start_nodes = [
        node for node in graph
        if clean_station_name(node) == start_clean
    ]

    end_nodes = [
        node for node in graph
        if clean_station_name(node) == end_clean
    ]

    # Initialize priority queue
    for node in start_nodes:
        heapq.heappush(pq, (0, node, None, [node], 0))
        # (total_time, current_node, prev_line, path, interchanges)

    while pq:
        total_time, current, prev_line, path, interchanges = heapq.heappop(pq)

        state = (current, prev_line)

        # Skip if already visited with better time
        if state in visited and visited[state] <= total_time:
            continue

        visited[state] = total_time

        if current in end_nodes:
            return path, total_time, interchanges

        for neighbor, line in graph.get(current, []):
            new_time = total_time + STATION_TIME
            new_interchanges = interchanges

            # Add interchange penalty
            if prev_line and prev_line != line and line != "INTERCHANGE":
                new_time += INTERCHANGE_TIME
                new_interchanges += 1

            heapq.heappush(
                pq,
                (
                    new_time,
                    neighbor,
                    line,
                    path + [neighbor],
                    new_interchanges
                )
            )

    return None, None, None


# -----------------------------
# API: Get Stations
# -----------------------------
@app.get("/stations")
def get_stations():
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT station_name FROM delhi_metro_stations;")
        raw = [row[0] for row in cur.fetchall()]

        cleaned = sorted(set(clean_station_name(n) for n in raw))

        cur.close()
        conn.close()

        return jsonify({"stations": cleaned})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# API: Get Route
# -----------------------------
@app.get("/route")
def get_route():
    start = request.args.get("start")
    end = request.args.get("end")

    if not start or not end:
        return jsonify({"error": "start and end required"}), 400

    try:
        graph = build_metro_graph()

        start_clean = clean_station_name(start)
        end_clean = clean_station_name(end)

        path, total_time, interchanges = shortest_path(
            graph, start_clean, end_clean
        )

        if not path:
            return jsonify({"error": "No route found"}), 404

        # Build route with line info
        route_with_lines = []
        prev_line = None

        for i in range(len(path)):
            station = path[i]
            station_name = clean_station_name(station)

            # find line between current and next
            line = None
            if i < len(path) - 1:
                  next_station = path[i + 1]
                  for neighbor, l in graph.get(station, []):
                      if neighbor == next_station:
                         line = l
                         break

            # fallback for last station
            if not line:
                line = prev_line

            route_with_lines.append({
                  "name": station_name,
                  "line": line
            })

            prev_line = line    

        return jsonify({
            "start": start_clean,
            "end": end_clean,
            "route": route_with_lines,
            "stops": len(route_with_lines) - 1,
            "interchanges": interchanges,
            "approx_time_minutes": total_time
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)