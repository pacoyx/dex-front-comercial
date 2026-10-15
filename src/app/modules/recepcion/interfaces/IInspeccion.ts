export interface SneakerBrandResponse {
    id: number;
    name: string;
    isActive: boolean;
}

export interface UpsertSneakerDetailRequest {
    brandId?: number | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    hasLaces: boolean;
    hasInsoles: boolean;
    observations?: string | null;
}

export interface SneakerDetailResponse {
    id: number;
    workGuideDetailId: number;
    brandId: number | null;
    brandName: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    hasLaces: boolean;
    hasInsoles: boolean;
    observations: string | null;
    createdAt: string;
}

export interface CreateItemInspectionRequest {
    hasStains: boolean;
    hasTears: boolean;
    hasFading: boolean;
    hasMissingParts: boolean;
    notes?: string | null;
}

export interface ItemInspectionResponse {
    id: number;
    workGuideDetailId: number;
    hasStains: boolean;
    hasTears: boolean;
    hasFading: boolean;
    hasMissingParts: boolean;
    notes: string | null;
    createdAt: string;
}

export interface ItemPhotoResponse {
    id: number;
    workGuideMainId: number;
    fileName: string;
    originalFileName: string | null;
    contentType: string;
    fileSize: number;
    createdAt: string;
}

export interface InspectionSummarySneakerResponse {
    id: number;
    brandId: number | null;
    brandName: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    hasLaces: boolean;
    hasInsoles: boolean;
    observations: string | null;
}

export interface InspectionSummaryDetailResponse {
    workGuideDetailId: number;
    productId: number;
    productName: string;
    inspection: ItemInspectionResponse | null;
    sneaker: InspectionSummarySneakerResponse | null;
}

export interface InspectionSummaryResponse {
    workGuideId: number;
    workGuideNumber: string;
    details: InspectionSummaryDetailResponse[];
}

export interface WorkGuidePhotoResponse {
    id: number;
    fileName: string;
    originalFileName: string | null;
    contentType: string;
    fileSize: number;
    createdAt: string;
}

export interface WorkGuidePhotosResponse {
    workGuideId: number;
    photos: WorkGuidePhotoResponse[];
}

export interface SneakerReportFilters {
    dateFrom?: string | null;
    dateTo?: string | null;
    branchId?: number | null;
    brandId?: number | null;
    ticketStatus?: 'P' | 'E' | 'F' | null;
    pendingDelivery?: boolean | null;
}

export interface SneakerReportRowResponse {
    workGuideNumber: string;
    customerName: string;
    brand: string | null;
    primaryColor: string | null;
    hasLaces: boolean;
    hasInsoles: boolean;
    deliveryStatus: 'Pending' | 'Delivered' | 'Returned' | 'Unknown';
    photoCount: number;
}
