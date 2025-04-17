export interface IResponseGeneric<T> {
  statusCode: string;
  message: string;
  data: T;
  success: boolean;
  errors: string[];
}

export interface ISupplierCreateRequest {
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  contactName: string;
  contactPhone: string;
}

export interface ISupplierUpdateRequest {
  id: number;
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  contactName: string;
  contactPhone: string;
}


export interface ISupplierCreateResponse {
  id: number;
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  contactName: string;
  contactPhone: string;
}

export interface IGetSupplierPaginadoResponse {
  totalCount: number;
  suppliers: ISupplierListarResponse[];
}

export interface ISupplierListarResponse {
  id: number;
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  contactName: string;
  contactPhone: string;
}

export interface IProductCreateRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  unitMeasurementId: number;
  categoryProdId: number;
  status: string;
}

export interface IProductCreateResponse {  
  name: string;
  description: string;
  price: number;
  stock: number;
  unitMeasurementId: number;
  categoryProdId: number;
  status: string;
}


export interface IProductUpdateRequest {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  unitMeasurementId: number;
  categoryProdId: number;
  status: string;
}


export interface IGetProductsPaginadoResponse {
  totalCount: number;
  products: IProductListarResponse[];
}

export interface IProductListarResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  unitMeasurementId: number;
  categoryProdId: number;
  status: string;
}