import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AppDrawer from "@/components/AppDrawer/AppDrawer";
import { renderWithProviders, stubMatchMedia } from "./test-utils";

describe("AppDrawer", () => {
  it("shows a permanent drawer with navigation and a collapse control on desktop", () => {
    stubMatchMedia(() => false);

    renderWithProviders(<AppDrawer />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse navigation" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open navigation" })).not.toBeInTheDocument();
  });

  it("opens and closes the navigation from the menu button on mobile", async () => {
    const user = userEvent.setup();
    stubMatchMedia((query) => query.includes("max-width"));

    renderWithProviders(<AppDrawer />);

    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open navigation" }));

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Transactions" }));

    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Transactions" })).not.toBeInTheDocument(),
    );
  });
});
