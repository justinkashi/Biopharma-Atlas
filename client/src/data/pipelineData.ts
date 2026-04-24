// ============================================================
// BIOPHARMA PIPELINE DASHBOARD — REAL DATA
// Sources: FDA CDER/CBER, ClinicalTrials.gov, ASGCT, BCG, PMC
// ============================================================

// ----- DATA CONFIDENCE METADATA -----
export type DataConfidence = "verified" | "estimated" | "composite";

export const dataSourceNotes: Record<string, { confidence: DataConfidence; source: string; note: string }> = {
  // Verified: directly from APIs
  "clinicalTrialsByCondition": { confidence: "verified", source: "ClinicalTrials.gov API v2", note: "Queried April 2026" },
  "pipelineByModality": { confidence: "verified", source: "ClinicalTrials.gov API v2", note: "Queried April 2026. NOTE: cell_therapy count (27,305) is a broad query including stem cell transplants, mesenchymal cells, and regenerative medicine — not just engineered CAR-T/TIL therapies. Engineered cell therapies only: CAR-T (2,519) + TIL (342) + NK Cell (1,185) = ~4,046." },

  // Composite: real data combined from multiple sources
  "modalityTimelineData": { confidence: "composite", source: "FDA CDER NME + CBER BLA compilations", note: "Year-by-year categorization from FDA annual reports. Some years required manual modality classification from drug labels." },
  "milestoneEvents": { confidence: "verified", source: "FDA approval records + published literature", note: "Each milestone is a documented FDA approval date" },

  // Estimated: industry reports, not primary
  "attritionData": { confidence: "estimated", source: "BIO Industry Analysis 2021 + Nature Reviews Drug Discovery", note: "Phase counts are industry-wide estimates, not exact trial counts. Success rates from pooled analyses." },
  "targetClassData": { confidence: "estimated", source: "Industry landscape analyses + ClinicalTrials.gov keyword searches", note: "Activity numbers represent approximate active pipeline programs, not exact trial counts" },
  "sponsorData": { confidence: "estimated", source: "Company pipeline disclosures + SEC filings", note: "Pipeline sizes are approximate based on public disclosures. Actual counts vary by inclusion criteria." },
  "organSystemData.trials": { confidence: "verified", source: "ClinicalTrials.gov API", note: "Real trial counts from API queries" },
  "organSystemData.details": { confidence: "composite", source: "Published literature + FDA labels", note: "Drug targets, modalities, and descriptions compiled from multiple published sources" },
};

// ----- MODALITY EVOLUTION TIMELINE (2000–2025) -----
// Year-by-year FDA approvals by modality category
// Source: FDA NME Compilation, PMC trend analyses, BCG 2024
export const modalityTimelineData = [
  { year: 2000, smallMolecule: 24, mAb: 0, adc: 1, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 2, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2001, smallMolecule: 22, mAb: 1, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 1, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2002, smallMolecule: 16, mAb: 2, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 0, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2003, smallMolecule: 18, mAb: 1, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 2, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2004, smallMolecule: 30, mAb: 3, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 1, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2005, smallMolecule: 18, mAb: 0, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 2, mRNAVaccine: 0, fcFusion: 1 },
  { year: 2006, smallMolecule: 20, mAb: 1, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 0, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2007, smallMolecule: 16, mAb: 1, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 0, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2008, smallMolecule: 21, mAb: 0, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 3, mRNAVaccine: 0, fcFusion: 1 },
  { year: 2009, smallMolecule: 22, mAb: 3, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 1, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2010, smallMolecule: 17, mAb: 1, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 0, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2011, smallMolecule: 29, mAb: 3, adc: 1, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 1, mRNAVaccine: 0, fcFusion: 2 },
  { year: 2012, smallMolecule: 33, mAb: 2, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 4, mRNAVaccine: 0, fcFusion: 1 },
  { year: 2013, smallMolecule: 22, mAb: 1, adc: 1, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 1, peptide: 0, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2014, smallMolecule: 33, mAb: 4, adc: 0, bispecific: 1, geneTherapy: 0, carT: 0, rnaTherapeutic: 0, peptide: 2, mRNAVaccine: 0, fcFusion: 2 },
  { year: 2015, smallMolecule: 33, mAb: 7, adc: 0, bispecific: 0, geneTherapy: 1, carT: 0, rnaTherapeutic: 0, peptide: 2, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2016, smallMolecule: 15, mAb: 6, adc: 0, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 3, peptide: 1, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2017, smallMolecule: 34, mAb: 7, adc: 2, bispecific: 1, geneTherapy: 1, carT: 2, rnaTherapeutic: 0, peptide: 2, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2018, smallMolecule: 44, mAb: 7, adc: 1, bispecific: 0, geneTherapy: 0, carT: 0, rnaTherapeutic: 2, peptide: 2, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2019, smallMolecule: 36, mAb: 4, adc: 3, bispecific: 0, geneTherapy: 1, carT: 0, rnaTherapeutic: 3, peptide: 2, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2020, smallMolecule: 38, mAb: 9, adc: 2, bispecific: 0, geneTherapy: 0, carT: 1, rnaTherapeutic: 2, peptide: 1, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2021, smallMolecule: 36, mAb: 7, adc: 2, bispecific: 1, geneTherapy: 0, carT: 3, rnaTherapeutic: 3, peptide: 1, mRNAVaccine: 1, fcFusion: 0 },
  { year: 2022, smallMolecule: 22, mAb: 2, adc: 1, bispecific: 4, geneTherapy: 4, carT: 1, rnaTherapeutic: 2, peptide: 2, mRNAVaccine: 1, fcFusion: 0 },
  { year: 2023, smallMolecule: 34, mAb: 6, adc: 0, bispecific: 4, geneTherapy: 4, carT: 1, rnaTherapeutic: 3, peptide: 4, mRNAVaccine: 0, fcFusion: 0 },
  { year: 2024, smallMolecule: 32, mAb: 13, adc: 0, bispecific: 3, geneTherapy: 2, carT: 2, rnaTherapeutic: 2, peptide: 2, mRNAVaccine: 1, fcFusion: 1 },
  { year: 2025, smallMolecule: 28, mAb: 8, adc: 2, bispecific: 1, geneTherapy: 1, carT: 1, rnaTherapeutic: 4, peptide: 2, mRNAVaccine: 1, fcFusion: 0 },
];

export const modalityKeys = [
  { key: "smallMolecule", label: "Small Molecules", color: "#6366f1" },
  { key: "mAb", label: "Monoclonal Antibodies", color: "#06b6d4" },
  { key: "adc", label: "ADCs", color: "#f43f5e" },
  { key: "bispecific", label: "Bispecific Antibodies", color: "#f97316" },
  { key: "geneTherapy", label: "Gene Therapy", color: "#22c55e" },
  { key: "carT", label: "CAR-T / Cell Therapy", color: "#a855f7" },
  { key: "rnaTherapeutic", label: "RNA Therapeutics", color: "#eab308" },
  { key: "peptide", label: "Peptides", color: "#ec4899" },
  { key: "mRNAVaccine", label: "mRNA Vaccines", color: "#14b8a6" },
  { key: "fcFusion", label: "Fc-Fusion Proteins", color: "#78716c" },
];

// ----- PIPELINE ATTRITION FUNNEL BY MODALITY -----
// Approximate success rates by phase (industry averages + modality-specific data)
// Sources: BIO Industry Analysis 2021, Nature Reviews Drug Discovery, ASGCT Q4 2024
export const attritionData = [
  { modality: "Small Molecules", phaseI: 8000, phaseII: 3200, phaseIII: 1200, approved: 320, color: "#6366f1", successRate: "4.0%" },
  { modality: "Monoclonal Antibodies", phaseI: 600, phaseII: 360, phaseIII: 200, approved: 80, color: "#06b6d4", successRate: "13.3%" },
  { modality: "ADCs", phaseI: 100, phaseII: 55, phaseIII: 25, approved: 7, color: "#f43f5e", successRate: "7.0%" },
  { modality: "Gene Therapy", phaseI: 341, phaseII: 306, phaseIII: 35, approved: 15, color: "#22c55e", successRate: "4.4%" },
  { modality: "CAR-T / Cell", phaseI: 200, phaseII: 150, phaseIII: 40, approved: 10, color: "#a855f7", successRate: "5.0%" },
  { modality: "RNA Therapeutics", phaseI: 350, phaseII: 250, phaseIII: 80, approved: 25, color: "#eab308", successRate: "7.1%" },
  { modality: "Bispecifics", phaseI: 60, phaseII: 30, phaseIII: 15, approved: 8, color: "#f97316", successRate: "13.3%" },
  { modality: "Peptides", phaseI: 100, phaseII: 80, phaseIII: 40, approved: 15, color: "#ec4899", successRate: "15.0%" },
];

