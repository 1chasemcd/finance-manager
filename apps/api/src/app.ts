import { createDb } from "./db/client";
import { DrizzleUserRepository } from "./db/repositories/user.drizzle-repository";
import { UserService } from "./users/user.service";
import router from "./http/router";
import { getRequestContext, runWithRequestContext } from "./core/request-context";
import { createAccountRoutes } from "./accounts/account.routes";
import { AccountService } from "./accounts/account.service";
import { CurrentUser } from "./identity/current-user";
import { authMiddlewareFactory } from "./http/middleware/auth";
import { DrizzleAccountRepository } from "./db/repositories/account.drizzle-repository";

export interface AppConfig {
  readonly db: D1Database;
}

export function createApp(config: AppConfig) {
  const db = createDb(config.db);

  const currentUser = new CurrentUser(getRequestContext);

  const userRepository = new DrizzleUserRepository(db);
  const accountsRepository = new DrizzleAccountRepository(db);

  const accountService = new AccountService(userRepository, currentUser);
  const userService = new UserService(userRepository, accountsRepository);

  const authMiddleware = authMiddlewareFactory(getRequestContext, userService);

  return router()
    .use("*", (_, next) => runWithRequestContext(next))
    .use("*", authMiddleware)
    .basePath("/api")
    .get("/health", (c) => c.json({ status: "ok" }))
    .route("/account", createAccountRoutes(accountService));
}
