# ⚗️ Virtual Lab Simulation Manager

> **Run physics, biology, electronics, and astronomy simulations — entirely in your browser.**

[![Deploy to GitHub Pages](https://github.com/YOUR_USERNAME/virtual-lab-sim-manager/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/virtual-lab-sim-manager/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 What Is This?

Virtual Lab Simulation Manager is a **production-grade React + TypeScript SPA** that lets you create, configure, run, and analyse scientific simulations in real time — no server, no backend, no sign-up required. All data is persisted in your browser's localStorage.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔬 **6 Built-in Simulations** | Pendulum, Projectile, Wave Interference, Population Dynamics, RC Circuit, Orbital Mechanics |
| 📊 **Live Charts** | Recharts line/scatter charts update in real time as simulations stream data |
| 🧪 **Lab Organisation** | Group simulations into named labs with custom colors and icons |
| ⚡ **Parameter Controls** | Range sliders, number inputs, select dropdowns — all update the simulation live |
| 💾 **Export Results** | Download any result as CSV or JSON with one click |
| ⭐ **Favorites** | Star simulations for quick access |
| 🌙 **Dark / Light Mode** | Full theme switching with CSS variables |
| 🚀 **GitHub Pages CI/CD** | Auto-deploy on every push to `main` |
| 🧪 **Unit Tests** | Vitest tests for the simulation engine and export utilities |

---

## 🧪 Built-in Simulations

### ⚛️ Physics
- **Simple Pendulum** — Damped harmonic motion, computes period & natural frequency
- **Projectile Motion** — 2D trajectory with air resistance; computes range & max height
- **Wave Interference** — Superposition of two sine waves with phase control

### 🧬 Biology
- **Population Dynamics** — Lotka–Volterra predator-prey model

### ⚡ Electronics
- **RC Circuit** — Charge/discharge curves with time-constant calculation

### 🔭 Astronomy
- **Orbital Mechanics** — Elliptical orbits via Newtonian gravity (Kepler's laws)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+**
- **npm 9+**

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/virtual-lab-sim-manager.git
cd virtual-lab-sim-manager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start dev server
```bash
npm run dev
# Opens http://localhost:3000
```

### 4. Build for production
```bash
npm run build
npm run preview   # preview the production build locally
```

---

## 📁 Project Structure

```
virtual-lab-sim-manager/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions → GitHub Pages
├── .vscode/
│   ├── settings.json           # Editor settings (format on save, ESLint)
│   ├── extensions.json         # Recommended extensions
│   └── launch.json             # Debug configs (Chrome + Vitest)
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx         # Collapsible navigation sidebar
│   │   ├── ParameterPanel.tsx  # Dynamic parameter controls
│   │   ├── ResultsChart.tsx    # Recharts line/scatter charts
│   │   └── SimulationRunner.tsx# Run/pause/stop + progress UI
│   ├── hooks/
│   │   └── useSimulationRunner.ts  # Custom hook wiring runner ↔ store
│   ├── pages/
│   │   ├── DashboardPage.tsx   # Overview stats + recent sims
│   │   ├── SimulationsPage.tsx # Full simulation catalog + runner
│   │   ├── LabsPage.tsx        # Lab CRUD management
│   │   └── OtherPages.tsx      # Favorites + Settings
│   ├── simulations/
│   │   └── engine.ts           # Physics/bio/electronics engines
│   ├── store/
│   │   └── simulationStore.ts  # Zustand + Immer + localStorage
│   ├── styles/
│   │   └── global.css          # Design system (CSS variables, tokens)
│   ├── test/
│   │   ├── setup.ts            # Vitest/jsdom setup
│   │   ├── engine.test.ts      # Engine unit tests
│   │   └── export.test.ts      # Export utility tests
│   ├── types/
│   │   └── index.ts            # All TypeScript types
│   ├── utils/
│   │   └── export.ts           # CSV + JSON export
│   ├── App.tsx                 # Root layout + page switching
│   └── main.tsx                # React entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
└── package.json
```

---

## 🛠️ Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest unit tests |
| `npm run test:ui` | Vitest with browser UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Prettier format all source files |
| `npm run type-check` | TypeScript type-check without emit |

---

## 🌐 Deploy to GitHub Pages

The repo ships with a complete GitHub Actions workflow. To enable:

1. Go to your repo → **Settings → Pages**
2. Set **Source** to `GitHub Actions`
3. Push to `main` — the workflow will build and deploy automatically

Your site will be live at:
```
https://YOUR_USERNAME.github.io/virtual-lab-sim-manager/
```

> ⚠️ **Important:** Update `vite.config.ts` base path if your repo name differs:
> ```ts
> // vite.config.ts
> export default defineConfig({
>   base: '/virtual-lab-sim-manager/',
>   ...
> })
> ```

---

## 🧩 Adding a New Simulation

1. **Define parameters** in `src/store/simulationStore.ts` under `DEFAULT_SIMULATIONS`
2. **Write the engine function** in `src/simulations/engine.ts` and register it in `ENGINES`
3. **Add chart labels** to `getChartLabels()` in engine.ts
4. The UI picks it up automatically — no other changes needed!

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 5 |
| State | Zustand 4 + Immer |
| Charts | Recharts 2 |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Math | Math.js |
| Testing | Vitest + jsdom |
| Notifications | React Hot Toast |
| Deployment | GitHub Actions + GitHub Pages |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-simulation`
3. Commit your changes: `git commit -m "feat: add my simulation"`
4. Push and open a Pull Request

---

## 📄 License

MIT © 2025 — see [LICENSE](LICENSE) for details.
