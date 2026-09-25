import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";

export const MultiplyRequest = z.object({
  number1: z.int(),
  number2: z.int(),
});

type MultiplyRequest = z.infer<typeof MultiplyRequest>;

export const MultiplyResponse = z.object({
  result: z.int(),
});

const app = new Hono()
  .use("*", cors({ origin: "http://localhost:5173" }))
  // .get("/", (c) => {
  //   return c.status(200);
  // })
  .post("/multiply", zValidator("json", MultiplyRequest), async (c) => {
    const body = await c.req.json<MultiplyRequest>();

    const { number1, number2 } = MultiplyRequest.parse(body);

    const response = MultiplyResponse.parse({
      result: number1 * number2,
    });

    return c.json(response);
  });

export type AppType = typeof app;

export default app;
