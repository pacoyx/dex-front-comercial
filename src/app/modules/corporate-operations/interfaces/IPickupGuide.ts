export enum PickupGuideStatus {
  Draft = 1,
  Collected = 2,
  Processed = 3,
  Invoiced = 4,
  Cancelled = 5,
}

export enum PickupGuideEmailStatus {
  Pending = 1,
  Sent = 2,
  Failed = 3,
}

export enum PickupGuideAttachmentType {
  Photo = 1,
  Signature = 2,
  Pdf = 3,
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

export interface IPickupGuideAttachment {
  id: number;
  pickupGuideId: number;
  attachmentType: PickupGuideAttachmentType;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  isCurrent: boolean;
  createdAt: string;
}

export interface IPickupGuideRevisionDetail {
  id: number;
  pickupGuideDetailId: number;
  serviceItemName: string;
  originalQuantity: number;
  newQuantity: number;
  reason: string;
}

export interface IPickupGuideRevision {
  id: number;
  pickupGuideId: number;
  employeeId: number;
  employeeName: string;
  observation: string | null;
  revisionDate: string;
  details: IPickupGuideRevisionDetail[];
}

export interface IResendEmailResult {
  id: number;
  emailDeliveryStatus: PickupGuideEmailStatus;
  emailRetryCount: number;
  lastEmailError: string | null;
}

export interface IPickupGuide extends IPickupGuideSummary {
  observation: string | null;
  customerPriceListId: number;
  updatedAt: string | null;
  employeeId: number | null;
  employeeName: string | null;
  vehicleId: number | null;
  vehiclePlate: string | null;
  vehicleDescription: string | null;
  emailDeliveryStatus: PickupGuideEmailStatus;
  emailSentAt: string | null;
  details: IPickupGuideDetailResponse[];
  attachments: IPickupGuideAttachment[];
  revisions: IPickupGuideRevision[];
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
