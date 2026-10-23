import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppDrawerContent } from "@/components/AppDrawer/AppDrawerContent";
import { navEntries } from "@/routes";
import { renderWithProviders } from "./test-utils";

const noop = () => undefined;

describe("AppDrawerContent", () => {
  it("renders a link for every navigation entry", () => {
    renderWithProviders(
      <AppDrawerContent
        collapsed={false}
        isMobile={false}
        onCollapseToggle={noop}
        onNavigate={noop}
      />,
    );

    for (const { path, label } of navEntries) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", path);
    }
  });

  it("asks to collapse the navigation while it is expanded", async () => {
    const onCollapseToggle = vi.fn();
    renderWithProviders(
      <AppDrawerContent
        collapsed={false}
        isMobile={false}
        onCollapseToggle={onCollapseToggle}
        onNavigate={noop}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));

    expect(onCollapseToggle).toHaveBeenCalledTimes(1);
  });

  it("asks to expand the navigation while it is collapsed", () => {
    renderWithProviders(
      <AppDrawerContent collapsed isMobile={false} onCollapseToggle={noop} onNavigate={noop} />,
    );

    expect(screen.getByRole("button", { name: "Expand navigation" })).toBeInTheDocument();
  });

  it("hides the collapse control on mobile", () => {
    renderWithProviders(
      <AppDrawerContent collapsed={false} isMobile onCollapseToggle={noop} onNavigate={noop} />,
    );

    expect(screen.queryByRole("button", { name: "Collapse navigation" })).not.toBeInTheDocument();
  });

  it("closes the drawer after navigating on mobile", async () => {
    const onNavigate = vi.fn();
    renderWithProviders(
      <AppDrawerContent
        collapsed={false}
        isMobile
        onCollapseToggle={noop}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.click(screen.getByRole("link", { name: "Dashboard" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
