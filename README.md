# 🚇 Delhi Transit Analysis System

A full-stack web application for intelligent route planning across the **Delhi Metro** and **DTC Bus** networks. Built with React + TypeScript on the frontend and Flask + PostgreSQL on the backend, powered by Dijkstra's algorithm for real-time pathfinding.

---

## ✨ Features

- **Metro Route Planner** — Two routing modes:
  - ⚡ **Fastest Route** — Minimum stops & travel time
  - 🔄 **Fewest Changes** — Minimum line interchanges
- **Bus Route Planner** — Search across 3,962 stops & 2,403 DTC routes
- **Interactive Metro Map** — All 13 DMRC lines with official colours, zoom/pan, animated route highlighting
- **Interchange Banners** — Visual line-change indicators with colour gradients
- **Skeleton Loading UI** — Shimmer placeholders while data loads
- **Dark / Light Mode** toggle

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, shadcn/ui, Vite |
| Backend | Python 3.11, Flask, Flask-CORS |
| Database | PostgreSQL |
| Algorithm | Dijkstra's (shortest path + min interchange) |
| Data | DMRC station data, DTC GTFS bus data |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ / Bun
- Python 3.11+
- PostgreSQL

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

Start the server:
```bash
python app.py
```

Backend runs at `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:8080`

---

## 📡 API Endpoints

### Metro
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stations` | All metro station names |
| GET | `/route?start=X&end=Y&route_type=shortest` | Metro route (shortest / min_interchange) |

### Bus
| Method | Endpoint | Description |
|---|---|---|
| GET | `/bus/stops?q=kashmere` | Fuzzy search bus stops |
| GET | `/bus/route?start=X&end=Y&mode=shortest` | Bus route (shortest / min_interchange) |

---

## 📊 Dataset

| Dataset | Records |
|---|---|
| Delhi Metro Stations | 285+ stations, 13 lines |
| DTC Bus Stops | 3,962 unique stops |
| DTC Bus Routes | 2,403 routes |
| Bus Stop Records | 99,287 GTFS records |

---

## 🗺️ Metro Lines Covered

Red · Yellow · Blue · Blue Branch · Violet · Pink · Magenta · Green · Green Branch · Orange (Airport Express) · Gray · Aqua · Rapid Metro

---

## 👨‍💻 Author

**Arnav** — [GitHub](https://github.com/Arnav594)

---

## 📄 License

MIT License
