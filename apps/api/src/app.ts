import { createDb } from "./db/client";
import { DrizzleUserRepository } from "./db/repositories/user.drizzle-repository";
import { UserService } from "./users/user.service";
import { createUserRoutes } from "./users/user.routes";
import router from "./http/router";
// import type { ExecutionContext } from "hono";

export type AppConfig = {
  readonly db: D1Database;
};

export function createApp(config: AppConfig) {
  const db = createDb(config.db);

  const userRepository = new DrizzleUserRepository(db);
  const userService = new UserService(userRepository);

  return router()
    .basePath("/api")
    .get("/health", (c) => c.json({ status: "ok" }))
    .route("/users", createUserRoutes(userService));
}
