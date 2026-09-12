# Flatland Web Client (`flws-web`)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20App-blue.svg)](https://longphanmn.github.io/flws-web/)
[![React: 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript: 5.6](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite: 5.4](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Dedicated web frontend simulation client and documentation host for **Flatland** (`flws`), built with React 18, TypeScript, Canvas2D/WebGL, and Vite.

- **Live Web App**: [https://longphanmn.github.io/flws-web/](https://longphanmn.github.io/flws-web/)
- **Project Landing Page**: [https://longphanmn.github.io/flws-page/](https://longphanmn.github.io/flws-page/) ([Repo](https://github.com/longphanmn/flws-page))
- **Backend Simulation Engine**: [https://github.com/longphanmn/flws](https://github.com/longphanmn/flws)
- **Living Wiki (Multilingual)**: [https://longphanmn.github.io/flws-web/wiki/](https://longphanmn.github.io/flws-web/wiki/)
- **API Documentation**: [https://longphanmn.github.io/flws-web/docs/](https://longphanmn.github.io/flws-web/docs/)
- **Engine Health Monitor**: [https://longphanmn.github.io/flws-web/health/](https://longphanmn.github.io/flws-web/health/)

---

## ✨ Features

- **High-Performance Canvas2D Viewport**: Zero-allocation batch renderer with LOD gating, offscreen elevation caching, and sub-pixel culling rendering thousands of geometric organisms at sustained 60 FPS.
- **Macro Analytics Observatory**: Full-screen telemetry dashboard featuring demographics, vital health, biomass pyramids, clan hegemony, and evolutionary morphospace scatter.
- **Real-Time WebSocket Sync**: Connects to the backend simulation engine at 10.0 TPS with delta frame updates, binary wire protocol, and automatic reconnection.
- **Living Creature Dossier**: Inspect individual organisms, polar morphology radar, genetic traits, vitals, inventory, and genealogy family trees.
- **God Panel**: Interactive Laws of Nature control drawer across 6 macro domains and curated world presets with PBKDF2 passkey authentication.
- **History & Epoch Analytics**: Daily chronicle digests, war arc graphs, population sparklines, casualty leaderboards, and AI Story export.
- **Bundled Static Documentation Hub**: Hosts static mirrors for the Living Wiki (English, French, Vietnamese), OpenAPI Swagger docs, health telemetry, and OpenAPI schema for GitHub Pages.

---

## 📁 Repository Structure

```
flws-web/
├── src/
│   ├── analytics/              # Macro Observatory tabs & telemetry components
│   │   ├── Observatory.tsx     # Full-screen macro dashboard & tab container
│   │   ├── MacroOverview.tsx   # Demographics, vital health & biomass sparklines
│   │   ├── SociologyTab.tsx    # Clan hegemony, trade caravans & war records
│   │   ├── EcologyTab.tsx      # Flora diversity, soil health & trophic pyramid
│   │   ├── CrisisTab.tsx       # Epidemic spread, starvation & disaster logs
│   │   └── MutationLab.tsx     # Morphological phylogeny & morphospace scatter
│   ├── render/                 # Viewport rendering engine
│   │   ├── CanvasRenderer.tsx  # High-performance 60 FPS interactive viewport
│   │   ├── renderCore.ts       # Canvas2D engine, LOD gates & scratch pools
│   │   ├── webglRenderer.ts    # WebGL instanced sprite renderer
│   │   ├── ClanPanel.tsx       # Live clan settlements & war records (memoized)
│   │   ├── ChronicleFeed.tsx   # Filterable real-time event log (memoized)
│   │   └── OverviewPanel.tsx   # Day-trend demographics & mortality (memoized)
│   ├── inspect/                # Creature inspector & phenotypic radar
│   │   └── Inspector.tsx       # Dossier, vitals, inventory & family tree
│   ├── god/                    # Laws of Nature control drawer
│   │   ├── GodPanel.tsx        # Interactive sliders & curated world presets
│   │   └── auth.tsx            # Passkey dialog & authorized godFetch client
│   ├── history/                # World history, war arcs & AI Story export
│   ├── components/             # Reusable UI components & CreatureAvatar
│   ├── wiki/                   # In-app interactive wiki modal
│   ├── i18n/                   # Multi-language localization (EN, FR, VI)
│   ├── config.ts               # Runtime API/WS endpoint resolution
│   ├── websocket.ts            # Auto-reconnecting WebSocket client
│   ├── types.ts                # TypeScript schemas mirroring backend protocol
│   └── App.tsx                 # Main layout, HUD, WS sync & drawer navigation
├── public/                     # Static documentation & PWA assets
│   ├── wiki/                   # Static Living Wiki (EN, FR, VI)
│   ├── docs/                   # Static Swagger API documentation viewer
│   ├── health/                 # Static engine health status dashboard
│   ├── openapi.json            # Static OpenAPI specification mirror
│   ├── 404.html                # GitHub Pages SPA router
│   └── manifest.webmanifest    # PWA configuration
├── Dockerfile                  # Multi-stage production container (Node → Nginx)
├── nginx.conf                  # Production reverse proxy configuration
└── package.json                # Dependencies & build scripts
```

---

## ⚡ Quickstart

### One-Command Full Stack Launch (Recommended)
To automatically clone, build, and launch both the backend engine and this web client together:
```bash
curl -fsSL https://raw.githubusercontent.com/longphanmn/flws/main/setup.sh | bash
```

---

## 🛠️ Development & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch at [http://localhost:5173](http://localhost:5173). In development mode, Vite proxies `/ws`, `/api`, `/docs`, `/wiki`, and `/healthz` directly to the backend on `localhost:8000`.

### 3. Production Bundle & Preview
```bash
npm run build      # Type checks with tsc and bundles via Vite into dist/
npm run preview    # Locally previews the production build
```

### 4. Docker Container
```bash
docker build -t flatland-frontend .
docker run -p 5173:80 flatland-frontend
```

---

## ⚙️ Environment Configuration

Create a `.env` file (see `.env.example`):

| Variable | Description | Default / Example |
|---|---|---|
| `API_URL` | Remote backend REST API endpoint | `http://localhost:8000` (or `https://api.example.com`) |
| `WS_URL` | Remote backend WebSocket endpoint | `ws://localhost:8000/ws` (or `wss://api.example.com/ws`) |
| `FRONTEND_URL` | Canonical hosted URL of the web client | `https://longphanmn.github.io/flws-web/` |
| `LANDING_URL` | Canonical URL of the project landing page | `https://longphanmn.github.io/flws-page/` |
| `GTM_ID` | Optional Google Tag Manager container ID | `GTM-XXXXXX` |
| `GA_ID` | Optional Google Analytics measurement ID | `G-XXXXXXXXXX` |

---

## 🚀 Deployment

- **GitHub Pages**: Pushes to `main` trigger `.github/workflows/deploy-pages.yml`, which compiles the TypeScript bundle and deploys the app along with static wiki, docs, and health monitors to [https://longphanmn.github.io/flws-web/](https://longphanmn.github.io/flws-web/).
- **Production Server**: Orchestrated via `./deploy.sh` from the parent workspace, which builds the bundle and restarts Nginx containers without interrupting the live backend simulation loop.

---

## 👤 Author & Attribution

- **Developed by**: **[Long Phan](mailto:long@minhnhan.in)** ([minhnhan.in](https://minhnhan.in/?lang=en))
- **Concept**: Developed from the geometric premises and social satire of Edwin A. Abbott's 1884 classic *Flatland: A Romance of Many Dimensions*.
- **Tooling**: Built and engineered with **OpenCode** and **Antigravity**.
- **License**: [MIT](https://opensource.org/licenses/MIT)
