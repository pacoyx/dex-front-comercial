export interface IResponseGeneric<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
  errors: string[];
}

export enum InventoryMovementType {
  InitialBalance = 1,
  PurchaseIn = 2,
  AdjustmentIn = 3,
  AdjustmentOut = 4,
  Consumption = 5,
  Transfer = 6,
  Reversal = 7,
  SaleOut = 8,
}

export enum InventoryMovementStatus {
  Posted = 1,
  Cancelled = 2,
}

// ---- Almacenes ----

export interface IWarehouse {
  id: number;
  branchSalesId: number;
  branchName: string;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface ISaveWarehouseRequest {
  branchSalesId: number;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
}

// ---- Movimientos ----

export interface IMovementListItem {
  id: number;
  number: string;
  type: InventoryMovementType;
  status: InventoryMovementStatus;
  movementDate: string;
  warehouseId: number;
  warehouseName: string;
  targetWarehouseName: string | null;
  areaName: string | null;
  reason: string | null;
  purchaseInvoiceId: number | null;
  purchaseInvoiceRef: string | null;
  lineCount: number;
  totalCost: number;
}

export interface IMovementLine {
  id: number;
  productId: number;
  productCode: string | null;
  productName: string;
  unitName: string | null;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  balanceQuantity: number;
  balanceAverageCost: number;
}

export interface IMovementDetail extends IMovementListItem {
  areaId: number | null;
  targetWarehouseId: number | null;
  reversedMovementId: number | null;
  reversedMovementNumber: string | null;
  reversalMovementId: number | null;
  reversalMovementNumber: string | null;
  createdAt: string;
  createdByUserName: string | null;
  lines: IMovementLine[];
}

export interface ICreateMovementLine {
  productId: number;
  quantity: number;
  unitCost: number | null;
}

export interface ICreateMovementRequest {
  type: InventoryMovementType;
  warehouseId: number;
  targetWarehouseId: number | null;
  areaId: number | null;
  reason: string | null;
  lines: ICreateMovementLine[];
}

export interface IMovementFilters {
  from?: string | null;
  to?: string | null;
  type?: InventoryMovementType | null;
  warehouseId?: number | null;
  productId?: number | null;
  status?: InventoryMovementStatus | null;
}

// ---- Stock y kardex ----

export interface IStockItem {
  productId: number;
  productCode: string | null;
  productName: string;
  categoryName: string | null;
  unitName: string | null;
  warehouseId: number | null;
  warehouseName: string | null;
  quantity: number;
  averageCost: number;
  totalValue: number;
  minStock: number;
  belowMin: boolean;
}

export interface IProductStockByWarehouse {
  warehouseId: number;
  warehouseName: string;
  branchName: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
}

export interface IKardexLine {
  movementId: number;
  movementNumber: string;
  movementDate: string;
  type: InventoryMovementType;
  status: InventoryMovementStatus;
  detail: string | null;
  quantityIn: number;
  quantityOut: number;
  unitCost: number;
  totalCost: number;
  balanceQuantity: number;
  balanceAverageCost: number;
  balanceValue: number;
}

export interface IKardex {
  productId: number;
  productCode: string | null;
  productName: string;
  unitName: string | null;
  warehouseId: number;
  warehouseName: string;
  from: string;
  to: string;
  openingQuantity: number;
  openingAverageCost: number;
  openingValue: number;
  totalIn: number;
  totalOut: number;
  closingQuantity: number;
  closingAverageCost: number;
  closingValue: number;
  lines: IKardexLine[];
}

export interface IConsumptionRow {
  areaId: number | null;
  areaName: string;
  productId: number;
  productCode: string | null;
  productName: string;
  unitName: string | null;
  quantity: number;
  totalCost: number;
}

// ---- Catálogos auxiliares ----

export interface IProductOption {
  id: number;
  name: string;
  code?: string | null;
  unitMeasurementDescription: string;
  tracksStock?: boolean;
  stock?: number;
}

export interface IAreaOption {
  id: number;
  name: string;
  isActive: boolean;
}

export interface IBranchOption {
  id: number;
  description: string;
}
