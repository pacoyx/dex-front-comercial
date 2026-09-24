export interface IHrDashboardSummary {
  activeEmployees: number;
  monthlyPayrollCost: number;
  pendingLoans: number;
  extraHoursMonth: number;
}

export interface IEmployeesByArea {
  areaId: number;
  areaName: string;
  employeeCount: number;
}

export interface IPendingLoanItem {
  id: number;
  employeeId: number;
  employeeName: string;
  loanType: number;
  loanDate: string;
  amount: number;
  balance: number;
}

export interface IUpcomingBirthday {
  employeeId: number;
  employeeName: string;
  birthDate: string;
  daysUntilBirthday: number;
}
