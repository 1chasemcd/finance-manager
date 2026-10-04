import type { MiddlewareHandler } from "hono";
import { getJwtPayload } from "../../identity/get-jwt-payload";
import type { UserService } from "../../users/user.service";
import { getCloudflareIdentity } from "../../identity/get-cloudflare-identity";
import { invariant } from "@finapp/result";
import type { GetRequestContext } from "../../core/request-context";

const CF_ACCESS_JWT_ASSERTION = "Cf-Access-Jwt-Assertion";

export function authMiddlewareFactory(
  requestContext: GetRequestContext,
  userService: UserService,
): MiddlewareHandler<{ Bindings: CloudflareBindings }> {
  return async (c, next) => {
    const jwt = c.req.header(CF_ACCESS_JWT_ASSERTION);
    if (!jwt) return c.body(null, 401);

    const payload = await getJwtPayload(jwt, c.env);
    if (payload.isErr) return c.body(null, 401);

    const context = requestContext();
    const user = await userService.getUser(payload.data.sub);

    if (user.isOk) {
      context.user = user.data;
      return next();
    }

    const cfIdentity = await getCloudflareIdentity(jwt, c.env);
    if (cfIdentity.isErr) return c.body(null, 502);

    const res = await userService.onboardUser({
      subject: payload.data.sub,
      email: cfIdentity.data.email ?? "",
      name: cfIdentity.data.name ?? "",
    });

    invariant(res);
    context.user = res.data;

    return next();
  };
}
