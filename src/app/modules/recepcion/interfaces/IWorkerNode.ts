export interface IWorkerNodeResponseDto {
    id: number;
    branchId: number;
    workerKey: string;
    computerName: string;
    isActive: boolean;
    lastConnectionAt: string | null;
}

export interface IWorkerNodeCreateDto {
    branchId: number;
    workerKey: string;
    computerName: string;
}

export interface IWorkerNodeEditDto {
    id: number;
    branchId: number;
    workerKey: string;
    computerName: string;
    isActive: boolean;
}
