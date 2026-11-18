import router from "@/core/router";
import { zValidator } from "@hono/zod-validator";
import { writeCategoryRuleSchema, idSchema } from "@finapp/schema";
import type { CategoryRuleService } from "./category-rule.service";
import { match } from "@finapp/result";

interface CategoryRuleRouteDeps {
  categoryRuleService: CategoryRuleService;
}

export function createCategoryRuleRoutes({ categoryRuleService }: CategoryRuleRouteDeps) {
  return router()
    .get("/", async (c) => {
      const all = await categoryRuleService.all();
      return c.json(all, 200);
    })
    .get("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const categoryRule = await categoryRuleService.get(id);
      if (!categoryRule) return c.body(null, 404);
      return c.json(categoryRule, 200);
    })
    .post("/", zValidator("json", writeCategoryRuleSchema), async (c) => {
      const writeCategoryRuleRequest = c.req.valid("json");
      const result = await categoryRuleService.create(writeCategoryRuleRequest);
      return match(result, {
        Ok: (x) => c.json(x, 201),
        Err: c.body(null, 409),
      });
    })
    .put(
      "/:id",
      zValidator("param", idSchema),
      zValidator("json", writeCategoryRuleSchema),
      async (c) => {
        const { id } = c.req.valid("param");
        const writeCategoryRuleRequest = c.req.valid("json");
        const result = await categoryRuleService.update(id, writeCategoryRuleRequest);
        return match(result, {
          Ok: c.body(null, 204),
          NotFound: c.body(null, 404),
          Conflict: c.body(null, 409),
        });
      },
    )
    .delete("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const result = await categoryRuleService.delete(id);
      return match(result, {
        Ok: c.body(null, 204),
        NotFound: c.body(null, 404),
        Conflict: c.body(null, 409),
      });
    });
}
