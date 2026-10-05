export interface IExpenseCategory {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface ICreateExpenseCategoryRequest {
  name: string;
}

export interface IUpdateExpenseCategoryRequest {
  name: string;
  isActive: boolean;
}