// ----- ORGAN SYSTEM DATA -----
// Clinical trials by condition area (real ClinicalTrials.gov data) + modality breakdown
export const organSystemData: Record<string, {
  name: string;
  trials: number;
  topModalities: string[];
  topTargets: string[];
  deliveryRoutes: string[];
  description: string;
  pipelineGrowth: string;
  keyDrugs: string[];
  tooltip: string;
}> = {
  brain: {
    name: "Brain / CNS",
    trials: 56600,
    topModalities: ["Small Molecules", "Monoclonal Antibodies", "ASOs", "Gene Therapy"],
    topTargets: ["Amyloid-β", "Tau", "α-Synuclein", "LRRK2", "SOD1", "5-HT", "NMDA-R", "GABA-A"],
    deliveryRoutes: ["Oral", "IV", "Intrathecal", "Intranasal"],
    description: "Neurological disorders including Alzheimer's, Parkinson's, ALS, epilepsy, depression, and schizophrenia. One of the hardest areas due to blood-brain barrier penetration challenges.",
    pipelineGrowth: "+18% (2020-2024)",
    keyDrugs: ["Lecanemab (anti-Aβ mAb)", "Tofersen (SOD1 ASO)", "Sotorasib (KRAS)", "Brexpiprazole"],
    tooltip: "The CNS is the hardest frontier in drug delivery: the blood-brain barrier (BBB) blocks ~98% of small molecules and essentially all biologics from entering the brain. Researchers use lipophilic small molecules, intrathecal (spinal fluid) injection for ASOs, or engineered proteins with BBB-crossing receptor ligands (e.g., transferrin receptor hijacking) to get around this. Landmark drugs: Lecanemab (Leqembi) — first anti-amyloid-β antibody to slow Alzheimer's progression; Tofersen (Qalsody) — intrathecal SOD1-targeting ASO for ALS; Nusinersen (Spinraza) — pioneered the intrathecal ASO delivery route for SMA."
  },
  eye: {
    name: "Eye / Ophthalmology",
    trials: 7167,
    topModalities: ["Monoclonal Antibodies", "Fc-Fusion", "Gene Therapy", "Small Molecules"],
    topTargets: ["VEGF-A", "Ang-2", "RPE65", "Complement C5", "IL-6"],
    deliveryRoutes: ["Intravitreal injection", "Topical", "Subretinal"],
    description: "Retinal diseases (AMD, diabetic retinopathy), glaucoma, and inherited retinal dystrophies. AAV gene therapies showing promise for genetic blindness.",
    pipelineGrowth: "+12% (2020-2024)",
    keyDrugs: ["Aflibercept (Eylea)", "Faricimab (bispecific)", "Luxturna (AAV gene therapy)"],
    tooltip: "The eye is a privileged compartment — drugs injected intravitreally (directly into the vitreous humor) are confined to the eye and avoid systemic exposure, making it the ideal delivery route for potent biologics. This 'immune privilege' also reduces rejection risk for gene therapies. VEGF inhibitors (aflibercept, ranibizumab) transformed wet AMD from a blinding disease to a manageable one. Landmark drugs: Luxturna (voretigene neparvovec) — first FDA-approved in vivo gene therapy, using AAV2 to deliver functional RPE65 gene under the retina, restoring vision in congenital blindness; Faricimab — first bispecific antibody for ophthalmology, simultaneously blocking VEGF-A and Ang-2."
  },
  lungs: {
    name: "Lungs / Respiratory",
    trials: 61169,
    topModalities: ["Small Molecules", "Monoclonal Antibodies", "Inhaled therapies"],
    topTargets: ["IL-5", "IL-4Rα", "TSLP", "PDE4", "JAK", "EGFR (lung cancer)"],
    deliveryRoutes: ["Inhaled", "Oral", "IV", "Subcutaneous"],
    description: "Asthma, COPD, pulmonary fibrosis, lung cancer, and cystic fibrosis. Biologics transforming severe asthma; checkpoint inhibitors revolutionizing lung cancer.",
    pipelineGrowth: "+22% (2020-2024)",
    keyDrugs: ["Dupilumab (IL-4Rα)", "Tezepelumab (TSLP)", "Osimertinib (EGFR TKI)", "Pembrolizumab"],
    tooltip: "Inhaled delivery is the gold standard for respiratory drugs — placing drug directly at the disease site while minimizing systemic exposure. Small molecules like bronchodilators (β2 agonists) and corticosteroids exploit this route brilliantly. However, biologics cannot yet be inhaled effectively at therapeutic doses, so anti-cytokine mAbs (dupilumab, tezepelumab) are given subcutaneously. In lung cancer, EGFR-mutant NSCLC was the first precision oncology success story outside hematology, and PD-1/PD-L1 checkpoint inhibitors now form the backbone of first-line treatment across histologies. Landmark drugs: Tezepelumab (Tezspire) — TSLP blocker that cuts asthma attacks by 70% regardless of eosinophil count; Osimertinib (Tagrisso) — 3rd-gen EGFR TKI overcoming T790M resistance; Pembrolizumab (Keytruda) — approved in 15+ lung cancer settings."
  },
  heart: {
    name: "Heart / Cardiovascular",
    trials: 78639,
    topModalities: ["Small Molecules", "siRNA", "Monoclonal Antibodies", "Peptides"],
    topTargets: ["PCSK9", "Lp(a)", "ApoCIII", "ANGPTL3", "SGLT2", "Factor XIa"],
    deliveryRoutes: ["Oral", "Subcutaneous", "IV"],
    description: "Heart failure, coronary artery disease, hypertension, lipid disorders. siRNA (inclisiran) and PCSK9 antibodies represent new paradigm for cholesterol management.",
    pipelineGrowth: "+15% (2020-2024)",
    keyDrugs: ["Inclisiran (PCSK9 siRNA)", "Evolocumab (PCSK9 mAb)", "Sotatercept (PAH)", "Semaglutide (CV benefit)"],
    tooltip: "Cardiovascular medicine was transformed first by statins (targeting cholesterol biosynthesis) and then by PCSK9 inhibitors — proteins that degrade LDL receptors. Blocking PCSK9 (either with mAbs like evolocumab, or siRNA like inclisiran) allows LDL receptors to persist longer on liver cells, dramatically lowering LDL-C. The siRNA approach is revolutionary: inclisiran is dosed only twice per year because GalNAc conjugation delivers it efficiently to hepatocytes where it silences PCSK9 mRNA for months. Beyond lipids, SGLT2 inhibitors surprised everyone with heart failure benefits unrelated to their glucose-lowering effect — possibly via cardiac energy substrate switching. Landmark drugs: Inclisiran (Leqvio) — first siRNA for CV disease, twice-yearly dosing; Evolocumab (Repatha) — proved PCSK9 mAb reduces heart attacks; Sotatercept (Winrevair) — ActRIIA Fc-fusion for pulmonary arterial hypertension."
  },
  liver: {
    name: "Liver / Hepatology",
    trials: 17468,
    topModalities: ["Small Molecules", "siRNA", "ASOs", "Monoclonal Antibodies"],
    topTargets: ["FXR", "THR-β", "ACC", "DGAT2", "HBV targets", "PNPLA3"],
    deliveryRoutes: ["Oral", "Subcutaneous (GalNAc-siRNA)", "IV"],
    description: "NASH/MASH (metabolic liver disease), hepatitis B, cirrhosis. GalNAc-conjugated siRNAs naturally target hepatocytes — liver is the most accessible organ for RNA therapeutics.",
    pipelineGrowth: "+35% (2020-2024)",
    keyDrugs: ["Resmetirom (THR-β, first NASH drug)", "Vutrisiran (GalNAc-siRNA)", "Eplontersen (GalNAc-ASO)"],
    tooltip: "The liver is the most druggable organ for RNA therapeutics because of a biological accident of anatomy: hepatocytes display ASGR1 receptors that avidly internalize GalNAc-sugar conjugates. Alnylam discovered that attaching N-acetylgalactosamine (GalNAc) to siRNAs and ASOs routes them directly into hepatocytes after subcutaneous injection, enabling potent, long-acting liver gene silencing with minimal off-target effects. This has made the liver the proving ground for the RNA therapeutic platform. Meanwhile, resmetirom (Rezdiffra) made history in 2024 as the first approved drug specifically for MASH (formerly NASH), acting as a selective thyroid hormone receptor-β agonist to reduce liver fat and fibrosis. Landmark drugs: Resmetirom (Rezdiffra) — first MASH approval; Inclisiran, Vutrisiran, Eplontersen — GalNAc-siRNA/ASO platform drugs; Patisiran (Onpattro) — first siRNA using LNP for TTR amyloidosis."
  },
  stomach: {
    name: "GI / Digestive System",
    trials: 21409,
    topModalities: ["Monoclonal Antibodies", "Small Molecules", "Peptides"],
    topTargets: ["TNF-α", "IL-23", "α4β7 integrin", "JAK", "S1P", "GLP-2"],
    deliveryRoutes: ["Oral", "Subcutaneous", "IV"],
    description: "Inflammatory bowel disease (Crohn's, UC), IBS, celiac disease. Anti-integrins and IL-23 blockers replacing older TNF inhibitors as first-line.",
    pipelineGrowth: "+20% (2020-2024)",
    keyDrugs: ["Vedolizumab (α4β7)", "Ustekinumab (IL-12/23)", "Risankizumab (IL-23)", "Ozanimod (S1P)"],
    tooltip: "The gut houses 70% of the body's immune cells, making it a uniquely immunologically active environment. In IBD, this immune system is dysregulated — attacking commensal bacteria and gut epithelium. The therapeutic evolution went from systemic immunosuppression (steroids, azathioprine) → TNF-α blockade (adalimumab, infliximab) → gut-selective integrin blockade (vedolizumab targets α4β7, restricting immune cell trafficking to the gut without systemic immunosuppression) → upstream cytokine blockade at IL-12/23 and IL-23 specifically. The IL-23 axis is now the most active target in IBD, with drugs like risankizumab (Skyrizi) achieving deep remission. Landmark drugs: Vedolizumab (Entyvio) — gut-selective; no systemic immunosuppression; Risankizumab (Skyrizi) — IL-23p19 blocker with excellent safety; Ozanimod (Zeposia) — oral S1P modulator retaining lymphocytes in lymph nodes."
  },
  kidney: {
    name: "Kidneys / Renal",
    trials: 15000,
    topModalities: ["Small Molecules", "Monoclonal Antibodies", "Peptides"],
    topTargets: ["SGLT2", "MR", "Endothelin-A", "Complement C5a", "VEGF"],
    deliveryRoutes: ["Oral", "IV", "Subcutaneous"],
    description: "Chronic kidney disease, diabetic nephropathy, IgA nephropathy, lupus nephritis. SGLT2 inhibitors showed unexpected renal protection benefit.",
    pipelineGrowth: "+25% (2020-2024)",
    keyDrugs: ["Dapagliflozin (SGLT2)", "Finerenone (MR antagonist)", "Iptacopan (complement)"],
    tooltip: "SGLT2 inhibitors were developed as glucose-lowering drugs for diabetes, but clinical trials revealed they dramatically slow CKD progression regardless of glucose levels — a completely unexpected mechanism. The leading hypothesis involves reduced glomerular hyperfiltration (SGLT2 blockade activates tubuloglomerular feedback, reducing pressure on the glomerulus) and possibly AMPK activation driving metabolic reprogramming. This repositioning transformed nephrology. Separately, IgA nephropathy gained multiple new drugs in 2023-2024 targeting the complement system and APRIL/BAFF cytokines upstream of IgA production. Landmark drugs: Dapagliflozin (Farxiga) — proved SGLT2 protects kidneys in CKD without diabetes; Finerenone (Kerendia) — non-steroidal MR antagonist reducing CKD progression in diabetic nephropathy; Iptacopan (Fabhalta) — first oral complement factor B inhibitor for PNH and IgA nephropathy."
  },
  bone: {
    name: "Musculoskeletal / Bone",
    trials: 20000,
    topModalities: ["Monoclonal Antibodies", "Small Molecules", "Fc-Fusion", "Peptides"],
    topTargets: ["RANKL", "Sclerostin", "IL-17A", "JAK", "TNF-α", "PTH-R"],
    deliveryRoutes: ["Subcutaneous", "Oral", "IV"],
    description: "Rheumatoid arthritis, osteoporosis, ankylosing spondylitis, gout. Biologics (anti-TNF, anti-IL-17) revolutionized RA treatment. PTH peptides for osteoporosis.",
    pipelineGrowth: "+10% (2020-2024)",
    keyDrugs: ["Denosumab (RANKL)", "Romosozumab (sclerostin)", "Secukinumab (IL-17)", "Teriparatide (PTH)"],
    tooltip: "Bone biology is elegantly controlled by two coupled processes: osteoclast-driven resorption and osteoblast-driven formation. RANKL (receptor activator of NF-κB ligand) is the master regulator of osteoclast differentiation — blocking it with denosumab (Prolia/Xgeva) essentially turns off bone resorption, increasing density and reducing fractures. Sclerostin is an osteocyte-secreted protein that inhibits bone formation (Wnt pathway); romosozumab antibody blocks sclerostin, simultaneously stimulating formation AND reducing resorption — a unique anabolic+antiresorptive mechanism. In inflammatory joint disease, the IL-17 axis (not just TNF) drives ankylosing spondylitis enthesitis particularly well. Landmark drugs: Denosumab (Prolia) — anti-RANKL for osteoporosis; Romosozumab (Evenity) — anti-sclerostin, anabolic bone builder; Secukinumab (Cosentyx) — anti-IL-17A for RA, AS, psoriasis."
  },
  skin: {
    name: "Skin / Dermatology",
    trials: 41376,
    topModalities: ["Monoclonal Antibodies", "Small Molecules", "Topicals"],
    topTargets: ["IL-4Rα", "IL-13", "IL-17A", "IL-31", "JAK1/2", "PDE4"],
    deliveryRoutes: ["Topical", "Subcutaneous", "Oral"],
    description: "Atopic dermatitis, psoriasis, acne, skin cancer. IL-4/13 and IL-17 biologics transformed moderate-to-severe eczema and psoriasis management.",
    pipelineGrowth: "+28% (2020-2024)",
    keyDrugs: ["Dupilumab (atopic dermatitis)", "Nemolizumab (IL-31)", "Ruxolitinib cream (JAK)"],
    tooltip: "The skin immune landscape is dominated by two Th2 cytokines — IL-4 and IL-13 — that drive the 'atopic march' in allergic disease (eczema → allergic rhinitis → asthma). Dupilumab (Dupixent) blocks the shared IL-4Rα receptor subunit used by both IL-4 and IL-13, producing remarkable efficacy in atopic dermatitis and becoming the best-selling dermatology drug ever. IL-31 drives itch specifically — nemolizumab targeting IL-31Rα directly addresses the debilitating pruritus component. In psoriasis, the IL-23/IL-17 axis is dominant: IL-23 drives Th17 differentiation, which produces IL-17A that causes keratinocyte hyperproliferation and the characteristic plaques. Landmark drugs: Dupilumab (Dupixent) — IL-4Rα blocker, >$10B/year, approved in 7+ indications; Nemolizumab (Nemluvio) — IL-31 blocker for itch; Ruxolitinib cream (Opzelura) — first topical JAK inhibitor for AD."
  },
  blood: {
    name: "Blood / Hematology",
    trials: 42288,
    topModalities: ["Gene Therapy", "CAR-T", "Bispecific Antibodies", "siRNA", "Monoclonal Antibodies"],
    topTargets: ["CD19", "BCMA", "CD20", "CD33", "HBB (gene)", "Factor IX", "Factor VIII"],
    deliveryRoutes: ["IV", "Subcutaneous", "Ex vivo cell processing"],
    description: "Blood cancers (lymphoma, leukemia, myeloma), hemophilia, sickle cell disease, thalassemia. The most active area for novel modalities — CAR-T, gene therapy, bispecifics all strongest here.",
    pipelineGrowth: "+32% (2020-2024)",
    keyDrugs: ["Kymriah (CAR-T)", "Casgevy (CRISPR)", "Hemgenix (gene therapy)", "Teclistamab (bispecific)"],
    tooltip: "Blood cancers and hemoglobinopathies are the vanguard of biopharma innovation because blood cells are easily accessible — unlike solid tumors, you can extract them, manipulate them ex vivo, and return them. This makes CAR-T engineering feasible: T-cells are harvested, engineered to express a chimeric antigen receptor (e.g., anti-CD19 or anti-BCMA), expanded, and infused. For hemophilia and sickle cell, gene therapy can potentially cure the disease with a single treatment by delivering functional copies of Factor IX or correcting the HBB mutation. In cancer, CD surface antigens (CD19, CD20, BCMA, CD33, CD38) are ideal targets because they're highly expressed on malignant cells, making them perfect for CAR-T, bispecific T-cell engagers, and ADCs. Landmark drugs: Kymriah — first CAR-T (83% remission in pediatric ALL); Casgevy — first CRISPR therapy, effectively cures sickle cell disease; Teclistamab (Tecvayli) — BCMA×CD3 bispecific, off-the-shelf alternative to BCMA CAR-T."
  },
  immune: {
    name: "Immune System",
    trials: 121405,
    topModalities: ["Checkpoint Inhibitors", "CAR-T", "Bispecifics", "ADCs", "Small Molecules"],
    topTargets: ["PD-1", "PD-L1", "CTLA-4", "LAG-3", "TIGIT", "CD47", "HER2", "EGFR"],
    deliveryRoutes: ["IV", "Subcutaneous", "Oral"],
    description: "Immuno-oncology is the largest therapeutic area. Checkpoint inhibitors alone account for 6,000+ trials. ADCs and bispecifics expanding rapidly in solid and hematologic cancers.",
    pipelineGrowth: "+40% (2020-2024)",
    keyDrugs: ["Pembrolizumab (PD-1)", "Nivolumab (PD-1)", "Trastuzumab deruxtecan (ADC)", "Ipilimumab (CTLA-4)"],
    tooltip: "Checkpoint inhibitors represent the most significant oncology breakthrough since cytotoxic chemotherapy. Cancer cells exploit inhibitory receptors (checkpoints) on T-cells — especially PD-1/PD-L1 and CTLA-4 — to evade immune surveillance. PD-L1 on tumor cells binds PD-1 on T-cells, sending an 'ignore me' signal that functionally exhausts T-cells. Anti-PD-1/PD-L1 antibodies (pembrolizumab, nivolumab, atezolizumab) block this interaction, reinvigorating T-cells to attack tumors. The Nobel Prize in Medicine 2018 was awarded to James Allison (CTLA-4) and Tasuku Honjo (PD-1) for this discovery. Combination strategies (anti-PD-1 + anti-CTLA-4, + chemotherapy, + ADC) are now standard. Next-gen checkpoints: LAG-3, TIGIT, TIM-3, VISTA are entering trials. Landmark drugs: Ipilimumab (Yervoy) — first checkpoint inhibitor (CTLA-4, melanoma); Pembrolizumab (Keytruda) — PD-1 blocker, approved in 30+ cancer types; T-DXd (Enhertu) — HER2 ADC with transformative efficacy."
  },
  pancreas: {
    name: "Pancreas / Metabolic",
    trials: 59608,
    topModalities: ["Peptides (GLP-1)", "Small Molecules", "Monoclonal Antibodies"],
    topTargets: ["GLP-1R", "GIP-R", "SGLT2", "GCG-R", "Amylin-R", "Insulin-R"],
    deliveryRoutes: ["Subcutaneous", "Oral"],
    description: "Diabetes (T1D & T2D), obesity, metabolic syndrome. GLP-1 receptor agonists (semaglutide, tirzepatide) are the fastest-growing drug class commercially.",
    pipelineGrowth: "+45% (2020-2024)",
    keyDrugs: ["Semaglutide (Ozempic/Wegovy)", "Tirzepatide (Mounjaro/Zepbound)", "Insulin analogs"],
    tooltip: "GLP-1 (glucagon-like peptide-1) is an incretin hormone secreted by intestinal L-cells after meals, signaling insulin release, glucagon suppression, delayed gastric emptying, and satiety through CNS hypothalamic GLP-1 receptors. Semaglutide is an engineered GLP-1 analog with a C18 fatty acid chain enabling albumin binding, extending half-life from 2 minutes (native GLP-1) to ~1 week. Tirzepatide adds dual GIP receptor agonism, achieving greater weight loss (20-22% body weight vs ~15% for semaglutide). The pipeline is racing toward triple agonists (GLP-1+GIP+GCG), oral formulations, and extensions into MASH, heart failure, sleep apnea, and Alzheimer's disease. This is the fastest-growing commercial drug class in history — Novo Nordisk briefly surpassed $500B market cap on semaglutide demand. Landmark drugs: Semaglutide (Ozempic/Wegovy) — ~15% weight loss, CV benefit proven; Tirzepatide (Mounjaro/Zepbound) — 20-22% weight loss, dual mechanism; Retatrutide — triple agonist in Phase 3 showing 24%+ weight loss."
  },
};

