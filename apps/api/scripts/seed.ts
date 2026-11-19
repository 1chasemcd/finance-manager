import { getPlatformProxy } from "wrangler";
import { readFile } from "fs/promises";
import path from "path";
import { createDb } from "@/db/client";
import { GroupDrizzleRepository } from "@/groups/group.drizzle-repository";
import { UserDrizzleRepository } from "@/users/user.drizzle-repository";
import type { CreateUserInput } from "@/users/user.types";
import { CategoryDrizzleRepository } from "@/categories/category.drizzle-repository";
import { TransactionDrizzleRepository } from "@/transactions/transaction.drizzle-repository";
import type { CreateTransactionInput } from "@/transactions/transaction.types";
import { SourceDrizzleRepository } from "@/sources/source.drizzle-repository";
import type { CreateCategoryRequest, CreateSourceRequest } from "@finapp/schema";
import { invariant, type Result } from "@finapp/result";

interface SeedData {
  groups: { id: number }[];
  users: (CreateUserInput & { id: number; groupId: number })[];
  categories: (CreateCategoryRequest & { id: number; groupId: number })[];
  sources: (CreateSourceRequest & { id: number; groupId: number })[];
  transactions: (CreateTransactionInput & { id: number; groupId: number })[];
}

type TableIdentifier = "groups" | "users" | "categories" | "sources";

type SeedIdKey = `${TableIdentifier}:${number}`;

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
const key = (table: TableIdentifier, id: number): SeedIdKey => `${table}:${id}`;

const configPath = path.resolve(import.meta.dirname, "../wrangler.jsonc");

async function main() {
  const seedPath = process.argv[2];
  if (!seedPath) {
    throw new Error("Usage: tsx scripts/seed.ts <path-to-seed-json>");
  }

  const seedData = await readSeedData(seedPath);

  const idMap = new Map<SeedIdKey, number>();

  function getMappedId(table: TableIdentifier, id: number): number {
    const mappedId = idMap.get(key(table, id));
    invariant(
      mappedId !== undefined,
      `Missing seed record in '${table}' with id '${id.toString()}'`,
    );
    return mappedId;
  }

  const proxy = await getPlatformProxy<Cloudflare.DevEnv>({
    configPath,
    environment: "dev",
  });

  try {
    const db = createDb(proxy.env.DB);
    const groupRepository = new GroupDrizzleRepository(db);
    const userRepository = new UserDrizzleRepository(db);
    const categoryRepository = new CategoryDrizzleRepository(db);
    const sourceRepository = new SourceDrizzleRepository(db);
    const transactionRepository = new TransactionDrizzleRepository(db);

    for (const { id } of seedData.groups) {
      const created = await groupRepository.create();
      idMap.set(key("groups", id), created.id);
    }

    for (const { id, groupId, ...seed } of seedData.users) {
      const created = await unwrap(
        userRepository.create({ groupId: getMappedId("groups", groupId), ...seed }),
      );
      idMap.set(key("users", id), created.id);
    }

    for (const { id, groupId, ...seed } of seedData.categories) {
      const created = await unwrap(categoryRepository.create(getMappedId("groups", groupId), seed));
      idMap.set(key("categories", id), created.id);
    }

    for (const { id, groupId, ownerId, ...seed } of seedData.sources) {
      const created = await unwrap(
        sourceRepository.create(getMappedId("groups", groupId), {
          ownerId: getMappedId("users", ownerId),
          ...seed,
        }),
      );
      idMap.set(key("sources", id), created.id);
    }

    for (const { id, groupId, sourceId, categoryId, ...seed } of seedData.transactions) {
      await unwrap(
        transactionRepository.create(groupId, {
          sourceId: getMappedId("sources", sourceId),
          categoryId: getMappedId("categories", categoryId),
          ...seed,
        }),
      );
    }
  } finally {
    await proxy.dispose();
  }
}

async function readSeedData(filePath: string): Promise<SeedData> {
  const workingDirectory = process.env["INIT_CWD"] ?? process.cwd();
  const raw = await readFile(path.resolve(workingDirectory, filePath), "utf8");
  const parsed: unknown = JSON.parse(raw);
  return parsed as SeedData;
}

async function unwrap<T, E>(value: Promise<Result<T, E>>): Promise<T> {
  const result = await value;
  if (result.isErr) throw new Error(`Expected ok result but was ${JSON.stringify(result.error)}`);
  return result.data;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
