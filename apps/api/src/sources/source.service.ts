import type { Source, SourceDetail } from "./source.types";
import type { CurrentUser } from "@/identity/current-user";
import { err, ok, type Result } from "@finapp/result";
import type { SourceRepository } from "./source.repository";
import type { CreateSourceRequest, UpdateSourceRequest } from "@finapp/schema";

type NotFound = "NotFound";
type Conflict = "Conflict";

export class SourceService {
  constructor(
    private readonly sources: SourceRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  all(): Promise<Source[]> {
    const { groupId } = this.currentUser.require();
    return this.sources.all(groupId);
  }

  async get(id: number): Promise<SourceDetail | undefined> {
    const { groupId } = this.currentUser.require();
    await this.sources.byId(groupId, id);

    const result = await this.sources.byId(groupId, id);
    return result && { ...result, canDelete: this.canDelete(result.id) };
  }

  create(request: CreateSourceRequest): Promise<Result<Source>> {
    const { groupId } = this.currentUser.require();
    return this.sources.create(groupId, request);
  }

  async update(
    id: number,
    request: UpdateSourceRequest,
  ): Promise<Result<void, NotFound | Conflict>> {
    const { groupId } = this.currentUser.require();

    const existing = await this.sources.byId(groupId, id);
    if (!existing) return err("NotFound");

    const result = await this.sources.update(groupId, id, request);
    if (result.isErr) return err("Conflict");

    return ok();
  }

  async delete(id: number): Promise<Result<void, NotFound | Conflict>> {
    const { groupId } = this.currentUser.require();

    const existing = await this.sources.byId(groupId, id);
    if (!existing) return err("NotFound");

    if (!this.canDelete(id)) return err("Conflict");

    const result = await this.sources.delete(groupId, id);
    if (result.isErr) return err("Conflict");

    return ok();
  }

  private canDelete(id: number) {
    return !!id;
  }
}
