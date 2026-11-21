import { createAppBase, createAppRoutes, cacheApp } from "./app";
import { createDevMiddleware } from "./middleware/dev";

function getApp(env: Cloudflare.Env) {
  return cacheApp(env, (container) =>
    createAppBase(container)
      .use(createDevMiddleware(container))
      .route("/", createAppRoutes(container)),
  );
}

export default {
  async fetch(
    request: Request,
    env: Cloudflare.Env,
    executionCtx: ExecutionContext,
  ): Promise<Response> {
    return getApp(env).fetch(request, env, executionCtx);
  },
};
