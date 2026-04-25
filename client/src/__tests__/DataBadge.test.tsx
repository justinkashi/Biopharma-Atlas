import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataBadge } from "@/components/DataBadge";

describe("DataBadge", () => {
  it("renders verified badge with check symbol", () => {
    render(<DataBadge confidence="verified" source="ClinicalTrials.gov" note="Direct API" />);
    expect(screen.getByText(/✓/)).toBeInTheDocument();
  });

  it("renders composite badge with tilde symbol", () => {
    render(<DataBadge confidence="composite" source="FDA + manual" note="Combined" />);
    expect(screen.getByText(/~/)).toBeInTheDocument();
  });

  it("renders estimated badge with asterisk symbol", () => {
    render(<DataBadge confidence="estimated" source="BIO 2021" note="Approximate" />);
    expect(screen.getByText(/\*/)).toBeInTheDocument();
  });
});
