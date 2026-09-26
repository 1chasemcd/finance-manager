import { drizzle } from "drizzle-orm/libsql";

export function createDb(databaseUrl: string) {
  return drizzle(databaseUrl);
}

export type Db = ReturnType<typeof createDb>;
