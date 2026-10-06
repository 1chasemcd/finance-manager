import { createDb } from "./db/client";
import { UserDrizzleRepository } from "./users/user.drizzle-repository";
import { UserService } from "./users/user.service";
import router from "./core/router";
import { getRequestContext, runWithRequestContext } from "./core/request-context";
import { createAccountRoutes } from "./accounts/account.routes";
import { AccountService } from "./accounts/account.service";
import { CurrentUser } from "./identity/current-user";
import { authMiddlewareFactory } from "./middleware/auth";
import { GroupDrizzleRepository } from "./groups/group.drizzle-repository";
import { GroupInviteService } from "./group-invites/group-invite.service";
import { GroupInviteDrizzleRepository } from "./group-invites/group-invite.drizzle-repository";
import { createGroupInviteRoutes } from "./group-invites/group-invite.routes";

export interface AppConfig {
  readonly db: D1Database;
}

export function createApp(config: AppConfig) {
  const db = createDb(config.db);

  const currentUser = new CurrentUser(getRequestContext);
  const currentTime = () => new Date();

  const userRepository = new UserDrizzleRepository(db);
  const groupRepository = new GroupDrizzleRepository(db);
  const groupInviteRepository = new GroupInviteDrizzleRepository(db);

  const groupInviteService = new GroupInviteService(
    userRepository,
    groupInviteRepository,
    currentUser,
    currentTime,
  );

  const accountService = new AccountService(userRepository, groupInviteService, currentUser);
  const userService = new UserService(userRepository, groupRepository);

  const authMiddleware = authMiddlewareFactory(getRequestContext, userService);

  return router()
    .basePath("/api")
    .use("*", (_, next) => runWithRequestContext(next))
    .get("/health", (c) => c.json({ status: "ok" }))
    .use("*", authMiddleware)
    .route("/account", createAccountRoutes(accountService))
    .route("/invite", createGroupInviteRoutes(groupInviteService));
}
