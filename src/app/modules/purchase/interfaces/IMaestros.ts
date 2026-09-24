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

export interface ISupplierListarPorPatronResponse {
  id: number;
  name: string;
}

export interface IPaymentMethod {
  id: number;
  name: string;
  isActive: boolean;
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
  id: number;
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

export interface IGetUniMedidaShortResponse {
  id: number;
  codeUm: string;
  name:string;
}

export interface IGetCategoriaProductoShortResponse {
  id: number;
  name: string;
}

export interface IProductListarPatronResponse {
  id: number;
  name: string;
  price: number;
  unitMeasurementId: number;
  unitMeasurementDescription: string;
}

export interface ICategoryProd {
  id: number;
  name: string;
  description: string;
  status: string;
}

export interface ICategoryProdCreateRequest {
  name: string;
  description: string;
  status?: string;
}

export interface ICategoryProdUpdateRequest {
  id: number;
  name: string;
  description: string;
  status: string;
}

export interface IUnitMeasurement {
  id: number;
  codeUm: string;
  name: string;
  description: string;
  status: string;
}

export interface IUnitMeasurementCreateRequest {
  name: string;
  description: string;
  codeUm: string;
  status?: string;
}

export interface IUnitMeasurementUpdateRequest {
  id: number;
  name: string;
  codeUm: string;
  description: string;
  status: string;
}