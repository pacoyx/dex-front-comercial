export interface ILoanInstallment {
  id: number;
  installmentNumber: number;
  amount: number;
  isPaid: boolean;
  payrollId: number | null;
  payrollPeriodId: number | null;
  payrollPeriodName: string | null;
  paidAt: string | null;
}

export interface ILoan {
  id: number;
  employeeId: number;
  employeeName: string;
  loanType: number;
  loanDate: string;
  amount: number;
  balance: number;
  observation: string | null;
  installmentCount: number;
  paidInstallments: number;
  isClosed: boolean;
  installments: ILoanInstallment[];
}

export interface ILoanCreateRequest {
  loanDate: string;
  amount: number;
  observation: string | null;
  installmentCount: number;
}

export interface ILoanDeleteResponse {
  id: number;
  deletedInstallments: number;
}

export interface ILoanListFilters {
  employeeId?: number;
  loanType?: number;
  isClosed?: boolean;
}
