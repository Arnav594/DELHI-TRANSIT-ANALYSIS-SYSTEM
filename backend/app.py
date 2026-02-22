from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from db import get_connection
from collections import deque
import os

load_dotenv()

app = Flask(__name__)
CORS(app)


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

    cur.execute("SELECT DISTINCT metro_line FROM delhi_metro_stations;")
    lines = [row[0] for row in cur.fetchall()]

    for line in lines:
        cur.execute("""
            SELECT station_id, station_name
            FROM delhi_metro_stations
            WHERE metro_line = %s
            ORDER BY station_id;
        """, (line,))

        stations = cur.fetchall()

        for i in range(len(stations) - 1):
            current = clean_station_name(stations[i][1])
            next_station = clean_station_name(stations[i + 1][1])

            if current not in graph:
                graph[current] = []
            if next_station not in graph:
                graph[next_station] = []

            graph[current].append(next_station)
            graph[next_station].append(current)

    cur.close()
    conn.close()

    return graph


# -----------------------------
# Shortest Path (BFS)
# -----------------------------
def shortest_path(graph, start, end):
    queue = deque([(start, [start])])
    visited = set()

    while queue:
        current, path = queue.popleft()

        if current == end:
            return path

        visited.add(current)

        for neighbor in graph.get(current, []):
            if neighbor not in visited:
                queue.append((neighbor, path + [neighbor]))

    return None


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

        cleaned = [clean_station_name(name) for name in raw]
        unique = sorted(set(cleaned))

        cur.close()
        conn.close()

        return jsonify({"stations": unique})

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

        start = clean_station_name(start)
        end = clean_station_name(end)

        if start not in graph or end not in graph:
            return jsonify({"error": "Station not found"}), 404

        path = shortest_path(graph, start, end)

        if not path:
            return jsonify({"error": "No route found"}), 404

        stops = len(path) - 1
        approx_time = stops * 2

        return jsonify({
            "start": start,
            "end": end,
            "route": path,
            "stops": stops,
            "approx_time_minutes": approx_time
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)