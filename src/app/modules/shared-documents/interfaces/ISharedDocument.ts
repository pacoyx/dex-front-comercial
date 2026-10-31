export interface ISharedDocumentRecipient {
  userId: number;
  userName: string;
}

export interface ISharedDocument {
  id: number;
  title: string;
  category: string;
  notes: string | null;
  fileName: string;
  contentType: string;
  createdAt: string;
  uploadedByUserId: number;
  uploadedByUserName: string;
  recipients: ISharedDocumentRecipient[];
}

export interface ICreateSharedDocumentRequest {
  title: string;
  category: string;
  notes?: string;
  file: File;
  recipientUserIds: number[];
}
