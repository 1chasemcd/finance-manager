import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "@/pages/NotFound";
import { renderWithProviders } from "./test-utils";

describe("NotFound page", () => {
  it("renders a 404 message with a way back home", () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 5, name: "Page Not Found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute("href", "/");
  });
});
