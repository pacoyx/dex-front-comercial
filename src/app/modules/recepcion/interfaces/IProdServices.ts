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