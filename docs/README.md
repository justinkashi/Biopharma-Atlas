# Data Sources & Research Documentation

This folder contains all the raw research and API data that powers the BioPharma Atlas dashboard.

## Research Reports (`research/`)

These are the deep-dive research reports compiled from FDA databases, academic literature, ClinicalTrials.gov, and industry sources. They were used to inform the data in `client/src/data/pipelineData.ts`.

| File | Contents | Size |
|------|----------|------|
| `research_modalities.md` | 25-year history of FDA drug approvals by modality (small molecules, mAbs, ADCs, gene therapy, etc.), year-by-year approval counts, paradigm shifts | ~689 lines |
| `research_novel_modalities.md` | Deep dives into ADCs, gene therapy, cell therapy (CAR-T), and RNA therapeutics — mechanisms, key approvals, pipeline trajectories, clinical challenges | ~602 lines |
| `research_therapeutic_areas.md` | Therapeutic area trends, organ system mapping, disease-target relationships, trial volume by condition, delivery routes | ~682 lines |

## Raw API Data (`raw-api-data/`)

JSON responses from public APIs queried during development:

| File | Source | Contents |
|------|--------|----------|
| `fda_yearly_data.json` | [OpenFDA API](https://open.fda.gov/) | Annual FDA novel drug approval counts (2000–2024) |
| `clinicaltrials_data.json` | [ClinicalTrials.gov API](https://clinicaltrials.gov/data-api/about-api) | Clinical trial counts by therapeutic condition |
| `modality_pipeline_data.json` | [ClinicalTrials.gov API](https://clinicaltrials.gov/data-api/about-api) | Active trial counts by drug modality/intervention type |

## Compiled Data

All of the above was synthesized into a single TypeScript file that the dashboard imports directly:

- **`client/src/data/pipelineData.ts`** (38 KB, 432 lines) — Contains all modality timelines, funnel attrition data, organ system mappings, target class heatmap data, sponsor profiles, milestone annotations, and educational tooltip content.

## How to Update the Data

If you want to refresh the data in the future:

1. **FDA approvals**: Query the OpenFDA drug approvals endpoint for updated yearly counts
2. **Clinical trials**: Query the ClinicalTrials.gov v2 API for current trial counts by condition and intervention
3. **Update `pipelineData.ts`**: Modify the arrays/objects in the data file to reflect new numbers
4. **Rebuild**: Run `npm run build` to regenerate the static bundle

No backend server is needed — all data is bundled at build time.
