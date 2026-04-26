# BioPharma Atlas — Database Architecture & Data Platform Specification

**Version:** 1.0  
**Date:** April 2026  
**Status:** Technical Specification — Implementation Ready  
**Audience:** Data engineers, backend developers, full-stack developers

---

## Table of Contents

1. [Database Selection & Architecture](#1-database-selection--architecture)
2. [Data Ingestion Pipeline](#2-data-ingestion-pipeline)
3. [Data Verification & Audit System](#3-data-verification--audit-system)
4. [Additional Data to Store](#4-additional-data-to-store)
5. [How to Make the Dashboard More Powerful](#5-how-to-make-the-dashboard-more-powerful)
6. [Audit of the Current Version](#6-audit-of-the-current-version)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Database Selection & Architecture

### 1.1 Why PostgreSQL

The recommended primary data store is **PostgreSQL 16** with the **TimescaleDB** extension for time-series tables.

| Criterion | PostgreSQL | SQLite | MySQL | MongoDB |
|---|---|---|---|---|
| Relational joins (multi-entity pharma data) | Excellent | Good | Good | Poor |
| JSONB for semi-structured data (SEC filings) | Native | None | Limited | Native |
| Time-series (TimescaleDB extension) | Extension available | No | No | No |
| Full-text search | Built-in | Limited | Limited | Good |
| Cost | Free / open-source | Free | Free | Free tier limited |
| Audit/provenance support | Excellent | Poor | OK | OK |
| Ecosystem (Python, Node, ORMs) | Best-in-class | Good | Good | Good |

**TimescaleDB** extends PostgreSQL with hypertables optimized for time-ordered inserts and range queries — ideal for daily stock price tables that will grow to millions of rows. It is transparent to the ORM layer; existing SQL queries continue to work unchanged.

**Companion stores** (add when needed, not Day 1):

- **Redis**: Cache for computed aggregates (modality trial counts, approval rate summaries) to avoid expensive recalculations on every page load.
- **Elasticsearch / OpenSearch**: Full-text search across drug names, company descriptions, earnings transcripts, and clinical trial summaries. PostgreSQL full-text search handles the early stages but degrades at scale.
- **Neo4j** (Phase 5): Graph database for relationship modeling — company → drug → target → disease → deal. See Section 5.

---

### 1.2 Schema Design

The schema is organized into five logical domains: **Core Entities**, **Clinical/Regulatory**, **Financial/Market**, **Scientific**, and **Platform/Audit**.

#### 1.2.1 Core Entities

```sql
-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE companies (
    id                  SERIAL PRIMARY KEY,
    ticker              VARCHAR(10) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    exchange            VARCHAR(20),                    -- NYSE, NASDAQ, TSX, etc.
    market_cap_usd      BIGINT,                         -- in dollars, from latest stock price
    sector              VARCHAR(100),                   -- 'Biotechnology', 'Pharma', 'MedTech'
    sub_sector          VARCHAR(100),                   -- 'Clinical Stage', 'Commercial Stage'
    modality_focus      VARCHAR(255)[],                 -- PostgreSQL array: {'ADC','CAR-T','mRNA'}
    hq_country          VARCHAR(100),
    hq_city             VARCHAR(100),
    founded_year        SMALLINT,
    employee_count      INTEGER,
    website_url         TEXT,
    ir_page_url         TEXT,
    description_text    TEXT,
    is_public           BOOLEAN DEFAULT TRUE,
    cik                 VARCHAR(20),                    -- SEC CIK number for EDGAR
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_ticker ON companies(ticker);
CREATE INDEX idx_companies_modality ON companies USING GIN(modality_focus);

-- ============================================================
-- PIPELINE PROGRAMS
-- ============================================================
CREATE TABLE pipeline_programs (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    drug_name           VARCHAR(255),                   -- brand/internal name, e.g. 'trastuzumab deruxtecan'
    generic_name        VARCHAR(255),                   -- INN name
    brand_name          VARCHAR(255),                   -- marketed name (post-approval)
    modality            VARCHAR(100),                   -- 'ADC', 'mRNA', 'Cell Therapy', 'Small Molecule', etc.
    target              VARCHAR(255),                   -- 'HER2', 'PD-L1', 'KRAS G12C'
    target_class        VARCHAR(100),                   -- 'RTK', 'Immune Checkpoint', 'RAS Family'
    indication          TEXT,                           -- full indication text
    indication_code     VARCHAR(20),                    -- ICD-10 code
    phase               VARCHAR(50),                    -- 'Preclinical', 'Phase 1', 'Phase 2', 'Phase 3', 'Approved', 'Discontinued'
    status              VARCHAR(50),                    -- 'Active', 'On Hold', 'Discontinued', 'Approved'
    nct_id              VARCHAR(20),                    -- ClinicalTrials.gov primary NCT ID (may be multiple)
    nda_bla_number      VARCHAR(20),                    -- FDA application number post-submission
    is_partnered        BOOLEAN DEFAULT FALSE,
    partner_company_id  INTEGER REFERENCES companies(id),
    partnership_type    VARCHAR(100),                   -- 'Co-development', 'License', 'Royalty'
    geography           VARCHAR(50)[] DEFAULT '{Global}', -- {'US','EU','Japan'}
    first_in_class      BOOLEAN,
    breakthrough_therapy BOOLEAN DEFAULT FALSE,
    fast_track          BOOLEAN DEFAULT FALSE,
    orphan_drug         BOOLEAN DEFAULT FALSE,
    source_type         VARCHAR(100),                   -- 'Company 10-K', 'ClinicalTrials.gov', 'Press Release'
    source_date         DATE,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipeline_company ON pipeline_programs(company_id);
CREATE INDEX idx_pipeline_modality ON pipeline_programs(modality);
CREATE INDEX idx_pipeline_phase ON pipeline_programs(phase);
CREATE INDEX idx_pipeline_target ON pipeline_programs(target);
CREATE INDEX idx_pipeline_nct ON pipeline_programs(nct_id);

-- ============================================================
-- PIPELINE HISTORY (phase transitions over time)
-- ============================================================
CREATE TABLE pipeline_program_history (
    id                  SERIAL PRIMARY KEY,
    program_id          INTEGER NOT NULL REFERENCES pipeline_programs(id),
    snapshot_date       DATE NOT NULL,
    phase               VARCHAR(50),
    status              VARCHAR(50),
    indication          TEXT,
    notes               TEXT,
    source_url          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prog_history_program ON pipeline_program_history(program_id, snapshot_date);
```

#### 1.2.2 Clinical & Regulatory

```sql
-- ============================================================
-- CLINICAL TRIALS (from ClinicalTrials.gov API v2)
-- ============================================================
CREATE TABLE clinical_trials (
    nct_id              VARCHAR(20) PRIMARY KEY,
    title               TEXT NOT NULL,
    brief_summary       TEXT,
    phase               VARCHAR(50),
    status              VARCHAR(100),                   -- 'Recruiting', 'Active not recruiting', 'Completed', etc.
    start_date          DATE,
    completion_date     DATE,
    primary_completion_date DATE,
    enrollment          INTEGER,
    enrollment_type     VARCHAR(20),                    -- 'Actual' or 'Anticipated'
    sponsor             TEXT,
    sponsor_class       VARCHAR(50),                    -- 'Industry', 'NIH', 'Academic'
    intervention_type   VARCHAR(100),                   -- 'Drug', 'Biological', 'Device', 'Combination'
    intervention_name   TEXT,
    condition           TEXT,
    conditions_array    TEXT[],
    primary_outcome     TEXT,
    results_summary     TEXT,
    has_results         BOOLEAN DEFAULT FALSE,
    last_update_date    DATE,
    source_url          TEXT DEFAULT 'https://clinicaltrials.gov/api/v2/',
    fetched_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ct_phase ON clinical_trials(phase);
CREATE INDEX idx_ct_status ON clinical_trials(status);
CREATE INDEX idx_ct_sponsor ON clinical_trials(sponsor);
CREATE INDEX idx_ct_conditions ON clinical_trials USING GIN(conditions_array);

-- ============================================================
-- FDA EVENTS
-- ============================================================
CREATE TABLE fda_events (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER REFERENCES companies(id),
    drug_name           VARCHAR(255),
    application_number  VARCHAR(20),                    -- NDA/BLA number
    event_type          VARCHAR(50) NOT NULL,           -- 'PDUFA', 'AdCom', 'Approval', 'CRL', 'Complete Response'
    event_date          DATE NOT NULL,
    outcome             VARCHAR(100),                   -- 'Approved', 'Rejected', 'Deferred', 'Pending'
    vote_for            INTEGER,                        -- AdCom vote in favor
    vote_against        INTEGER,
    vote_abstain        INTEGER,
    indication          TEXT,
    details             TEXT,
    source_url          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fda_event_type ON fda_events(event_type);
CREATE INDEX idx_fda_event_date ON fda_events(event_date);
CREATE INDEX idx_fda_company ON fda_events(company_id);

-- ============================================================
-- REGULATORY MILESTONES
-- ============================================================
CREATE TABLE regulatory_milestones (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER REFERENCES companies(id),
    program_id          INTEGER REFERENCES pipeline_programs(id),
    drug_name           VARCHAR(255),
    milestone_type      VARCHAR(100),                   -- 'PDUFA Date', 'sNDA Filing', 'Approval', 'CRL', 'EU CHMP Opinion'
    milestone_date      DATE,
    jurisdiction        VARCHAR(50) DEFAULT 'US',       -- 'US', 'EU', 'Japan', 'China'
    status              VARCHAR(50) DEFAULT 'Pending',  -- 'Pending', 'Completed', 'Withdrawn'
    description         TEXT,
    source_url          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPROVAL RATES (phase transition success probabilities)
-- ============================================================
CREATE TABLE approval_rates (
    id                  SERIAL PRIMARY KEY,
    modality            VARCHAR(100),                   -- 'Small Molecule', 'Biologic', 'ADC', etc. NULL = overall
    indication_area     VARCHAR(100),                   -- 'Oncology', 'CNS', 'Cardiovascular', NULL = all
    phase_from          VARCHAR(50) NOT NULL,           -- 'Phase 1', 'Phase 2', 'Phase 3', 'NDA/BLA'
    phase_to            VARCHAR(50) NOT NULL,           -- 'Phase 2', 'Phase 3', 'NDA/BLA', 'Approval'
    success_rate        DECIMAL(5,4) NOT NULL,          -- 0.0 to 1.0
    sample_size         INTEGER,
    source              TEXT,                           -- 'BIO/QLS 2011-2020', 'Citeline 2015-2025'
    year_range_start    SMALLINT,
    year_range_end      SMALLINT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- M&A DEALS
-- ============================================================
CREATE TABLE mna_deals (
    id                  SERIAL PRIMARY KEY,
    acquirer_id         INTEGER REFERENCES companies(id),
    target_id           INTEGER REFERENCES companies(id),
    acquirer_name       VARCHAR(255),                   -- denormalized for cases where acquirer is not in companies table
    target_name         VARCHAR(255),
    deal_value_usd      BIGINT,                         -- total deal value in USD
    upfront_usd         BIGINT,                         -- upfront cash
    milestones_usd      BIGINT,                         -- contingent milestones
    premium_pct         DECIMAL(8,4),                   -- premium over unaffected price
    premium_basis       VARCHAR(100),                   -- 'Prior Close', '30-Day VWAP', '60-Day VWAP'
    modality            VARCHAR(100)[],                 -- primary modalities driving the deal
    key_assets          TEXT,                           -- free text description of pipeline assets
    therapeutic_area    VARCHAR(100),
    deal_type           VARCHAR(50),                    -- 'Acquisition', 'Merger', 'Asset Purchase', 'License'
    announce_date       DATE,
    close_date          DATE,
    status              VARCHAR(50),                    -- 'Announced', 'Closed', 'Terminated', 'Pending'
    sec_merger_proxy_url TEXT,                          -- SEC filing with definitive deal terms
    press_release_url   TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mna_announce ON mna_deals(announce_date);
CREATE INDEX idx_mna_modality ON mna_deals USING GIN(modality);
```

#### 1.2.3 Financial & Market Data

```sql
-- ============================================================
-- STOCK PRICES (TimescaleDB hypertable)
-- ============================================================
CREATE TABLE stock_prices (
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    date                DATE NOT NULL,
    open                DECIMAL(12,4),
    high                DECIMAL(12,4),
    low                 DECIMAL(12,4),
    close               DECIMAL(12,4) NOT NULL,
    adjusted_close      DECIMAL(12,4),
    volume              BIGINT,
    PRIMARY KEY (company_id, date)
);

-- Convert to TimescaleDB hypertable (run after CREATE TABLE)
-- SELECT create_hypertable('stock_prices', 'date');

CREATE INDEX idx_stock_company_date ON stock_prices(company_id, date DESC);

-- ============================================================
-- CATALYST EVENTS
-- ============================================================
CREATE TABLE catalyst_events (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    event_date          DATE NOT NULL,
    event_type          VARCHAR(100),                   -- 'Phase 3 Data', 'PDUFA', 'AdCom', 'M&A', 'Earnings', 'FDA Action'
    drug_name           VARCHAR(255),
    modality            VARCHAR(100),
    description         TEXT,
    stock_price_prior   DECIMAL(12,4),                  -- closing price day before
    stock_price_after   DECIMAL(12,4),                  -- closing price day after
    stock_move_pct      DECIMAL(8,4),                   -- computed: (after - prior) / prior
    volume_ratio        DECIMAL(8,4),                   -- event day volume / 30-day avg volume
    source_url          TEXT,
    verified            BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_catalyst_company ON catalyst_events(company_id, event_date);
CREATE INDEX idx_catalyst_type ON catalyst_events(event_type);

-- ============================================================
-- SEC FILINGS
-- ============================================================
CREATE TABLE sec_filings (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    cik                 VARCHAR(20),
    filing_type         VARCHAR(20) NOT NULL,           -- '10-K', '10-Q', '8-K', 'S-1', 'DEF 14A', 'SC 13G', 'Form 4'
    filing_date         DATE NOT NULL,
    period_end          DATE,
    accession_number    VARCHAR(25),                    -- SEC accession number: XXXXXXXXXX-YY-ZZZZZZ
    edgar_url           TEXT,
    extracted_data_json JSONB,                          -- structured extraction of key metrics
    is_processed        BOOLEAN DEFAULT FALSE,
    processing_notes    TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sec_company_type ON sec_filings(company_id, filing_type);
CREATE INDEX idx_sec_filing_date ON sec_filings(filing_date);
CREATE INDEX idx_sec_extracted ON sec_filings USING GIN(extracted_data_json);

-- ============================================================
-- EARNINGS REPORTS
-- ============================================================
CREATE TABLE earnings_reports (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    fiscal_quarter      VARCHAR(10) NOT NULL,           -- 'Q3 2025', 'Q4 2025'
    report_date         DATE,
    revenue_usd         BIGINT,
    revenue_growth_yoy  DECIMAL(8,4),
    eps_actual          DECIMAL(10,4),
    eps_consensus       DECIMAL(10,4),
    eps_beat_miss       DECIMAL(10,4),                  -- actual - consensus
    r_and_d_expense_usd BIGINT,
    gross_margin        DECIMAL(6,4),
    cash_and_equiv_usd  BIGINT,                         -- cash runway indicator
    guidance_revenue_low BIGINT,
    guidance_revenue_high BIGINT,
    guidance_narrative  TEXT,
    transcript_url      TEXT,
    sentiment_score     DECIMAL(4,3),                   -- -1.0 to 1.0, NLP-derived
    key_quotes_json     JSONB,                          -- array of {speaker, text, topic, sentiment}
    sec_filing_id       INTEGER REFERENCES sec_filings(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_earnings_company ON earnings_reports(company_id, fiscal_quarter);
```

#### 1.2.4 Scientific Data

```sql
-- ============================================================
-- TARGET CLASSES
-- ============================================================
CREATE TABLE target_classes (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) UNIQUE NOT NULL,   -- 'VEGF/VEGFR', 'PD-1/PD-L1', 'HER2'
    description         TEXT,
    mechanism           TEXT,
    category            VARCHAR(100),                   -- 'Kinase', 'Immune Checkpoint', 'GPCRs'
    trend               VARCHAR(50),                    -- 'Rising', 'Stable', 'Declining', 'Mature'
    clinical_trial_count INTEGER,
    approved_drugs_count INTEGER,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TARGET CLASS ACTIVITY (longitudinal — yearly snapshots)
-- ============================================================
CREATE TABLE target_class_activity (
    id                  SERIAL PRIMARY KEY,
    target_class_id     INTEGER NOT NULL REFERENCES target_classes(id),
    snapshot_year       SMALLINT NOT NULL,
    trial_count         INTEGER,
    approved_drugs_count INTEGER,
    source              TEXT,
    UNIQUE (target_class_id, snapshot_year)
);

-- ============================================================
-- ORGAN SYSTEMS
-- ============================================================
CREATE TABLE organ_systems (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) UNIQUE NOT NULL,
    trial_count         INTEGER,
    trial_count_date    DATE,
    growth_rate_yoy     DECIMAL(6,4),
    top_modalities      JSONB,                          -- [{"modality":"ADC","count":142}, ...]
    top_targets         JSONB,
    approved_drug_count INTEGER,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PUBLICATION COUNTS (PubMed longitudinal)
-- ============================================================
CREATE TABLE publication_counts (
    id                  SERIAL PRIMARY KEY,
    target              VARCHAR(255),
    modality            VARCHAR(100),
    year                SMALLINT NOT NULL,
    pubmed_count        INTEGER,
    clinical_trial_count INTEGER,
    source_query        TEXT,                           -- exact PubMed query used
    fetched_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (target, modality, year)
);
```

#### 1.2.5 Platform & Audit

```sql
-- ============================================================
-- DATA PROVENANCE (audit trail — every record links here)
-- ============================================================
CREATE TABLE data_provenance (
    id                  SERIAL PRIMARY KEY,
    table_name          VARCHAR(100) NOT NULL,
    record_id           INTEGER NOT NULL,               -- FK into the referenced table
    field_name          VARCHAR(100),                   -- NULL = applies to entire record
    value_text          TEXT,                           -- the actual value being sourced
    source_type         VARCHAR(50),                    -- 'API', 'Manual', 'Scrape', 'Computed'
    source_name         VARCHAR(255),                   -- 'ClinicalTrials.gov', 'SEC EDGAR', 'Bloomberg'
    source_url          TEXT,
    fetch_date          DATE NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'unverified', -- 'verified', 'unverified', 'disputed', 'stale'
    verified_by         VARCHAR(100),                   -- email or 'automated'
    last_verified       TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prov_table_record ON data_provenance(table_name, record_id);
CREATE INDEX idx_prov_verification ON data_provenance(verification_status);
CREATE INDEX idx_prov_fetch_date ON data_provenance(fetch_date);

-- ============================================================
-- DATA CHANGE LOG (version history for all mutable fields)
-- ============================================================
CREATE TABLE data_change_log (
    id                  SERIAL PRIMARY KEY,
    table_name          VARCHAR(100) NOT NULL,
    record_id           INTEGER NOT NULL,
    field_name          VARCHAR(100) NOT NULL,
    old_value           TEXT,
    new_value           TEXT,
    change_reason       TEXT,
    changed_by          VARCHAR(100),                   -- 'ingestion_pipeline', user email, etc.
    changed_at          TIMESTAMPTZ DEFAULT NOW(),
    source_url          TEXT
);

CREATE INDEX idx_changelog_table_record ON data_change_log(table_name, record_id);
CREATE INDEX idx_changelog_date ON data_change_log(changed_at);

-- ============================================================
-- INGESTION RUNS (track pipeline executions)
-- ============================================================
CREATE TABLE ingestion_runs (
    id                  SERIAL PRIMARY KEY,
    pipeline_name       VARCHAR(100) NOT NULL,          -- 'clinicaltrials_gov', 'fda_openfda', 'stock_prices'
    started_at          TIMESTAMPTZ NOT NULL,
    completed_at        TIMESTAMPTZ,
    status              VARCHAR(20),                    -- 'running', 'success', 'partial', 'failed'
    records_fetched     INTEGER,
    records_inserted    INTEGER,
    records_updated     INTEGER,
    records_skipped     INTEGER,
    error_count         INTEGER DEFAULT 0,
    error_details       JSONB,
    notes               TEXT
);

-- ============================================================
-- DATA QUALITY ALERTS
-- ============================================================
CREATE TABLE data_quality_alerts (
    id                  SERIAL PRIMARY KEY,
    alert_type          VARCHAR(100) NOT NULL,          -- 'value_drift', 'missing_data', 'temporal_inconsistency'
    severity            VARCHAR(20),                    -- 'critical', 'warning', 'info'
    table_name          VARCHAR(100),
    record_id           INTEGER,
    field_name          VARCHAR(100),
    description         TEXT NOT NULL,
    old_value           TEXT,
    new_value           TEXT,
    is_resolved         BOOLEAN DEFAULT FALSE,
    resolved_at         TIMESTAMPTZ,
    resolved_by         VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.2.6 Automatic Audit Triggers

```sql
-- Generic trigger function to log field changes
CREATE OR REPLACE FUNCTION log_field_change()
RETURNS TRIGGER AS $$
DECLARE
    col_name TEXT;
    old_val  TEXT;
    new_val  TEXT;
BEGIN
    FOREACH col_name IN ARRAY TG_ARGV
    LOOP
        EXECUTE format('SELECT ($1).%I::text', col_name) INTO old_val USING OLD;
        EXECUTE format('SELECT ($1).%I::text', col_name) INTO new_val USING NEW;
        IF old_val IS DISTINCT FROM new_val THEN
            INSERT INTO data_change_log(table_name, record_id, field_name, old_value, new_value, changed_by)
            VALUES (TG_TABLE_NAME, OLD.id, col_name, old_val, new_val, current_user);
        END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to pipeline_programs (phase and status are the most critical)
CREATE TRIGGER trg_pipeline_change
AFTER UPDATE ON pipeline_programs
FOR EACH ROW
EXECUTE FUNCTION log_field_change('phase', 'status', 'indication');

-- Apply to fda_events
CREATE TRIGGER trg_fda_change
AFTER UPDATE ON fda_events
FOR EACH ROW
EXECUTE FUNCTION log_field_change('event_date', 'outcome');
```

---

### 1.3 Environment Setup

```bash
# Install PostgreSQL 16 + TimescaleDB (Ubuntu/Debian)
sudo apt install -y postgresql-16 postgresql-client-16
sudo apt install -y timescaledb-2-postgresql-16

# Enable TimescaleDB in postgresql.conf
echo "shared_preload_libraries = 'timescaledb'" | sudo tee -a /etc/postgresql/16/main/postgresql.conf
sudo systemctl restart postgresql

# Create database
createdb biopharma_atlas
psql biopharma_atlas -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
psql biopharma_atlas -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"  -- for fuzzy text search

# Convert stock_prices to TimescaleDB hypertable
psql biopharma_atlas -c "SELECT create_hypertable('stock_prices', 'date');"
```

---

## 2. Data Ingestion Pipeline

All ingestion scripts are Python 3.11+. Dependencies: `requests`, `pandas`, `sqlalchemy 2.0`, `psycopg2-binary`, `pydantic` for validation, `tenacity` for retry logic, `schedule` or cron for orchestration.

```
pipelines/
├── config.py              # DB connection, API keys, rate limits
├── base_pipeline.py       # Abstract base: fetch → validate → upsert → log provenance
├── clinicaltrials/
│   ├── ingest.py
│   └── transform.py
├── fda/
│   ├── openfda_ingest.py
│   └── pdufa_calendar.py
├── financial/
│   ├── stock_prices.py
│   ├── sec_edgar.py
│   └── earnings.py
├── scientific/
│   └── pubmed.py
└── scheduler.py           # Orchestrates all pipelines with schedule
```

---

### 2.1 ClinicalTrials.gov API v2

**API Base URL:** `https://clinicaltrials.gov/api/v2/studies`  
**Documentation:** `https://clinicaltrials.gov/data-api/api`  
**Cadence:** Daily (status changes, new registrations)  
**Auth:** None required

```python
# pipelines/clinicaltrials/ingest.py
import requests
import pandas as pd
from datetime import datetime
from base_pipeline import BasePipeline, log_provenance

CT_BASE = "https://clinicaltrials.gov/api/v2/studies"

MODALITY_QUERIES = {
    "Small Molecule":  "SMALL MOLECULE",
    "Biologic":        "BIOLOGIC",
    "ADC":             "antibody drug conjugate",
    "CAR-T":           "chimeric antigen receptor T-cell",
    "mRNA":            "messenger RNA",
    "Gene Therapy":    "gene therapy AAV",
    "siRNA":           "siRNA RNAi",
    "Bispecific":      "bispecific antibody",
    "Cell Therapy":    "engineered cell therapy",     # Note: use 'engineered' to reduce overcounting
}

def fetch_trials_for_modality(modality: str, query: str, phase: str | None = None) -> list[dict]:
    """Fetch all trials for a given modality via ClinicalTrials.gov API v2."""
    params = {
        "query.intr": query,
        "countTotal": "true",
        "pageSize": 1000,
    }
    if phase:
        params["filter.advanced"] = f"AREA[Phase]{phase}"

    all_trials = []
    next_page_token = None

    while True:
        if next_page_token:
            params["pageToken"] = next_page_token

        resp = requests.get(CT_BASE, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        studies = data.get("studies", [])
        all_trials.extend(studies)

        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break

    return all_trials


def transform_trial(study: dict) -> dict:
    """Normalize a raw ClinicalTrials.gov v2 study response into a flat dict."""
    proto = study.get("protocolSection", {})
    id_mod  = proto.get("identificationModule", {})
    status_mod = proto.get("statusModule", {})
    design_mod  = proto.get("designModule", {})
    sponsor_mod = proto.get("sponsorCollaboratorsModule", {})
    cond_mod    = proto.get("conditionsModule", {})
    interv_mod  = proto.get("armsInterventionsModule", {})

    interventions = interv_mod.get("interventions", [])
    interv_names  = [i.get("name") for i in interventions]

    return {
        "nct_id":               id_mod.get("nctId"),
        "title":                id_mod.get("briefTitle"),
        "brief_summary":        proto.get("descriptionModule", {}).get("briefSummary"),
        "phase":                ", ".join(design_mod.get("phases", [])),
        "status":               status_mod.get("overallStatus"),
        "start_date":           status_mod.get("startDateStruct", {}).get("date"),
        "completion_date":      status_mod.get("completionDateStruct", {}).get("date"),
        "enrollment":           design_mod.get("enrollmentInfo", {}).get("count"),
        "enrollment_type":      design_mod.get("enrollmentInfo", {}).get("type"),
        "sponsor":              sponsor_mod.get("leadSponsor", {}).get("name"),
        "sponsor_class":        sponsor_mod.get("leadSponsor", {}).get("class"),
        "intervention_name":    ", ".join(filter(None, interv_names)),
        "conditions_array":     cond_mod.get("conditions", []),
        "last_update_date":     status_mod.get("lastUpdateSubmitDate"),
        "has_results":          study.get("hasResults", False),
        "source_url":           f"https://clinicaltrials.gov/study/{id_mod.get('nctId')}",
    }
```

**Anomaly check:**

```python
def check_modality_count_drift(conn, modality: str, new_count: int, threshold: float = 0.20):
    """Alert if trial count for a modality drops by more than 20%."""
    prev = conn.execute(
        "SELECT trial_count FROM modality_snapshots WHERE modality = %s ORDER BY snapshot_date DESC LIMIT 1",
        (modality,)
    ).fetchone()

    if prev and (prev[0] - new_count) / prev[0] > threshold:
        insert_alert(conn, {
            "alert_type": "value_drift",
            "severity": "critical",
            "table_name": "clinical_trials",
            "description": f"Trial count for {modality} dropped from {prev[0]} to {new_count} (>{threshold*100:.0f}% decline). Possible query change or data issue.",
        })
```

---

### 2.2 FDA OpenFDA API

**API Base URL:** `https://api.fda.gov`  
**Key endpoints:**  
- Drug approvals: `https://api.fda.gov/drug/drugsfda.json`  
- Adverse events: `https://api.fda.gov/drug/event.json`  
**Documentation:** `https://open.fda.gov/apis/`  
**Cadence:** Weekly  
**Auth:** Free API key from `https://open.fda.gov/apis/authentication/`

```python
# pipelines/fda/openfda_ingest.py
import requests
from datetime import datetime, timedelta

FDA_BASE = "https://api.fda.gov/drug/drugsfda.json"
FDA_KEY  = "YOUR_OPENFDA_KEY"  # from open.fda.gov

def fetch_recent_approvals(days_back: int = 30) -> list[dict]:
    """Fetch FDA drug approvals from the last N days."""
    cutoff = (datetime.now() - timedelta(days=days_back)).strftime("%Y%m%d")
    params = {
        "search": f"products.marketing_status:\"Prescription\" AND submissions.submission_type:\"ORIG\"",
        "limit": 100,
        "api_key": FDA_KEY,
    }
    resp = requests.get(FDA_BASE, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json().get("results", [])
```

**PDUFA Calendar** (semi-automated, monthly):  
FDA publishes the PDUFA calendar at `https://www.fda.gov/patients/drug-development-process/step-3-clinical-research`. This requires HTML parsing (BeautifulSoup). Run monthly and diff against stored dates — PDUFA dates shift. Store every detected shift in `data_change_log`.

---

### 2.3 SEC EDGAR XBRL API

**API Base URL:** `https://data.sec.gov/api/xbrl/companyfacts/{CIK}.json`  
**Full-text search:** `https://efts.sec.gov/LATEST/search-index?q={query}&dateRange=custom&startdt={date}`  
**Filing submissions:** `https://data.sec.gov/submissions/CIK{padded_cik}.json`  
**Documentation:** `https://www.sec.gov/developer`  
**Cadence:** Quarterly (10-K/10-Q), near-real-time for 8-K  
**Auth:** None (must include `User-Agent` header per SEC policy)

```python
# pipelines/financial/sec_edgar.py
import requests

EDGAR_FACTS = "https://data.sec.gov/api/xbrl/companyfacts"
HEADERS = {"User-Agent": "BioPharma Atlas research@biopharmaatlas.com"}

XBRL_CONCEPTS = {
    "revenue":            "us-gaap/Revenues",
    "r_and_d":            "us-gaap/ResearchAndDevelopmentExpense",
    "gross_profit":       "us-gaap/GrossProfit",
    "cash":               "us-gaap/CashAndCashEquivalentsAtCarryingValue",
    "net_income":         "us-gaap/NetIncomeLoss",
    "eps_basic":          "us-gaap/EarningsPerShareBasic",
}

def fetch_company_facts(cik: str) -> dict:
    """Fetch all XBRL facts for a company."""
    padded = cik.zfill(10)
    url = f"{EDGAR_FACTS}/CIK{padded}.json"
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return resp.json()

def extract_financial_series(facts: dict, concept_path: str) -> list[dict]:
    """Extract a time series for a specific XBRL concept (e.g., revenue)."""
    namespace, concept = concept_path.split("/")
    units = facts.get("facts", {}).get(namespace, {}).get(concept, {}).get("units", {})
    # USD-denominated facts
    values = units.get("USD", units.get("shares", []))
    return [
        {
            "end": entry.get("end"),
            "val": entry.get("val"),
            "form": entry.get("form"),
            "accn": entry.get("accn"),
            "filed": entry.get("filed"),
        }
        for entry in values
        if entry.get("form") in ("10-K", "10-Q")
    ]
```

---

### 2.4 Stock Prices

**Primary source:** Yahoo Finance via `yfinance` (free, no API key)  
**Backup:** Alpha Vantage — `https://www.alphavantage.co/documentation/` (free tier: 25 requests/day)  
**Cadence:** Daily (run at 6 PM ET after market close)

```python
# pipelines/financial/stock_prices.py
import yfinance as yf
from sqlalchemy import text

def fetch_and_store_prices(tickers: list[str], conn, days_back: int = 5):
    """Fetch recent closing prices and upsert into stock_prices."""
    for ticker in tickers:
        try:
            df = yf.download(ticker, period=f"{days_back}d", auto_adjust=True, progress=False)
            for date, row in df.iterrows():
                conn.execute(text("""
                    INSERT INTO stock_prices (company_id, date, open, high, low, close, volume)
                    SELECT c.id, :date, :open, :high, :low, :close, :volume
                    FROM companies c WHERE c.ticker = :ticker
                    ON CONFLICT (company_id, date) DO UPDATE
                    SET close = EXCLUDED.close,
                        adjusted_close = EXCLUDED.close,
                        volume = EXCLUDED.volume
                """), {
                    "ticker": ticker, "date": date.date(),
                    "open": float(row["Open"]),  "high": float(row["High"]),
                    "low":  float(row["Low"]),   "close": float(row["Close"]),
                    "volume": int(row["Volume"]),
                })
        except Exception as e:
            log_alert(conn, "stock_fetch_error", f"{ticker}: {e}")
```

---

### 2.5 PubMed / NCBI

**API Base URL:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`  
**Key endpoints:**  
- Search: `esearch.fcgi?db=pubmed&term={query}&retmax=0&rettype=count`  
- Fetch abstracts: `efetch.fcgi?db=pubmed&id={pmid}&rettype=abstract`  
**Cadence:** Monthly  
**Auth:** Free, rate-limited. Register for API key at `https://www.ncbi.nlm.nih.gov/account/` for higher limits (10 req/s vs 3/s)

```python
# pipelines/scientific/pubmed.py
import requests, time

NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
NCBI_KEY  = "YOUR_NCBI_KEY"

def count_publications(query: str, year: int) -> int:
    """Count PubMed publications matching a query for a specific year."""
    params = {
        "db": "pubmed",
        "term": f"{query}[Title/Abstract] AND {year}[PDAT]",
        "retmax": 0,
        "rettype": "count",
        "api_key": NCBI_KEY,
    }
    resp = requests.get(f"{NCBI_BASE}/esearch.fcgi", params=params, timeout=15)
    resp.raise_for_status()
    time.sleep(0.1)  # respect rate limit
    return int(resp.json().get("esearchresult", {}).get("count", 0))
```

---

### 2.6 Ingestion Orchestration

```python
# pipelines/scheduler.py
import schedule, time, logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(name)s %(levelname)s %(message)s')

# Daily pipelines
schedule.every().day.at("18:30").do(run_pipeline, "stock_prices")
schedule.every().day.at("19:00").do(run_pipeline, "fda_approvals")
schedule.every().day.at("20:00").do(run_pipeline, "clinicaltrials_status_changes")

# Weekly pipelines
schedule.every().monday.at("06:00").do(run_pipeline, "clinicaltrials_full_refresh")
schedule.every().tuesday.at("06:00").do(run_pipeline, "sec_edgar_8k")
schedule.every().wednesday.at("06:00").do(run_pipeline, "fda_pdufa_calendar")

# Monthly pipelines
schedule.every(30).days.do(run_pipeline, "sec_edgar_10k_10q")
schedule.every(30).days.do(run_pipeline, "pubmed_publication_counts")
schedule.every(30).days.do(run_pipeline, "revalidation_sweep")

while True:
    schedule.run_pending()
    time.sleep(60)
```

For production workloads, replace `schedule` with **Apache Airflow** or **Prefect** to get dependency resolution, retries, alerting, and a monitoring UI. The pipeline structure above maps directly to Airflow DAGs.

---

### 2.7 Provenance Logging Pattern

Every pipeline must call `log_provenance()` for every inserted or updated record:

```python
def log_provenance(conn, table_name: str, record_id: int, source_name: str,
                   source_url: str, source_type: str = "API", field_name: str = None,
                   value_text: str = None):
    conn.execute("""
        INSERT INTO data_provenance
            (table_name, record_id, field_name, value_text, source_type, source_name,
             source_url, fetch_date, verification_status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, 'unverified')
        ON CONFLICT DO NOTHING
    """, (table_name, record_id, field_name, value_text, source_type, source_name, source_url))
```

---

## 3. Data Verification & Audit System

### 3.1 Source-Level Verification

Every number surfaced in the dashboard must have a corresponding row in `data_provenance` linking to its source URL. The `DataBadge` component in the existing React frontend should query this table at render time to display the verification status badge alongside each displayed value.

API contract (add to the backend):

```
GET /api/provenance?table=pipeline_programs&record_id=42
→ [{ source_name, source_url, fetch_date, verification_status, last_verified }]
```

The frontend already has a `DataBadge` component; wire it to this endpoint.

---

### 3.2 Cross-Source Validation

Run these checks weekly (after all ingestion pipelines complete):

```sql
-- Check 1: Company-reported pipeline counts vs. ClinicalTrials.gov counts
-- Flag companies where counts diverge by more than 20%
SELECT
    c.ticker,
    c.name,
    pp_count.reported                               AS pipeline_reported,
    ct_count.ct_gov                                 AS ct_gov_count,
    ABS(pp_count.reported - ct_count.ct_gov) * 1.0
        / NULLIF(pp_count.reported, 0)              AS divergence_pct
FROM companies c
JOIN (
    SELECT company_id, COUNT(*) AS reported
    FROM pipeline_programs
    WHERE status = 'Active'
    GROUP BY company_id
) pp_count ON pp_count.company_id = c.id
JOIN (
    SELECT c2.id AS company_id, COUNT(*) AS ct_gov
    FROM clinical_trials ct
    JOIN companies c2 ON ct.sponsor ILIKE '%' || c2.name || '%'
    WHERE ct.status IN ('Recruiting', 'Active, not recruiting', 'Not yet recruiting')
    GROUP BY c2.id
) ct_count ON ct_count.company_id = c.id
WHERE ABS(pp_count.reported - ct_count.ct_gov) * 1.0 / NULLIF(pp_count.reported, 0) > 0.20
ORDER BY divergence_pct DESC;
```

```sql
-- Check 2: Phase regression — a program cannot move to an earlier phase
-- (detects data entry errors or incorrect sourcing)
SELECT
    prog.id,
    prog.drug_name,
    prog.phase AS current_phase,
    hist.phase AS prior_phase,
    hist.snapshot_date
FROM pipeline_programs prog
JOIN pipeline_program_history hist ON hist.program_id = prog.id
WHERE hist.snapshot_date = (
    SELECT MAX(h2.snapshot_date)
    FROM pipeline_program_history h2
    WHERE h2.program_id = prog.id AND h2.snapshot_date < CURRENT_DATE
)
AND (
    (hist.phase = 'Phase 3' AND prog.phase IN ('Phase 1', 'Phase 2'))
 OR (hist.phase = 'Phase 2' AND prog.phase = 'Phase 1')
);
```

```sql
-- Check 3: PDUFA date staleness — alert on upcoming PDUFA dates not recently verified
SELECT
    fe.drug_name, fe.event_date, fe.company_id,
    dp.last_verified, dp.source_url
FROM fda_events fe
JOIN data_provenance dp ON dp.table_name = 'fda_events' AND dp.record_id = fe.id
WHERE fe.event_type = 'PDUFA'
  AND fe.event_date > CURRENT_DATE
  AND fe.event_date < CURRENT_DATE + INTERVAL '60 days'
  AND (dp.last_verified IS NULL OR dp.last_verified < CURRENT_DATE - INTERVAL '7 days');
```

---

### 3.3 Temporal Consistency Checks

```python
# pipelines/verification/temporal_checks.py

PHASE_ORDER = {
    "Preclinical": 0, "Phase 1": 1, "Phase 1/2": 1.5,
    "Phase 2": 2, "Phase 2/3": 2.5, "Phase 3": 3,
    "NDA/BLA Submitted": 4, "Approved": 5, "Discontinued": -1
}

def check_phase_regression(conn) -> list[dict]:
    """Return all programs where current phase is earlier than the most recent historical phase."""
    issues = []
    rows = conn.execute("""
        SELECT p.id, p.drug_name, p.phase,
               h.phase AS prev_phase, h.snapshot_date
        FROM pipeline_programs p
        JOIN LATERAL (
            SELECT phase, snapshot_date
            FROM pipeline_program_history
            WHERE program_id = p.id
            ORDER BY snapshot_date DESC LIMIT 1
        ) h ON TRUE
    """).fetchall()

    for row in rows:
        curr  = PHASE_ORDER.get(row.phase, 0)
        prior = PHASE_ORDER.get(row.prev_phase, 0)
        if curr < prior and prior != -1:  # ignore discontinued
            issues.append({
                "program_id": row.id,
                "drug_name":  row.drug_name,
                "current":    row.phase,
                "previous":   row.prev_phase,
                "snap_date":  row.snapshot_date,
            })
    return issues
```

---

### 3.4 Automated Re-verification (Monthly Sweep)

```python
# pipelines/verification/revalidation.py

def revalidation_sweep(conn):
    """Re-fetch and compare key metrics monthly. Alert on any drift."""

    # 1. Re-fetch ClinicalTrials.gov counts for each modality
    for modality, query in MODALITY_QUERIES.items():
        live_count = len(fetch_trials_for_modality(modality, query))
        stored_count = conn.execute(
            "SELECT COUNT(*) FROM clinical_trials WHERE intervention_name ILIKE %s",
            (f"%{query.split()[0]}%",)
        ).scalar()

        pct_diff = abs(live_count - stored_count) / max(stored_count, 1)
        if pct_diff > 0.05:  # 5% drift threshold
            insert_alert(conn, {
                "alert_type": "value_drift",
                "severity": "warning" if pct_diff < 0.15 else "critical",
                "description": f"{modality} trial count drifted {pct_diff*100:.1f}%: stored={stored_count}, live={live_count}",
            })

    # 2. Re-verify upcoming PDUFA dates
    upcoming = conn.execute("""
        SELECT id, drug_name, event_date
        FROM fda_events
        WHERE event_type = 'PDUFA' AND event_date > NOW()
    """).fetchall()

    for event in upcoming:
        live_date = lookup_fda_pdufa_date(event.drug_name)
        if live_date and live_date != event.event_date:
            insert_change_log(conn, "fda_events", event.id, "event_date",
                              str(event.event_date), str(live_date), "revalidation_sweep")
            update_alert(conn, "PDUFA date shifted", event.drug_name,
                         old=str(event.event_date), new=str(live_date))
```

---

### 3.5 Human Audit Workflow

The `data_provenance.verification_status` field supports four states:

| Status | Meaning |
|---|---|
| `unverified` | Ingested from API, not human-reviewed |
| `verified` | Manually confirmed against original source |
| `disputed` | Cross-source validation found a discrepancy; needs resolution |
| `stale` | Verified more than 90 days ago; due for re-check |

A data quality admin page (recommended for Phase 3) should:
1. List all `disputed` records with the conflicting values and source URLs.
2. Allow a reviewer to mark a record `verified` and attach a note.
3. Show a dashboard-wide "data freshness" metric: what percentage of displayed values are `verified` vs. `unverified`.

---

## 4. Additional Data to Store

### 4.1 Longitudinal / Time-Series Data

The current dashboard shows a "modality growth over time" chart estimated from aggregate data. The database should build this from first principles.

**Monthly modality snapshots:**

```sql
CREATE TABLE modality_monthly_snapshots (
    id                  SERIAL PRIMARY KEY,
    modality            VARCHAR(100) NOT NULL,
    snapshot_month      DATE NOT NULL,                  -- first day of the month
    active_trial_count  INTEGER,
    recruiting_count    INTEGER,
    completed_count     INTEGER,
    total_enrollment    INTEGER,
    source              TEXT DEFAULT 'ClinicalTrials.gov API v2',
    UNIQUE (modality, snapshot_month)
);
```

Run the ClinicalTrials.gov query monthly on the first of each month and store a row per modality. After 12 months you have a real trailing-year trend. After 3 years, the "modality growth over time" chart is based on verified longitudinal data rather than estimates.

**Phase transition timeline:**

```sql
-- Already covered by pipeline_program_history.
-- Query pattern to reconstruct transition timelines:
SELECT
    pp.drug_name,
    pp.company_id,
    h1.phase            AS from_phase,
    h2.phase            AS to_phase,
    h1.snapshot_date    AS transition_date
FROM pipeline_program_history h1
JOIN pipeline_program_history h2
    ON h2.program_id = h1.program_id
    AND h2.snapshot_date = (
        SELECT MIN(h3.snapshot_date)
        FROM pipeline_program_history h3
        WHERE h3.program_id = h1.program_id
          AND h3.snapshot_date > h1.snapshot_date
          AND h3.phase != h1.phase
    )
JOIN pipeline_programs pp ON pp.id = h1.program_id
ORDER BY transition_date;
```

---

### 4.2 Financial Data

**Full income statement series** (sourced from SEC EDGAR XBRL):

```sql
CREATE TABLE financial_statements (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    period_end          DATE NOT NULL,
    period_type         VARCHAR(10) NOT NULL,           -- 'annual', 'quarterly'
    revenue_usd         BIGINT,
    cost_of_goods_usd   BIGINT,
    gross_profit_usd    BIGINT,
    r_and_d_expense_usd BIGINT,
    sga_expense_usd     BIGINT,
    operating_income_usd BIGINT,
    net_income_usd      BIGINT,
    eps_basic           DECIMAL(10,4),
    eps_diluted         DECIMAL(10,4),
    cash_usd            BIGINT,
    total_assets_usd    BIGINT,
    total_liabilities_usd BIGINT,
    equity_usd          BIGINT,
    operating_cash_flow_usd BIGINT,
    capex_usd           BIGINT,
    xbrl_accession      VARCHAR(25),
    UNIQUE (company_id, period_end, period_type)
);
```

**Institutional ownership (13-F):**

```sql
CREATE TABLE institutional_ownership (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    institution_name    VARCHAR(255),
    cik_filer           VARCHAR(20),
    report_date         DATE,
    shares_held         BIGINT,
    market_value_usd    BIGINT,
    pct_outstanding     DECIMAL(8,4),
    change_shares       BIGINT,                         -- vs. prior quarter
    change_pct          DECIMAL(8,4),
    UNIQUE (company_id, institution_name, report_date)
);
```

**Insider transactions (Form 4):**

```sql
CREATE TABLE insider_transactions (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    insider_name        VARCHAR(255),
    insider_title       VARCHAR(100),
    transaction_date    DATE,
    transaction_type    VARCHAR(20),                    -- 'Buy', 'Sell', 'Option Exercise'
    shares              INTEGER,
    price_per_share     DECIMAL(12,4),
    total_value_usd     BIGINT,
    shares_owned_after  INTEGER,
    form4_url           TEXT
);
```

---

### 4.3 Scientific / Clinical Data

**Conference presentations** (semi-automated, quarterly around ASCO/ASH/AACR):

```sql
CREATE TABLE conference_presentations (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER REFERENCES companies(id),
    program_id          INTEGER REFERENCES pipeline_programs(id),
    conference          VARCHAR(100),                   -- 'ASCO 2025', 'ASH 2025', 'AACR 2025'
    conference_date     DATE,
    abstract_title      TEXT,
    abstract_number     VARCHAR(50),
    presentation_type   VARCHAR(50),                    -- 'Oral', 'Poster', 'Late-Breaking'
    drug_name           VARCHAR(255),
    key_results         TEXT,
    abstract_url        TEXT,
    stock_move_pct      DECIMAL(8,4),                   -- stock move on presentation date
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Patent landscape:**

```sql
CREATE TABLE patent_events (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER REFERENCES companies(id),
    drug_name           VARCHAR(255),
    patent_number       VARCHAR(50),
    patent_type         VARCHAR(50),                    -- 'Compound', 'Formulation', 'Method of Use', 'Manufacturing'
    expiry_date         DATE,
    jurisdiction        VARCHAR(20) DEFAULT 'US',
    is_primary          BOOLEAN DEFAULT FALSE,           -- primary compound patent
    generic_entry_risk  VARCHAR(20),                    -- 'High', 'Medium', 'Low'
    notes               TEXT
);
```

---

### 4.4 Market / Competitive Data

**Product sales:**

```sql
CREATE TABLE product_sales (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER NOT NULL REFERENCES companies(id),
    drug_name           VARCHAR(255) NOT NULL,
    brand_name          VARCHAR(255),
    fiscal_quarter      VARCHAR(10) NOT NULL,
    geography           VARCHAR(50) DEFAULT 'Global',
    net_sales_usd       BIGINT,
    yoy_growth_pct      DECIMAL(8,4),
    volume_units        BIGINT,
    source              TEXT,                           -- 'Earnings report', 'SEC 10-Q'
    UNIQUE (company_id, drug_name, fiscal_quarter, geography)
);
```

**Geographic approval status:**

```sql
CREATE TABLE regulatory_approvals (
    id                  SERIAL PRIMARY KEY,
    company_id          INTEGER REFERENCES companies(id),
    program_id          INTEGER REFERENCES pipeline_programs(id),
    drug_name           VARCHAR(255),
    jurisdiction        VARCHAR(20) NOT NULL,           -- 'US', 'EU', 'Japan', 'China', 'Canada'
    approval_date       DATE,
    approval_type       VARCHAR(50),                    -- 'Standard', 'Accelerated', 'Conditional'
    indication          TEXT,
    application_number  VARCHAR(50),
    status              VARCHAR(50) DEFAULT 'Approved'
);
```

---

## 5. How to Make the Dashboard More Powerful

### 5.1 Near-Term: v3.1–v3.5 (1–3 months)

These features require the Phase 1 backend (database + API layer) to be in place.

**Live trial counts (v3.1)**  
Replace hardcoded trial counts in `ModalityTimeline`, `PipelineOverview`, and `BodyMap` pages with API calls to the new backend:

```
GET /api/trials/counts?group_by=modality
GET /api/trials/counts?group_by=organ_system
GET /api/trials/counts?modality=ADC&group_by=phase
```

The React frontend replaces TypeScript constants with `useQuery` calls (React Query / SWR). Add a `DataFreshnessBanner` showing "Data as of [date], sourced from ClinicalTrials.gov."

**Universal search (v3.2)**  
Add a search bar to the top navigation that accepts company tickers, drug names, targets, and indications.

```
GET /api/search?q=KRAS+G12C
→ {
    companies: [...],
    programs: [...],
    trials: [...],
    catalysts: [...]
  }
```

The backend uses PostgreSQL full-text search (`tsvector`) on `companies.name`, `pipeline_programs.drug_name`, `pipeline_programs.target`, and `clinical_trials.title`. Promote to Elasticsearch when result latency exceeds 300ms.

**Custom screening (v3.3)**  
Let users build a pipeline density screen by adjusting modality weights, phase filters, and indication filters with a form UI:

```
POST /api/screen
Body: {
  modalities: ["ADC", "Bispecific"],
  phases: ["Phase 2", "Phase 3"],
  indication: "Oncology",
  min_trial_count: 5,
  sort_by: "pipeline_density_score"
}
```

This replaces the hardcoded scores in `InvestmentSignals.tsx` with a parameterizable server-side computation.

**Catalyst alerts (v3.4)**  
Email/webhook alert subscriptions:

```sql
CREATE TABLE alert_subscriptions (
    id              SERIAL PRIMARY KEY,
    user_email      TEXT NOT NULL,
    alert_type      VARCHAR(50),   -- 'phase_readout', 'pdufa', 'approval', 'earnings'
    filter_modality VARCHAR(100),
    filter_company_id INTEGER,
    filter_drug_name  TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

A nightly cron checks `catalyst_events` for new entries and dispatches emails for matching subscriptions. Use SendGrid or AWS SES.

**Export (v3.5)**  
Add `GET /api/export?table=pipeline_programs&format=csv` and `format=xlsx` endpoints. Use `pandas` server-side for CSV and `openpyxl` for Excel.

---

### 5.2 Medium-Term: v4 (3–9 months)

**User accounts and watchlists**  
PostgreSQL `users`, `watchlists`, `watchlist_items` tables. JWT authentication (Auth0 or Supabase Auth). Watchlists feed into the custom alert system.

**REST + GraphQL API**  
Expose the full dataset as a public API with rate limiting. Use FastAPI for REST and Strawberry for GraphQL. This turns BioPharma Atlas into a data product, not just a dashboard.

```
GET  /api/v1/companies/{ticker}
GET  /api/v1/companies/{ticker}/pipeline
GET  /api/v1/companies/{ticker}/stock_prices?start=2024-01-01
GET  /api/v1/trials?modality=ADC&phase=Phase+3&status=Recruiting
GET  /api/v1/deals?year=2025
POST /api/v1/screen
```

**Phase 3 success prediction model**  
Train a logistic regression (or gradient boosting) model on historical trial outcomes:

Features to include:
- Modality
- Target class
- Indication area
- Trial size (enrollment)
- Biomarker-selected population (boolean)
- Phase 2 ORR / PFS data (where available)
- Number of prior Phase 2 failures in the same target/indication

Labels: Phase 3 success (reached primary endpoint) vs. failure (missed primary or terminated).

Train on the BIO/QLS dataset and/or Citeline TrialTrove data. Output: a `success_probability` score for each `pipeline_programs` record in Phase 3. This directly enriches the Approval Probability table in the `InvestmentSignals` page.

**NLP pipeline for earnings calls**  
Use a transformer model (e.g., `clinical-longformer` fine-tuned on pharma transcripts, or GPT-4o via API) to:
1. Extract guidance updates, pipeline milestone mentions, and R&D commentary.
2. Compute a sentiment score per earnings call.
3. Flag key quotes (pipeline progress, cash runway, competitive mentions).

Store outputs in `earnings_reports.key_quotes_json` and `sentiment_score`.

**Real-time news feed**  
Aggregate from RSS feeds:
- `https://www.biopharmadive.com/feeds/news/`
- `https://feeds.statnews.com/statnews/all`
- `https://www.fiercepharma.com/rss.xml`
- `https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&dateb=&owner=include&count=40&output=atom`

Use NLP to annotate each article with tickers, drug names, and event types. Store in a `news_articles` table. Display on a company detail page alongside stock price chart.

---

### 5.3 Long-Term: v5+ (9+ months)

**Graph database layer (Neo4j)**  
Model the biopharma knowledge graph:
```
(Company)-[OWNS]->(PipelineProgram)
(PipelineProgram)-[TARGETS]->(Target)
(Target)-[IMPLICATED_IN]->(Disease)
(Disease)-[AFFECTS]->(OrganSystem)
(Company)-[ACQUIRED]->(Company)
(PipelineProgram)-[COMPETES_WITH]->(PipelineProgram)
```

This enables relationship queries that are expensive in SQL: "Find all companies that have an ADC targeting HER2 that have been acquired in the last 5 years — and what did the acquirer's pipeline look like before the deal?"

**Deal flow predictor**  
Train an acquisition likelihood model. Features:
- Pipeline phase distribution (how many Phase 2/3 programs)
- Modality alignment with active acquirers
- Market cap (under $5B is more acquirable)
- Cash position / burn rate
- Recent M&A activity in the same indication space
- Insider buying signal

Output: Monthly "acquisition likelihood score" per company, surfaced on the Sponsor Analysis page.

**Global regulatory tracker**  
Beyond FDA, track EMA (European Medicines Agency), PMDA (Japan), NMPA (China), and Health Canada. EMA EPAR data is publicly available at `https://www.ema.europa.eu/en/medicines/download-medicine-data`. Store in `regulatory_approvals` with `jurisdiction` = 'EU', 'Japan', etc.

---

## 6. Audit of the Current Version

This section documents every data quality concern in the current static dashboard and the recommended remediation steps.

### 6.1 Known Data Quality Issues

#### Issue 1: Cell Therapy Trial Count (27,305) — Overcounting
**Current state:** The trial count of 27,305 for "Cell Therapy" is derived from a broad ClinicalTrials.gov query that includes all cell-based interventions — hematopoietic stem cell transplants, dendritic cell vaccines, and unmodified cell infusions — not just the genetically engineered therapies (CAR-T, TCR-T, TIL) that the "Cell Therapy" modality label implies.  
**Impact:** The count is approximately 3–5× larger than the engineered cell therapy universe. This inflates the modality's apparent size and skews the modality comparison chart.  
**Remediation:** Rerun the query with more specific terms: `"CAR T-cell" OR "chimeric antigen receptor" OR "TCR-T" OR "tumor infiltrating lymphocyte" OR "TIL therapy"`. Store the narrow count alongside the broad count in `modality_monthly_snapshots` with a `query_scope` field.

#### Issue 2: Pipeline Phase Counts — Mixed Vintage Dates
**Current state:** The 20-company pipeline counts in `PipelineOverview` and `SponsorAnalysis` are sourced from a mix of Q3 2025 and Q4 2025 data, depending on when each company published their most recent investor presentation.  
**Impact:** Cross-company comparisons are not apples-to-apples. A company that reported in September 2025 may have had a Phase 3 failure or addition since then.  
**Remediation:** Source all pipeline counts from the most recent 10-K or Q3 2025 10-Q (uniform date). Document the source filing date in `pipeline_programs.source_date`. Once the ingestion pipeline is live, re-pull all company pipelines on a consistent monthly basis.

#### Issue 3: M&A Premiums — Inconsistent Basis
**Current state:** Premium percentages in the M&A deals section are calculated using different bases: some use the prior-day closing price, others use 30-day VWAP, and at least one uses the 52-week low.  
**Impact:** Premiums are not comparable across deals. A 30-day VWAP premium is typically 5–10% lower than a prior-close premium for a stock with recent upward momentum.  
**Remediation:** Standardize all premiums to 30-day VWAP (the most common industry convention). Store the raw unaffected price, VWAP-30, VWAP-60, and prior-close in the `mna_deals` table. Display 30-day VWAP as the default with a tooltip showing all bases.

#### Issue 4: Stock Performance Figures — Mixed Time Periods
**Current state:** Stock return figures in the Investment Signals page mix YTD, full-year, and Q3 returns depending on data availability at time of authoring.  
**Impact:** Comparative performance is misleading. A stock showing a "+45% return" on a YTD basis and another showing "+30% full year" cannot be directly compared.  
**Remediation:** Once `stock_prices` is populated, compute all returns from identical time windows server-side. Recommended windows: 1-month, 3-month, 6-month, YTD, 1-year, and 3-year. Show consistently.

#### Issue 5: Approval Rate Data — Dated Source (2011–2020)
**Current state:** Phase transition success probabilities (used in pipeline funnel/attrition charts and the approval probability table) are sourced from the BIO/QLS "Clinical Development Success Rates" study covering 2011–2020.  
**Impact:** The dataset predates the ADC, bispecific, and mRNA waves at scale. For newer modalities, these rates may be meaningfully different (ADC approvals have accelerated 2020–2025). The CNS approval rate in particular has been revised upward in more recent datasets.  
**Remediation:** Supplement with the Citeline TrialTrove dataset (subscription required) or the Wong et al. 2019 update. Store separate `approval_rates` rows for different source + year_range combinations. Weight recent data more heavily when displaying.

#### Issue 6: Drug Name / Modality Classification Inconsistencies
**Current state:** Some drug names appear in inconsistent forms across pages (e.g., "trastuzumab deruxtecan" vs. "T-DXd" vs. "Enhertu"). Modality classifications were assigned manually and may not match FDA or WHO definitions.  
**Remediation:** Normalize all drug names to their INN (International Nonproprietary Name) with brand name stored separately. Cross-reference against DrugBank (`https://www.drugbank.ca/`) and the FDA Approved Drug Products (Orange Book / Purple Book) for classification.

---

### 6.2 Recommended Audit Checklist

Run these checks when transitioning to the database-backed version:

| # | Check | Data Source | Tools |
|---|---|---|---|
| 1 | Re-query every trial count against ClinicalTrials.gov API v2 with documented query strings | ClinicalTrials.gov | Python `requests`, document query in `data_provenance` |
| 2 | Cross-reference all 20 company pipeline counts against most recent 10-K or investor day deck | SEC EDGAR, company IR pages | Manual, record source date |
| 3 | Verify every M&A deal value against the SEC EDGAR merger proxy (Schedule 14A / SC TO-T) | SEC EDGAR full-text search | `https://efts.sec.gov/LATEST/search-index` |
| 4 | Check all PDUFA dates against the current FDA PDUFA calendar | `https://www.fda.gov/patients/drug-development-process/step-4-fda-drug-review` | Manual + alert if date differs from stored value |
| 5 | Verify all stock prices (entry/exit dates) against Yahoo Finance historical data | Yahoo Finance | `yfinance` library |
| 6 | Confirm drug name, indication, and modality against DrugBank or FDA drug label | DrugBank, DailyMed | `https://dailymed.nlm.nih.gov/dailymed/` |
| 7 | Audit all interactive features: milestone clicks, funnel tooltips, heatmap hover states | Browser | Manual QA in Chrome + Firefox, check console for errors |
| 8 | Validate M&A premium calculations using standardized 30-day VWAP basis | Yahoo Finance historical | Python, recompute from OHLCV data |
| 9 | Confirm approval rate figures against the original BIO/QLS publication | BIO/QLS 2021 report | Manual |
| 10 | Verify all chart axis labels, units, and scale breaks are accurate | Dashboard | Manual visual audit |

---

## 7. Implementation Roadmap

### Phase 1 — Database + Core Ingestion (Weeks 1–2)

**Goal:** Replace all hardcoded TypeScript data with a live PostgreSQL backend.

| Task | Owner | Est. Effort |
|---|---|---|
| Provision PostgreSQL 16 + TimescaleDB (local Docker or AWS RDS) | Backend | 2h |
| Run `CREATE TABLE` statements from Section 1 | Backend | 2h |
| Write data migration script: parse TypeScript constants → INSERT statements | Backend | 1 day |
| Build ClinicalTrials.gov ingestion pipeline (Section 2.1) | Data | 1 day |
| Build FDA OpenFDA ingestion pipeline (Section 2.2) | Data | 1 day |
| Build FastAPI/Express API layer with initial endpoints | Backend | 2 days |
| Update React frontend: replace TypeScript imports with API calls (React Query) | Frontend | 2 days |
| Implement provenance logging for all ingested data | Data | 4h |
| Deploy scheduler (cron or Prefect) for daily/weekly runs | Infra | 4h |

**Docker Compose for local development:**

```yaml
# docker-compose.yml
services:
  db:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_DB: biopharma_atlas
      POSTGRES_USER: atlas
      POSTGRES_PASSWORD: changeme
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./schema:/docker-entrypoint-initdb.d   # auto-run SQL on first start

  api:
    build: ./api
    environment:
      DATABASE_URL: postgresql://atlas:changeme@db:5432/biopharma_atlas
    ports:
      - "8000:8000"
    depends_on:
      - db

  pipelines:
    build: ./pipelines
    environment:
      DATABASE_URL: postgresql://atlas:changeme@db:5432/biopharma_atlas
    depends_on:
      - db

volumes:
  pgdata:
```

---

### Phase 2 — Financial Data + Stock Prices (Weeks 3–4)

| Task | Owner | Est. Effort |
|---|---|---|
| SEC EDGAR XBRL ingestion for all 20 companies (10-K/10-Q financial statements) | Data | 2 days |
| Daily stock price ingestion via `yfinance` | Data | 4h |
| Catalyst event detection (flag >10% daily moves, prompt for annotation) | Data | 1 day |
| Institutional ownership ingestion (13-F filings) | Data | 1 day |
| Insider transaction ingestion (Form 4) | Data | 4h |
| Populate `earnings_reports` from SEC filings + transcript URLs | Data | 1 day |
| Add financial data endpoints to API | Backend | 1 day |
| Update Investment Signals page to use real stock data | Frontend | 1 day |

---

### Phase 3 — Verification + Audit (Weeks 5–6)

| Task | Owner | Est. Effort |
|---|---|---|
| Implement cross-source validation queries (Section 3.2) | Data | 1 day |
| Implement temporal consistency checks (Section 3.3) | Data | 1 day |
| Build automated re-verification cron (Section 3.4) | Data | 1 day |
| Build data quality admin page (verification status dashboard) | Frontend | 2 days |
| Run full audit checklist from Section 6.2 | All | 2 days |
| Correct all identified data quality issues from audit | Data | 2 days |
| Wire `DataBadge` component to `/api/provenance` endpoint | Frontend | 4h |

---

### Phase 4 — Longitudinal + Intelligence (Ongoing)

| Task | Timeline |
|---|---|
| Begin storing monthly modality snapshots | Month 2 |
| Add search endpoint + UI | Month 2 |
| Add custom screening UI | Month 3 |
| Build alert subscription system | Month 3 |
| Add export (CSV/XLSX) endpoints | Month 3 |
| Launch NLP pipeline for earnings calls | Month 4–5 |
| Begin training Phase 3 success prediction model | Month 5–6 |
| Launch public REST API with rate limiting | Month 6 |
| Add user accounts + watchlists | Month 6–9 |
| Evaluate Neo4j for graph layer | Month 9+ |

---

## Appendix A: API Reference Summary

| Source | Base URL | Auth | Docs |
|---|---|---|---|
| ClinicalTrials.gov v2 | `https://clinicaltrials.gov/api/v2/studies` | None | https://clinicaltrials.gov/data-api/api |
| FDA OpenFDA | `https://api.fda.gov/drug/drugsfda.json` | Free key | https://open.fda.gov/apis/ |
| SEC EDGAR XBRL | `https://data.sec.gov/api/xbrl/companyfacts/CIK{n}.json` | None (User-Agent required) | https://www.sec.gov/developer |
| SEC EDGAR Submissions | `https://data.sec.gov/submissions/CIK{n}.json` | None (User-Agent required) | https://www.sec.gov/developer |
| SEC EDGAR Full-Text | `https://efts.sec.gov/LATEST/search-index` | None | https://efts.sec.gov |
| PubMed NCBI eSearch | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` | Free key optional | https://www.ncbi.nlm.nih.gov/books/NBK25501/ |
| Yahoo Finance | Via `yfinance` Python library | None | https://pypi.org/project/yfinance/ |
| Alpha Vantage | `https://www.alphavantage.co/query` | Free key | https://www.alphavantage.co/documentation/ |
| EMA EPAR | `https://www.ema.europa.eu/en/medicines/download-medicine-data` | None | https://www.ema.europa.eu/en/medicines/download-medicine-data |
| FDA PDUFA Calendar | `https://www.fda.gov/patients/drug-development-process/step-4-fda-drug-review` | None (HTML parse) | Manual |
| DailyMed (drug labels) | `https://dailymed.nlm.nih.gov/dailymed/services/v2/` | None | https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm |
| DrugBank | `https://go.drugbank.com/` | Subscription for API | https://docs.drugbankplus.com/ |

---

## Appendix B: Technology Stack Summary

| Layer | Recommendation | Alternatives |
|---|---|---|
| Primary database | PostgreSQL 16 + TimescaleDB | CockroachDB (distributed), Aurora PostgreSQL (managed) |
| Cache | Redis 7 | Memcached, DynamoDB DAX |
| Full-text search | PostgreSQL `pg_trgm` → Elasticsearch | Meilisearch, Typesense |
| Graph database | Neo4j (Phase 5) | Amazon Neptune, TigerGraph |
| API framework | FastAPI (Python) | Express (Node.js), Django REST |
| Ingestion language | Python 3.11 | — |
| ORM | SQLAlchemy 2.0 | Tortoise ORM, Django ORM |
| Scheduler | Prefect (prod) / `schedule` (dev) | Apache Airflow, Dagster |
| Frontend data fetching | TanStack Query (React Query) | SWR, Apollo Client |
| NLP | OpenAI GPT-4o API (fast iteration) → fine-tuned BioBERT (production) | Anthropic Claude API |
| Auth | Supabase Auth or Auth0 | Clerk, Cognito |
| Hosting (DB) | AWS RDS PostgreSQL or Supabase | Railway, Render, Neon |
| Hosting (API) | AWS ECS / Fargate or Railway | Render, Fly.io, Vercel (serverless) |
| Monitoring | Datadog or Prometheus + Grafana | New Relic, Sentry |
