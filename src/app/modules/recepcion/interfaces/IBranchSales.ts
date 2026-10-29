export interface IBranchSalesResponseDto {
    id: number;
    description: string;
    address: string;
    status: string;
    code: string;
    defaultPrinterId: number;
    printerName: string | null;
    isCentral: boolean;
}

export interface IBranchSalesCreateDto {
    description: string;
    address: string;
    status: string;
    code: string;
    defaultPrinterId: number;
}

export interface IBranchSalesEditDto {
    id: number;
    description: string;
    address: string;
    status: string;
    code: string;
    defaultPrinterId: number;
    isCentral: boolean;
}

export interface IBranchSalesUserResponseDto {
    id: number;
    branchSalesId: number;
    userId: number;
    userName: string;
    status: string;
}

export interface IBranchSalesUserCreateDto {
    branchSalesId: number;
    userId: number;
    status: string;
}

export interface IBranchSalesUserEditDto {
    id: number;
    branchSalesId: number;
    userId: number;
    status: string;
}

export interface IUsuarioSistema {
    id: number;
    name: string;
    userName: string;
    email: string;
    role: string;
    status: string;
}
