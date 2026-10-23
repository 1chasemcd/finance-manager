import { AsyncLocalStorage } from "node:async_hooks";
import type { User } from "@/users/user.types";
import type { MiddlewareHandler } from "hono";
import type { CloudflareEnv } from "@/types/cloudflare-env";

interface RequestContextData {
  user?: User;
}

const requestStore = new AsyncLocalStorage<RequestContextData>();

export function requestContext() {
  const store = requestStore.getStore();
  if (store === undefined)
    throw Error("Attempted to use request context outside of a request scope.");
  return store;
}

export function createRequestContextMiddleware(): MiddlewareHandler<{
  Bindings: CloudflareEnv;
}> {
  return (_, next) =>
    requestStore.run({}, async () => {
      await next();
    });
}

export type RequestContext = typeof requestContext;
