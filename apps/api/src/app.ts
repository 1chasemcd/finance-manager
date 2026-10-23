import router from "@/core/router";
import { createRequestContextMiddleware } from "@/core/request-context";
import { createAccountRoutes } from "@/accounts/account.routes";
import { createAuthMiddleware } from "@/middleware/auth";
import { createGroupInviteRoutes } from "@/group-invites/group-invite.routes";
import { type Container } from "./container";

export function createApp(container: Container) {
  return router()
    .basePath("/api")
    .use("*", createRequestContextMiddleware())
    .get("/health", (c) => c.json({ status: "ok" }))
    .use("*", createAuthMiddleware(container))
    .route("/account", createAccountRoutes(container))
    .route("/invite", createGroupInviteRoutes(container));
}
