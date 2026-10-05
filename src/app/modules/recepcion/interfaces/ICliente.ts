export enum CustomerType {
    Individual = 1,
    Company = 2,
}

export const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
    { value: CustomerType.Individual, label: 'Individual' },
    { value: CustomerType.Company, label: 'Empresa' },
];

export interface ICliente {
    id: number;
    firtsName: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    docPersonal: string;
    status: string;
    customerType: CustomerType;
    internalCode: string;
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
    customerType: CustomerType;
    internalCode: string;
}

export interface IUpdatePhoneRequest {
    id: number;
    phone: string;
}