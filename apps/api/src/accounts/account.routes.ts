import router from "@/core/router";
import type { AccountService } from "./account.service";

export function createAccountRoutes({ accountService }: { accountService: AccountService }) {
  return router().get("/", async (c) => {
    const info = await accountService.getAccountInfo();
    return c.json(info, 200);
  });
}
