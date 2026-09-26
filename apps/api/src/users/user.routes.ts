// import { Hono } from "hono";
// import type { UserService } from "./user.service";

// export function createUserRoutes(userService: UserService) {
//   const router = new Hono();

//   router.get("/:id", async (c) => {
//     const id = c.req.param("id");

//     const user = await userService.getUser(id);

//     return c.json(user);
//   });

//   router.post("/", async (c) => {
//     const body = await c.req.json<{
//       email: string;
//       name: string;
//     }>();

//     const user = await userService.createUser(body);

//     return c.json(user, 201);
//   });

//   return router;
// }
