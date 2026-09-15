export interface IAccountReceivable {
  customerId: number;
  customerName: string;
  invoiceId: number;
  serie: string;
  numero: string;
  total: number;
  amountPaid: number;
  balance: number;
  status: number;
  overdueDays: number;
}
