/// <reference path="../worker-configuration.d.ts" />
import { createApp } from "./app";

export type AppType = ReturnType<typeof createApp>;

const apps = new WeakMap<CloudflareBindings, AppType>();

function getApp(bindings: CloudflareBindings): AppType {
  const cached = apps.get(bindings);
  if (cached) return cached;

  const app = createApp({ db: bindings.DB });
  apps.set(bindings, app);
  return app;
}

export default {
  fetch(
    request: Request,
    bindings: CloudflareBindings,
    executionCtx: ExecutionContext,
  ): Response | Promise<Response> {
    return getApp(bindings).fetch(request, bindings, executionCtx);
  },
};
