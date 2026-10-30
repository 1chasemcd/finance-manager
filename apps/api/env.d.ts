import type { Container } from "@/container";
import type { MiddlewareHandler } from "hono";

type AuthMiddlewareFactory<EnvType extends Cloudflare.Env> = (
  container: Container,
) => MiddlewareHandler<{ Bindings: EnvType }>;

interface Injections {
  authMiddlewareFactory?: AuthMiddlewareFactory<DevEnv>;
  currentTime?: () => Date;
  fetchHandler?: typeof fetch;
}

declare global {
  declare namespace Cloudflare {
    interface Env {
      DB: D1Database;
      INJECTIONS?: Injections;
    }
  }
}
