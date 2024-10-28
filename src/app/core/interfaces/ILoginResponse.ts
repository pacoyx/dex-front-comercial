export interface ILoginResponse {
    success: boolean;
    message: string;
    data: ILoginResponseData;
    errors: any[];
    statusCode: number;
}

export interface ILoginResponseData {
    token: string;
    name: string;
    userName: string;
    role: string;
    status: string;
    userId: number;
    branchSales: BranchSale[];
}

interface BranchSale {
    id: number;
    branchSalesId: number;
    branchSalesName: string;
    status: string;
}

