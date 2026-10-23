import type { MiddlewareHandler } from "hono";
import type { UserService } from "@/users/user.service";
import type { RequestContext } from "@/core/request-context";
import { randomInt } from "crypto";

const DEV_USER_SUB = "Dev-User-Sub";

interface RandomIdentity {
  name: string;
  email: string;
}

interface RandomResponse {
  data: [{ firstName: string; lastName: string }];
}
export async function getRandomUser(): Promise<RandomIdentity> {
  const response = await fetch("https://randomapi.dev/api/names?count=1&fields=firstName,lastName");
  const data = await response.json<RandomResponse>();
  const number = randomInt(1_000, 10_000).toString();
  const name = data.data[0];
  return {
    name: `${name.firstName} ${name.lastName}`,
    email: `${name.firstName}.${name.lastName}.${number}@gmail.com`,
  };
}
export function authMiddlewareFactoryDev(
  requestContext: RequestContext,
  userService: UserService,
): MiddlewareHandler<{ Bindings: Cloudflare.DevEnv }> {
  return async (c, next) => {
    const sub = c.req.header(DEV_USER_SUB);
    if (!sub) return c.body(null, 401);

    const context = requestContext();
    const user = await userService.getUser(sub);

    if (user.isOk) {
      context.user = user.data;
      return next();
    }

    const identity = await getRandomUser();

    const res = await userService.onboardUser({
      subject: sub,
      email: identity.email,
      name: identity.name,
    });

    if (res.isOk) {
      context.user = res.data;
    } else {
      const existing = await userService.getUser(sub);
      if (existing.isErr) return c.body(null, 409);
      context.user = existing.data;
    }

    return next();
  };
}
