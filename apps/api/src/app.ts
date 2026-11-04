import router from "@/core/router";
import { createRequestContextMiddleware } from "@/middleware/request-context";
import { createAccountRoutes } from "@/accounts/account.routes";
import { createContainer, type Container } from "./container";
import { createErrorHandler } from "./middleware/error-handler";
import { createSourceRoutes } from "./sources/source.routes";

const cache = new WeakMap<Cloudflare.Env, unknown>();

export function cacheApp<AppType>(
  env: Cloudflare.Env,
  appFactory: (container: Container) => AppType,
): AppType {
  const cached = cache.get(env);
  if (cached) return cached as AppType;

  const container = createContainer(env);
  const app = appFactory(container);

  cache.set(env, app);
  return app;
}

export function createAppBase(container: Container) {
  return router()
    .onError(createErrorHandler(container))
    .basePath("/api")
    .use(createRequestContextMiddleware())
    .get("/health", (c) => c.json({ status: "ok" }));
}

export function createAppRoutes(container: Container) {
  return router()
    .route("/account", createAccountRoutes(container))
    .route("/source", createSourceRoutes(container));
}
