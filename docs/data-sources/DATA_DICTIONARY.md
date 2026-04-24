# BioPharma Atlas — Data Dictionary

This document describes every data file used in BioPharma Atlas, including source, confidence level, how counts were obtained, and how to refresh the data.

## Confidence Rating System

| Symbol | Level | Meaning |
|--------|-------|---------|
| ✓ | **Verified** | Directly queried from primary APIs (ClinicalTrials.gov v2, FDA databases). Numbers are exact for the query date. |
| ~ | **Composite** | Real data combined from multiple primary sources, requiring manual cross-referencing or classification. High confidence but some subjective judgment applied. |
| * | **Estimated** | Derived from industry reports, published analyses, or keyword-based approximations. Order-of-magnitude correct; should not be cited as precise statistics. |

---

## File Reference

### 1. `fda_approvals_by_year.json` — ~ Composite

**What it contains:** Year-by-year FDA novel drug approvals from 2000–2025, broken down by drug modality (small molecule, mAb, ADC, bispecific, gene therapy, CAR-T, RNA therapeutic, peptide, mRNA vaccine, Fc-fusion).

**Source:** FDA CDER NME (Novel Molecular Entity) annual lists + CBER BLA annual approvals.
- Primary: https://www.fda.gov/drugs/development-approval-process-drugs/novel-drug-approvals-fda
- CBER biologics: https://www.fda.gov/vaccines-blood-biologics/development-approval-process-cber

**Why composite?** The FDA lists give drug names and dates but not modality categories. Each drug was individually classified into a modality category by reviewing drug labels (Prescribing Information), mechanism-of-action descriptions, and published drug profiles. This classification requires judgment — e.g., a therapeutic protein may be classified as "mAb" or "Fc-fusion" depending on its structure.

**How to refresh:**
1. Download the CDER NME list from the FDA website (Excel/PDF available)
2. Download CBER BLA approvals separately
3. For each new approval, determine modality from FDA drug label (section 12.1 "Mechanism of Action")
4. Update the JSON array with the new year's breakdown

---

### 2. `clinicaltrials_by_condition.json` — ✓ Verified

**What it contains:** Total registered study counts on ClinicalTrials.gov, grouped by major therapeutic condition area (oncology, cardiovascular, respiratory, etc.).

**Source:** ClinicalTrials.gov API v2 — queried April 2026.
- API endpoint: `https://clinicaltrials.gov/api/v2/studies`
- Query format: `?query.cond={condition_term}&countTotal=true`

**Notes:** Counts include all study types (interventional + observational) and all statuses. Some studies may appear in multiple condition categories (e.g., lung cancer in both "oncology" and "respiratory"). The counts represent total registered studies matching the condition search term, not necessarily completed or active trials.

**How to refresh:**
```bash
# Example API call for oncology
curl "https://clinicaltrials.gov/api/v2/studies?query.cond=neoplasms&countTotal=true&pageSize=1" \
  | jq '.totalCount'

# Repeat for each condition group using terms from the JSON file
```

---

### 3. `clinicaltrials_by_modality.json` — ✓ Verified

**What it contains:** Active clinical trial pipeline counts by drug modality type (monoclonal antibody, CAR-T, gene therapy, siRNA, etc.).

**Source:** ClinicalTrials.gov API v2 — queried April 2026.
- Query format: `?query.intr={modality_term}&countTotal=true`

**Notes:** Counts represent total registered studies where the intervention matches the modality keyword. This is broader than "active" trials — it includes completed, terminated, and recruiting studies. The modality search uses free-text intervention terms, which may miss some studies or include off-target hits. Cross-reference with commercial pipeline databases (Evaluate Pharma, GlobalData) for more precise active-only counts.

**How to refresh:**
```bash
# Example for monoclonal antibodies
curl "https://clinicaltrials.gov/api/v2/studies?query.intr=monoclonal+antibody&countTotal=true&pageSize=1" \
  | jq '.totalCount'
```

