import { AsyncLocalStorage } from "node:async_hooks";
import type { User } from "@/users/user.types";
import type { MiddlewareHandler } from "hono";
import type { CloudflareEnv } from "@/types/cloudflare-env";

export interface RequestContextData {
  user?: User;
}

const requestStore = new AsyncLocalStorage<RequestContextData>();

export const requestContext = () => requestStore.getStore();

export function createRequestContextMiddleware(): MiddlewareHandler<{
  Bindings: CloudflareEnv;
}> {
  return (_, next) => {
    return requestStore.run({}, async () => {
      await next();
    });
  };
}

export type RequestContext = typeof requestContext;
