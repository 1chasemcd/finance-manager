import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";
import PageHeaderProvider from "@/components/PageHeader/PageHeaderProvider";
import { theme } from "@/theme";

let restoreMatchMedia: (() => void) | null = null;

afterEach(() => {
  restoreMatchMedia?.();
  restoreMatchMedia = null;
});

export interface FetchCall {
  url: string;
  method: string;
  body: string | null;
}

export interface StubResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

type FetchHandler = (call: FetchCall) => StubResponse | Promise<StubResponse>;

export function jsonResponse(data: unknown, status = 200): StubResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

export function stubFetch(handlers: Record<string, FetchHandler>): { calls: FetchCall[] } {
  const calls: FetchCall[] = [];

  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<StubResponse> => {
      const url = requestUrl(input);
      const method = (init?.method ?? "GET").toUpperCase();
      const matched = Object.entries(handlers).find(([route]) => {
        const [routeMethod, routePath = ""] = route.split(" ");
        return routeMethod === method && url.endsWith(routePath);
      });
      if (!matched) {
        throw new Error(`No fetch handler registered for ${method} ${url}`);
      }
      const call: FetchCall = {
        url,
        method,
        body: typeof init?.body === "string" ? init.body : null,
      };
      calls.push(call);
      const [, handler] = matched;
      return handler(call);
    },
  );

  vi.stubGlobal("fetch", fetchMock);
  return { calls };
}

export function stubMatchMedia(queryMatches: (query: string) => boolean): void {
  const original = Object.getOwnPropertyDescriptor(window, "matchMedia");
  restoreMatchMedia = () => {
    if (original) {
      Object.defineProperty(window, "matchMedia", original);
    } else {
      delete (window as { matchMedia?: unknown }).matchMedia;
    }
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: queryMatches(query),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/" }: { route?: string } = {},
): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <PageHeaderProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </PageHeaderProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}
