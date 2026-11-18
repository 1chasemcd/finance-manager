export interface Category {
  id: number;
  name: string;
  description: string | null;
  archived: boolean;
}

export interface CategoryDetail extends Category {
  canDelete: boolean;
}
