import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db/client";
import { DrizzleUserRepository } from "./db/repositories/user.drizzle-repository";
import { UserService } from "./users/user.service";
import { createUserRoutes } from "./users/user.routes";

const DEFAULT_CORS_ORIGINS = ["http://localhost:5173"];

export type AppConfig = {
  readonly db: D1Database;
  readonly corsOrigins?: string | readonly string[];
};

function resolveCorsOrigins(corsOrigins: AppConfig["corsOrigins"]): string[] {
  if (corsOrigins === undefined) return DEFAULT_CORS_ORIGINS;

  const origins = typeof corsOrigins === "string" ? corsOrigins.split(",") : corsOrigins;
  return origins.map((origin) => origin.trim()).filter((origin) => origin !== "");
}

export function createApp(config: AppConfig) {
  const db = createDb(config.db);

  const userRepository = new DrizzleUserRepository(db);
  const userService = new UserService(userRepository);
  const corsOrigins = resolveCorsOrigins(config.corsOrigins);
  const corsOrigin = corsOrigins.includes("*") ? "*" : corsOrigins;

  return new Hono()
    .use("*", cors({ origin: corsOrigin }))
    .route("/users", createUserRoutes(userService));
}
