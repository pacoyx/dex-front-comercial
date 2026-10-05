export interface IListaItemsBusqueda {
    id: number;
    name: string;
    price: number;
    categoryDescription?: string;
    /** 'S' | 'N' — igual que el campo "Es Peso?" del maestro de servicios (mnt-prodservices). */
    isPeso?: string;
}