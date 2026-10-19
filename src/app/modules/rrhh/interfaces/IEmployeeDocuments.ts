export interface IEmployeeDocument {
  id: number;
  employeeId: number;
  documentTypeId: number;
  documentTypeName: string;
  fileName: string;
  blobUrl: string;
  contentType: string;
  notes: string | null;
  createdAt: string;
}

export interface IEmployeeDocumentCreateRequest {
  documentTypeId: number;
  notes: string | null;
  file: File;
}