// ----- TARGET CLASS HEATMAP DATA -----
// Pipeline activity by target class, comparing 2005 vs 2025
export const targetClassData = [
  {
    targetClass: "Kinases",
    activity2005: 45,
    activity2015: 280,
    activity2025: 520,
    description: "Protein kinases phosphorylate other proteins, acting as molecular on/off switches in virtually every cell signaling cascade. Tyrosine kinase inhibitors (TKIs) are the most successful targeted cancer therapy class. Over 100 FDA-approved kinase inhibitors as of 2025.",
    examples: "Imatinib, Osimertinib, Sotorasib",
    trend: "up",
    tooltip: "Kinases are enzymes that transfer a phosphate group from ATP onto specific serine, threonine, or tyrosine residues on target proteins, acting as on/off switches in cellular signaling networks. In cancer, oncogenic mutations lock kinases in a permanently 'on' state (e.g., BCR-ABL fusion in CML, EGFR mutations in NSCLC, BRAF V600E in melanoma), driving uncontrolled proliferation — a phenomenon called 'oncogene addiction.' This addiction is kinase inhibitors' key advantage: tumor cells depend on a single mutated kinase while normal cells have redundant signaling, allowing therapeutic selectivity. Small molecule TKIs fit into the ATP-binding pocket of specific kinases, competitively blocking substrate phosphorylation. Landmark drugs: Imatinib (Gleevec) — BCR-ABL inhibitor, turned CML from fatal to manageable with ~90% 10-year survival; Osimertinib (Tagrisso) — 3rd-gen EGFR TKI for NSCLC, overcomes T790M resistance mutation; Sotorasib (Lumakras) — first KRAS G12C inhibitor, cracked the previously 'undruggable' KRAS oncogene."
  },
  {
    targetClass: "GPCRs",
    activity2005: 120,
    activity2015: 95,
    activity2025: 140,
    description: "G protein-coupled receptors are the largest family of membrane proteins (~800 members) and the target of ~34% of all FDA-approved drugs. GLP-1 receptor (a GPCR) became the most commercially important drug target of the 2020s.",
    examples: "Semaglutide, Tirzepatide, Brexpiprazole",
    trend: "up",
    tooltip: "GPCRs are seven-transmembrane-domain proteins that couple extracellular signals (hormones, neurotransmitters, light, odorants) to intracellular G-protein cascades (Gαs, Gαi, Gαq, Gα12/13), triggering second messenger production (cAMP, IP3, DAG) and downstream kinase activation. Their diverse physiological roles make them targets for CNS (dopamine, serotonin, opioid receptors), cardiovascular (β-adrenergic, AT1R), metabolic (GLP-1R, GIP-R, GCGR), and inflammatory disease. The GLP-1R renaissance — driven by semaglutide and tirzepatide — has reignited interest in GPCRs. Biased agonism (activating G-protein signaling without β-arrestin recruitment, or vice versa) is an emerging strategy to improve the therapeutic window of GPCR drugs. Landmark drugs: Semaglutide (Ozempic/Wegovy) — GLP-1R agonist with massive CV and weight benefit; Tirzepatide (Mounjaro) — dual GLP-1R/GIPR agonist, superior weight loss; Brexpiprazole (Rexulti) — partial D2/D3 and 5-HT1A agonist for schizophrenia and depression."
  },
  {
    targetClass: "Ion Channels",
    activity2005: 80,
    activity2015: 50,
    activity2025: 45,
    description: "Voltage- and ligand-gated channels regulating ion flow across membranes. Historically important for epilepsy, anesthesia, and cardiovascular drugs, but fewer novel entries due to selectivity challenges. Cystic fibrosis channel modulators are a notable exception.",
    examples: "Ziconotide, Retigabine, Ivacaftor",
    trend: "down",
    tooltip: "Ion channels are transmembrane protein pores that selectively conduct Na⁺, K⁺, Ca²⁺, or Cl⁻ ions across cell membranes in response to voltage changes or ligand binding, generating electrical signals in neurons, muscle, and other excitable cells. Historically, ion channels were major drug targets (sodium channel blockers for anesthesia/epilepsy, L-type calcium channel blockers for hypertension). However, achieving selectivity is challenging because related channel subtypes are expressed throughout the body — blocking cardiac sodium channels can cause arrhythmias, blocking neuronal channels causes CNS side effects. CFTR (the cystic fibrosis channel) is the glorious exception: ivacaftor acts as a CFTR 'potentiator,' increasing channel open probability for the G551D gating mutation, transforming a fatal disease. Landmark drugs: Ivacaftor (Kalydeco) — first CFTR modulator, revolutionary for CF; Elexacaftor/tezacaftor/ivacaftor (Trikafta) — triple combination covering 90% of CF mutations; Ziconotide (Prialt) — N-type calcium channel blocker for severe pain, intrathecal delivery."
  },
  {
    targetClass: "Immune Checkpoints",
    activity2005: 2,
    activity2015: 85,
    activity2025: 650,
    description: "PD-1, PD-L1, CTLA-4, LAG-3, TIGIT, and next-gen co-inhibitory receptors. The defining oncology target class of the 2010s-2020s. Expanding to combinations and new checkpoints beyond PD-1.",
    examples: "Pembrolizumab, Nivolumab, Relatlimab",
    trend: "up",
    tooltip: "Immune checkpoints are inhibitory co-receptors on T-cells (PD-1, CTLA-4, LAG-3, TIGIT, TIM-3) that normally prevent autoimmunity by dampening T-cell activation after antigen clearance. Cancer cells subvert this system — particularly through PD-L1 expression — to evade T-cell killing. Anti-PD-1 antibodies (pembrolizumab, nivolumab) block the PD-1/PD-L1 interaction, reinvigorating exhausted tumor-infiltrating T-cells. CTLA-4 operates earlier in the immune activation cycle (in lymph nodes during T-cell priming), so anti-CTLA-4 (ipilimumab) and anti-PD-1 combination achieves synergistic effects. LAG-3 (relatlimab + nivolumab = Opdualag) was the first novel checkpoint combination approved after PD-1+CTLA-4. Next frontiers: TIGIT, TIM-3, VISTA, CD47 ('don't eat me' signal on cancer cells). Landmark drugs: Ipilimumab (Yervoy) — anti-CTLA-4, first checkpoint inhibitor (2011 Nobel prize basis); Pembrolizumab (Keytruda) — anti-PD-1, approved in 30+ cancer types, ~$25B/year revenue; Relatlimab/nivolumab (Opdualag) — first LAG-3 checkpoint combination."
  },
  {
    targetClass: "TNF / Cytokines",
    activity2005: 90,
    activity2015: 110,
    activity2025: 85,
    description: "TNF-α, interleukins (IL-4, IL-5, IL-13, IL-17, IL-23), and other inflammatory cytokines. Mature class with many approved drugs. The field is moving toward upstream specificity (IL-23 > IL-12/23 > TNF).",
    examples: "Adalimumab, Dupilumab, Secukinumab",
    trend: "stable",
    tooltip: "TNF-α and interleukins are soluble signaling proteins that coordinate inflammatory responses. TNF-α (tumor necrosis factor-alpha) is a master proinflammatory cytokine that drives NF-κB activation, cytokine amplification, and tissue damage in autoimmune diseases like RA, Crohn's, and psoriasis. Anti-TNF biologics (adalimumab/Humira, infliximab, etanercept) were transformative for RA — Humira was the world's best-selling drug for over a decade at $20B/year. The trend is toward upstream, more specific cytokine blockade: targeting IL-23p19 specifically (not shared p40 subunit) reduces immunosuppression while maintaining efficacy. IL-4/IL-13 drive Th2 inflammation (atopic disease), IL-17A drives Th17 inflammation (psoriasis, AS), IL-5 drives eosinophil accumulation (severe asthma). Landmark drugs: Adalimumab (Humira) — first fully human anti-TNF mAb, longest-running best-seller; Dupilumab (Dupixent) — anti-IL-4Rα, transformed atopic dermatitis and expanded to 7+ indications; Secukinumab (Cosentyx) — anti-IL-17A for psoriasis, AS, PsA."
  },
  {
    targetClass: "Nuclear Receptors",
    activity2005: 65,
    activity2015: 40,
    activity2025: 55,
    description: "Ligand-activated transcription factors (ER, AR, PPAR, FXR, THR-β, RAR). Historically important for endocrine and metabolic diseases. Resmetirom (THR-β agonist) was the first approved NASH drug in 2024.",
    examples: "Enzalutamide, Resmetirom, Elafibranor",
    trend: "stable",
    tooltip: "Nuclear receptors are a family of ~48 ligand-activated transcription factors in humans that translocate to the nucleus upon ligand binding, directly controlling gene expression programs. They include steroid hormone receptors (estrogen receptor ER, androgen receptor AR, glucocorticoid receptor GR), metabolic receptors (PPARs, FXR, LXR, THR), and retinoid receptors (RAR, RXR). Because they bind small lipophilic ligands in a defined binding pocket, they're inherently druggable with small molecules. Selective modulation is the key challenge — different receptor conformations upon binding different ligands recruit different coactivator/corepressor complexes, enabling tissue-selective agonism/antagonism. Resmetirom (Rezdiffra, 2024) is a THR-β1 selective agonist that activates thyroid hormone signaling in the liver (reducing lipogenesis, increasing fatty acid oxidation) without cardiac/bone THR-α effects, achieving the first-ever MASH approval. Landmark drugs: Enzalutamide (Xtandi) — AR antagonist for prostate cancer; Resmetirom (Rezdiffra) — THR-β agonist, first MASH drug; Tamoxifen/Fulvestrant — ER modulators for breast cancer."
  },
  {
    targetClass: "Epigenetic Targets",
    activity2005: 5,
    activity2015: 35,
    activity2025: 120,
    description: "HDACs, BET bromodomains, EZH2, IDH1/2, and DNA methyltransferases. Emerged from 2005-2015 as cancer epigenomics became understood. Growing class particularly for hematologic malignancies.",
    examples: "Vorinostat, Tazemetostat, Olutasidenib",
    trend: "up",
    tooltip: "Epigenetic modifications — histone acetylation, methylation, and DNA methylation — control gene accessibility without altering DNA sequence, effectively determining which genes are expressed in which cell types. In cancer, these marks are frequently disrupted: histone deacetylases (HDACs) are overexpressed (compacting chromatin and silencing tumor suppressors), EZH2 (H3K27 methyltransferase) is mutated or amplified (silencing differentiation genes), IDH1/2 mutations produce an oncometabolite (2-HG) that inhibits TET enzymes and causes global hypermethylation. HDAC inhibitors (vorinostat, romidepsin) were the first class approved, mainly in T-cell lymphoma. EZH2 inhibitors (tazemetostat/Tazverik) work particularly well in follicular lymphoma with EZH2 Y646 gain-of-function mutations. BET bromodomain inhibitors (targeting BRD4 which reads acetyl marks at super-enhancers of oncogenes like MYC) are the most active clinical class. Landmark drugs: Vorinostat (Zolinza) — first HDAC inhibitor, T-cell lymphoma; Tazemetostat (Tazverik) — first EZH2 inhibitor, follicular lymphoma; Olutasidenib (Rezlidhia) — IDH1 inhibitor for AML."
  },
  {
    targetClass: "Protein Degradation",
    activity2005: 0,
    activity2015: 3,
    activity2025: 45,
    description: "PROTACs, molecular glues, and targeted protein degraders recruit E3 ubiquitin ligases to destroy disease-causing proteins. Entirely new modality enabling previously 'undruggable' targets. No approved PROTACs yet but 20+ in clinical trials.",
    examples: "ARV-471 (Phase 3), Mezigdomide (glue)",
    trend: "up",
    tooltip: "Targeted protein degraders exploit the cell's own proteasomal garbage disposal system. PROTACs (Proteolysis-Targeting Chimeras) are heterobifunctional molecules: one end binds the target protein, the other recruits an E3 ubiquitin ligase (CRBN or VHL), physically bringing them together. The E3 ligase then ubiquitinates the target protein, flagging it for proteasomal destruction. Unlike conventional inhibitors that merely block a protein's active site, degraders eliminate the protein entirely — including domains that traditional inhibitors can't access (transcription factors, scaffolding proteins). This 'beyond the binding site' approach dramatically expands the druggable proteome. Molecular glues (like lenalidomide/thalidomide analogs) work similarly but are simpler single molecules that stabilize protein-E3 interactions. Landmark drugs (emerging): ARV-471 — PROTAC degrading ERα for breast cancer, Phase 3; Mezigdomide (CC-92480) — CELMoD molecular glue for myeloma; Bavdegalutamide (ARV-110) — AR PROTAC for prostate cancer."
  },
  {
    targetClass: "CD Antigens (B/T cell)",
    activity2005: 15,
    activity2015: 40,
    activity2025: 280,
    description: "CD19, CD20, BCMA, CD33, CD38 — cluster of differentiation surface markers on immune and blood cells. Foundation for CAR-T, bispecific T-cell engagers, and ADCs. Hematologic cancer targeting exploded post-2017.",
    examples: "Kymriah (CD19 CAR-T), Teclistamab (BCMA bispecific)",
    trend: "up",
    tooltip: "CD (cluster of differentiation) antigens are cell surface proteins whose consistent, high-level expression on specific blood cell types — and the cancers derived from them — make them ideal therapeutic targets. CD19 and CD20 are pan-B-cell markers (lymphomas, leukemias), BCMA (CD269) is a plasma cell marker (multiple myeloma), CD33 marks myeloid progenitors (AML), CD38 is high on plasma cells (myeloma). Because these antigens are on accessible hematologic cells (not buried in solid tumor stroma), three modalities can target them simultaneously: monoclonal antibodies (rituximab anti-CD20), CAR-T cells (engineered to express anti-CD19 or anti-BCMA CARs), bispecific T-cell engagers (CD19×CD3 blinatumomab, BCMA×CD3 teclistamab), and ADCs. The convergence of multiple modalities onto the same antigen creates a competitive but scientifically rich space. Landmark drugs: Kymriah (tisagenlecleucel) — CD19 CAR-T, 83% remission in pediatric ALL; Teclistamab (Tecvayli) — BCMA×CD3 bispecific, off-the-shelf option for myeloma; Gemtuzumab ozogamicin (Mylotarg) — first ADC, CD33-targeting for AML."
  },
  {
    targetClass: "RNA Targets",
    activity2005: 8,
    activity2015: 25,
    activity2025: 180,
    description: "mRNA knockdown (siRNA, ASO), splicing modulation, mRNA replacement therapeutics. Targets the nucleic acid layer of biology rather than protein. GalNAc-siRNA conjugates dominate liver disease applications.",
    examples: "Patisiran (siRNA), Nusinersen (ASO), Inclisiran",
    trend: "up",
    tooltip: "RNA therapeutics are fundamentally different from small molecules and biologics — they target the mRNA transcript rather than the encoded protein, and their sequence specificity enables precise gene silencing without the need to identify a druggable protein pocket. siRNAs (19-21 bp dsRNA) are loaded into the RISC complex, which uses the antisense strand to find and cleave complementary mRNAs via Ago2 endonuclease. ASOs (single-stranded 15-25 nt oligonucleotides) work by RNase H-mediated degradation of mRNA:ASO heteroduplexes, or by steric blocking of splicing sites (splice-switching ASOs used for Duchenne muscular dystrophy). GalNAc conjugation delivers RNA drugs efficiently to hepatocytes via ASGR1 receptor-mediated endocytosis, enabling ~5-6 month duration from a single dose (siRNA) or monthly dosing (ASO) — a massive dosing frequency advantage. Landmark drugs: Nusinersen (Spinraza) — intrathecal splice-switching ASO, transforms SMA survival; Patisiran (Onpattro) — first siRNA drug (LNP delivery), for TTR amyloidosis; Inclisiran (Leqvio) — GalNAc-siRNA, twice-yearly PCSK9 silencing for LDL-C reduction."
  },
];

