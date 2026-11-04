import type { SourceRepository } from "./source.repository";
import type { CreateSourceInput, Source, SourceDetail, UpdateSourceInput } from "./source.types";
import type { CurrentUser } from "@/identity/current-user";
import { err, type Result } from "@finapp/result";

export class SourceService {
  constructor(
    private readonly sources: SourceRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  async all(): Promise<Source[]> {
    const currentUser = this.currentUser.require();
    return this.sources.all(currentUser.groupId);
  }

  async get(publicId: string): Promise<SourceDetail | null> {
    const currentUser = this.currentUser.require();
    const result = await this.sources.byPublicId(currentUser.groupId, publicId);
    return result && { ...result, canDelete: this.canDelete(publicId) };
  }

  create(input: CreateSourceInput): Promise<Result<Source>> {
    const currentUser = this.currentUser.require();
    return this.sources.create(currentUser.groupId, input);
  }

  update(publicId: string, input: UpdateSourceInput): Promise<Result> {
    const currentUser = this.currentUser.require();
    return this.sources.update(currentUser.groupId, publicId, input);
  }

  delete(publicId: string): Promise<Result> {
    if (!this.canDelete(publicId)) return Promise.resolve(err());

    const currentUser = this.currentUser.require();
    return this.sources.delete(currentUser.groupId, publicId);
  }

  private canDelete(publicId: string) {
    return !!publicId;
  }
}
