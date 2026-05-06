# BioPharma Atlas

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.x-22C55E?style=flat)
![Static](https://img.shields.io/badge/Static-No_Backend-F97316?style=flat)

An interactive data visualization dashboard mapping 25 years of global drug development — from the first targeted kinase inhibitor in 2001 to CRISPR therapies in 2023. Built for bioengineers, scientists, and analysts who want real data and biological context, not marketing slides.

---
WEBSITE: LIVE AT https://justinkashi.github.io/Biopharma-Atlas/ 

---

## What Is This?

BioPharma Atlas is a competitive intelligence dashboard built by a scientist, for investors and BD strategy teams who need to understand the drug development landscape quickly and confidently.

Answering basic questions before a partner call — *How crowded is the bispecific space? Who's already in this mechanism? What's the historical attrition rate for ADCs?* — currently means stitching together FDA databases, ClinicalTrials.gov, company IR pages, and industry reports. BioPharma Atlas puts 25 years of FDA approvals, 27,000+ active trials, phase attrition rates, target class trends, and major sponsor pipelines in one place, with data confidence ratings shown inline.

Built for the kind of rapid landscape analysis that goes into partnership decks, licensing evaluations, and opportunity assessments — without a Bloomberg Terminal.

**Relevant for BD, strategy, and scientific teams at clinical-stage biotechs:**

- **"Who else is competing in our modality and indication?"** — Sponsors view shows pipeline size and modality focus across 17 major players, from Roche/AstraZeneca down to focused biotechs like Alnylam (siRNA) and CRISPR Therapeutics. Useful for licensing scans, competitor monitoring, and partnership target lists.
- **"Where is the field actually going?"** — Modality Timeline decomposes every FDA approval from 2000–2025 by drug class, making it obvious where the field has invested vs. retreated (e.g., the immune checkpoint explosion: 2 active programs in 2005 → 650 in 2025).
- **"What's the realistic clinical risk for our modality?"** — Pipeline Funnel shows Phase I → II → III → Approved attrition by modality, alongside live ClinicalTrials.gov pipeline counts (27k+ cell therapy trials, 15k+ mAb trials).
- **"What's the activity in our target organ system?"** — Body Map shows real trial counts, top modalities, delivery routes, and approved drugs by organ region — useful for orienting around indication selection and tissue-specific delivery considerations.
- **"Which targets are heating up?"** — Target Class Heatmap shows 10 drug-target classes across 2005 / 2015 / 2025, surfacing emerging spaces (PROTACs: 0 → 45) alongside saturated ones.

**This is the current version — a fully static dashboard.** The roadmap takes it significantly further. The architecture specification in this repo (`DATABASE_ARCHITECTURE.md`) outlines the transition to a live data platform: automated ingestion pipelines pulling daily from ClinicalTrials.gov, FDA, SEC EDGAR, and stock feeds; a structured PostgreSQL backend with full data provenance tracking; and an AI layer for natural language querying, catalyst event detection, and Phase 3 success prediction. The goal is a tool where a BD team can ask *"show me all bispecific programs in solid tumors that entered Phase 2 in the last 18 months and flag any that had a >10% stock move on data readout"* — and get an answer in seconds, not days.

---

## Features

| Feature | Description |
|---------|-------------|
| **Data Confidence Badges** | Every chart header shows a ✓/~/\* badge indicating whether data is API-verified, composite from multiple sources, or estimated from industry reports |
| **Learn More Tooltips** | Every drug target class and organ system has an expandable tooltip written at bioengineering grad student level — mechanism, drug delivery biology, and landmark drug examples |
| **Anatomical Body SVG** | Custom-drawn human body with realistic organ shapes (not just ellipses) — brain with folds, lung lobes, kidney beans, GI coils, major blood vessels |
| **InfoPanel** | Slide-in panel with deep modality education: mechanism of action, advantages/limitations, landmark drug cards with significance descriptions |
| **Interactive Heatmap** | Target class activity 2005→2015→2025 with color scale, click-to-expand detail panel, and trend indicators |
| **Milestone Timeline** | 15 annotated breakthrough moments from imatinib (2001) to TIL therapy (2024) |
| **Error Boundary** | React error boundary wrapping each page section — render failures are caught and displayed gracefully without crashing the app |
| **Hero Onboarding** | Dismissable banner with data source disclosure, navigation guide, and description |

---

## Data Sources

| Dataset | File | Confidence | Source |
|---------|------|-----------|--------|
| FDA Approvals by Year | `fda_approvals_by_year.json` | ~ Composite | FDA CDER NME + CBER BLA annual compilations |
| Trials by Condition | `clinicaltrials_by_condition.json` | ✓ Verified | ClinicalTrials.gov API v2, queried April 2026 |
| Pipeline by Modality | `clinicaltrials_by_modality.json` | ✓ Verified | ClinicalTrials.gov API v2, queried April 2026 |
| Phase Attrition | `attrition_estimates.json` | * Estimated | BIO Industry Analysis 2021 + Nature Reviews Drug Discovery |
| Target Class Activity | `target_class_activity.json` | * Estimated | Industry landscape analyses + ClinicalTrials.gov keyword searches |
| Sponsor Pipelines | `sponsor_pipelines.json` | * Estimated | Company IR disclosures + SEC filings |

**Legend:** ✓ Verified = queried from primary API · ~ Composite = cross-referenced from multiple primary sources · * Estimated = derived from industry reports (order-of-magnitude, not exact)

Full documentation in [`docs/data-sources/DATA_DICTIONARY.md`](docs/data-sources/DATA_DICTIONARY.md).

---

## Architecture

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 18 + TypeScript | Component composition, type-safe data |
| Build | Vite 5 | Fast HMR, optimized static bundle |
| Styling | Tailwind CSS v3 | Utility-first, consistent dark theme |
| Charts | Recharts 2.x | Composable chart primitives, SVG-based |
| Routing | Wouter (hash routing) | Zero-dependency, works in static hosting |
| Animation | Framer Motion | Page transitions, organ pulse animations |
| UI Components | shadcn/ui | Accessible component primitives |

### Design Philosophy

**No backend.** All data is bundled as TypeScript imports at build time. The app is a single static HTML file — deployable to GitHub Pages, Netlify, S3, or any CDN with no server configuration.

**Data provenance built-in.** The `dataSourceNotes` export in `pipelineData.ts` maps every dataset to its confidence level and source. `DataBadge` components render this metadata inline next to every chart header.

**Dark-first, desktop-first.** Background `#0f1117`, card `#141720`, primary `#06b6d4`. Designed for a 1280px+ desktop context matching the research/analytics use case.

### Data Flow

```
pipelineData.ts  ──►  React components  ──►  Recharts / SVG
     │                       │
     │                  DataBadge                 (provenance)
     │                  ErrorBoundary             (fault isolation)
     │                  InfoPanel                 (education)
     │
docs/data-sources/  ──►  DATA_DICTIONARY.md      (documentation)
```

---

## Project Structure

```
biopharma-atlas-export/
├── client/
│   └── src/
│       ├── components/
│       │   ├── DataBadge.tsx          # Data confidence badge + tooltip
│       │   ├── ErrorBoundary.tsx      # React error boundary
│       │   ├── InfoPanel.tsx          # Modality deep-dive slide panel
│       │   ├── Sidebar.tsx            # Navigation sidebar
│       │   └── ui/                    # shadcn/ui component primitives
│       ├── data/
│       │   └── pipelineData.ts        # All app data as TS exports
│       ├── pages/
│       │   ├── Overview.tsx           # KPIs, charts, milestones + hero
│       │   ├── ModalityTimeline.tsx   # 25yr FDA approval stacked chart
│       │   ├── PipelineFunnel.tsx     # Attrition funnel + pipeline bar
│       │   ├── BodyMap.tsx            # Anatomical SVG + organ detail
│       │   ├── TargetHeatmap.tsx      # Target class heatmap
│       │   └── Sponsors.tsx           # Company pipeline comparison
│       ├── App.tsx                    # Router, ErrorBoundary, InfoPanel context
│       ├── index.css                  # Tailwind + CSS variables (dark theme)
│       └── main.tsx                   # React entry point
├── docs/
│   ├── data-sources/                  # Raw JSON data + DATA_DICTIONARY.md
│   ├── raw-api-data/                  # Original API responses
│   ├── research/                      # Research notes for each section
│   └── ROADMAP.md                     # v2.x improvement roadmap
├── dist/                              # Build output (gitignored in most setups)
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Development

```bash
git clone https://github.com/your-username/biopharma-atlas
cd biopharma-atlas
npm install
npm run dev
```

The app runs at `http://localhost:5173` (or your configured Vite port). All data is bundled — no environment variables or API keys needed.

### Production Build

```bash
npm run build
# Output: dist/public/index.html + dist/public/assets/
```

The build output is a self-contained static bundle. No server required.

---

## Deployment

### GitHub Pages

1. In `vite.config.ts`, set the base path:
   ```ts
   export default defineConfig({
     base: '/biopharma-atlas/',
     // ...
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Upload dist/public/ to gh-pages branch
   ```

3. Or use the included GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment on push to `main`.

### Netlify / Vercel

- Build command: `npm run build`
- Publish directory: `dist/public`
- No environment variables needed

### S3 Static Hosting

Upload the contents of `dist/public/` to any S3-compatible bucket with static website hosting enabled. No server configuration needed.

---

## Data Freshness & How to Update

BioPharma Atlas is designed for periodic manual data updates (not continuous live data). The recommended update cadence is:

| Dataset | When to Update |
|---------|---------------|
| FDA approvals | January (after FDA annual report) |
| ClinicalTrials.gov counts | Quarterly (March, June, September, December) |
| Attrition estimates | When new BIO/IQVIA industry analyses are published |
| Sponsor pipelines | After R&D Day season (February–April) |

**To update data:**
1. Re-query ClinicalTrials.gov API (see `DATA_DICTIONARY.md` for query patterns)
2. Download latest FDA NME list from fda.gov
3. Update `client/src/data/pipelineData.ts` exports
4. Update `docs/data-sources/*.json` files with new data + updated `_meta.last_updated`
5. Run `npm run build` and verify the build passes
6. Commit and deploy

---

## v2 Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full prioritized improvement plan.

**Highlights:**
- v2.1: Replace estimated data with primary API queries; time-series animation; search/filter across all views
- v2.2: Live ClinicalTrials.gov API integration; drug detail drill-down; mobile responsive layout
- v3: 3D body map with Three.js; AI natural language queries; automated data refresh pipeline

---

## License

MIT — free to use, modify, and deploy. Attribution appreciated.

---

*Built with real data from ClinicalTrials.gov, FDA CDER/CBER, and peer-reviewed literature. Data confidence ratings displayed throughout the app. See [`docs/data-sources/`](docs/data-sources/) for full provenance documentation.*
