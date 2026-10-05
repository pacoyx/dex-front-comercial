import { ExpenseSourceType } from '../shared/expense-source-type';

export interface IExpense {
  id: number;
  branchSalesId: number;
  branchName: string;
  expenseCategoryId: number;
  categoryName: string;
  sourceType: ExpenseSourceType;
  expenseDate: string;
  amount: number;
  description: string;
  hasSupportingDocument: boolean;
  documentNumber: string | null;
  supplierName: string | null;
  observation: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface IExpenseSummary {
  id: number;
  expenseDate: string;
  branchSalesId: number;
  branchName: string;
  expenseCategoryId: number;
  categoryName: string;
  sourceType: ExpenseSourceType;
  amount: number;
  description: string;
  hasSupportingDocument: boolean;
  documentNumber: string | null;
  supplierName: string | null;
}

export interface ICreateExpenseRequest {
  branchSalesId: number;
  expenseCategoryId: number;
  sourceType: ExpenseSourceType;
  expenseDate: string;
  amount: number;
  description: string;
  hasSupportingDocument: boolean;
  documentNumber?: string | null;
  supplierName?: string | null;
  observation?: string | null;
}

export interface IExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  branchSalesId?: number;
  expenseCategoryId?: number;
  sourceType?: ExpenseSourceType | null;
}
