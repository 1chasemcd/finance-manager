import type { FileFormat } from "@/file-formats/file-format.types";
import type { User } from "@/users/user.types";

export interface Source {
  id: number;
  publicId: string;
  name: string;
  description: string | null;
  archived: boolean;
  ownerId: number;
  fileFormatId: number | null;
}

export interface SourceDetail {
  id: number;
  publicId: string;
  name: string;
  description: string | null;
  archived: boolean;
  owner: User;
  fileFormat: FileFormat | null;
}

export interface CreateSourceInput {
  name: string;
  description?: string | null | undefined;
  ownerId: number;
  fileFormatId?: number | null | undefined;
}

export interface UpdateSourceInput extends CreateSourceInput {
  archived: boolean;
}

export interface SourceResponse {
  id: string;
  name: string;
  description: string | null;
  archived: boolean;
}

export interface SourceDetailResponse {
  id: string;
  name: string;
  description: string | null;
  archived: boolean;
  canDelete: boolean;
  ownerEmail: string;
  fileFormatId: string | null;
}
