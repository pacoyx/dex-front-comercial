import { IPurchaseInvoicePayment } from './IOperaciones';

export interface IFacturasPorParamsResponse {
  invoices: IFacturasPorParamsList[];
  totalCount: number;
}

export interface IFacturasPorParamsList {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierRuc: string;
  invoiceType: string;
  invoiceSerie: string;
  invoiceNumber: string;
  invoiceIssueDate: string;
  invoiceExpirationDate: string;
  typePayment: string;
  daysCredit: number;
  paymentMethod: string;
  subtotal: number;
  igv: number;
  total: number;
  status: string;
  currencyId: string;
  exchangeRate: number;
  comments: string;
  details: Detail[];
}

interface Detail {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  comments: string;
}




export interface IListInvoiceByIdResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierRuc: string;
  invoiceType: string;
  invoiceSerie: string;
  invoiceNumber: string;
  invoiceIssueDate: string;
  invoiceExpirationDate: string;
  typePayment: string;
  daysCredit: number;
  paymentMethod: string;
  subtotal: number;
  igv: number;
  total: number;
  status: string;
  amountPaid: number;
  balance: number;
  paymentStatus: number;
  currencyId: string;
  exchangeRate: number;
  comments: string;
  purchaseInvoiceDetails: IListInvoiceByIdDetail[];
  payments: IPurchaseInvoicePayment[];
  purchaseDate: string;
}

export interface IListInvoiceByIdDetail {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  comments: string;
}

export interface IPurchaseRegisterFilters {
  fromDate: string;
  toDate: string;
  supplierId?: number;
  status?: number;
}

export interface IPurchaseRegisterRow {
  invoiceId: number;
  issueDate: string;
  supplierName: string;
  supplierRuc: string;
  serieNumero: string;
  subTotal: number;
  igv: number;
  total: number;
  currencyId: string;
  exchangeRate: number;
  amountPaid: number;
  balance: number;
  status: string;
}

export interface IPurchaseRegisterTotals {
  cantidadDocumentos: number;
  totalCompras: number;
  totalPagado: number;
  totalPendiente: number;
}

export interface IPurchaseRegisterResponse {
  rows: IPurchaseRegisterRow[];
  totals: IPurchaseRegisterTotals;
}