export interface Source {
  id: number;
  name: string;
  description: string | null;
  archived: boolean;
  ownerId: number;
  fileFormatId: number | null;
}

export interface SourceDetail {
  id: number;
  name: string;
  description: string | null;
  archived: boolean;
  ownerId: number;
  fileFormatId: number | null;
  canDelete: boolean;
}
