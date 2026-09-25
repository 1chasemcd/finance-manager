import { Hono, TypedResponse } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

const db = drizzle(process.env.DB_FILE_NAME);

export const MultiplyRequest = z.object({
  number1: z.int(),
  number2: z.int(),
});

type MultiplyRequest = z.infer<typeof MultiplyRequest>;

type MultiplyResponse = TypedResponse<{ result: number }, 200>;

const app = new Hono()
  .use("*", cors({ origin: "http://localhost:5173" }))
  .post("/multiply", zValidator("json", MultiplyRequest), (c) => {
    const { number1, number2 } = c.req.valid("json");

    return c.json({
      result: number1 * number2,
    }) as MultiplyResponse;
  });

export type AppType = typeof app;

export default app;
