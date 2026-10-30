import router from "@/core/router";
import { createRequestContextMiddleware } from "@/middleware/request-context";
import { createAccountRoutes } from "@/accounts/account.routes";
import { createContainer } from "./container";
import { createErrorHandler } from "./middleware/error-handler";
import { createAuthMiddleware } from "./middleware/auth";

type AppType = ReturnType<typeof createApp>;
const cache = new WeakMap<Cloudflare.Env, AppType>();

export function getApp(env: Cloudflare.Env) {
  const cached = cache.get(env);
  if (cached) return cached;

  const app = createApp(env);

  cache.set(env, app);
  return app;
}

function createApp(env: Cloudflare.Env) {
  const container = createContainer(env);
  const createAppAuth = env.INJECTIONS?.authMiddlewareFactory ?? createAuthMiddleware;

  return router()
    .onError(createErrorHandler(container))
    .basePath("/api")
    .use(createRequestContextMiddleware())
    .get("/health", (c) => c.json({ status: "ok" }))
    .use(createAppAuth(container))
    .route("/account", createAccountRoutes(container));
}
