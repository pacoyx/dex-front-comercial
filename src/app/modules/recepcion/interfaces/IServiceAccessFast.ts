export interface IServiceAccessFastAdmin {
    id: number;
    prodServiceId: number;
    prodServiceName: string;
    shortName: string;
    iconName: string;
    status: string;
    order: number;
}

export interface IServiceAccessFastCreateRequest {
    prodServiceId: number;
    shortName: string;
    iconName: string;
    status: string;
}

export interface IServiceAccessFastUpdateRequest {
    prodServiceId: number;
    shortName: string;
    iconName: string;
    status: string;
}
