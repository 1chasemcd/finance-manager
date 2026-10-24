import type { MiddlewareHandler } from "hono";
import type { RequestContext } from "@/middleware/request-context";
import devUsers from "../dev-users.json";
import type { UserService } from "@/users/user.service";
import { invariant } from "@finapp/result";
import type { Logger } from "@/core/logger";

interface DevMiddlewareDeps {
  requestContext: RequestContext;
  userService: UserService;
  logger: Logger;
}

export function createDevMiddleware({
  requestContext,
  userService,
  logger,
}: DevMiddlewareDeps): MiddlewareHandler<{ Bindings: Cloudflare.DevEnv }> {
  let setupStatus: "pending" | "done" | "not_done" = "not_done";
  return async (c, next) => {
    if (setupStatus === "not_done") {
      setupStatus = "pending";
      await setupUsers(userService, logger);
      setupStatus = "done";
    }

    const user = await userService.getUser(c.env.DEV_USER);
    invariant(user, "DEV_USER not found in db.");

    const context = requestContext();
    invariant(context, "No request context.");
    context.user = user.data;
    return next();
  };
}

async function setupUsers(userService: UserService, logger: Logger) {
  const entries = Object.entries(devUsers);
  for (const [subject, identity] of entries)
    try {
      await userService.onboardUser({ subject, ...identity });
    } catch (e) {
      logger.error(e instanceof Error ? e.message : "An error occurred while creating a user.");
    }
}
