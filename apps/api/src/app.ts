import router from "@/core/router";
import { createRequestContextMiddleware } from "@/core/request-context";
import { createAccountRoutes } from "@/accounts/account.routes";
import { createAuthMiddleware } from "@/middleware/auth";
import { type Container } from "./container";
import { createDevMiddleware } from "./middleware/dev";

export function createApp(container: Container) {
  const baseApp = router()
    .basePath("/api")
    .use("*", createRequestContextMiddleware())
    .get("/health", (c) => c.json({ status: "ok" }));

  const app =
    __ENVIRONMENT__ === "dev"
      ? baseApp.use("*", createDevMiddleware(container))
      : baseApp.use("*", createAuthMiddleware(container));

  return app.route("/account", createAccountRoutes(container));
}
