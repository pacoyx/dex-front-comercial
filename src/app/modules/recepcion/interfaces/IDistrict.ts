export interface IZone {
    id: number;
    name: string;
}

export interface IDistrictAdmin {
    id: number;
    name: string;
    zoneId: number;
    zoneName: string;
    isActive: boolean;
}

export interface ICreateDistrictRequest {
    name: string;
    zoneId: number;
}

export interface IUpdateDistrictRequest {
    name: string;
    zoneId: number;
    isActive: boolean;
}
