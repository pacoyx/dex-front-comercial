export interface ICollectionSheetCreateRequest {
  branchId: number;
  number: string;
  remarks?: string;
}

export interface ICollectionSheet {
  id: number;
  branchId: number;
  number: string;
  openDate: string;
  closeDate: string | null;
  totalAmount: number;
  status: number;
  remarks: string;
}

export interface ICollectionSheetPaymentRequest {
  invoiceId: number;
  paymentMethodId: number;
  amount: number;
  operationNumber?: string;
  observation?: string;
}

export interface ICollectionSheetCloseResponse {
  id: number;
  status: number;
  closeDate: string;
}
