import { ExpenseSourceType } from '../shared/expense-source-type';

export interface IExpenseReportFilters {
  fromDate: string;
  toDate: string;
  branchSalesId?: number | null;
  expenseCategoryId?: number | null;
  sourceType?: ExpenseSourceType | null;
}

export interface IExpenseDetailRow {
  id: number;
  expenseDate: string;
  branchName: string;
  categoryName: string;
  sourceType: string;
  amount: number;
  description: string;
  hasSupportingDocument: boolean;
  documentNumber: string | null;
  supplierName: string | null;
}

export interface IExpenseAggregateRow {
  label: string;
  count: number;
  amount: number;
}

export interface IExpenseReportTotals {
  count: number;
  totalAmount: number;
}

export interface IExpenseDetailReportResponse {
  rows: IExpenseDetailRow[];
  totals: IExpenseReportTotals;
}

export interface IExpenseAggregateReportResponse {
  rows: IExpenseAggregateRow[];
  totals: IExpenseReportTotals;
}
