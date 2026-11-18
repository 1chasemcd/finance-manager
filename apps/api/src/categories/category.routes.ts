import router from "@/core/router";
import { zValidator } from "@hono/zod-validator";
import { createCategorySchema, idSchema, updateCategorySchema } from "@finapp/schema";
import type { CategoryService } from "./category.service";
import { match } from "@finapp/result";

interface CategoryRouteDeps {
  categoryService: CategoryService;
}

export function createCategoryRoutes({ categoryService }: CategoryRouteDeps) {
  return router()
    .get("/", async (c) => {
      const all = await categoryService.all();
      return c.json(all, 200);
    })
    .get("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const category = await categoryService.get(id);
      if (!category) return c.body(null, 404);
      return c.json(category, 200);
    })
    .post("/", zValidator("json", createCategorySchema), async (c) => {
      const createCategoryRequest = c.req.valid("json");
      const result = await categoryService.create(createCategoryRequest);
      return match(result, {
        Ok: (x) => c.json(x, 201),
        Err: c.body(null, 409),
      });
    })
    .put(
      "/:id",
      zValidator("param", idSchema),
      zValidator("json", updateCategorySchema),
      async (c) => {
        const { id } = c.req.valid("param");
        const updateCategoryRequest = c.req.valid("json");
        const result = await categoryService.update(id, updateCategoryRequest);
        return match(result, {
          Ok: c.body(null, 204),
          NotFound: c.body(null, 404),
          Conflict: c.body(null, 409),
        });
      },
    )
    .delete("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const result = await categoryService.delete(id);
      return match(result, {
        Ok: c.body(null, 204),
        NotFound: c.body(null, 404),
        Conflict: c.body(null, 409),
      });
    });
}
