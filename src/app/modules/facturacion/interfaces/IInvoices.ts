export interface IInvoiceDetailLineRequest {
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface IInvoiceCreateRequest {
  customerId: number;
  branchId: number;
  documentTypeId: number;
  serie: string;
  numero: string;
  issueDate: string;
  dueDate: string;
  currencyId: string;
  exchangeRate: number;
  paymentMethod: string;
  typePayment: string;
  daysCredit: number;
  notes?: string;
  details: IInvoiceDetailLineRequest[];
}

export interface IInvoiceCreateResponse {
  id: number;
  serie: string;
  numero: string;
  subTotal: number;
  igv: number;
  total: number;
  currencyId: string;
  exchangeRate: number;
  paymentMethod: string;
  typePayment: string;
  daysCredit: number;
  status: number;
}

export interface IInvoiceDetailLine {
  id: number;
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface IInvoicePayment {
  id: number;
  invoiceId: number;
  paymentMethodId: number;
  paymentMethodName: string;
  paymentDate: string;
  amount: number;
  operationNumber: string;
  observation: string;
  collectionSheetId: number | null;
}

export interface IInvoiceDetail {
  id: number;
  customerId: number;
  customerName: string;
  branchId: number;
  documentTypeId: number;
  serie: string;
  numero: string;
  issueDate: string;
  dueDate: string;
  subTotal: number;
  igv: number;
  total: number;
  currencyId: string;
  exchangeRate: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  typePayment: string;
  daysCredit: number;
  status: number;
  notes: string;
  details: IInvoiceDetailLine[];
  payments: IInvoicePayment[];
}

export interface IInvoiceListItem {
  id: number;
  customerId: number;
  customerName: string;
  serie: string;
  numero: string;
  issueDate: string;
  dueDate: string;
  total: number;
  currencyId: string;
  exchangeRate: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  typePayment: string;
  daysCredit: number;
  status: number;
}

export interface IInvoiceListFilters {
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: number;
}

export interface IInvoiceCancelResponse {
  id: number;
  status: number;
}

export interface IPaymentCreateRequest {
  paymentMethodId: number;
  amount: number;
  operationNumber?: string;
  observation?: string;
}

export interface IInvoiceStoreDetailLine {
  item: number;
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}
