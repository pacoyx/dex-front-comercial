export interface IClienteCreate {
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    docPersonal: string;
    status: string;
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
}