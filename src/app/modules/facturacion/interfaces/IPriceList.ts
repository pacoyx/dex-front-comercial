export interface ICustomerPriceListDetailRequest {
  serviceItemId: number;
  unitPrice: number;
}

export interface ICustomerPriceListDetailResponse extends ICustomerPriceListDetailRequest {
  id: number;
  serviceItemName: string;
}

export interface ICreatePriceListRequest {
  name: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  activate: boolean;
  details: ICustomerPriceListDetailRequest[];
}

export interface IUpdatePriceListRequest {
  name: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  details: ICustomerPriceListDetailRequest[];
}

export interface IClonePriceListRequest {
  name?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface ICustomerPriceListSummary {
  id: number;
  customerId: number;
  name: string;
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
}

export interface ICustomerPriceList extends ICustomerPriceListSummary {
  details: ICustomerPriceListDetailResponse[];
}
