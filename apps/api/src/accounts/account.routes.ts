import router from "@/core/router";
import type { AccountService } from "./account.service";
import { zValidator } from "@hono/zod-validator";
import type { GroupInviteService } from "@/group-invites/group-invite.service";
import { idSchema, inviteUserSchema } from "@finapp/schema";

interface AccountRouteDeps {
  accountService: AccountService;
  groupInviteService: GroupInviteService;
}

export function createAccountRoutes({ accountService, groupInviteService }: AccountRouteDeps) {
  return router()
    .get("/", async (c) => {
      const info = await accountService.getAccountInfo();
      return c.json(info, 200);
    })
    .post("/invite", zValidator("json", inviteUserSchema), async (c) => {
      const email = c.req.valid("json").email;
      await groupInviteService.inviteUserToGroup(email);
      return c.body(null, 204);
    })
    .post("/invite/:id/accept", zValidator("param", idSchema), async (c) => {
      const id = c.req.param("id");
      const res = await groupInviteService.acceptInviteToGroup(id);
      if (res.isOk) return c.body(null, 204);
      else return c.body(null, 404);
    })
    .post("/invite/:id/decline", zValidator("param", idSchema), async (c) => {
      const id = c.req.param("id");
      const res = await groupInviteService.declineInviteToGroup(id);
      if (res.isOk) return c.body(null, 204);
      else return c.body(null, 404);
    });
}
