import router from "@/core/router";
import { zValidator } from "@hono/zod-validator";
import { writeFileFormatSchema, idSchema } from "@finapp/schema";
import type { FileFormatService } from "./file-format.service";
import { match } from "@finapp/result";

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
      return match(result, {
        Ok: (x) => c.json(x, 201),
        Err: c.body(null, 409),
      });
    })
    .put(
      "/:id",
      zValidator("param", idSchema),
      zValidator("json", writeFileFormatSchema),
      async (c) => {
        const { id } = c.req.valid("param");
        const writeFileFormatRequest = c.req.valid("json");
        const result = await fileFormatService.update(id, writeFileFormatRequest);
        return match(result, {
          Ok: c.body(null, 204),
          NotFound: c.body(null, 404),
          Conflict: c.body(null, 409),
        });
      },
    )
    .delete("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const result = await fileFormatService.delete(id);
      return match(result, {
        Ok: c.body(null, 204),
        NotFound: c.body(null, 404),
        Conflict: c.body(null, 409),
      });
    });
}
