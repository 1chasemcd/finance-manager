import { Hono } from "hono";

export default function router() {
  return new Hono<{ Bindings: Cloudflare.Env }>();
}
