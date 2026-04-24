// ============================================================
// Stock Pitch Data — BioPharma Atlas Investment Thesis
// Research Date: April 8, 2026
// Compiled from: prompts 1-14, investment_data_research.md
// ============================================================

export interface Pick {
  ticker: string;
  name: string;
  direction: "LONG" | "SHORT";
  price: number;
  target: number;
  upside: number;
  color: string;
  accentDark: string;
  marketCap: string;
  timeframe: string;
  conviction: string;
  tagline: string;
}

export const picks: Pick[] = [
  {
    ticker: "BNTX",
    name: "BioNTech SE",
    direction: "LONG",
    price: 92.08,
    target: 155,
    upside: 68,
    color: "#6366f1",
    accentDark: "#3730a3",
    marketCap: "$23.1B",
    timeframe: "12–18 months",
    conviction: "HIGH",
    tagline: "Pipeline priced at $18/share after cash. Three Phase 3s across three modalities.",
  },
  {
    ticker: "LEGN",
    name: "Legend Biotech",
    direction: "LONG",
    price: 18.30,
    target: 50,
    upside: 173,
    color: "#10b981",
    accentDark: "#065f46",
    marketCap: "$3.4B",
    timeframe: "9–18 months",
    conviction: "HIGH",
    tagline: "CARVYKTI +66% YoY. Confirmed buyout process underway.",
  },
  {
    ticker: "IONS",
    name: "Ionis Pharmaceuticals",
    direction: "LONG",
    price: 74.98,
    target: 130,
    upside: 73,
    color: "#06b6d4",
    accentDark: "#155e75",
    marketCap: "$12.4B",
    timeframe: "12–24 months",
    conviction: "HIGH",
    tagline: "11 Phase 3 programs at $12.4B. Novartis paid $12B for 3 Phase 3s.",
  },
  {
    ticker: "GILD",
    name: "Gilead Sciences",
    direction: "SHORT",
    price: 141.54,
    target: 90,
    upside: -36,
    color: "#ef4444",
    accentDark: "#7f1d1d",
    marketCap: "$175.7B",
    timeframe: "18–24 months",
    conviction: "MEDIUM",
    tagline: "SOTP: $54B equity vs. $175.7B market cap. Wonders-2 terminated Apr 8.",
  },
];

// ── BNTX Detail ──────────────────────────────────────────────

export const bntxStats = [
  { label: "Market Cap", value: "$23.1B" },
  { label: "Net Cash", value: "$14.9B" },
  { label: "Cash / Share", value: "$73.80" },
  { label: "Pipeline Value", value: "$8.2B" },
  { label: "Pipeline / Share", value: "$18.28" },
  { label: "Pipeline Programs", value: "30+" },
  { label: "Cash Runway", value: "14+ years" },
  { label: "Analyst PT", value: "$129.50" },
  { label: "Buy Rating", value: "70%" },
  { label: "Long-Term Debt", value: "$0" },
];

export const bntxThesis = [
  {
    heading: "The Overreaction Entry Point",
    body: "On March 10, 2026, co-founders Ugur Sahin and Özlem Türeci announced their departure from executive roles alongside a guidance cut to €2.0–2.3B — the stock fell 17.9% in one session. This is a textbook overreaction: the founders are departing into a structured spin-out with an IP agreement (expected H1 2026), not leaving science behind. Sahin retains a large equity stake and board involvement. The fundamental business — €14.9B in liquidity, zero debt, and a 30+ program pipeline — is entirely unchanged.",
  },
  {
    heading: "BNT327: The Key Catalyst",
    body: "BNT327 (pumitamig), a PD-L1×VEGF-A bispecific partnered with Bristol-Myers Squibb in an $11.1B co-development deal, has demonstrated an ORR of 76.3% in small-cell lung cancer Phase 2 — versus 60% historical standard of care. It is differentiated from ivonescimab (Summit/Akeso) by targeting PD-L1 (not PD-1), preserving the CD28 co-stimulation signal and requiring no biomarker selection. Phase 3 interim data are expected Q2 2026 in SCLC. A second Phase 3 in NSCLC runs in parallel.",
  },
  {
    heading: "The Valuation Absurdity",
    body: "At $92/share, BioNTech's $14.9B cash pile implies the market values the entire oncology pipeline at just $8.2B — less than 40% of AbbVie's $10.1B ImmunoGen acquisition for a single Phase 3 ADC. BNT323 (HER2 ADC) alone met its China Phase 3 primary endpoint in September 2025. BNT111 (mRNA cancer vaccine) is in Phase 3 with Regeneron. Risk-adjusted SOTP is $32.4B ($40% above current market cap), and probability-weighted DCF reaches $192/share — more than double today's price.",
  },
];

