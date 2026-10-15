export interface IIdsPesoLavadoResponse {
    idPeso: number;
    idLavado: number;
}


export interface IGetProdServicesPaginadoResponse {
    totalCount: number;
    servicios: IResponseProdServices[];
}

export interface IResponseProdServices {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    status: string;
    idPeso: number;
    idLavado: number;
}

export interface IActuaizarProdServicesRequest {
    name: string;
    description: string;
    category: string;
    price: number;
    status: string;
    idPeso: number;
    idLavado: number;
}

export interface ICrearProdServicesRequest {
    name: string;
    description: string;
    category: string;
    price: number;
    status: string;
    idPeso: number;
    idLavado: number;
}


export interface IResponseServiceQuickAccess {
    id: number;
    prodServiceID: number;
    shortName: string;
    iconName: string;
    status: string;
    price: number;
    categoryDescription?: string;
    /** 'S' | 'N' — igual que el campo "Es Peso?" del maestro de servicios (mnt-prodservices). */
    isPeso?: string;
    /** 'S' | 'N' — igual que el campo "Es Lavado?" del maestro de servicios (mnt-prodservices). */
    isLavado?: string;
}