export interface IPrintQueueResponseDto {
    id: number;
    workGuideId: number;
    printerId: number;
    createdAt: string;
    retryCount: number;
    status: number;
    documentType: string;
}
