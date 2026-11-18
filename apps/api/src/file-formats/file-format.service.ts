import type { FileFormatDetail, FileFormat } from "./file-format.types";
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

  all(): Promise<FileFormat[]> {
    const { groupId } = this.currentUser.require();
    return this.fileFormats.all(groupId);
  }

  async get(id: number): Promise<FileFormatDetail | undefined> {
    const { groupId } = this.currentUser.require();
    const result = await this.fileFormats.byId(groupId, id);
    return result && { ...result, canDelete: await this.canDelete(result.id) };
  }

  create(request: WriteFileFormatRequest): Promise<Result<FileFormat>> {
    const { groupId } = this.currentUser.require();
    return this.fileFormats.create(groupId, request);
  }

  async update(
    id: number,
    request: WriteFileFormatRequest,
  ): Promise<Result<void, NotFound | Conflict>> {
    const { groupId } = this.currentUser.require();

    const toUpdate = await this.fileFormats.byId(groupId, id);
    if (!toUpdate) return err("NotFound");

    const result = await this.fileFormats.update(groupId, id, request);
    if (result.isErr) return err("Conflict");

    return result;
  }

  async delete(id: number): Promise<Result<void, NotFound | Conflict>> {
    const { groupId } = this.currentUser.require();

    const toDelete = await this.fileFormats.byId(groupId, id);
    if (!toDelete) return err("NotFound");

    const canDelete = await this.canDelete(id);
    if (!canDelete) return err("Conflict");

    const result = await this.fileFormats.delete(groupId, id);
    if (result.isErr) return err("Conflict");
    return result;
  }

  private async canDelete(id: number): Promise<boolean> {
    const currentUser = this.currentUser.require();
    const assigned = await this.sources.byFileFormat(currentUser.groupId, id);
    return assigned.filter((x) => !x.archived).length === 0;
  }
}
