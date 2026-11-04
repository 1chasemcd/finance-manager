import type { CreateFileFormatInput, UpdateFileFormatInput } from "@finapp/schema";
import type { FileFormat, FileFormatDetail } from "./file-format.types";
import type { CurrentUser } from "@/identity/current-user";
import { err, type Result } from "@finapp/result";
import type { SourceRepository } from "@/sources/source.repository";
import type { FileFormatRepository } from "./file-format.repository";

export class FileFormatService {
  constructor(
    private readonly fileFormats: FileFormatRepository,
    private readonly sources: SourceRepository,
    private readonly currentUser: CurrentUser,
  ) {}

  async all(): Promise<FileFormat[]> {
    const currentUser = this.currentUser.require();
    return this.fileFormats.all(currentUser.groupId);
  }

  async get(publicId: string): Promise<FileFormatDetail | null> {
    const currentUser = this.currentUser.require();
    const result = await this.fileFormats.get(currentUser.groupId, publicId);
    return result && { ...result, canDelete: await this.canDelete(publicId) };
  }

  create(input: CreateFileFormatInput): Promise<Result<FileFormat>> {
    const currentUser = this.currentUser.require();
    return this.fileFormats.create(currentUser.groupId, input);
  }

  update(publicId: string, input: UpdateFileFormatInput): Promise<Result> {
    const currentUser = this.currentUser.require();
    return this.fileFormats.update(currentUser.groupId, publicId, input);
  }

  async delete(publicId: string): Promise<Result> {
    const canDelete = await this.canDelete(publicId);
    if (!canDelete) return err();

    const currentUser = this.currentUser.require();
    return this.fileFormats.delete(currentUser.groupId, publicId);
  }

  private async canDelete(publicId: string): Promise<boolean> {
    const currentUser = this.currentUser.require();
    const assigned = await this.sources.getByFileFormat(currentUser.groupId, publicId);
    return assigned.filter((x) => !x.archived).length === 0;
  }
}
