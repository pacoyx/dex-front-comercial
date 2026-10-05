export enum CustomerType {
  Individual = 1,
  Company = 2,
}

export const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: CustomerType.Individual, label: 'Individual' },
  { value: CustomerType.Company, label: 'Empresa' },
];

export interface ICustomer {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  docPersonal: string;
  status: string;
  customerType: CustomerType;
  internalCode: string;
}

export interface ICustomerPaginatedResponse {
  totalCount: number;
  customers: ICustomer[];
}

export interface ICustomerCreateRequest {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  docPersonal: string;
  status: string;
  customerType?: CustomerType;
  internalCode?: string;
}

export interface ICustomerUpdateRequest extends ICustomerCreateRequest {
  id: number;
}

export interface IBillingProfile {
  customerId: number;
  taxId: string;
  businessName: string;
  commercialName: string;
  fiscalAddress: string;
  billingEmail: string;
  paymentTermDays: number;
  creditLimit: number;
  isCreditEnabled: boolean;
}

export interface IBillingProfileRequest {
  taxId: string;
  businessName: string;
  commercialName: string;
  fiscalAddress: string;
  billingEmail: string;
  paymentTermDays: number;
  creditLimit: number;
  isCreditEnabled: boolean;
}

export interface ICustomerContact {
  id: number;
  customerId: number;
  fullName: string;
  position: string;
  phoneNumber: string;
  email: string;
  isPrimary: boolean;
}

export interface ICustomerContactRequest {
  fullName: string;
  position: string;
  phoneNumber: string;
  email: string;
  isPrimary: boolean;
}

export interface ICompanySearchFilters {
  ruc?: string;
  businessName?: string;
  commercialName?: string;
}

export interface ICompanySearchResult {
  customerId: number;
  businessName: string;
  commercialName: string;
  taxId: string;
}

export interface IAccountSummary {
  customerId: number;
  businessName: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  pendingInvoices: number;
}
