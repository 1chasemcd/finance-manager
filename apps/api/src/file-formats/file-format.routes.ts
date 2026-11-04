import router from "@/core/router";
import { zValidator } from "@hono/zod-validator";
import { createFileFormatSchema, idSchema, updateFileFormatSchema } from "@finapp/schema";
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
      const id = c.req.param("id");
      const fileFormat = await fileFormatService.get(id);
      if (!fileFormat) return c.body(null, 404);
      return c.json(fileFormat, 200);
    })
    .post("/", zValidator("json", createFileFormatSchema), async (c) => {
      const createFileFormatInput = c.req.valid("json");
      const fileFormat = await fileFormatService.create(createFileFormatInput);
      if (fileFormat.isErr) return c.body(null, 409);
      return c.json(fileFormat.data, 201);
    })
    .patch(
      "/:id",
      zValidator("param", idSchema),
      zValidator("json", updateFileFormatSchema),
      async (c) => {
        const id = c.req.param("id");
        const updateFileFormatInput = c.req.valid("json");
        const result = await fileFormatService.update(id, updateFileFormatInput);
        if (result.isErr) return c.body(null, 409);
        return c.body(null, 204);
      },
    )
    .delete("/:id", zValidator("param", idSchema), async (c) => {
      const id = c.req.param("id");
      const result = await fileFormatService.delete(id);
      if (result.isErr) return c.body(null, 409);
      return c.body(null, 204);
    });
}
