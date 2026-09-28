import { zValidator } from "@hono/zod-validator";
import z from "zod";

export const idValidator = zValidator(
  "param",
  z.object({
    id: z.coerce.number().int().positive(),
  }),
);