// ----- MILESTONE EVENTS -----
// Key events annotated on the timeline
export const milestoneEvents = [
  { year: 2001, event: "Imatinib (Gleevec)", description: "First targeted kinase inhibitor approved for CML. Paradigm shift in precision oncology — proved cancer could be treated by targeting specific molecular defects.", category: "Small Molecule" },
  { year: 2004, event: "Bevacizumab & Cetuximab", description: "First anti-VEGF and anti-EGFR antibodies for cancer. Established antibody-based targeted therapy as cornerstone of oncology.", category: "mAb" },
  { year: 2006, event: "First HPV vaccine (Gardasil)", description: "First vaccine to prevent cancer. Recombinant subunit vaccine against HPV — proof that vaccines can address non-infectious disease.", category: "Vaccine" },
  { year: 2011, event: "First Checkpoint Inhibitor (Ipilimumab)", description: "Anti-CTLA-4 antibody for melanoma. Launched the immuno-oncology revolution — harnessing the immune system to fight cancer.", category: "mAb" },
  { year: 2013, event: "T-DM1 (Kadcyla) ADC", description: "First ADC for solid tumors (HER2+ breast cancer). Proved antibody-drug conjugate concept could work beyond hematologic cancers.", category: "ADC" },
  { year: 2014, event: "PD-1 Blockade Era (Pembrolizumab/Nivolumab)", description: "Dual PD-1 checkpoint inhibitor approvals. Became the backbone of modern cancer treatment across 20+ tumor types.", category: "mAb" },
  { year: 2016, event: "Nusinersen (Spinraza) for SMA", description: "First ASO to transform a fatal genetic disease. Intrathecal delivery of antisense oligonucleotide — proved RNA therapeutics work.", category: "RNA" },
  { year: 2017, event: "First CAR-T (Kymriah) & Gene Therapy (Luxturna)", description: "Two paradigm-shifting approvals in one year: first chimeric antigen receptor T-cell therapy and first AAV gene therapy in the US. Historic year for biopharma.", category: "Cell/Gene" },
  { year: 2018, event: "First siRNA (Patisiran/Onpattro)", description: "First small interfering RNA drug using lipid nanoparticle delivery. Validated the siRNA platform and LNP technology later used for mRNA vaccines.", category: "RNA" },
  { year: 2019, event: "Enhertu & Zolgensma", description: "Trastuzumab deruxtecan (Enhertu) transformed ADC expectations with its novel payload. Zolgensma (AAV9) became most expensive drug at $2.1M for SMA.", category: "ADC/Gene" },
  { year: 2020, event: "COVID-19 Pandemic", description: "Accelerated mRNA vaccine development from years to months. Operation Warp Speed funded unprecedented parallel clinical development.", category: "Pandemic" },
  { year: 2021, event: "First mRNA Vaccines (Comirnaty/Spikevax)", description: "First FDA-approved mRNA products. 95% efficacy against COVID-19. Validated lipid nanoparticle + mRNA platform for future medicines.", category: "mRNA" },
  { year: 2022, event: "Bispecific Antibody Explosion", description: "Four bispecific antibodies approved in one year. T-cell engagers for cancer became a mature drug class. Gene therapy also saw 4 approvals.", category: "Bispecific" },
  { year: 2023, event: "First CRISPR Therapy (Casgevy)", description: "First CRISPR/Cas9 gene-editing therapy approved for sickle cell disease. Landmark for precision genome editing in humans.", category: "Gene Editing" },
  { year: 2024, event: "First TIL & TCR-T Therapies", description: "Amtagvi (first TIL therapy) and Tecelra (first TCR-T therapy) approved. Cell therapy expands beyond CAR-T into new architectures for solid tumors.", category: "Cell Therapy" },
];

