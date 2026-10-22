export enum InvoiceReminderLogStatus {
  Sent = 0,
  Failed = 1,
  Skipped = 2,
}

export interface IInvoiceReminderPreview {
  subject: string;
  body: string;
}

export interface ISendTestInvoiceReminderRequest {
  customerId: number;
  testEmail: string;
}

export interface IInvoiceReminderLogDetail {
  invoiceId: number;
  documentNumber: string;
  balance: number;
  daysOverdue: number;
}

export interface IInvoiceReminderLog {
  id: number;
  customerId: number;
  customerName: string;
  runAt: string;
  status: InvoiceReminderLogStatus;
  skipReason: string | null;
  errorMessage: string | null;
  recipients: string;
  invoiceCount: number;
  totalAmount: number;
  createdAt: string;
  details: IInvoiceReminderLogDetail[];
}

export interface IInvoiceReminderLogFilters {
  customerId?: number;
  fromDate?: string;
  toDate?: string;
  status?: InvoiceReminderLogStatus;
}
