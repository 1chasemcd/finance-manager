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
  setupUsersInBackground(userService);

  return async (c, next) => {
    const context = requestContext();
    const subject = c.env.DEV_USER;

    if (!(subject in devUsers)) return c.body("DEV_USER not set or invalid", 500);

    const user = await userService.getUser(c.env.DEV_USER);

    if (user.isErr) return c.body("Dev user not found in db", 500);

    context.user = user.data;
    return next();
  };
}

function setupUsersInBackground(userService: UserService) {
  const entries = Object.entries(devUsers);

  function setupUserAndInitiateNext(userIndex: number) {
    const entry = entries.at(userIndex);
    if (!entry) return;
    const [subject, identity] = entry;
    userService
      .onboardUser({ subject, ...identity })
      .catch(() => {
        // TODO log errors
      })
      .finally(() => {
        setupUserAndInitiateNext(userIndex + 1);
      });
  }

  setupUserAndInitiateNext(0);
}