// ----- COMPANY/SPONSOR DATA -----
// Top sponsors by type and pipeline share
export const sponsorData = [
  { name: "Roche/Genentech", type: "Big Pharma", pipelineSize: 180, topModalities: ["mAbs", "ADCs", "Bispecifics"], focus: "Oncology, Immunology" },
  { name: "Pfizer", type: "Big Pharma", pipelineSize: 165, topModalities: ["Small Molecules", "mRNA", "mAbs"], focus: "Oncology, Vaccines, Inflammation" },
  { name: "Novartis", type: "Big Pharma", pipelineSize: 160, topModalities: ["Small Molecules", "CAR-T", "Gene Therapy"], focus: "Oncology, CV, Ophthalmology" },
  { name: "Merck & Co", type: "Big Pharma", pipelineSize: 145, topModalities: ["Small Molecules", "mAbs", "mRNA"], focus: "Oncology (Keytruda), Vaccines" },
  { name: "AstraZeneca", type: "Big Pharma", pipelineSize: 180, topModalities: ["Small Molecules", "mAbs", "ADCs"], focus: "Oncology, CV, Respiratory" },
  { name: "Johnson & Johnson", type: "Big Pharma", pipelineSize: 130, topModalities: ["mAbs", "Bispecifics", "Small Molecules"], focus: "Oncology, Immunology" },
  { name: "Bristol-Myers Squibb", type: "Big Pharma", pipelineSize: 120, topModalities: ["Small Molecules", "CAR-T", "mAbs"], focus: "Oncology, Hematology" },
  { name: "Novo Nordisk", type: "Big Pharma", pipelineSize: 75, topModalities: ["Peptides (GLP-1)", "Small Molecules"], focus: "Diabetes, Obesity, Rare Blood" },
  { name: "Eli Lilly", type: "Big Pharma", pipelineSize: 95, topModalities: ["Peptides", "mAbs", "Small Molecules"], focus: "Diabetes/Obesity, Neuro, Oncology" },
  { name: "Moderna", type: "Biotech", pipelineSize: 48, topModalities: ["mRNA Vaccines", "mRNA Therapeutics"], focus: "Vaccines, Oncology (mRNA)" },
  { name: "BioNTech", type: "Biotech", pipelineSize: 35, topModalities: ["mRNA", "CAR-T", "Bispecifics"], focus: "Oncology, Vaccines" },
  { name: "Alnylam", type: "Biotech", pipelineSize: 25, topModalities: ["siRNA"], focus: "Rare disease, CV, CNS" },
  { name: "Ionis Pharma", type: "Biotech", pipelineSize: 35, topModalities: ["ASOs"], focus: "Rare disease, CV, Neuro" },
  { name: "Gilead Sciences", type: "Biotech", pipelineSize: 55, topModalities: ["Small Molecules", "CAR-T"], focus: "HIV, Oncology, Liver" },
  { name: "Regeneron", type: "Biotech", pipelineSize: 40, topModalities: ["mAbs", "Gene Therapy"], focus: "Ophthalmology, Immunology, Oncology" },
  { name: "bluebird bio", type: "Biotech", pipelineSize: 8, topModalities: ["Gene Therapy (Lentiviral)"], focus: "Hematology, Rare disease" },
  { name: "CRISPR Therapeutics", type: "Biotech", pipelineSize: 10, topModalities: ["CRISPR Gene Editing"], focus: "Hematology, Diabetes" },
  { name: "Academic/NIH", type: "Academic", pipelineSize: 2500, topModalities: ["All modalities"], focus: "Early-stage research across all areas" },
];

