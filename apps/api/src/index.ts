import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import "dotenv/config";
export const MultiplyRequest = z.object({
  number1: z.int(),
  number2: z.int(),
});

type MultiplyRequest = z.infer<typeof MultiplyRequest>;

const app = new Hono()
  .use("*", cors({ origin: "http://localhost:5173" }))
  .post("/multiply", zValidator("json", MultiplyRequest), (c) => {
    const { number1, number2 } = c.req.valid("json");

    return c.json({
      result: number1 * number2,
    });
  });

export type AppType = typeof app;

export default { fetch: app.fetch };
