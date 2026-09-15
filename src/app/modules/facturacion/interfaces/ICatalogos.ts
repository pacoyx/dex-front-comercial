export interface IResponseGeneric<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
  errors: string[];
}

export interface ICustomerSearchResult {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
}

export interface IBranchSales {
  id: number;
  description: string;
  address: string;
  status: string;
  code: string;
  defaultPrinterId: number;
  printerName: string;
}

export interface ITypeDocument {
  id: number;
  name: string;
  description: string;
  docId: string;
  status: string;
}

export interface IPaymentMethod {
  id: number;
  name: string;
  isActive: boolean;
}

export interface IProdServiceSearchResult {
  id: number;
  name: string;
  price: number;
}
