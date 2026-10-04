import { AsyncLocalStorage } from "node:async_hooks";
import type { User } from "../users/user.types";

interface RequestContext {
  user?: User;
}

export type GetRequestContext = () => RequestContext;

const requestStore = new AsyncLocalStorage<RequestContext>();

export const getRequestContext: GetRequestContext = () => {
  const store = requestStore.getStore();
  if (store === undefined)
    throw Error("Attempted to use request context outside of a request scope.");
  return store;
};

export function runWithRequestContext(callback: () => Promise<void>): Promise<void> {
  return requestStore.run({}, async () => {
    await callback();
  });
}
