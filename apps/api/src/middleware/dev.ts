import type { MiddlewareHandler } from "hono";
import type { RequestContext } from "@/core/request-context";
import devUsers from "../dev-users.json";
import type { UserService } from "@/users/user.service";

interface DevMiddlewareDeps {
  requestContext: RequestContext;
  userService: UserService;
}

export function createDevMiddleware({
  requestContext,
  userService,
}: DevMiddlewareDeps): MiddlewareHandler<{ Bindings: Cloudflare.DevEnv }> {
  let setupStatus: "pending" | "done" | "not_done" = "not_done";
  return async (c, next) => {
    if (setupStatus === "not_done") {
      setupStatus = "pending";
      await setupUsers(userService);
      setupStatus = "done";
    }
    const context = requestContext();
    const subject = c.env.DEV_USER;

    if (!(subject in devUsers)) return c.body("DEV_USER not set or invalid", 500);

    const user = await userService.getUser(c.env.DEV_USER);

    if (user.isErr) return c.body("Dev user not found in db", 500);

    context.user = user.data;
    return next();
  };
}

async function setupUsers(userService: UserService) {
  const entries = Object.entries(devUsers);
  for (const [subject, identity] of entries)
    try {
      await userService.onboardUser({ subject, ...identity });
    } catch {
      // TODO log
    }
}
