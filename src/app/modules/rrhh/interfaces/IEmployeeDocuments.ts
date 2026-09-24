export interface IEmployeeDocument {
  id: number;
  employeeId: number;
  documentTypeId: number;
  documentTypeName: string;
  fileName: string;
  blobUrl: string;
  notes: string | null;
  createdAt: string;
}

export interface IEmployeeDocumentCreateRequest {
  documentTypeId: number;
  fileName: string;
  blobUrl: string;
  notes: string | null;
}
