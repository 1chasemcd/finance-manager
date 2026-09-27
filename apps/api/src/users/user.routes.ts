import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { UserService } from "./user.service";
import { CreateUser, UpdateUser } from "./user.schemas";
import { mapResult } from "../core/http-result-mapper";

const idValidator = zValidator(
  "param",
  z.object({
    id: z.coerce.number().int().positive(),
  }),
);

export function createUserRoutes(users: UserService) {
  const router = new Hono()
    .get("/", async (c) => {
      const res = await users.getall();
      const mapped = mapResult(res);
      return c.json(...mapped);
    })
    .post("/", zValidator("json", CreateUser), async (c) => {
      const body = c.req.valid("json");
      const res = await users.create(body);
      if (res.isOk) return c.json(res.data, 201);
      const mapped = mapResult(res);
      return c.json(...mapped);
    })
    .get("/:id", idValidator, async (c) => {
      const param = c.req.valid("param");

      const res = await users.lookup(param.id);
      const mapped = mapResult(res);
      return c.json(...mapped);
    })
    .patch("/:id", idValidator, zValidator("json", UpdateUser), async (c) => {
      const param = c.req.valid("param");
      const body = c.req.valid("json");
      const res = await users.update(param.id, body);
      const mapped = mapResult(res);
      return c.json(...mapped);
    })
    .delete("/:id", idValidator, async (c) => {
      const param = c.req.valid("param");
      const res = await users.delete(param.id);
      const mapped = mapResult(res);
      return c.body(...mapped);
    });

  return router;
}
