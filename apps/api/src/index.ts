// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types/worker-configuration.d.ts" />
import { createApp } from "./app";
import type { CloudflareEnv } from "./types/cloudflare-env";

export type AppType = ReturnType<typeof createApp>;

const apps = new WeakMap<CloudflareEnv, AppType>();

function getApp(env: CloudflareEnv): AppType {
  const cached = apps.get(env);
  if (cached) return cached;

  const app = createApp(env);
  apps.set(env, app);
  return app;
}

export default {
  fetch(
    request: Request,
    env: CloudflareEnv,
    executionCtx: ExecutionContext,
  ): Response | Promise<Response> {
    return getApp(env).fetch(request, env, executionCtx);
  },
};
