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
import { CategoryService } from "./categories/category.service";
import { CategoryDrizzleRepository } from "./categories/category.drizzle-repository";
import { CategoryRuleDrizzleRepository } from "./category-rules/category-rule.drizzle-repository";
import { CategoryRuleService } from "./category-rules/category-rule.service";
import { TransactionDrizzleRepository } from "./transactions/transaction.drizzle-repository";
import { TransactionService } from "./transactions/transaction.service";

export function createContainer(env: Cloudflare.Env) {
  const db = createDb(env.DB);
  const currentTime = () => new Date();
  const fetchHandler = fetch.bind(globalThis);

  const currentUser = new CurrentUser(requestContext);
  const logger = createLogger(env.LOG_LEVEL ?? "info");

  const categoryRepository = new CategoryDrizzleRepository(db);
  const categoryRuleRepository = new CategoryRuleDrizzleRepository(db);
  const fileFormatRepository = new FileFormatDrizzleRepository(db);
  const groupRepository = new GroupDrizzleRepository(db);
  const groupInviteRepository = new GroupInviteDrizzleRepository(db);
  const sourceRepository = new SourceDrizzleRepository(db);
  const transactionRepository = new TransactionDrizzleRepository(db);
  const userRepository = new UserDrizzleRepository(db);

  const groupInviteService = new GroupInviteService(
    userRepository,
    groupInviteRepository,
    currentUser,
    currentTime,
  );

  const accountService = new AccountService(userRepository, groupInviteService, currentUser);
  const categoryService = new CategoryService(
    categoryRepository,
    transactionRepository,
    currentUser,
  );
  const categoryRuleService = new CategoryRuleService(categoryRuleRepository, currentUser);
  const fileFormatService = new FileFormatService(
    fileFormatRepository,
    sourceRepository,
    currentUser,
  );
  const transactionService = new TransactionService(transactionRepository, currentUser);
  const sourceService = new SourceService(sourceRepository, transactionRepository, currentUser);
  const userService = new UserService(userRepository, groupRepository, currentUser);

  const identityService: IdentityService = new CloudflareIdentityService(fetchHandler, logger);

  return {
    requestContext,
    logger,
    accountService,
    categoryService,
    categoryRuleService,
    fileFormatService,
    groupInviteService,
    sourceService,
    transactionService,
    userService,
    identityService,
  };
}

export type Container = ReturnType<typeof createContainer>;
