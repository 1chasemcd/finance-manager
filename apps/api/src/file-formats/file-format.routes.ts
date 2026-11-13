import router from "@/core/router";
import { zValidator } from "@hono/zod-validator";
import { writeFileFormatSchema, idSchema } from "@finapp/schema";
import type { FileFormatService } from "./file-format.service";

interface FileFormatRouteDeps {
  fileFormatService: FileFormatService;
}

export function createFileFormatRoutes({ fileFormatService }: FileFormatRouteDeps) {
  return router()
    .get("/", async (c) => {
      const all = await fileFormatService.all();
      return c.json(all, 200);
    })
    .get("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const fileFormat = await fileFormatService.get(id);
      if (!fileFormat) return c.body(null, 404);
      return c.json(fileFormat, 200);
    })
    .post("/", zValidator("json", writeFileFormatSchema), async (c) => {
      const writeFileFormatRequest = c.req.valid("json");
      const result = await fileFormatService.create(writeFileFormatRequest);
      if (result.isErr) return c.body(null, 409);
      return c.json(result.data, 201);
    })
    .put(
      "/:id",
      zValidator("param", idSchema),
      zValidator("json", writeFileFormatSchema),
      async (c) => {
        const { id } = c.req.valid("param");
        const writeFileFormatRequest = c.req.valid("json");
        const result = await fileFormatService.update(id, writeFileFormatRequest);
        if (result.isErr) {
          if (result.error === "NotFound") return c.body(null, 404);
          else return c.body(null, 409);
        }
        return c.body(null, 204);
      },
    )
    .delete("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const result = await fileFormatService.delete(id);
      if (result.isErr) {
        if (result.error === "NotFound") return c.body(null, 404);
        else return c.body(null, 409);
      }
      return c.body(null, 204);
    });
}