---

### 4. `attrition_estimates.json` — * Estimated

**What it contains:** Phase-by-phase attrition funnel estimates for 8 drug modalities (number of compounds at Phase I, II, III, and approved).

**Source:** 
- BIO Industry Analysis 2021: "Clinical Development Success Rates 2011-2020" (bio.org)
- Nature Reviews Drug Discovery: "Clinical trial success rates by phase, indication, and modality" (various years)
- ASGCT Gene Therapy Pipeline Report Q4 2024

**IMPORTANT DISCLAIMER:** These are industry-wide estimates, not exact counts. Phase counts represent approximate active programs at each phase level based on pooled analyses. The data is intended to illustrate relative attrition dynamics between modalities — do not use these numbers as precise statistics in publications.

**How to refresh:** Monitor BIO's annual clinical success rate reports (published annually at bio.org/blogs). IQVIA also publishes modality-specific attrition analyses. For gene therapy/cell therapy specifically, ASGCT quarterly pipeline reports are the best source.

---

### 5. `target_class_activity.json` — * Estimated

**What it contains:** Pipeline activity levels by drug target class in 2005, 2015, and 2025. "Activity" represents approximate number of active drug programs targeting that class.

**Source:** 
- 2025 figures: ClinicalTrials.gov keyword searches (target-specific terms)
- 2005/2015 figures: Retrospective estimates from published landscape analyses in Nature Reviews Drug Discovery and Drug Discovery Today

**IMPORTANT:** Numbers represent approximate active programs, not exact trial counts. Historical figures (2005, 2015) are especially approximate — they are derived from retrospective analyses rather than direct API queries. Use for trend visualization, not statistical analysis.

**How to refresh:** For current year, query ClinicalTrials.gov with target-specific terms. Historical data would require mining published literature reviews.

---

### 6. `sponsor_pipelines.json` — * Estimated

**What it contains:** Approximate pipeline sizes and focus areas for major pharmaceutical companies and biotechs.

**Source:** 
- Company annual reports (10-K filings, SEC EDGAR)
- R&D Day presentations (publicly available on company IR websites)
- Company pipeline pages

**IMPORTANT:** Pipeline sizes are highly variable depending on inclusion criteria. Some companies count all discovery/preclinical programs; others only clinical-stage. These numbers represent approximate relative pipeline sizes for visualization purposes. For accurate company benchmarking, always use official company disclosures or commercial databases (Evaluate Pharma, Citeline).

**How to refresh:** Check company IR websites annually. R&D Day presentations (typically held January–March each year) provide the most detailed pipeline snapshots.

---

## Cross-References

The data in these files corresponds to the TypeScript data in:
- `client/src/data/pipelineData.ts` — main data module

TypeScript exports mapped to JSON files:

| TypeScript export | JSON file |
|---|---|
| `modalityTimelineData` | `fda_approvals_by_year.json` |
| `clinicalTrialsByCondition` | `clinicaltrials_by_condition.json` |
| `pipelineByModality` | `clinicaltrials_by_modality.json` |
| `attritionData` | `attrition_estimates.json` |
| `targetClassData` | `target_class_activity.json` |
| `sponsorData` | `sponsor_pipelines.json` |

---

## Data Freshness

| Dataset | Last Updated | Update Frequency |
|---------|-------------|-----------------|
| FDA Approvals by Year | April 2026 | Annual (after year-end) |
| Trials by Condition | April 2026 | Quarterly |
| Pipeline by Modality | April 2026 | Quarterly |
| Attrition Estimates | April 2026 (source: 2021) | Every 2–3 years |
| Target Class Activity | April 2026 | Annual |
| Sponsor Pipelines | April 2026 | Annual (post-R&D Day) |

---

## Raw API Data

See `/docs/raw-api-data/` for the raw JSON responses from ClinicalTrials.gov and FDA API queries used to populate this dashboard's verified datasets.
