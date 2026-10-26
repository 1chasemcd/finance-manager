import router from "@/core/router";
import type { AccountService } from "./account.service";
import { zValidator } from "@hono/zod-validator";
import type { GroupInviteService } from "@/group-invites/group-invite.service";
import { inviteUserSchema } from "@finapp/schema";

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
    .post("/invite/:inviteId/accept", async (c) => {
      const inviteId = c.req.param("inviteId");
      const res = await groupInviteService.acceptInviteToGroup(inviteId);
      if (res.isOk) return c.body(null, 204);
      else return c.body(null, 404);
    })
    .post("/invite/:inviteId/decline", async (c) => {
      const inviteId = c.req.param("inviteId");
      const res = await groupInviteService.declineInviteToGroup(inviteId);
      if (res.isOk) return c.body(null, 204);
      else return c.body(null, 404);
    });
}
