import router from "@/core/router";
import type { SourceService } from "./source.service";
import { zValidator } from "@hono/zod-validator";
import { createSourceSchema, idSchema, updateSourceSchema } from "@finapp/schema";
import { match } from "@finapp/result";

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
      const { id } = c.req.valid("param");
      const source = await sourceService.get(id);
      if (!source) return c.body(null, 404);
      return c.json(source, 200);
    })
    .post("/", zValidator("json", createSourceSchema), async (c) => {
      const createSourceInput = c.req.valid("json");
      const result = await sourceService.create(createSourceInput);
      return match(result, {
        Ok: (x) => c.json(x, 201),
        Err: c.body(null, 409),
      });
    })
    .patch(
      "/:id",
      zValidator("param", idSchema),
      zValidator("json", updateSourceSchema),
      async (c) => {
        const { id } = c.req.valid("param");
        const updateSourceInput = c.req.valid("json");
        const result = await sourceService.update(id, updateSourceInput);
        return match(result, {
          Ok: c.body(null, 204),
          NotFound: c.body(null, 404),
          Conflict: c.body(null, 409),
        });
      },
    )
    .delete("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const result = await sourceService.delete(id);
      return match(result, {
        Ok: c.body(null, 204),
        NotFound: c.body(null, 404),
        Conflict: c.body(null, 409),
      });
    });
}
