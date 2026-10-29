import {
  conflict,
  notFound,
  type Conflict,
  type CreateError,
  type NotFound,
  type UpdateError,
} from "@/core/errors";
import type { SourceRepository } from "./source.repository";
import type { CreateSourceInput, Source, UpdateSourceInput } from "./source.types";
import type { CurrentUser } from "@/identity/current-user";
import { ok, type Result } from "@finapp/result";

export class SourceService {
  constructor(
    private readonly sources: SourceRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  async getall(): Promise<Source[]> {
    const currentUser = this.currentUser.require();
    return this.sources.all(currentUser.groupId);
  }

  async get(publicId: string): Promise<Result<Source, NotFound>> {
    const currentUser = this.currentUser.require();
    const result = await this.sources.byPublicId(currentUser.groupId, publicId);
    if (result) return ok(result);
    return notFound("source", publicId);
  }

  create(input: CreateSourceInput): Promise<Result<Source, CreateError>> {
    const currentUser = this.currentUser.require();
    return this.sources.create(currentUser.groupId, input);
  }

  update(publicId: string, input: UpdateSourceInput): Promise<Result<void, UpdateError>> {
    const currentUser = this.currentUser.require();
    return this.sources.update(currentUser.groupId, publicId, input);
  }

  async delete(publicId: string): Promise<Result<void, NotFound | Conflict>> {
    // if (!this.canDelete(publicId))
    //   return conflict("Cannot delete source when dependent transactions exist.");

    const currentUser = this.currentUser.require();
    const result = await this.sources.delete(currentUser.groupId, publicId);
    if (result.isOk) return ok();

    const existing = await this.sources.byPublicId(currentUser.groupId, publicId);
    if (!existing) return notFound("source", publicId);
    return conflict();
  }
}
