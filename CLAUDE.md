# BioPharma Atlas — Claude Code Context

## What this project is
A fully **static** React/TypeScript data dashboard tracking 25 years of biopharma drug development (2000–2025). No backend, no API keys, no server-side routing. Deploys to GitHub Pages.

## Commands
```bash
npm run dev          # Vite dev server
npm run build        # Production build → dist/
npm run typecheck    # TypeScript strict-mode compile check (no emit)
npm test             # Vitest unit tests
```

## Key architecture decisions
- **Wouter with hash routing** (`useHashLocation`) — required for GitHub Pages static hosting. Never switch to BrowserRouter.
- **All data is in `client/src/data/pipelineData.ts`** — a single 500+ line TypeScript file. Changes to any chart or metric start here. No API calls at runtime.
- **Data confidence ratings** — every dataset in `dataSourceNotes` must have a confidence level: `✓ verified` (direct API), `~ composite` (FDA + manual), `* estimated` (industry reports). Add a rating whenever you add data.
- **Lazy loading split** — 7 core pages are eagerly loaded in `App.tsx`; 7 heavy pages (`StockPitch`, `Encyclopedia`, etc.) are `React.lazy`. Keep this split.
- **Dark-first design** — Background `#0f1117`, primary cyan `#06b6d4`. All new components must work in dark mode. Do not add light-mode assumptions.
- **Charts use Recharts (SVG)** — do not replace with Canvas-based alternatives. The Body Map uses hand-drawn D3/SVG overlays in `BodyMap.tsx`.

## What NOT to do
- Do not introduce a backend, database, or runtime API keys — `docs/DATABASE_ARCHITECTURE.md` is a future aspirational spec only.
- Do not push to `main` directly — deploy CI runs on `main`, so broken builds break the live site.
- Do not use `git add -A` or `git add .` — stage specific files to avoid committing build artifacts.

## Styling
Tailwind CSS v3 with shadcn/ui primitives. CSS custom properties (HSL vars) are defined in `client/src/index.css`. Use `cn()` from `@/lib/utils` for conditional class merging.

## Testing
Tests live in `client/src/__tests__/`. Run with `npm test`. Use Vitest + React Testing Library. Smoke tests (page renders without throwing) are the baseline; data-shape tests for `pipelineData.ts` are highest ROI.

## Path aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`

## Data sources (current)
All data fetched April 2026 from ClinicalTrials.gov API v2, FDA CDER/CBER, and industry reports. See `docs/data-sources/DATA_DICTIONARY.md` for per-dataset confidence levels.
