import { Hono } from "hono";

interface Variables {
  identity: Awaited<ReturnType<NonNullable<ExecutionContext["access"]>["getIdentity"]>>;
}

export default function router() {
  return new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();
}
