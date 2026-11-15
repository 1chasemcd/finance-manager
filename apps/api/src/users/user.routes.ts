import router from "@/core/router";
import type { UserService } from "./user.service";
import type { User } from "./user.types";

interface UserRouteDeps {
  userService: UserService;
}

export function createUserRoutes({ userService }: UserRouteDeps) {
  return router().get("/", async (c) => {
    const info = await userService.all();
    return c.json(info.map(mapUser), 200);
  });
}

function mapUser(user: User) {
  const { groupId, subject, ...rest } = user;
  return rest;
}
