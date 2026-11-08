import type { FileFormat, FileFormatDetailResponse, FileFormatResponse } from "./file-format.types";
import type { CurrentUser } from "@/identity/current-user";
import { err, type Result } from "@finapp/result";
import type { SourceRepository } from "@/sources/source.repository";
import type { FileFormatRepository } from "./file-format.repository";
import type { WriteFileFormatRequest } from "@finapp/schema";

type NotFound = "NotFound";
type Conflict = "Conflict";

export class FileFormatService {
  constructor(
    private readonly fileFormats: FileFormatRepository,
    private readonly sources: SourceRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  async all(): Promise<FileFormatResponse[]> {
    const currentUser = this.currentUser.require();
    const x = await this.fileFormats.all(currentUser.groupId);
    return x.map(toResponse);
  }

  async get(publicId: string): Promise<FileFormatDetailResponse | undefined> {
    const currentUser = this.currentUser.require();
    const result = await this.fileFormats.byPublicId(currentUser.groupId, publicId);
    return result && { ...toResponse(result), canDelete: await this.canDelete(result.id) };
  }

  async create(request: WriteFileFormatRequest): Promise<Result<FileFormatResponse>> {
    const currentUser = this.currentUser.require();
    const x = await this.fileFormats.create(currentUser.groupId, request);
    return x.map(toResponse);
  }

  async update(
    publicId: string,
    request: WriteFileFormatRequest,
  ): Promise<Result<void, NotFound | Conflict>> {
    const currentUser = this.currentUser.require();
    const toUpdate = await this.fileFormats.byPublicId(currentUser.groupId, publicId);
    if (!toUpdate) return err("NotFound");

    const result = await this.fileFormats.update(currentUser.groupId, toUpdate.id, request);
    if (result.isErr) return err("Conflict");

    return result;
  }

  async delete(publicId: string): Promise<Result<void, NotFound | Conflict>> {
    const currentUser = this.currentUser.require();

    const toDelete = await this.fileFormats.byPublicId(currentUser.groupId, publicId);
    if (!toDelete) return err("NotFound");

    const canDelete = await this.canDelete(toDelete.id);
    if (!canDelete) return err("Conflict");

    const result = await this.fileFormats.delete(currentUser.groupId, toDelete.id);
    if (result.isErr) return err("Conflict");
    return result;
  }

  private async canDelete(id: number): Promise<boolean> {
    const currentUser = this.currentUser.require();
    const assigned = await this.sources.byFileFormat(currentUser.groupId, id);
    return assigned.filter((x) => !x.archived).length === 0;
  }
}

function toResponse(fileFormat: FileFormat): FileFormatResponse {
  const { publicId, ...values } = fileFormat;
  return {
    ...values,
    id: publicId,
  };
}
