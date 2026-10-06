# 🧭 CampusNav AI - Full-Stack Campus Navigation System

A modern, production-grade **Campus Navigation System** built for hackathons and campus mobility. It computes the shortest walking paths between campus landmarks using **Dijkstra's Algorithm / A*** on an interconnected graph stored in **SQLite**, and presents them on an interactive **Leaflet map** with custom category pins, glowing polyline routes, turn-by-turn guidance cards, multi-floor transitions, and voice narration.

---

## ✨ Key Features

- 🗺️ **Interactive OpenStreetMap with Leaflet**:
  - Color-coded pins for 5 distinct categories: **Labs** (Cyan), **Departments** (Indigo), **Offices** (Amber), **Classrooms** (Emerald), **Facilities** (Rose).
  - Pulsing animated **Start (Origin)** and **Destination (Target)** markers.
  - Glowing neon route polyline with animated direction dashes.
  - Multi-layer toggle: *Dark Matrix*, *Clean Street Map*, and *Esri Satellite*.
  - Full Campus Walkway Graph overlay toggle (*"Path Grid"*).

- ⚡ **Dijkstra / A* Shortest Pathfinding Engine**:
  - Graph-based path computation from SQLite database edges.
  - Floor transition intelligence (e.g. *"Take internal stairs/elevator from Floor 1 to Floor 3"*).
  - Accurate distance calculation (meters) and estimated walking time (minutes).
  - Rich step-by-step turn guidance.

- 🗣️ **Turn-by-Turn Audio Guidance**:
  - Built-in speech synthesis (Web Speech API) to read navigation steps aloud.

- 🔍 **Live Search & Category Filtering**:
  - Real-time search across names, buildings, and descriptions.
  - Filter by category pills and floor levels (Floor 1, 2, 3, or All).

- 🏢 **Admin & Graph Expansion**:
  - Interactive modal to add new campus nodes with a 1-click **"Pick on Map"** coordinate pin.
  - Automatic linkage to the nearest campus graph node to preserve graph connectivity.
  - **1-Click Reset Demo Seed** button for hackathon presentations.

---

## 🛠️ Tech Stack & Ports

| Component | Technology | Port |
|---|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide Icons, Leaflet, React-Leaflet | `http://localhost:5173` |
| **Backend** | Node.js, Express.js (REST API), CORS | `http://localhost:5000` |
| **Database** | SQLite via `better-sqlite3` (zero external setup required) | Stored at `backend/campus.db` |

---

## 🚀 Quick Start Guide

### 1. Install All Dependencies (One-time Setup)

Run from the root directory:
```bash
npm run install:all
```

Or install in each folder individually:
```bash
# In backend/
cd backend
npm install

# In frontend/
cd ../frontend
npm install
```

---

### 2. Seed Campus Database (Automated)

The backend auto-seeds the database upon initial boot. To manually re-seed:
```bash
npm run seed --prefix backend
```

---

### 3. Run Backend & Frontend Concurrently

From the root project directory, run:
```bash
npm run dev
```

This starts:
- 🟢 **Backend API Server**: `http://localhost:5000`
- 🔵 **Frontend Web App**: `http://localhost:5173`

> Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.

---

## 📡 REST API Endpoints Reference

### Base URL: `http://localhost:5000/api`

#### 1. Locations
- `GET /api/locations` -> Fetch all campus points (supports `?category=...`, `?floor=...`, and `?search=...`).
- `GET /api/locations/categories` -> Get list of categories and counts.
- `GET /api/locations/:id` -> Single location detail with direct walkway neighbors.
- `POST /api/locations` -> Add a new campus node (accepts `name`, `category`, `building`, `floor`, `latitude`, `longitude`, `description`, `connectToId`).
- `DELETE /api/locations/:id` -> Delete a location and cascade-remove connected routes.

#### 2. Navigation & Shortest Path
- `POST /api/route` -> Compute shortest path between nodes.
  - Request Body:
    ```json
    {
      "startId": 1,
      "endId": 4
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "found": true,
        "totalDistanceMeters": 310,
        "estimatedWalkingMinutes": 4,
        "path": [ ... ],
        "coordinates": [ [37.4275, -122.174], [37.4282, -122.1725], ... ],
        "steps": [
          {
            "stepNumber": 1,
            "type": "depart",
            "instruction": "Depart from Campus Main Gate & Visitor Center (Entry Plaza Block, Floor 1)."
          },
          {
            "stepNumber": 2,
            "type": "walk",
            "instruction": "Exit Main Gate and walk Northeast along Founders Boulevard toward Administration Hall.",
            "distanceMeters": 140
          },
          {
            "stepNumber": 3,
            "type": "stairs_up",
            "instruction": "Take the internal central elevator or north stairway up to Floor 3 to enter AI & Robotics Lab.",
            "additionalNote": "Take stairs or elevator from Floor 2 to Floor 3."
          }
        ]
      }
    }
    ```
- `GET /api/route/edges` -> Retrieve all campus walkway segments for path network rendering.
- `POST /api/route/reset-seed` -> Reset campus database back to original factory state.

---

## 📂 Project Directory Structure

```
CampusNavigationSystem/
├── backend/
│   ├── campus.db                  # Local SQLite Database file
│   ├── package.json               # Backend dependencies & scripts
│   └── src/
│       ├── server.js              # Express REST server on port 5000
│       ├── db/
│       │   ├── database.js        # SQLite database connection & schema
│       │   └── seed.js            # Auto-seeder with 16 campus nodes & routes
│       ├── routes/
│       │   ├── locations.js       # Location CRUD endpoints
│       │   └── route.js           # Pathfinding & edge network endpoints
│       └── services/
│           └── pathfinding.js     # Dijkstra & A* path computation service
├── frontend/
│   ├── index.html                 # HTML shell with Google Fonts & Leaflet
│   ├── package.json               # Frontend React 18, Vite 5 & Tailwind
│   ├── tailwind.config.js         # Tailwind configuration
│   ├── postcss.config.js          # PostCSS configuration
│   ├── vite.config.js             # Vite React bundler config
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── index.css              # Custom CSS, dark theme & Leaflet popups
│       ├── api.js                 # API helper module
│       ├── App.jsx                # Main application state & orchestrator
│       ├── components/
│       │   ├── Navbar.jsx         # Header with branding, map style & tools
│       │   ├── Sidebar.jsx        # Route planner, directions & directory
│       │   ├── CampusMap.jsx      # Leaflet map, custom pins & route lines
│       │   ├── AddLocationModal.jsx # Admin coordinate & node creation dialog
│       │   └── LocationDetailModal.jsx # Landmark deep-dive modal
│       └── utils/
│           ├── categories.js      # Category color & badge mappings
│           └── speech.js          # Web Speech voice navigation reader
├── package.json                   # Root package with concurrent run scripts
└── README.md                      # Complete system documentation
```
