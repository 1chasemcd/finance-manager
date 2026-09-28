import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db/client";
import { DrizzleUserRepository } from "./db/repositories/user.drizzle-repository";
import { UserService } from "./users/user.service";
import { createUserRoutes } from "./users/user.routes";

export type AppConfig = {
  readonly db: D1Database;
};

export function createApp(config: AppConfig) {
  const db = createDb(config.db);

  const userRepository = new DrizzleUserRepository(db);
  const userService = new UserService(userRepository);

  return new Hono()
    .use("*", cors({ origin: "http://localhost:5173" }))
    .route("/users", createUserRoutes(userService));
}