export const bntxScenarios = [
  { label: "Bear (15%)", value: 25, weight: 0.15, color: "#ef4444" },
  { label: "Base (60%)", value: 137, weight: 0.60, color: "#6366f1" },
  { label: "Weighted", value: 192, weight: null, color: "#a78bfa" },
  { label: "Bull (25%)", value: 423, weight: 0.25, color: "#10b981" },
];

export const bntxValuationChart = [
  { name: "Current ($92)", value: 92, fill: "#64748b" },
  { name: "Base Case ($137)", value: 137, fill: "#6366f1" },
  { name: "Prob-Weighted ($192)", value: 192, fill: "#a78bfa" },
  { name: "M&A Low ($131)", value: 131, fill: "#06b6d4" },
  { name: "M&A High ($222)", value: 222, fill: "#0284c7" },
];

export const bntxAssumptions = [
  "Base case: BNT327 achieves FDA approval 2028, peak sales $4B (conservative vs. Keytruda's $25B)",
  "Bear case: BNT327 fails Phase 3; pipeline valued at cash minus 3 years of burn",
  "Bull case: BNT327 peak $8B + BNT323 $2.5B + mRNA vaccine platform $4B",
  "WACC: 10% | Terminal growth: 3% | Discount period: 10 years",
  "M&A comp range: $131–$222 based on bispecific + RNA + ADC modality benchmarks from 28 transactions",
];

// ── BNTX Catalysts ───────────────────────────────────────────

export const bntxCatalysts = [
  {
    date: "Q2 2026",
    event: "BNT327 Phase 3 Interim",
    detail: "Rosetta Lung-01 SCLC interim data vs. Tecentriq + chemo",
    impact: "HIGH",
    type: "positive",
  },
  {
    date: "H2 2026",
    event: "BNT323 Global Phase 3",
    detail: "DYNASTY-Breast02 HER2-low global data readout",
    impact: "HIGH",
    type: "positive",
  },
  {
    date: "H2 2026",
    event: "mRNA Cancer Vaccine Ph3",
    detail: "BNT111/BNT122 data with Regeneron partnership reaffirmed",
    impact: "MEDIUM",
    type: "positive",
  },
  {
    date: "H1 2026",
    event: "IP Agreement Resolution",
    detail: "Co-founder spin-out IP terms finalized — key overhang removal",
    impact: "RISK",
    type: "risk",
  },
  {
    date: "2027",
    event: "BNT327 NDA Filing",
    detail: "Assuming positive Phase 3 → regulatory submission",
    impact: "HIGH",
    type: "positive",
  },
  {
    date: "2028",
    event: "BNT327 Potential Approval",
    detail: "Peak sales $4–8B; first mRNA oncology platform drug",
    impact: "HIGH",
    type: "positive",
  },
];

// ── BNTX Competitive Landscape ───────────────────────────────

