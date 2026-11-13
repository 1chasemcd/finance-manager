import { UserDrizzleRepository } from "@/users/user.drizzle-repository";
import { UserService } from "@/users/user.service";
import { requestContext } from "@/middleware/request-context";
import { AccountService } from "@/accounts/account.service";
import { CurrentUser } from "@/identity/current-user";
import { GroupDrizzleRepository } from "@/groups/group.drizzle-repository";
import { GroupInviteService } from "@/group-invites/group-invite.service";
import { GroupInviteDrizzleRepository } from "@/group-invites/group-invite.drizzle-repository";
import {
  CloudflareIdentityService,
  type IdentityService,
} from "./identity/cloudflare-identity.service";
import { createLogger } from "./core/logger";
import { createDb } from "./db/client";
import { SourceDrizzleRepository } from "./sources/source.drizzle-repository";
import { SourceService } from "./sources/source.service";
import { FileFormatDrizzleRepository } from "./file-formats/file-format.drizzle-repository";
import { FileFormatService } from "./file-formats/file-format.service";

export function createContainer(env: Cloudflare.Env) {
  const db = createDb(env.DB);
  const currentTime = () => new Date();
  const fetchHandler = fetch.bind(globalThis);

  const currentUser = new CurrentUser(requestContext);
  const logger = createLogger(env.LOG_LEVEL ?? "info");

  const userRepository = new UserDrizzleRepository(db);
  const groupRepository = new GroupDrizzleRepository(db);
  const groupInviteRepository = new GroupInviteDrizzleRepository(db);
  const fileFormatRepository = new FileFormatDrizzleRepository(db);
  const sourceRepository = new SourceDrizzleRepository(db);

  const groupInviteService = new GroupInviteService(
    userRepository,
    groupInviteRepository,
    currentUser,
    currentTime,
  );

  const accountService = new AccountService(userRepository, groupInviteService, currentUser);
  const userService = new UserService(userRepository, groupRepository);
  const fileFormatService = new FileFormatService(
    fileFormatRepository,
    sourceRepository,
    currentUser,
  );

  const sourceService = new SourceService(sourceRepository, currentUser);

  const identityService: IdentityService = new CloudflareIdentityService(fetchHandler, logger);

  return {
    requestContext,
    logger,
    groupInviteService,
    accountService,
    userService,
    identityService,
    sourceService,
    fileFormatService,
  };
}

export type Container = ReturnType<typeof createContainer>;
