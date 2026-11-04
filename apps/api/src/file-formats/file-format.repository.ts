import type { DefaultRepository } from "@/core/types";
import type { FileFormat } from "./file-format.types";
import type { CreateFileFormatInput, UpdateFileFormatInput } from "@finapp/schema";

export type FileFormatRepository = DefaultRepository<
  FileFormat,
  CreateFileFormatInput,
  UpdateFileFormatInput
>;
