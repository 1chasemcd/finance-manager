import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "@/App";
import { jsonResponse, stubFetch } from "./test-utils";

describe("App", () => {
  it("shows a loading indicator while checking the API", () => {
    stubFetch({ "GET /api/health": () => new Promise<never>(() => undefined) });

    render(<App />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("confirms the app is running once the API reports healthy", async () => {
    stubFetch({ "GET /api/health": () => jsonResponse({ status: "ok" }) });

    render(<App />);

    expect(await screen.findByText("The app is running")).toBeInTheDocument();
  });

  it("reports a failure when the API reports unhealthy", async () => {
    stubFetch({ "GET /api/health": () => jsonResponse({ status: "error" }, 500) });

    render(<App />);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("reports a failure when the health check cannot reach the API", async () => {
    stubFetch({
      "GET /api/health": () => {
        throw new Error("network is unreachable");
      },
    });

    render(<App />);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });
});
