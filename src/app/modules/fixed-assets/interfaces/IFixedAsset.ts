export interface IFixedAssetCategory {
  id: number;
  name: string;
  defaultDepreciationRatePercent: number;
  defaultUsefulLifeYears: number;
}

export interface IFixedAssetListItem {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string;
  branchId: number;
  branchName: string;
  responsibleUserId: number | null;
  responsibleUserName: string | null;
  status: number;
  acquisitionDate: string;
  acquisitionCost: number;
  bookValue: number;
  hasPhoto: boolean;
  photoUpdatedAt: string | null;
}

export interface IFixedAssetMaintenanceAttachment {
  id: number;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface IFixedAssetMaintenance {
  id: number;
  date: string;
  type: number;
  description: string;
  cost: number;
  observations: string | null;
  nextMaintenanceDate: string | null;
  attachments: IFixedAssetMaintenanceAttachment[];
  serviceProvider: string | null;
  /** true si al registrarlo el activo pasó a "En Mantenimiento" */
  putsAssetOutOfService: boolean;
  outOfServiceReason: string | null;
  estimatedEndDate: string | null;
  /** null mientras el mantenimiento sigue en curso */
  actualEndDate: string | null;
  closingNotes: string | null;
}

export interface IFixedAssetReassignment {
  id: number;
  date: string;
  previousBranchId: number | null;
  previousBranchName: string | null;
  newBranchId: number;
  newBranchName: string;
  previousResponsibleUserId: number | null;
  previousResponsibleUserName: string | null;
  newResponsibleUserId: number | null;
  newResponsibleUserName: string | null;
  reason: string | null;
}

export interface IFixedAssetDetail {
  id: number;
  code: string;
  name: string;
  description: string | null;
  categoryId: number;
  categoryName: string;
  acquisitionDate: string;
  acquisitionCost: number;
  supplierId: number | null;
  supplierName: string | null;
  purchaseInvoiceId: number | null;
  purchaseInvoiceNumber: string | null;
  branchId: number;
  branchName: string;
  responsibleUserId: number | null;
  responsibleUserName: string | null;
  usefulLifeYears: number;
  status: number;
  disposalDate: string | null;
  disposalReason: string | null;
  notes: string | null;
  bookValue: number;
  maintenances: IFixedAssetMaintenance[];
  reassignments: IFixedAssetReassignment[];
  hasPhoto: boolean;
  photoUpdatedAt: string | null;
}

export interface IFixedAssetPhoto {
  fixedAssetId: number;
  photoUpdatedAt: string;
}

export interface ICreateFixedAssetRequest {
  name: string;
  description?: string;
  categoryId: number;
  acquisitionDate: string;
  acquisitionCost: number;
  supplierId?: number | null;
  purchaseInvoiceId?: number | null;
  branchId: number;
  responsibleUserId?: number | null;
  usefulLifeYearsOverride?: number | null;
  notes?: string;
}

export interface IUpdateFixedAssetRequest {
  name: string;
  description?: string;
  categoryId: number;
  acquisitionDate: string;
  acquisitionCost: number;
  supplierId?: number | null;
  purchaseInvoiceId?: number | null;
  usefulLifeYearsOverride?: number | null;
  notes?: string;
}

export interface IReassignFixedAssetRequest {
  newBranchId: number;
  newResponsibleUserId?: number | null;
  reason?: string;
}

export interface IDisposeFixedAssetRequest {
  status: number;
  disposalDate: string;
  disposalReason: string;
}

export interface ICreateFixedAssetMaintenanceRequest {
  date: string;
  type: number;
  description: string;
  cost: number;
  observations?: string;
  nextMaintenanceDate?: string | null;
  serviceProvider?: string | null;
  putAssetOutOfService?: boolean;
  outOfServiceReason?: string | null;
  estimatedEndDate?: string | null;
}

export interface IFinishFixedAssetMaintenanceRequest {
  actualEndDate: string;
  finalCost?: number | null;
  closingNotes?: string | null;
}

export interface IFixedAssetListFilters {
  branchId?: number;
  categoryId?: number;
  status?: number;
}

// ---- Reporte de historial ----

export interface IFixedAssetHistoryFilters {
  fromDate?: string | null;
  toDate?: string | null;
  branchId?: number | null;
  categoryId?: number | null;
  status?: number | null;
  fixedAssetId?: number | null;
}

export type FixedAssetHistoryEventType = 'acquisition' | 'reassignment' | 'maintenance' | 'out-of-service' | 'disposal';

export interface IFixedAssetHistoryEvent {
  date: string;
  fixedAssetId: number;
  assetCode: string;
  assetName: string;
  categoryName: string;
  branchName: string;
  eventType: FixedAssetHistoryEventType;
  eventLabel: string;
  description: string;
  detail: string | null;
  cost: number | null;
  endDate: string | null;
  daysOutOfService: number | null;
  inProgress: boolean;
}

export interface IFixedAssetHistorySummary {
  fixedAssetId: number;
  code: string;
  name: string;
  categoryName: string;
  branchName: string;
  responsibleUserName: string | null;
  status: number;
  acquisitionDate: string;
  acquisitionCost: number;
  bookValue: number;
  maintenanceCount: number;
  maintenanceCost: number;
  outOfServiceCount: number;
  daysOutOfService: number;
  reassignmentCount: number;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
}

export interface IFixedAssetHistoryTotals {
  assetCount: number;
  totalAcquisitionCost: number;
  totalBookValue: number;
  maintenanceCount: number;
  totalMaintenanceCost: number;
  totalDaysOutOfService: number;
  assetsCurrentlyInMaintenance: number;
}

export interface IFixedAssetHistoryReport {
  assets: IFixedAssetHistorySummary[];
  events: IFixedAssetHistoryEvent[];
  totals: IFixedAssetHistoryTotals;
}
