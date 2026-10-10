export interface IResponseGeneric<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
  errors: string[];
}

export interface ICustomerSearchResult {
  id: number;
  name: string;
  ruc: string;
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

/** Item del catalogo completo de servicios (maestro de Recepción), incluye el flag "Es Peso?". */
export interface IProdServiceCatalogItem {
  id: number;
  name: string;
  price: number;
  status: string;
  /** 'S' | 'N' */
  isPeso: string;
}

export interface IProdServiceCatalogPaginatedResponse {
  totalCount: number;
  servicios: IProdServiceCatalogItem[];
}
