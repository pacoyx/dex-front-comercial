export interface IExpenseDashboardSummary {
  currentMonthExpenses: number;
  currentMonthOperational: number;
  currentMonthAdministrative: number;
  expenseCount: number;
}

export interface IExpenseByCategory {
  category: string;
  amount: number;
}

export interface IExpenseByBranch {
  branch: string;
  amount: number;
}

export interface IExpenseMonthlyTrend {
  month: string;
  amount: number;
}

export interface IExpenseRecentOrTop {
  id: number;
  expenseDate: string;
  branchName: string;
  categoryName: string;
  amount: number;
  description: string;
}
