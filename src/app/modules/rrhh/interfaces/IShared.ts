export interface IResponseGeneric<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
  errors: string[];
}

export enum EmployeeContractType {
  Weekly = 1,
  Biweekly = 2,
  Monthly = 3,
  Payroll = 4,
  Services = 5,
}

export enum AttendanceIncidentType {
  Absence = 1,
  LateArrival = 2,
  Permission = 3,
  MedicalLeave = 4,
  Vacation = 5,
}

export enum LoanType {
  Loan = 1,
  SalaryAdvance = 2,
}

export enum PayrollFrequency {
  Biweekly = 1,
  Monthly = 2,
}

export enum PayrollConceptType {
  BaseSalary = 1,
  ExtraHours = 2,
  Bonus = 3,
  LoanDiscount = 4,
  AdvanceDiscount = 5,
  AbsenceDiscount = 6,
  LateArrivalDiscount = 7,
}
