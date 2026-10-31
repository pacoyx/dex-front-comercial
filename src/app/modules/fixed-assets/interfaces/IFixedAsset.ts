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
}

export interface IFixedAssetListFilters {
  branchId?: number;
  categoryId?: number;
  status?: number;
}
