export interface IResponseGeneric<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
  errors: string[];
}

export enum SaleStatus {
  Completed = 1,
  Cancelled = 2,
}

/** Mismos códigos que la caja (el cierre suma EF, TA y QR). */
export type PaymentType = 'EF' | 'TA' | 'QR';

export const PAYMENT_OPTIONS: { value: PaymentType; label: string; icon: string }[] = [
  { value: 'EF', label: 'Efectivo', icon: 'payments' },
  { value: 'TA', label: 'Tarjeta', icon: 'credit_card' },
  { value: 'QR', label: 'Yape / Plin', icon: 'qr_code_2' },
];

export function paymentLabel(code: string): string {
  return PAYMENT_OPTIONS.find(p => p.value === code)?.label ?? code;
}

export interface IPosWarehouse {
  id: number;
  name: string;
  isDefault: boolean;
}

export interface IPosContext {
  cashBoxOpen: boolean;
  cashBoxId: number | null;
  branchSalesId: number | null;
  branchName: string | null;
  warehouses: IPosWarehouse[];
  defaultWarehouseId: number | null;
  walkInCustomerId: number;
  walkInCustomerName: string;
  igvRate: number;
}

export interface ISaleProduct {
  id: number;
  code: string | null;
  name: string;
  unitMeasurementDescription: string;
  price: number;
  tracksStock: boolean;
  stock: number;
}

export interface ICreateSaleRequest {
  warehouseId: number | null;
  customerId: number | null;
  paymentType: PaymentType;
  paymentDescription: string | null;
  amountReceived: number;
  notes: string | null;
  lines: { productId: number; quantity: number; unitPrice: number }[];
}

export interface ISaleListItem {
  id: number;
  number: string;
  saleDate: string;
  customerName: string;
  branchName: string;
  userName: string;
  paymentType: string;
  total: number;
  status: SaleStatus;
  itemCount: number;
}

export interface ISaleLine {
  productId: number;
  productCode: string | null;
  description: string;
  unitName: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  unitCost: number;
}

export interface ISaleDetail extends ISaleListItem {
  customerId: number;
  customerDocument: string | null;
  warehouseId: number;
  warehouseName: string;
  cashBoxMainId: number;
  cashBoxOpen: boolean;
  subtotal: number;
  igv: number;
  paymentDescription: string | null;
  amountReceived: number;
  change: number;
  notes: string | null;
  inventoryMovementId: number | null;
  inventoryMovementNumber: string | null;
  cancelledAt: string | null;
  cancelledByUserName: string | null;
  cancelReason: string | null;
  totalCost: number;
  companyName: string;
  companyDocument: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  lines: ISaleLine[];
}

/** Resultado del diálogo de clientes de recepción (dialog-cliente-touch). */
export interface IClienteSeleccionado {
  id: number;
  nombres: string;
  apellidos: string;
}
