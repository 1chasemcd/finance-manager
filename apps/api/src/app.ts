import router from "@/core/router";
import { createRequestContextMiddleware } from "@/core/request-context";
import { createAccountRoutes } from "@/accounts/account.routes";
import { createAuthMiddleware } from "@/middleware/auth";
import { createGroupInviteRoutes } from "@/group-invites/group-invite.routes";
import { type Container } from "./container";
import { createDevMiddleware } from "./dev/dev.middleware";

export function createApp(container: Container) {
  const baseApp = router()
    .basePath("/api")
    .use("*", createRequestContextMiddleware())
    .get("/health", (c) => c.json({ status: "ok" }));

  const app =
    __ENVIRONMENT__ === "dev"
      ? baseApp.use("*", createDevMiddleware(container))
      : baseApp.use("*", createAuthMiddleware(container));

  return app
    .route("/account", createAccountRoutes(container))
    .route("/invite", createGroupInviteRoutes(container));
}