export const bntxCompTable = [
  {
    asset: "BNT327 (pumitamig)",
    company: "BioNTech / BMS",
    target: "PD-L1 × VEGF-A",
    phase: "Phase 3",
    keyData: "SCLC ORR 76.3%",
    differentiation: "PD-L1 target, no biomarker needed, CD28 preserved",
    status: "active",
  },
  {
    asset: "Ivonescimab",
    company: "Summit / Akeso",
    target: "PD-1 × VEGF",
    phase: "BLA Filed",
    keyData: "HARMONi PFS HR 0.52 (EGFR-mut)",
    differentiation: "PD-L1 selection required; no SCLC program",
    status: "competitor",
  },
  {
    asset: "Tiragolumab",
    company: "Roche",
    target: "PD-1 × TIGIT",
    phase: "Discontinued",
    keyData: "SKYSCRAPER-01 failed OS",
    differentiation: "Program abandoned",
    status: "failed",
  },
];

export const bntxADCTable = [
  {
    asset: "BNT323 (trastuzumab pamirtecan)",
    company: "BioNTech / DualityBio",
    target: "HER2 ADC (DITAC platform)",
    phase: "Phase 3",
    keyData: "China Ph3 met PFS primary endpoint (Sept 2025)",
    differentiation: "Lower ILD risk vs. Enhertu; ADC-IO combo with BNT327",
    status: "active",
  },
  {
    asset: "Enhertu (T-DXd)",
    company: "AZ / Daiichi Sankyo",
    target: "HER2 ADC",
    phase: "Approved",
    keyData: "DESTINY-Breast09: 44% risk reduction (1L HER2+)",
    differentiation: "Market leader; ILD risk in ~15% of patients",
    status: "competitor",
  },
];

// ── Secondary Picks ──────────────────────────────────────────

export const secondaryPicks = [
  {
    ticker: "LEGN",
    name: "Legend Biotech",
    direction: "LONG" as const,
    price: 18.30,
    target: 50,
    upside: 173,
    color: "#10b981",
    marketCap: "$3.4B",
    timeframe: "9–18 months",
    bullets: [
      "CARVYKTI (cilta-cel) Q4 2025 revenue $555M, +66% YoY; company-wide profit expected 2026",
      "Confirmed buyout process — Centerview Partners engaged; J&J holds commercialization rights (logical acquirer)",
      "Trades below Gilead's $3.3B Arcellx acquisition — for a company with a commercial blockbuster and OS label benefit",
      "10,000+ patients treated globally; in-vivo CAR-T pipeline readouts H2 2026",
      "Analyst consensus: 87.5% Buy, avg PT $57.50",
    ],
    keyMetrics: [
      { label: "Q4 2025 Revenue", value: "$555M" },
      { label: "YoY Growth", value: "+66%" },
      { label: "2026 Revenue Guidance", value: "+50%+" },
      { label: "Cash", value: "$949M" },
      { label: "M&A Comp (Arcellx)", value: "$3.3B" },
    ],
  },
  {
    ticker: "IONS",
    name: "Ionis Pharmaceuticals",
    direction: "LONG" as const,
    price: 74.98,
    target: 130,
    upside: 73,
    color: "#06b6d4",
    marketCap: "$12.4B",
    timeframe: "12–24 months",
    bullets: [
      "11 Phase 3 programs + 4 NDA submissions in 2026 + 3 approved drugs at $12.4B market cap",
      "Novartis paid $12B for Avidity RNA platform (3 Phase 3 programs) — IONS has 3.7× more Phase 3s",
      "Pipeline density score #3 in universe (1.85) — pure-play RNA leader alongside Alnylam",
      "Olezarsen (TRYNGOLZA) NDA filed for triglycerides; pelacarsen Phase 3 cardiovascular data mid-2026",
      "Revenue +34% in 2025; $2.7B total liquidity; breakeven target 2028",
    ],
    keyMetrics: [
      { label: "Phase 3 Programs", value: "11" },
      { label: "Approved Products", value: "4" },
      { label: "Cash / Liquidity", value: "$2.7B" },
      { label: "2025 Revenue Growth", value: "+34%" },
      { label: "Analyst Buy %", value: "91.7%" },
    ],
  },
  {
    ticker: "GILD",
    name: "Gilead Sciences",
    direction: "SHORT" as const,
    price: 141.54,
    target: 90,
    upside: -36,
    color: "#ef4444",
    marketCap: "$175.7B",
    timeframe: "18–24 months",
    bullets: [
      "SOTP equity value: $54B vs. $175.7B market cap → 69% overvaluation implied",
      "Wonders-2 trial terminated April 8, 2026 — removes HIV franchise successor narrative",
      "mAb franchise event study: 5.14× negative asymmetry ratio — worst long setup in universe",
      "HIV franchise faces biosimilar pressure post-2026; Biktarvy LOE approaching",
      "Trodelvy NSCLC failure risk ($7.64B risk-adjusted) → asymmetric downside if pivotal trial fails",
    ],
    keyMetrics: [
      { label: "Market Cap", value: "$175.7B" },
      { label: "SOTP Value", value: "$95.3B" },
      { label: "Premium to SOTP", value: "−46%" },
      { label: "mAb Asymmetry Ratio", value: "5.14×" },
      { label: "Short Target", value: "$90" },
    ],
  },
];

