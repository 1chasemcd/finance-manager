import { getApp } from "@/app";

export default {
  fetch(
    request: Request,
    env: Cloudflare.Env,
    executionCtx: ExecutionContext,
  ): Response | Promise<Response> {
    return getApp(env).fetch(request, env, executionCtx);
  },
};
