export interface IEmergencyContact {
  id?: number;
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface IBankAccount {
  id?: number;
  bankName: string;
  accountNumber: string;
  cci: string | null;
}

export interface IEmployeeCreateRequest {
  code: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string | null;
  birthDate: string;
  hireDate: string;
  areaId: number;
  positionId: number;
  contractType: number;
  baseSalary: number;
  emergencyContacts: IEmergencyContact[] | null;
  bankAccounts: IBankAccount[] | null;
}

export interface IEmployeeUpdateRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string | null;
  areaId: number;
  positionId: number;
  contractType: number;
  baseSalary: number;
}

export interface IEmployeeTerminateRequest {
  terminationDate: string;
  observation: string | null;
}

export interface IEmployeeResponse {
  id: number;
  code: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string | null;
  birthDate: string;
  hireDate: string;
  terminationDate: string | null;
  isActive: boolean;
  areaId: number;
  areaName: string;
  positionId: number;
  positionName: string;
  contractType: number;
  baseSalary: number;
}

export interface IEmployeeListItem {
  id: number;
  code: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  hireDate: string;
  isActive: boolean;
  areaId: number;
  areaName: string;
  positionId: number;
  positionName: string;
  contractType: number;
  baseSalary: number;
}

export interface IEmployeeListResponse {
  employees: IEmployeeListItem[];
  totalCount: number;
}

export interface IEmployeeListFilters {
  pageNumber?: number;
  pageSize?: number;
  onlyActive?: boolean;
  areaId?: number;
  search?: string;
}

export interface IEmployeeDetail {
  id: number;
  code: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string | null;
  birthDate: string;
  hireDate: string;
  terminationDate: string | null;
  isActive: boolean;
  areaId: number;
  areaName: string;
  positionId: number;
  positionName: string;
  contractType: number;
  baseSalary: number;
  emergencyContacts: IEmergencyContact[];
  bankAccounts: IBankAccount[];
}
