export interface ILoan {
  id: number;
  employeeId: number;
  employeeName: string;
  loanType: number;
  loanDate: string;
  amount: number;
  balance: number;
  observation: string | null;
  isClosed: boolean;
}

export interface ILoanCreateRequest {
  loanDate: string;
  amount: number;
  observation: string | null;
}

export interface ILoanListFilters {
  employeeId?: number;
  loanType?: number;
  isClosed?: boolean;
}