// ── Screening Funnel ─────────────────────────────────────────

export const screeningFunnel = [
  { stage: "Public Biopharma Universe", count: 500, description: "NYSE/NASDAQ listed, market cap >$1B" },
  { stage: "Pipeline Density Screen", count: 28, description: "Ranked by Phase 3 + Ph2 + Approved / Market Cap" },
  { stage: "Modality Alignment", count: 16, description: ">50% exposure to ADC, Bispecific, or RNA" },
  { stage: "M&A Target Profile", count: 10, description: "Size, modality fit, acquirer appetite screened" },
  { stage: "Valuation Gap >30%", count: 6, description: "SOTP discount vs. market cap >30%" },
  { stage: "Final Picks", count: 4, description: "Near-term 2026 catalysts + probability mispricing" },
];

// ── Structural Trends ────────────────────────────────────────

export const modalityAsymmetry = [
  { modality: "Small Mol.", successAvg: 254.8, failureAvg: -55.2, ratio: 0.22, color: "#f59e0b" },
  { modality: "CAR-T", successAvg: 77.3, failureAvg: -10.0, ratio: 0.13, color: "#10b981" },
  { modality: "Bispecific", successAvg: 75.8, failureAvg: -44.5, ratio: 0.59, color: "#6366f1" },
  { modality: "Gene Therapy", successAvg: 62.5, failureAvg: -40.4, ratio: 0.65, color: "#8b5cf6" },
  { modality: "RNAi", successAvg: 53.5, failureAvg: -65.0, ratio: 1.21, color: "#06b6d4" },
  { modality: "ADC", successAvg: 16.6, failureAvg: -17.5, ratio: 1.05, color: "#f43f5e" },
  { modality: "mAb", successAvg: 15.8, failureAvg: -81.5, ratio: 5.14, color: "#dc2626" },
];

export const structuralTrends = [
  {
    icon: "adc",
    title: "ADC / Bispecific Explosion",
    stats: [
      { label: "ADCs in Clinic", value: "230+" },
      { label: "Bispecific LOA", value: "13%" },
      { label: "ADC M&A in 2025", value: "~40%" },
    ],
    detail:
      "230+ ADCs in clinical development, 41 in Phase 3 as of mid-2025. Bispecifics have the highest likelihood of approval in oncology immunology. ADC-related transactions represent ~40% of all antibody M&A.",
  },
  {
    icon: "ma",
    title: "M&A Acceleration",
    stats: [
      { label: "2025 Deal Volume", value: "$138B" },
      { label: "Avg Premium (ADC)", value: "78%" },
      { label: "CAR-T Avg Premium", value: "130%" },
    ],
    detail:
      "$138B in biopharma M&A deals analyzed (2023–2026), with 28 transactions showing 30–165% acquisition premiums. RNA modality commands $6B per Phase 3 program (Novartis/Avidity benchmark).",
  },
  {
    icon: "event",
    title: "Modality Event Asymmetry",
    stats: [
      { label: "Small Mol. Ratio", value: "0.22×" },
      { label: "Bispecific Ratio", value: "0.59×" },
      { label: "mAb Ratio", value: "5.14×" },
    ],
    detail:
      "Small molecules and bispecifics offer the best asymmetric returns: +254.8% average success vs. −55.2% failure. mAbs are the worst setup with 5.14× negative asymmetry — catastrophic failure risk vs. tiny reward on success.",
  },
];

