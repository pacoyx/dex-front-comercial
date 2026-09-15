export interface IPrinterResponseDto {
    id: number;
    workerNodeId: number;
    windowsPrinterName: string;
    isActive: boolean;
    lastDiscoveredAt: string | null;
}

export interface IPrinterCreateDto {
    workerNodeId: number;
    windowsPrinterName: string;
}

export interface IPrinterEditDto {
    id: number;
    workerNodeId: number;
    windowsPrinterName: string;
}
