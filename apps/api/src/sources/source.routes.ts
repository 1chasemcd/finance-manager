import router from "@/core/router";
import type { SourceService } from "./source.service";

interface SourceRouteDeps {
  sourceService: SourceService;
}

export function createSourceRoutes({ sourceService }: SourceRouteDeps) {
  return router().get("/", async (c) => {
    const all = await sourceService.all();
    return c.json(all, 200);
  });
}
