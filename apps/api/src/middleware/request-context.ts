import { AsyncLocalStorage } from "node:async_hooks";
import type { User } from "@/users/user.types";
import type { MiddlewareHandler } from "hono";

export interface RequestContextData {
  user?: User;
}

const requestStore = new AsyncLocalStorage<RequestContextData>();

export const requestContext = () => requestStore.getStore();

export function createRequestContextMiddleware(): MiddlewareHandler<{
  Bindings: Cloudflare.Env;
}> {
  return (_, next) => {
    return requestStore.run({}, async () => {
      await next();
    });
  };
}

export type RequestContext = typeof requestContext;
