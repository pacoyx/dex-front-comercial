export interface IPurchaseDashboardSummary {
  monthPurchases: number;
  accountsPayable: number;
  purchaseCount: number;
  activeSuppliers: number;
}

export interface IPurchaseMonthlyPurchase {
  month: string;
  amount: number;
}

export interface IPurchaseTopProduct {
  productName: string;
  quantity: number;
}

export interface IPurchaseRecentPurchase {
  id: number;
  supplierName: string;
  documentNumber: string;
  invoiceIssueDate: string;
  total: number;
  paymentStatus: number;
}
