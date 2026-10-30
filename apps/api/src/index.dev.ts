import { getApp } from "@/app";
import { createDevMiddleware } from "./middleware/dev";

export default {
  fetch(
    request: Request,
    env: Cloudflare.Env,
    executionCtx: ExecutionContext,
  ): Response | Promise<Response> {
    env.INJECTIONS = { authMiddlewareFactory: createDevMiddleware };
    return getApp(env).fetch(request, env, executionCtx);
  },
};
