import { snakeCase } from "drizzle-orm/sqlite-core";
import { id } from "../columns";

export const accounts = snakeCase.table("accounts", {
  id,
});
