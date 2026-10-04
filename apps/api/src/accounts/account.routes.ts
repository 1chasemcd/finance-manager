import router from "../http/router";
import type { AccountService } from "./account.service";

export function createAccountRoutes(account: AccountService) {
  return router().get("/", async (c) => {
    const info = await account.getAccountInfo();
    return c.json(info, 200);
  });
}
