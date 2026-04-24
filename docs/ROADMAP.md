# BioPharma Atlas — v2+ Development Roadmap

This document outlines concrete next-step improvements to the BioPharma Atlas dashboard, organized by priority and implementation complexity.

---

## Current State (v2.0)

- 6 interactive views (Overview, Modality Timeline, Pipeline Funnel, Body Map, Target Heatmap, Sponsors)
- Data confidence badge system (verified/composite/estimated) on all charts
- Detailed anatomical SVG body map with realistic organ shapes
- LearnMoreTooltip system with biology explanations for all target classes and organ systems
- Hero/onboarding section with data source disclosure
- React ErrorBoundary for fault isolation
- Static frontend — no backend, all data bundled as TypeScript

---

## High Priority (v2.1) — Near-Term

### 1. Replace Estimated Data with Primary API Queries

**Problem:** The phase attrition funnel and target class activity numbers are currently industry-wide estimates from 2021 reports. They're useful for visualization but shouldn't be cited.

**Solution:**
- Build a ClinicalTrials.gov v2 API query pipeline that counts actual trials by phase, modality, and intervention type
- Query ASGCT quarterly pipeline reports for gene/cell therapy
- Update `attrition_estimates.json` with real phase-stratified counts
- Flag all data cells with last-queried timestamps
- Write a `scripts/refresh-data.ts` script that re-queries ClinicalTrials.gov on demand

**Effort:** Medium (2–3 days)

---

### 2. Time-Series Animation (Play Button)

**Problem:** The modality evolution chart is static — users can't watch the evolution unfold.

**Solution:**
- Add a "Play" button to the Modality Timeline page
- Use Recharts' `syncId` or `data` slice approach to animate one year at a time
- Show the current year indicator moving across the x-axis
- Let users pause, scrub, and step year-by-year
- Add the same animation to the Target Heatmap (watch the checkpoint inhibitor explosion happen)

**Implementation notes:**
- `setInterval` updating a `currentYearIndex` state
- `modalityTimelineData.slice(0, currentYearIndex)` for animated data input
- Recharts `isAnimationActive={false}` to prevent double-animation on data change

**Effort:** Low-medium (1 day)

---

### 3. Global Search / Filter

**Problem:** Users can't search across the dashboard. If you want to find everything about "KRAS" or "Dupilumab", there's no way to do it.

**Solution:**
- Add a search bar in the Sidebar (or as a command palette: Cmd+K)
- Index: drug names, targets, companies, modalities, conditions, mechanism keywords
- Show results grouped by view: "Found in Body Map, Target Heatmap, Overview milestones"
- Clicking a result navigates to that view and highlights the relevant element
- Use Fuse.js for fuzzy client-side search (no backend needed)

**Implementation notes:**
- Build a search index from all data exports in `pipelineData.ts`
- shadcn `<Command>` component for the command palette UI
- `useHashLocation` for navigation from search results

**Effort:** Medium (2 days)

---

### 4. Export Functionality

**Problem:** Analysts and researchers want to use this data downstream but can't extract it.

**Solution:**
- **CSV export** for all data tables (target class activity, sponsor pipeline, attrition funnel)
- **PNG export** for all charts using `html2canvas` or SVG serialization
- **JSON export** linking to `docs/data-sources/` files
- Add a download button (⬇) to each chart card header

**Implementation notes:**
- `html2canvas` for Recharts export (they render as SVG, then rasterize)
- Native `Blob` + `URL.createObjectURL` for CSV export (no library needed)
- `document.querySelector('svg').outerHTML` + `FileReader` for SVG export

**Effort:** Low-medium (1 day)

---

## Medium Priority (v2.2) — Future Cycle

### 5. Live ClinicalTrials.gov Integration

**Problem:** Data goes stale between manual updates. Trial counts change weekly.

**Solution:**
- Add a lightweight API mode where the app queries ClinicalTrials.gov v2 directly from the browser
- Show "Live Data" badge vs "Cached" badge depending on fetch success
- Cache responses in React state (not localStorage) for the session duration
- Graceful fallback to bundled data if API is unavailable or rate-limited
- Display "Last refreshed: X minutes ago" timestamp

**Technical notes:** ClinicalTrials.gov API is publicly accessible with CORS headers enabled. No API key required. Rate limit is generous (~100 req/min).

**Effort:** Medium (2–3 days)

---

### 6. Drug Detail Drill-Down

**Problem:** Drug names appear throughout the app (milestone cards, organ detail panels, tooltip examples) but clicking them does nothing.

