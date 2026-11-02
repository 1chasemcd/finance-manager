import { createAppBase, createAppRoutes, cacheApp } from "./app";
import { createAuthMiddleware } from "./middleware/auth";

function getApp(env: Cloudflare.Env) {
  return cacheApp(env, (container) =>
    createAppBase(container)
      .use(createAuthMiddleware(container))
      .route("/", createAppRoutes(container)),
  );
}

export type AppType = ReturnType<typeof getApp>;

export default {
  fetch(
    request: Request,
    env: Cloudflare.Env,
    executionCtx: ExecutionContext,
  ): Response | Promise<Response> {
    return getApp(env).fetch(request, env, executionCtx);
  },
};
