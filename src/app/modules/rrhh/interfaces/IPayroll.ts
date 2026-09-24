export interface IPayrollPeriod {
  id: number;
  name: string;
  frequency: number;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface IPayrollPeriodCreateRequest {
  name: string;
  frequency: number;
  startDate: string;
  endDate: string;
}

export interface IPayrollDetailConcept {
  conceptType: number;
  description: string;
  amount: number;
}

export interface IPayrollSummary {
  id: number;
  employeeId: number;
  employeeName: string;
  grossAmount: number;
  discounts: number;
  netAmount: number;
  generatedAt: string;
  details: IPayrollDetailConcept[];
}

export interface IGeneratePayrollResponse {
  payrollPeriodId: number;
  generatedCount: number;
  skippedCount: number;
  totalNetAmount: number;
  payrolls: IPayrollSummary[];
}
