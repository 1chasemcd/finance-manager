import { Hono } from "hono";
import type { CloudflareEnv } from "@/types/cloudflare-env";

export default function router() {
  return new Hono<{ Bindings: CloudflareEnv }>();
}