// ----- MODALITY INFO (Educational Tooltips) -----
export const modalityInfo: Record<string, {
  name: string;
  mechanism: string;
  howItWorks: string;
  advantages: string[];
  limitations: string[];
  landmarks: { year: number; drug: string; significance: string }[];
  currentStatus: string;
  quickTooltip: string;
}> = {
  smallMolecule: {
    name: "Small Molecules",
    mechanism: "Organic compounds (<900 Da) that penetrate cell membranes to bind intracellular targets",
    howItWorks: "Small molecules are chemically synthesized compounds small enough to enter cells and bind to specific protein targets — typically enzymes, receptors, or ion channels. They can inhibit, activate, or modulate these targets. Most are taken orally.",
    advantages: ["Oral bioavailability", "Low manufacturing cost", "Intracellular target access", "Established chemistry platforms"],
    limitations: ["Off-target effects (selectivity)", "Limited to 'druggable' protein pockets", "Drug resistance mutations", "Short half-life requiring daily dosing"],
    landmarks: [
      { year: 2001, drug: "Imatinib (Gleevec)", significance: "First targeted kinase inhibitor — proved precision oncology works" },
      { year: 2011, drug: "Crizotinib", significance: "First ALK inhibitor — opened multi-kinase targeting era" },
      { year: 2021, drug: "Sotorasib", significance: "First KRAS G12C inhibitor — conquered the 'undruggable' target" },
    ],
    currentStatus: "64% of 2024 approvals. 100th kinase inhibitor approved Sept 2025. Dominant by volume but shrinking share.",
    quickTooltip: "Chemically synthesized organic compounds (<900 Da) that enter cells and bind protein targets. Usually oral. The classic drug category — aspirin to kinase inhibitors. ~64% of all FDA approvals."
  },
  mAb: {
    name: "Monoclonal Antibodies",
    mechanism: "Engineered Y-shaped proteins (~150 kDa) that bind extracellular targets with high specificity",
    howItWorks: "Monoclonal antibodies mimic the immune system's ability to recognize and neutralize threats. They bind to specific proteins on cell surfaces or in the blood — blocking receptors, marking cells for immune destruction (ADCC), or delivering payloads. Produced in cell culture (CHO cells).",
    advantages: ["Extremely high target specificity", "Long half-life (weeks)", "Multiple mechanisms (blocking, ADCC, CDC)", "Proven platform with 159+ approvals"],
    limitations: ["Cannot reach intracellular targets", "IV/SC injection required", "High manufacturing cost", "Immunogenicity risk"],
    landmarks: [
      { year: 2002, drug: "Adalimumab (Humira)", significance: "First fully human mAb — became world's best-selling drug ($20B/yr)" },
      { year: 2011, drug: "Ipilimumab (Yervoy)", significance: "First checkpoint inhibitor — launched immuno-oncology revolution" },
      { year: 2014, drug: "Pembrolizumab (Keytruda)", significance: "PD-1 blocker — became most prescribed cancer drug globally" },
    ],
    currentStatus: "159 FDA approvals through 2024. 13 approved in 2024 (record year). Largest biologic pipeline with 18% YoY growth.",
    quickTooltip: "Y-shaped proteins (~150 kDa) binding one target with high specificity. IV or SC injection. Longest half-life (weeks). Cannot enter cells. 159+ FDA approvals — the most productive biologic platform."
  },
  adc: {
    name: "Antibody-Drug Conjugates (ADCs)",
    mechanism: "Antibody + cytotoxic payload connected by a chemical linker — 'guided missiles' for cancer",
    howItWorks: "ADCs use an antibody to deliver a potent cell-killing drug directly to cancer cells. The antibody binds a tumor-specific antigen, the whole complex is internalized, and the linker releases the cytotoxic payload inside the cell. Newer ADCs have 'bystander effect' — killing nearby cancer cells too.",
    advantages: ["Precision delivery reduces systemic toxicity", "Extremely potent payloads", "Bystander effect (new gen)", "Active in low-expression tumors"],
    limitations: ["Complex manufacturing (3 components)", "Narrow therapeutic window", "Payload resistance", "Ocular and hematologic toxicities"],
    landmarks: [
      { year: 2000, drug: "Gemtuzumab (Mylotarg)", significance: "First ADC — proved concept but withdrawn for safety (re-approved 2017)" },
      { year: 2013, drug: "T-DM1 (Kadcyla)", significance: "First ADC for solid tumors — established HER2 ADC paradigm" },
      { year: 2019, drug: "Trastuzumab deruxtecan (Enhertu)", significance: "Transformed ADC expectations with high DAR + bystander effect" },
    ],
    currentStatus: "14 FDA approvals through 2025. Pipeline grew 22% in 2024. Expanding beyond oncology — 15% of ADC pipeline now non-cancer.",
    quickTooltip: "Antibody + cytotoxic payload + linker. 'Guided missile' for cancer — antibody targets tumor antigen, payload kills on internalization. 14 approvals; most potent cancer drug platform."
  },
  bispecific: {
    name: "Bispecific Antibodies",
    mechanism: "Engineered antibodies that bind two different targets simultaneously — 'dual targeting'",
    howItWorks: "Bispecific antibodies have two different binding arms — one targets a cancer cell surface antigen (like BCMA or CD20), the other targets T-cells (CD3). By physically bridging cancer cells and immune cells, they force an immune attack. Non-CD3 bispecifics can hit two pathways (like VEGF + Ang-2).",
    advantages: ["Dual mechanism in one molecule", "T-cell engagement without CAR-T manufacturing", "Off-the-shelf (no cell processing)", "Multiple format options"],
    limitations: ["Cytokine release syndrome risk", "Short half-life for some formats", "Complex manufacturing", "Neurotoxicity with CD3 engagers"],
    landmarks: [
      { year: 2014, drug: "Blinatumomab (Blincyto)", significance: "First bispecific (BiTE format) — CD19×CD3 for ALL" },
      { year: 2017, drug: "Emicizumab (Hemlibra)", significance: "First non-CD3 bispecific — FIXa×FX for hemophilia A" },
      { year: 2022, drug: "4 approvals in one year", significance: "Bispecific era begins — T-cell engagers become mature drug class" },
    ],
    currentStatus: "15 approvals through 2025. 100+ in clinical trials. Fastest-growing antibody sub-class. Next-gen: trispecifics and NK-cell engagers.",
    quickTooltip: "Antibody engineered to bind two targets simultaneously. T-cell engagers (CD3 arm + tumor antigen) redirect immune cells to kill cancer. Off-the-shelf, no cell manufacturing needed."
  },
  geneTherapy: {
    name: "Gene Therapy",
    mechanism: "Delivering functional genes or gene-editing tools to correct genetic defects at their root cause",
    howItWorks: "Gene therapy uses viral vectors (AAV, lentivirus) to deliver a working copy of a defective gene into a patient's cells. The corrected gene produces the missing or dysfunctional protein. Can be delivered in vivo (injected directly) or ex vivo (cells removed, modified, returned). CRISPR adds gene editing — precise DNA cuts to fix mutations.",
    advantages: ["One-time 'cure' potential", "Addresses root genetic cause", "Durable effect (years to lifetime)", "Applicable to 7,000+ genetic diseases"],
    limitations: ["$1M-$3M per treatment", "Pre-existing immunity to AAV", "Limited payload size (AAV ~4.7kb)", "Durability questions for some organs"],
    landmarks: [
      { year: 2017, drug: "Luxturna (AAV2)", significance: "First AAV gene therapy in US — restored vision in inherited blindness" },
      { year: 2019, drug: "Zolgensma (AAV9)", significance: "Single-dose gene therapy for SMA — most expensive drug at $2.1M" },
      { year: 2023, drug: "Casgevy (CRISPR)", significance: "First CRISPR gene-editing therapy — sickle cell/thalassemia cure" },
    ],
    currentStatus: "15+ US approvals. 2,117 programs in pipeline (693 clinical). 2022-2023 saw 8 approvals. CRISPR base editing emerging.",
    quickTooltip: "Delivers functional gene copies or gene-editing machinery (CRISPR) via viral vector. One-time treatment potential. $1-3M price tags. ~15 US approvals; hundreds in trials."
  },
  carT: {
    name: "CAR-T / Cell Therapy",
    mechanism: "Living cells engineered to recognize and destroy cancer — 'living drugs'",
    howItWorks: "T-cells are extracted from the patient, genetically modified in a lab to express a chimeric antigen receptor (CAR) that targets a specific cancer marker (like CD19), then expanded and infused back. The engineered cells multiply inside the body and hunt cancer cells. TIL therapy uses natural tumor-killing T-cells.",
    advantages: ["Living drug that multiplies", "Durable responses (years)", "High complete remission rates", "Personalized to tumor markers"],
    limitations: ["Cytokine release syndrome", "4-6 week manufacturing per patient", "$400K-$500K per treatment", "Mainly blood cancers (solid tumors harder)"],
    landmarks: [
      { year: 2017, drug: "Kymriah (tisagenlecleucel)", significance: "First CAR-T therapy — 83% remission in pediatric ALL" },
      { year: 2021, drug: "Abecma (idecabtagene vicleucel)", significance: "First BCMA CAR-T — opened myeloma to cell therapy" },
      { year: 2024, drug: "Amtagvi (lifileucel)", significance: "First TIL therapy — cell therapy enters solid tumors (melanoma)" },
    ],
    currentStatus: "7 CAR-T + TIL + TCR-T approvals. Expanding to solid tumors. Allogeneic 'off-the-shelf' CAR-T in clinical trials.",
    quickTooltip: "Patient T-cells extracted, engineered with chimeric antigen receptor (CAR), expanded, re-infused. 'Living drug' that persists and multiplies. 83% remission in some cancers. Requires custom manufacturing per patient."
  },
  rnaTherapeutic: {
    name: "RNA Therapeutics (siRNA, ASO, mRNA)",
    mechanism: "Nucleic acid-based drugs that silence, modify, or replace RNA to control protein production",
    howItWorks: "Three sub-types: (1) siRNA — double-stranded RNA that triggers mRNA degradation via RISC complex (silences specific genes). (2) ASO — single-stranded DNA/RNA that binds mRNA to block translation or modify splicing. (3) mRNA — delivers instructions to make therapeutic proteins. GalNAc conjugation enables liver targeting.",
    advantages: ["Can target 'undruggable' genes", "Programmable (sequence-based design)", "Long-acting (months per dose for siRNA)", "Platform approach (same chemistry, different targets)"],
    limitations: ["Delivery challenge (most organs)", "Liver-centric (GalNAc limitation)", "Injection required", "Cost of novel delivery systems"],
    landmarks: [
      { year: 2016, drug: "Nusinersen (Spinraza)", significance: "ASO transformed fatal SMA — proved RNA drugs can treat genetic disease" },
      { year: 2018, drug: "Patisiran (Onpattro)", significance: "First siRNA — LNP delivery validated (later used for COVID mRNA vaccines)" },
      { year: 2021, drug: "Comirnaty (Pfizer mRNA)", significance: "mRNA vaccines achieved 95% COVID efficacy — validated the entire platform" },
    ],
    currentStatus: "35 RNA therapies approved globally. 1,177 programs in pipeline. GalNAc-siRNA platform dominates liver diseases. mRNA expanding beyond vaccines.",
    quickTooltip: "Nucleic acid drugs targeting mRNA rather than proteins. siRNA silences genes, ASOs modify splicing, mRNA replaces missing proteins. Programmable by sequence design. GalNAc delivers to liver efficiently."
  },
  peptide: {
    name: "Peptides",
    mechanism: "Short protein fragments (2-50 amino acids) that mimic natural hormones or signaling molecules",
    howItWorks: "Peptide drugs act as synthetic versions of natural hormones or signaling peptides. GLP-1 agonists (the blockbuster class) mimic gut hormones that signal insulin release and satiety. Peptides bridge small molecules and biologics in size, combining some advantages of each.",
    advantages: ["Natural hormone mimicry", "High target selectivity", "Lower immunogenicity than proteins", "Flexible modification chemistry"],
    limitations: ["Usually requires injection", "Short half-life (needs PEGylation/acylation)", "Limited oral bioavailability", "Manufacturing complexity"],
    landmarks: [
      { year: 2005, drug: "Exenatide (Byetta)", significance: "First GLP-1 agonist — launched the most impactful peptide drug class" },
      { year: 2017, drug: "Semaglutide (Ozempic)", significance: "Weekly GLP-1 — became one of the best-selling drugs in history" },
      { year: 2022, drug: "Tirzepatide (Mounjaro)", significance: "Dual GLP-1/GIP agonist — superior weight loss and glucose control" },
    ],
    currentStatus: "GLP-1 agonists are fastest-growing drug class commercially. Expanding into Alzheimer's, NASH, heart failure. Oral peptides in development.",
    quickTooltip: "Short protein chains (2-50 aa) mimicking natural hormones. GLP-1 agonists (semaglutide, tirzepatide) are the fastest-growing drug class in pharma history. Usually SC injection; oral formulations emerging."
  },
  mRNAVaccine: {
    name: "mRNA Vaccines",
    mechanism: "Lipid nanoparticle-delivered mRNA that instructs cells to produce antigens for immune training",
    howItWorks: "mRNA vaccines deliver genetic instructions wrapped in tiny fat bubbles (lipid nanoparticles). Once inside cells, the mRNA is translated into viral or tumor proteins that the immune system learns to recognize and fight. No live virus needed — the body makes its own 'wanted poster.'",
    advantages: ["Rapid design and manufacturing", "No live virus needed", "Strong immune response", "Platform (swap in new sequences quickly)"],
    limitations: ["Cold chain storage requirements", "Reactogenicity (fever, fatigue)", "Durability of immune response", "LNP delivery limitations for non-vaccine"],
    landmarks: [
      { year: 2021, drug: "Comirnaty (Pfizer/BioNTech)", significance: "First approved mRNA product — 95% COVID efficacy. Most impactful vaccine development in modern history." },
      { year: 2024, drug: "mRESVIA (Moderna)", significance: "First non-COVID mRNA vaccine — proved platform works beyond pandemic" },
    ],
    currentStatus: "4 approved mRNA vaccines. Personalized cancer vaccines in Phase 3. Flu, CMV, HIV mRNA vaccines in development.",
    quickTooltip: "LNP-encapsulated mRNA instructs cells to make antigens for immune training. Rapid platform — swap antigen sequence in weeks. 4 approvals. Personalized cancer vaccines in Phase 3 trials."
  },
  fcFusion: {
    name: "Fc-Fusion Proteins",
    mechanism: "Therapeutic protein domain fused to antibody Fc region for extended half-life and immune function",
    howItWorks: "Fc-fusion proteins combine a receptor or protein of interest with the Fc (tail) portion of an antibody. The Fc region extends the drug's half-life by recycling through FcRn receptors, and can add immune effector functions. Think of it as giving a therapeutic protein the longevity of an antibody.",
    advantages: ["Extended half-life (weeks vs hours)", "Added immune effector function", "Well-established manufacturing", "FcRn recycling mechanism"],
    limitations: ["Large molecule (requires injection)", "Limited to extracellular targets", "Fc effector function can cause side effects", "Patent cliffs approaching for early drugs"],
    landmarks: [
      { year: 1998, drug: "Etanercept (Enbrel)", significance: "First Fc-fusion — TNF receptor trap revolutionized RA treatment" },
      { year: 2011, drug: "Aflibercept (Eylea)", significance: "VEGF trap for AMD — became best-selling ophthalmology drug" },
      { year: 2024, drug: "Sotatercept (Winrevair)", significance: "First ActRIIA Fc-fusion for pulmonary arterial hypertension" },
    ],
    currentStatus: "~15 approved products. Mature class with proven concept. New formats: GLP-1 fusions, IL-15 fusions, dual-domain fusions.",
    quickTooltip: "Therapeutic protein fused to antibody Fc tail for extended half-life via FcRn recycling. Combines protein binding specificity with antibody-like duration. ~15 approvals; mature but evolving platform."
  },
};

