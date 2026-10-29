export interface Source {
  publicId: string;
  name: string;
  description: string | null;
  archived: boolean;
  ownerEmail: string;
  fileFormatPublicId: string | null;
}

export interface CreateSourceInput {
  name: string;
  description?: string | null;
  ownerEmail: string;
  fileFormatPublicId?: string | null;
}

export type UpdateSourceInput = Partial<CreateSourceInput & { archived: boolean }>;
