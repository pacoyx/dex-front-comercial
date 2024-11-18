export interface ICliente {
    id: number;
    firtsName: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    docPersonal: string;
    status: string;
}


export interface IGetClientesPaginadoResponse {
    totalCount: number;
    customers: IResponseCustomers[];
}

export interface IResponseCustomers {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    docPersonal: string;
    status: string;
}

export interface IUpdatePhoneRequest {
    id: number;
    phone: string;
}