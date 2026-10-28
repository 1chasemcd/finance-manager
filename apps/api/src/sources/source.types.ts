export interface Source {
  publicId: string;
  name: string;
  description: string | null;
  archived: boolean;
  ownerEmail: string;
  fileFormatPublicId: string;
}

export interface CreateSourceInput {
  name: string;
  description: string;
  ownerEmail: string;
  fileFormatPublicId: string;
}

export type UpdateSourceInput = Partial<CreateSourceInput & { archived: boolean }>;
