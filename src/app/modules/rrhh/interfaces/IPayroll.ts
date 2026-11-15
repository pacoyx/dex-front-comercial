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
  /** Trabajadores ad honorem omitidos (no se les genera planilla). */
  adHonoremSkippedCount: number;
  totalNetAmount: number;
  payrolls: IPayrollSummary[];
}

export interface IPayrollDiscount {
  id: number;
  payrollPeriodId: number;
  employeeId: number;
  employeeName: string;
  description: string;
  amount: number;
  created: string;
  createdBy: string | null;
}

export interface IPayrollDiscountCreateRequest {
  employeeId: number;
  description: string;
  amount: number;
}

export interface IPayrollDiscountChangeResponse {
  discount: IPayrollDiscount | null;
  /** Planilla recalculada del trabajador; null si aún no se generó (el descuento se aplicará al generarla). */
  payroll: IPayrollSummary | null;
}

export interface IDeletePayrollResponse {
  payrollPeriodId: number;
  deletedPayrolls: number;
  revertedInstallments: number;
  reopenedLoans: number;
}
