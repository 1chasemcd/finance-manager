import { zValidator } from "@hono/zod-validator";
import router from "../core/router";
import type { GroupInviteService } from "./group-invite.service";
import { InviteUserSchema } from "./group-invites.types";

export function createGroupInviteRoutes(groupInvites: GroupInviteService) {
  return router()
    .post("/", zValidator("json", InviteUserSchema), async (c) => {
      const email = c.req.valid("json").email;
      await groupInvites.inviteUserToGroup(email);
      return c.body(null, 204);
    })
    .post("/:inviteId/accept", async (c) => {
      const inviteId = c.req.param("inviteId");
      const res = await groupInvites.acceptInviteToGroup(inviteId);
      if (res.isOk) return c.body(null, 204);
      else return c.body(null, 404);
    })
    .post("/:inviteId/decline", async (c) => {
      const inviteId = c.req.param("inviteId");
      const res = await groupInvites.declineInviteToGroup(inviteId);
      if (res.isOk) return c.body(null, 204);
      else return c.body(null, 404);
    });
}
