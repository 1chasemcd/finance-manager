export interface FileFormat {
  id: number;
  publicId: string;
  name: string;
  skipRows: number;
  rowPattern: string | null;
  dateIndex: number;
  summaryIndex: number;
  amountIndex: number;
  dateFormat: string | null;
  positiveIsSpending: boolean;
}

export interface WriteFileFormatInput {
  name: string;
  skipRows: number;
  rowPattern?: string | null | undefined;
  dateIndex: number;
  summaryIndex: number;
  amountIndex: number;
  dateFormat?: string | null | undefined;
  positiveIsSpending: boolean;
}

export interface FileFormatResponse {
  id: string;
  name: string;
  skipRows: number;
  rowPattern: string | null;
  dateIndex: number;
  summaryIndex: number;
  amountIndex: number;
  dateFormat: string | null;
  positiveIsSpending: boolean;
}

export interface FileFormatDetailResponse extends FileFormatResponse {
  canDelete: boolean;
}
