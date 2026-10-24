import { createDb } from "@/db/client";
import { UserDrizzleRepository } from "@/users/user.drizzle-repository";
import { UserService } from "@/users/user.service";
import { requestContext } from "@/middleware/request-context";
import { AccountService } from "@/accounts/account.service";
import { CurrentUser } from "@/identity/current-user";
import { GroupDrizzleRepository } from "@/groups/group.drizzle-repository";
import { GroupInviteService } from "@/group-invites/group-invite.service";
import { GroupInviteDrizzleRepository } from "@/group-invites/group-invite.drizzle-repository";
import type { CurrentTime } from "./types/current-time";
import {
  CloudflareIdentityService,
  type IdentityService,
} from "./identity/cloudflare-identity.service";
import type { CloudflareEnv } from "./types/cloudflare-env";
import { createLogger } from "./core/logger";

type ContainerDeps = CloudflareEnv & {
  handleFetch?: typeof fetch;
  currentTime?: CurrentTime;
};

export function createContainer({
  handleFetch = fetch.bind(globalThis),
  currentTime = () => new Date(),
  ...env
}: ContainerDeps) {
  const db = createDb(env.DB);

  const currentUser = new CurrentUser(requestContext);
  const logger = createLogger(requestContext, "LOG_LEVEL" in env ? env.LOG_LEVEL : "info");

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

  const identityService: IdentityService = new CloudflareIdentityService(handleFetch, logger);

  return {
    requestContext,
    logger,
    groupInviteService,
    accountService,
    userService,
    identityService,
  };
}

export type Container = ReturnType<typeof createContainer>;
