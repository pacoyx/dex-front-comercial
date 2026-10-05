export interface IExpenseAttachment {
  id: number;
  expenseId: number;
  fileName: string;
  originalFileName: string;
  blobUrl: string;
  createdAt: string;
}

export interface ICreateExpenseAttachmentRequest {
  fileName: string;
  originalFileName: string;
  blobUrl: string;
}
