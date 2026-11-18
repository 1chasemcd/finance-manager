export interface Source {
  id: number;
  name: string;
  description: string | null;
  archived: boolean;
  ownerId: number;
  fileFormatId: number | null;
}

export interface SourceDetail extends Source {
  canDelete: boolean;
}
