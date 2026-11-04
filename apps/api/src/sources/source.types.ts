export interface Source {
  publicId: string;
  name: string;
  description: string | null;
  archived: boolean;
  ownerEmail: string;
  fileFormatPublicId: string | null;
}

export interface SourceDetail extends Source {
  canDelete: boolean;
}
