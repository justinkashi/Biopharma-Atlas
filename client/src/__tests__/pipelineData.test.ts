import { describe, it, expect } from "vitest";
import {
  modalityTimelineData,
  modalityKeys,
  clinicalTrialsByCondition,
  pipelineByModality,
  attritionData,
  milestoneEvents,
  dataSourceNotes,
} from "@/data/pipelineData";

describe("modalityTimelineData", () => {
  it("has entries for every year 2000–2025", () => {
    const years = modalityTimelineData.map((d) => d.year);
    for (let y = 2000; y <= 2025; y++) {
      expect(years).toContain(y);
    }
  });

  it("has no negative values", () => {
    for (const row of modalityTimelineData) {
      for (const [key, val] of Object.entries(row)) {
        if (key !== "year") {
          expect(val as number).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

describe("modalityKeys", () => {
  it("each entry has key, label, and color", () => {
    for (const mk of modalityKeys) {
      expect(mk.key).toBeTruthy();
      expect(mk.label).toBeTruthy();
      expect(mk.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("each modality key maps to a column in modalityTimelineData", () => {
    const firstRow = modalityTimelineData[0];
    for (const mk of modalityKeys) {
      expect(firstRow).toHaveProperty(mk.key);
    }
  });
});

describe("clinicalTrialsByCondition", () => {
  it("has at least 5 condition keys with positive trial counts", () => {
    const entries = Object.entries(clinicalTrialsByCondition);
    expect(entries.length).toBeGreaterThanOrEqual(5);
    for (const [, count] of entries) {
      expect(count).toBeGreaterThan(0);
    }
  });

  it("oncology has the highest or near-highest trial count", () => {
    const max = Math.max(...Object.values(clinicalTrialsByCondition));
    expect(clinicalTrialsByCondition.oncology).toBeGreaterThan(max * 0.5);
  });
});

describe("pipelineByModality", () => {
  it("has at least 4 modality keys with positive counts", () => {
    const entries = Object.entries(pipelineByModality);
    expect(entries.length).toBeGreaterThanOrEqual(4);
    for (const [, count] of entries) {
      expect(count).toBeGreaterThan(0);
    }
  });
});

describe("attritionData", () => {
  it("each modality has phase counts in descending order (phaseI > phaseII > phaseIII > approved)", () => {
    for (const row of attritionData) {
      expect(row.phaseI, `${row.modality} phaseI`).toBeGreaterThan(row.phaseII);
      expect(row.phaseII, `${row.modality} phaseII`).toBeGreaterThan(row.phaseIII);
      expect(row.phaseIII, `${row.modality} phaseIII`).toBeGreaterThan(row.approved);
    }
  });

  it("each modality has a successRate string", () => {
    for (const row of attritionData) {
      expect(row.successRate).toMatch(/^\d+(\.\d+)?%$/);
    }
  });
});

describe("milestoneEvents", () => {
  it("each milestone has year, event, description, and category", () => {
    expect(milestoneEvents.length).toBeGreaterThan(0);
    for (const milestone of milestoneEvents) {
      expect(milestone.year).toBeGreaterThanOrEqual(2000);
      expect(milestone.event).toBeTruthy();
      expect(milestone.description).toBeTruthy();
      expect(milestone.category).toBeTruthy();
    }
  });
});

describe("dataSourceNotes", () => {
  it("each note has confidence and source fields", () => {
    for (const [key, note] of Object.entries(dataSourceNotes)) {
      expect(["verified", "composite", "estimated"], `${key} confidence`).toContain(note.confidence);
      expect(note.source, key).toBeTruthy();
    }
  });
});
