export type InvoiceStatusString = 'Draft' | 'Issued' | 'PartiallyPaid' | 'Paid' | 'Cancelled';

export interface IInvoiceDashboardSummary {
  monthInvoiced: number;
  monthCollected: number;
  accountsReceivable: number;
  invoiceCount: number;
}

export interface IInvoiceMonthlySales {
  month: string;
  amount: number;
}

export interface IInvoiceStatusSummary {
  status: InvoiceStatusString;
  count: number;
}

export interface IInvoiceAccountReceivableTop {
  invoiceId: number;
  customerName: string;
  documentNumber: string;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatusString;
  daysPastDue: number;
}

export interface IOverdueInvoice {
  invoiceId: number;
  documentNumber: string;
  customerName: string;
  balance: number;
  daysPastDue: number;
}

export interface ITopCustomer {
  customerId: number;
  customerName: string;
  totalInvoiced: number;
}

export interface IRecentInvoice {
  invoiceId: number;
  issueDate: string;
  customerName: string;
  documentNumber: string;
  total: number;
  status: InvoiceStatusString;
}

export interface ICustomerSalesItem {
  customerName: string;
  amount: number;
}

export interface ICustomerSalesFilters {
  dateFrom?: string;
  dateTo?: string;
}

export interface IBranchSalesItem {
  branchName: string;
  amount: number;
}

export interface IServiceSalesItem {
  serviceName: string;
  amount: number;
}
