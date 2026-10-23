import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageSection from "@/components/PageSection";
import { renderWithProviders } from "./test-utils";

describe("PageSection", () => {
  it("renders its title and children", () => {
    renderWithProviders(
      <PageSection title="Personal Info">
        <p>Section content</p>
      </PageSection>,
    );

    expect(screen.getByRole("heading", { name: "Personal Info" })).toBeInTheDocument();
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("applies padding to the content by default", () => {
    renderWithProviders(
      <PageSection title="Personal Info">
        <p>Section content</p>
      </PageSection>,
    );

    expect(screen.getByText("Section content").parentElement).toHaveStyle({ padding: "16px" });
  });

  it("removes the content padding when noMargin is set", () => {
    renderWithProviders(
      <PageSection title="Personal Info" noMargin>
        <p>Section content</p>
      </PageSection>,
    );

    expect(screen.getByText("Section content").parentElement).toHaveStyle({ padding: "0px" });
  });
});
