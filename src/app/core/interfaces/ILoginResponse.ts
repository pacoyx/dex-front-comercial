export interface ILoginResponse {
    success: boolean;
    message: string;
    data: ILoginResponseData;
    errors: any[];
    statusCode: number;
}

export interface ILoginResponseData {
    token: string;
    refreshToken: string;
    name: string;
    userName: string;
    role: string; // legado, solo display, ya no se usa para autorizar nada
    status: string;
    userId: number;
    branchSales: BranchSale[];
    branchSalesCashId: number;
    roles: string[];
    permissions: string[];
}

interface BranchSale {
    id: number;
    branchSalesId: number;
    branchSalesName: string;
    status: string;
}

