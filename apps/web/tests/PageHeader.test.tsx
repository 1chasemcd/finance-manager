import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageHeader from "@/components/PageHeader/PageHeader";
import PageHeaderProvider from "@/components/PageHeader/PageHeaderProvider";
import { usePageHeader } from "@/lib/pageHeader";

function PageWithHeader() {
  usePageHeader({
    title: "Transactions",
    actions: <button type="button">Export</button>,
  });
  return null;
}

function HeaderHarness({ showPage }: { showPage: boolean }) {
  return (
    <PageHeaderProvider>
      <PageHeader />
      {showPage ? <PageWithHeader /> : null}
    </PageHeaderProvider>
  );
}

describe("PageHeader", () => {
  it("renders an empty header when no page has registered a title", () => {
    render(
      <PageHeaderProvider>
        <PageHeader />
      </PageHeaderProvider>,
    );

    expect(screen.getByRole("heading", { level: 4 })).toBeEmptyDOMElement();
  });

  it("shows the title and actions registered by the mounted page", () => {
    render(<HeaderHarness showPage />);

    expect(screen.getByRole("heading", { level: 4, name: "Transactions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("clears the title when the page unmounts", () => {
    const { rerender } = render(<HeaderHarness showPage />);

    expect(screen.getByRole("heading", { level: 4, name: "Transactions" })).toBeInTheDocument();

    rerender(<HeaderHarness showPage={false} />);

    expect(screen.getByRole("heading", { level: 4 })).toBeEmptyDOMElement();
  });

  it("throws when used outside a PageHeaderProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<PageWithHeader />)).toThrow(
      "usePageHeader must be used within a PageHeaderProvider",
    );

    consoleError.mockRestore();
  });
});
