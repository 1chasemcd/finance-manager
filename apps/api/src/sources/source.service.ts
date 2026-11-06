import type { Source, SourceDetailResponse, SourceResponse } from "./source.types";
import type { CurrentUser } from "@/identity/current-user";
import { err, ok, type Result } from "@finapp/result";
import type { SourceRepository } from "./source.repository";
import type { CreateSourceRequest, UpdateSourceRequest } from "@finapp/schema";
import type { UserRepository } from "@/users/user.repository";
import type { FileFormatRepository } from "@/file-formats/file-format.repository";

type NotFound = "NotFound";
type Conflict = "Conflict";

export class SourceService {
  constructor(
    private readonly sources: SourceRepository,
    private readonly users: UserRepository,
    private readonly fileFormats: FileFormatRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  async all(): Promise<SourceResponse[]> {
    const groupId = this.currentUser.require().groupId;
    const result = await this.sources.all(groupId);
    return result.map(toResponse);
  }

  async get(publicId: string): Promise<SourceDetailResponse | undefined> {
    const groupId = this.currentUser.require().groupId;
    const result = await this.sources.byPublicId(groupId, publicId);
    return (
      result && {
        id: result.publicId,
        name: result.name,
        description: result.description,
        archived: result.archived,
        ownerEmail: result.owner.email,
        fileFormatPublicId: result.fileFormat?.publicId ?? null,
        canDelete: this.canDelete(result.id),
      }
    );
  }

  async create(request: CreateSourceRequest): Promise<Result<SourceResponse, NotFound | Conflict>> {
    const groupId = this.currentUser.require().groupId;

    const relations = await this.loadRelations(request);
    if (relations.isErr) return relations;

    const result = await this.sources.create(groupId, { ...request, ...relations.data });
    if (result.isErr) return err("Conflict");

    return result.map(toResponse);
  }

  async update(
    publicId: string,
    request: UpdateSourceRequest,
  ): Promise<Result<void, NotFound | Conflict>> {
    const groupId = this.currentUser.require().groupId;

    const toUpdate = await this.sources.byPublicId(groupId, publicId);
    if (!toUpdate) return err("NotFound");

    const relations = await this.loadRelations(request);
    if (relations.isErr) return relations;

    const result = await this.sources.update(groupId, toUpdate.id, {
      ...request,
      ...relations.data,
    });

    if (result.isErr) return err("Conflict");
    return result;
  }

  async delete(publicId: string): Promise<Result<void, NotFound | Conflict>> {
    const currentUser = this.currentUser.require();

    const toDelete = await this.sources.byPublicId(currentUser.groupId, publicId);
    if (!toDelete) return err("NotFound");
    if (!this.canDelete(toDelete.id)) return err("Conflict");

    const result = await this.sources.delete(currentUser.groupId, toDelete.id);
    if (result.isErr) return err("Conflict");
    return result;
  }

  private canDelete(id: number) {
    return !!id;
  }

  private async loadRelations(request: {
    ownerEmail: string;
    fileFormatId?: string | null | undefined;
  }): Promise<Result<{ ownerId: number; fileFormatId: number | null }, NotFound>> {
    const groupId = this.currentUser.require().groupId;

    const ownerId = (await this.users.byGroupAndEmail(groupId, request.ownerEmail))?.id;
    if (!ownerId) return err("NotFound");

    let fileFormatId = null;
    if (request.fileFormatId != null) {
      fileFormatId = (await this.fileFormats.byPublicId(groupId, request.fileFormatId))?.id;
      if (!fileFormatId) return err("NotFound");
    }

    return ok({ ownerId, fileFormatId });
  }
}

function toResponse(source: Source): SourceResponse {
  const { id: _x, publicId, ...values } = source;
  return {
    ...values,
    id: publicId,
  };
}
