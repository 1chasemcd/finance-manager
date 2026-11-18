import router from "@/core/router";
import { zValidator } from "@hono/zod-validator";
import { idSchema, searchTransactionsSchema } from "@finapp/schema";
import type { TransactionService } from "./transaction.service";

interface TransactionRouteDeps {
  transactionService: TransactionService;
}

export function createTransactionRoutes({ transactionService }: TransactionRouteDeps) {
  return router()
    .get("/", zValidator("query", searchTransactionsSchema), async (c) => {
      const query = c.req.valid("query");
      const result = await transactionService.search(query);
      return c.json(result, 200);
    })
    .get("/:id", zValidator("param", idSchema), async (c) => {
      const { id } = c.req.valid("param");
      const transaction = await transactionService.get(id);
      if (!transaction) return c.body(null, 404);
      return c.json(transaction, 200);
    });
}
