export interface IIdsPesoLavadoResponse {
    idPeso: number;
    idLavado: number;
}


export interface IGetProdServicesPaginadoResponse {
    totalCount: number;
    servicios: IResponseProdServices[];
}

/** Flag S/N usado por el backend en isPeso / isLavado. */
export type FlagSN = 'S' | 'N';

/** Estado del servicio: A = Activo, I = Inactivo. */
export type EstadoProdService = 'A' | 'I';

/** Servicio tal como lo devuelve el listado del backend. */
export interface IResponseProdServices {
    id: number;
    name: string;
    description: string;
    price: number;
    status: string;
    catServiceId: number | null;
    isPeso: string | null;
    isLavado: string | null;
}

/** Body del POST de creación (backend: strings no nulos; name max 100, description max 250). */
export interface ICrearProdServicesRequest {
    name: string;
    description: string;
    price: number;
    status: EstadoProdService;
    catServiceId: number;
    isPeso: FlagSN;
    isLavado: FlagSN;
}

/** Body del PUT /{id} de actualización: mismos campos de creación + id. */
export interface IActuaizarProdServicesRequest extends ICrearProdServicesRequest {
    id: number;
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