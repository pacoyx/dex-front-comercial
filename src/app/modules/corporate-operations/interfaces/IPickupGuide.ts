export enum PickupGuideStatus {
  Draft = 1,
  Collected = 2,
  Processed = 3,
  Invoiced = 4,
  Cancelled = 5,
}

export interface IPickupGuideDetailRequest {
  serviceItemId: number;
  quantity: number;
  weight?: number | null;
  observation?: string | null;
}

export interface IPickupGuideDetailResponse extends IPickupGuideDetailRequest {
  id: number;
  serviceItemName: string;
  unitPrice: number;
  total: number;
}

export interface ICreatePickupGuideRequest {
  customerId: number;
  branchSalesId: number;
  pickupDate: string;
  observation?: string | null;
  details: IPickupGuideDetailRequest[];
}

export interface IUpdatePickupGuideRequest {
  branchSalesId: number;
  pickupDate: string;
  observation?: string | null;
  details: IPickupGuideDetailRequest[];
}

export interface IChangePickupGuideStatusRequest {
  status: PickupGuideStatus;
}

export interface IPickupGuideSummary {
  id: number;
  guideNumber: string;
  customerId: number;
  customerName: string;
  branchSalesId: number;
  pickupDate: string;
  status: PickupGuideStatus;
  totalAmount: number;
  createdAt: string;
}

export interface IPickupGuide extends IPickupGuideSummary {
  observation: string | null;
  customerPriceListId: number;
  updatedAt: string | null;
  details: IPickupGuideDetailResponse[];
}

export interface IPickupGuideFilters {
  customerId?: number | null;
  status?: PickupGuideStatus | null;
  fromDate?: string | null;
  toDate?: string | null;
}

/** Linea de trabajo en memoria mientras se arma la guia (antes de guardar). */
export interface IPickupGuideStoreDetailLine extends IPickupGuideDetailRequest {
  item: number;
  serviceItemName: string;
  isPeso: boolean;
  unitPrice: number;
  lineTotal: number;
}
