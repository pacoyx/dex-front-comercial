
export interface FindClothingWorkerReqDto {
    idWorker: string;
    userRef: number;
}

export interface FindClothingWorkerResponseDto {
    id: number;
    name: string;
    lastName: string;
    documentNumber: string;
    status: string;
    userRef: number;
}
