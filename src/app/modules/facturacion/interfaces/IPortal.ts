export interface IEnablePortalRequest {
  fullName: string;
  email: string;
}

export interface IEnablePortalResponse {
  customerId: number;
  customerName: string;
  portalEnabled: boolean;
  activationUrl: string;
}

export interface IPortalStatus {
  portalEnabled: boolean;
  totalUsers: number;
  activeUsers: number;
  administratorExists: boolean;
}

export interface IGenerateActivationLinkResponse {
  activationUrl: string;
}

export type PortalCustomerAdminStatus = 'Sin Portal' | 'Nunca Ingresó' | 'Activo' | string;

export interface IPortalCustomerAdminItem {
  customerId: number;
  customerName: string;
  portalEnabled: boolean;
  totalUsers: number;
  activeUsers: number;
  lastLogin: string | null;
  status: PortalCustomerAdminStatus;
}

export interface ICustomerUserAdmin {
  id: number;
  fullName: string;
  email: string;
  userName: string;
  customerId: number;
  customerName: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface IResetCustomerUserPasswordResponse {
  id: number;
  userName: string;
  email: string;
  customerId: number;
  customerName: string;
}
