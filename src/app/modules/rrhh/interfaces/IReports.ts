export interface IPayrollReportItem {
  payrollId: number;
  payrollPeriodId: number;
  payrollPeriodName: string;
  employeeId: number;
  employeeName: string;
  grossAmount: number;
  discounts: number;
  netAmount: number;
  generatedAt: string;
}

export interface IPayrollReportFilters {
  employeeId?: number;
  payrollPeriodId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ILoanReportItem {
  id: number;
  employeeId: number;
  employeeName: string;
  loanDate: string;
  amount: number;
  balance: number;
  isClosed: boolean;
  observation: string | null;
}

export interface ILoanReportFilters {
  employeeId?: number;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean;
}

export interface IAttendanceReportFilters {
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

export interface IExtraHourReportFilters {
  employeeId?: number;
  approved?: boolean;
  startDate?: string;
  endDate?: string;
}
