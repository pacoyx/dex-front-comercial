import { CustomerType } from './ICliente';

export interface IClienteCreate {
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    docPersonal: string;
    status: string;
    customerType?: CustomerType;
    internalCode?: string;
}

export interface IClienteUpdate {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    docPersonal: string;
    status: string;
    customerType?: CustomerType;
    internalCode?: string;
}
