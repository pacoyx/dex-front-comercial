export interface IAccountPayable {
  supplierId: number;
  supplierName: string;
  purchaseInvoiceId: number;
  documentNumber: string;
  total: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  status: number;
  overdueDays: number;
}