// ── Risk Factors ─────────────────────────────────────────────

export const riskFactors = [
  {
    risk: "Co-founder IP Agreement Uncertainty",
    severity: "MEDIUM",
    ticker: "BNTX",
    mitigation:
      "€14.9B cash buffer and 14-year operational runway provides full protection regardless of IP outcome. Founders retain equity stakes; structured departure, not abrupt exit.",
  },
  {
    risk: "BNT327 Fails to Differentiate vs. Ivonescimab",
    severity: "HIGH",
    ticker: "BNTX",
    mitigation:
      "BNT323 (HER2 ADC, China Ph3 met primary endpoint) and BNT111 mRNA cancer vaccine Phase 3 provide pipeline diversification. BMS co-development provides commercial validation.",
  },
  {
    risk: "Broader Biopharma Market Sell-Off",
    severity: "MEDIUM",
    ticker: "ALL",
    mitigation:
      "BNTX cash floor of ~$74/share provides structural downside protection. LEGN buyout premium acts as floor. IONS has $2.7B cash.",
  },
  {
    risk: "Clinical Trial Failure Across Portfolio",
    severity: "LOW",
    ticker: "ALL",
    mitigation:
      "Bispecific event study shows failures average only −55% vs. +255% on success (0.59× ratio). Portfolio diversification across 3 modalities reduces correlation risk.",
  },
];

// ── Methodology Sources ──────────────────────────────────────

export const dataSources = [
  { name: "ClinicalTrials.gov API v2", url: "https://clinicaltrials.gov" },
  { name: "FDA CDER / CBER", url: "https://www.fda.gov/drugs" },
  { name: "SEC EDGAR (10-K / 20-F filings)", url: "https://www.sec.gov/edgar" },
  { name: "BIO / QLS Advisors Clinical Success Rates 2011–2020", url: "https://go.bio.org/rs/490-EHZ-999/images/ClinicalDevelopmentSuccessRates2011_2020.pdf" },
  { name: "Bain & Company Pharma M&A Report 2026", url: "https://www.bain.com/insights/pharmaceuticals-m-and-a-report-2026/" },
  { name: "Fierce Pharma — Top 10 M&A Deals 2025", url: "https://www.fiercepharma.com/pharma/top-10-biopharma-ma-deals-2025" },
  { name: "Perplexity Finance (real-time quotes)", url: "https://perplexity.ai/finance/" },
  { name: "BioNTech 20-F (March 10, 2026)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=BNTX" },
  { name: "Legend Biotech JP Morgan 2026 Takeaways", url: "https://www.stocktitan.net/news/LEGN/legend-biotech-highlights-recent-business-updates-at-44th-annual-j-p-8kdjhm3k3788.html" },
  { name: "Ionis JPM 2026 Takeaways", url: "https://ionis.com/newsroom/defining-moments/ionis-jpm-2026-takeaways-breakthrough-therapies-driving-accelerating" },
  { name: "Novartis / Avidity $12B RNA Acquisition", url: "https://www.novaoneadvisor.com/report/rna-therapeutics-market" },
  { name: "Pharm Exec 2026 Pipeline Report", url: "https://www.pharmexec.com/view/pharm-exec-s-2026-pipeline-report-next-frontiers-in-focus" },
];

export const dashboardLinks = [
  { label: "Overview", path: "/" },
  { label: "Modality Timeline", path: "/timeline" },
  { label: "Pipeline Funnel", path: "/funnel" },
  { label: "Body Map", path: "/bodymap" },
  { label: "Target Heatmap", path: "/heatmap" },
  { label: "Investment Signals", path: "/signals" },
];
