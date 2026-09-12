# Flatland Web Client (`flws-web`)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20App-blue.svg)](https://longphanmn.github.io/flws-web/)
[![React: 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript: 5.6](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Dedicated web frontend simulation client for **Flatland** (`flws`), built with React 18, TypeScript, and Vite.

- **Live Web App**: [https://longphanmn.github.io/flws-web/](https://longphanmn.github.io/flws-web/)
- **Backend Simulation Engine**: [https://github.com/longphanmn/flws](https://github.com/longphanmn/flws)
- **Project Landing Page (Private)**: [https://github.com/longphanmn/flws-page](https://github.com/longphanmn/flws-page)

---

## Features

- **High-Performance Canvas2D Viewport**: Zero-allocation batch renderer with LOD gating rendering thousands of geometric organisms at sustained 60 FPS.
- **Macro Analytics Observatory**: Full-screen telemetry dashboard featuring demographics, vital health, biomass pyramids, clan hegemony, and evolutionary morphospace.
- **Real-Time WebSocket Sync**: Connects to the backend simulation engine at 10.0 TPS with delta frame updates and automatic reconnection.
- **Living Creature Dossier**: Inspect individual organisms, polar morphology radar, genetic traits, vitals, inventory, and genealogy family trees.
- **God Panel**: Interactive Laws of Nature control drawer across 6 macro domains and curated world presets.

---

## Quick Start

### ⚡ One-Command Automatic Setup (Full Stack)
To automatically clone, configure, and launch both the backend engine and this web client together:
```bash
curl -fsSL https://raw.githubusercontent.com/longphanmn/flws/main/setup.sh | bash
```

---

### Manual Frontend Setup

#### 1. Install dependencies
```bash
npm install
```

### 2. Development mode
```bash
npm run dev
```
The application will launch on `http://localhost:5173` with reverse proxy configured to backend on `:8000`.

### 3. Production build & preview
```bash
npm run build
npm run preview
```

### 4. Docker container
```bash
docker build -t flatland-frontend .
docker run -p 5173:80 flatland-frontend
```

---

## Environment Variables

Configure in `.env`:
- `VITE_DEMO_API_URL` / `API_URL`: Backend REST API URL (e.g. `http://localhost:8000` or production host).
- `VITE_DEMO_WS_URL` / `WS_URL`: Backend WebSocket URL (e.g. `ws://localhost:8000/ws` or `wss://...`).
- `FRONTEND_URL`: URL of the hosted frontend (defaults to `https://longphanmn.github.io/flws-web/`).
- `LANDING_URL`: URL of the project landing page (`https://longphanmn.github.io/flws-page/`).
