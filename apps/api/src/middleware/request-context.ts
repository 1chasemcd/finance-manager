import { AsyncLocalStorage } from "node:async_hooks";
import type { User } from "@/users/user.types";
import type { MiddlewareHandler } from "hono";
import type { CloudflareEnv } from "@/types/cloudflare-env";

export interface RequestContextData {
  user?: User;
  requestId: string;
  method: string;
  path: string;
}

const requestStore = new AsyncLocalStorage<RequestContextData>();

export const requestContext = () => requestStore.getStore();

export function createRequestContextMiddleware(): MiddlewareHandler<{
  Bindings: CloudflareEnv;
}> {
  return (c, next) => {
    const requestId = crypto.randomUUID();
    const { method, path } = c.req;
    return requestStore.run({ requestId, method, path }, async () => {
      await next();
    });
  };
}

export type RequestContext = typeof requestContext;