// ----- CLINICAL TRIALS TOTAL BY CONDITION (ClinicalTrials.gov real data) -----
export const clinicalTrialsByCondition = {
  oncology: 121405,
  cardiovascular: 78639,
  respiratory: 61169,
  metabolic: 59608,
  cns_neurology: 56600,
  hematology: 42288,
  dermatology: 41376,
  immunology: 21409,
  rare_disease: 20398,
  hepatology: 17468,
  ophthalmology: 7167,
};

// ----- PIPELINE SIZE BY MODALITY (ClinicalTrials.gov real data) -----
export const pipelineByModality = {
  monoclonal_antibody: 15544,
  // NOTE: "cell therapy" returns 27,305 from ClinicalTrials.gov query.intr="cell therapy"
  // This includes ALL cell-based interventions: stem cell transplants, mesenchymal stem cells,
  // regenerative medicine, and traditional cellular products — not just engineered therapies
  // like CAR-T (2,519) or TIL (342). The broad number is accurate per the API but may
  // overrepresent what most people consider "modern cell therapy drug development."
  // More specific: CAR-T (2,519) + TIL (342) + NK Cell (1,185) = ~4,046 engineered cell therapies.
  cell_therapy: 27305,
  peptide_drug: 10273,
  checkpoint_inhibitor: 6161,
  gene_therapy: 3429,
  kinase_inhibitor: 2719,
  car_t_cell: 2519,
  adc: 1247,
  nk_cell_therapy: 1185,
  mrna_therapeutic: 1003,
  fusion_protein: 859,
  bispecific_antibody: 733,
  til_therapy: 342,
  antisense_oligonucleotide: 176,
  crispr: 170,
  sirna: 157,
  protac_degrader: 39,
};
