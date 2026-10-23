import type { MiddlewareHandler } from "hono";
import type { UserService } from "@/users/user.service";
import type { RequestContext } from "@/core/request-context";
import { type IdentityService } from "@/identity/cloudflare-identity.service";

const CF_ACCESS_JWT_ASSERTION = "Cf-Access-Jwt-Assertion";

interface AuthMiddlewareDeps {
  requestContext: RequestContext;
  userService: UserService;
  identityService: IdentityService;
}

export function createAuthMiddleware({
  requestContext,
  userService,
  identityService,
}: AuthMiddlewareDeps): MiddlewareHandler<{ Bindings: Cloudflare.ProdEnv }> {
  return async (c, next) => {
    const jwt = c.req.header(CF_ACCESS_JWT_ASSERTION);
    if (!jwt) return c.body(null, 401);
    const payload = await identityService.jwtVerify(jwt, c.env);
    if (payload.isErr) return c.body(null, 401);

    const context = requestContext();
    const user = await userService.getUser(payload.data.sub);

    if (user.isOk) {
      context.user = user.data;
      return next();
    }

    const cfIdentity = await identityService.getIdentity(jwt, c.env);
    if (cfIdentity.isErr) return c.body(null, 502);
    if (!cfIdentity.data.email) return c.body(null, 401);

    const res = await userService.onboardUser({
      subject: payload.data.sub,
      email: cfIdentity.data.email,
      name: cfIdentity.data.name ?? "",
    });

    if (res.isOk) {
      context.user = res.data;
    } else {
      const existing = await userService.getUser(payload.data.sub);
      if (existing.isErr) return c.body(null, 409);
      context.user = existing.data;
    }

    return next();
  };
}
