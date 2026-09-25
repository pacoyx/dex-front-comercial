export interface ISalesRegisterFilters {
  fromDate: string;
  toDate: string;
  branchId?: number;
  customerId?: number;
  status?: string;
}

export interface ISalesRegisterRow {
  invoiceId: number;
  issueDate: string;
  customerName: string;
  serieNumero: string;
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
  status: string;
}

export interface ISalesRegisterTotals {
  cantidadDocumentos: number;
  totalVentas: number;
  totalCobrado: number;
  totalPendiente: number;
}

export interface ISalesRegisterResponse {
  rows: ISalesRegisterRow[];
  totals: ISalesRegisterTotals;
}