**Solution:**
- Add a `drugDatabase` export to `pipelineData.ts` with profiles for 30–50 landmark drugs
- Each profile: mechanism, approval date, indication, modality, target, sponsor, trial history
- Clicking a drug name anywhere in the app opens a drug detail modal
- Include a mini-timeline of the drug's regulatory journey (IND → Phase 1 → approval)

**Effort:** Medium-high (3–4 days, data entry + UI)

---

### 7. Mobile Responsive Layout

**Problem:** The dashboard is built desktop-first (1280px+). It doesn't work well on mobile.

**Solution:**
- Replace the persistent sidebar with a bottom tab bar on mobile (< 768px)
- Stack the two-column layouts vertically on mobile
- Make the Body Map SVG larger on mobile (full-width, scrollable)
- Reduce chart heights for mobile viewports
- Test on iOS Safari (a common Tailwind issue with `height: 100vh`)

**Effort:** Medium (2 days)

---

### 8. Dark/Light Theme Toggle

**Problem:** The app is locked to dark mode. Some users prefer light mode for presentations.

**Solution:**
- Add `ThemeProvider` context using `useState` seeded from `window.matchMedia`
- Toggle `dark` class on `document.documentElement`
- Define CSS variables for both `:root` (light) and `.dark` (dark) in `index.css`
- Add sun/moon toggle button in sidebar footer
- Note: cannot use `localStorage` for persistence (static site constraint) — mode resets on page load

**Effort:** Medium (1–2 days)

---

### 9. Compare View

**Problem:** Users want to compare modalities or companies side-by-side but have to flip between views.

**Solution:**
- Add a "Compare" mode accessible from the Modality Timeline and Sponsors pages
- Select 2–3 modalities: see their approval trajectories overlaid
- Select 2–3 companies: see their pipeline sizes and modality mix side-by-side
- Use a split-panel layout with each selection shown independently

**Effort:** Medium-high (3 days)

---

## Nice to Have (v3) — Research-Grade

### 10. 3D Body Map with Three.js

**Problem:** The 2D SVG body map is a huge improvement over ellipses, but a 3D anatomical model would be even more informative and visually impactful.

**Solution:**
- Use Three.js with a GLTF anatomical model (open-source models available from OpenAnatomy project)
- Map organ regions to clickable 3D mesh objects
- Use the same data and color system as the current 2D body map
- Allow rotation (mouse drag) and zoom
- Maintain the same detail panel for data display

**Effort:** High (1–2 weeks, requires 3D asset pipeline setup)

---

### 11. AI Natural Language Query

**Problem:** Non-technical users don't know which view to navigate to for their question.

**Solution:**
- Add a natural language query input: "Show me all KRAS inhibitors in Phase 3"
- Use a client-side LLM (or lightweight keyword parser) to route queries to the right view
- Parse intent and generate a filtered view automatically
- Highlight relevant data points in the active visualization

**Technical notes:** Could use a serverless edge function (Cloudflare Workers, Vercel Edge) for LLM inference without a backend, or use a client-side ONNX model for offline functionality.

**Effort:** High (1 week + API cost/infrastructure)

---

### 12. Automated Data Refresh Pipeline

**Problem:** Manual data updates are error-prone and delay freshness.

**Solution:**
- GitHub Actions cron workflow (weekly or monthly)
- Python script querying ClinicalTrials.gov v2 API, FDA API, and parsing FDA annual NME list
- Generate updated JSON files in `docs/data-sources/`
- PR auto-created with data diff summary
- Human review before merge (to catch API changes or unusual data)
- Auto-deploy on merge

**Effort:** High (2–3 days initial setup, then maintenance-free)

---

### 13. Collaboration Features

**Problem:** Research teams want to share filtered views and add annotations.

**Solution:**
- Shareable URL state: encode filters/selections in hash parameters
- Annotations: add text notes to specific data points (stored in URL hash)
- Bookmark specific views with custom names
- Export annotated views as PNG with annotation overlay

**Technical notes:** Can be done entirely client-side using URL hash encoding (no backend). E.g., `/#/heatmap?selected=Kinases&year=2025`

**Effort:** Medium (2 days for URL state; high for full annotation system)

---

## Non-Goals

These are explicitly out of scope for BioPharma Atlas:

- **Real-time clinical trial tracking** — too expensive (ClinicalTrials.gov has data freshness limits)
- **Financial data (stock prices, revenue)** — different product category
- **Regulatory submission tracking** — requires premium data sources (Cortellis, Citeline)
- **Drug-drug interaction data** — requires clinical pharmacology database, out of scope
- **User accounts/authentication** — static app design principle; adds complexity without value for this use case

---

*Last updated: April 2026*
