import router from "@/core/router";
import type { SourceService } from "./source.service";
import { zValidator } from "@hono/zod-validator";
import { createSourceSchema, idSchema, updateSourceSchema } from "@finapp/schema";

interface SourceRouteDeps {
  sourceService: SourceService;
}

export function createSourceRoutes({ sourceService }: SourceRouteDeps) {
  return router()
    .get("/", async (c) => {
      const all = await sourceService.all();
      return c.json(all, 200);
    })
    .get("/:id", zValidator("param", idSchema), async (c) => {
      const id = c.req.param("id");
      const source = await sourceService.get(id);
      if (!source) return c.body(null, 404);
      return c.json(source, 200);
    })
    .post("/", zValidator("json", createSourceSchema), async (c) => {
      const createSourceInput = c.req.valid("json");
      const source = await sourceService.create(createSourceInput);
      if (source.isErr) return c.body(null, 409);
      return c.json(source.data, 201);
    })
    .patch(
      "/:id",
      zValidator("param", idSchema),
      zValidator("json", updateSourceSchema),
      async (c) => {
        const id = c.req.param("id");
        const updateSourceInput = c.req.valid("json");
        const result = await sourceService.update(id, updateSourceInput);
        if (result.isErr) return c.body(null, 409);
        return c.body(null, 204);
      },
    )
    .delete("/:id", zValidator("param", idSchema), async (c) => {
      const id = c.req.param("id");
      const result = await sourceService.delete(id);
      if (result.isErr) return c.body(null, 409);
      return c.body(null, 204);
    });
}
