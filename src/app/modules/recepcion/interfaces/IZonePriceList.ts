export interface IZonePriceListDetail {
    id: number;
    serviceItemId: number;
    serviceItemName: string;
    unitPrice: number;
}

export interface IZonePriceListDetailRequest {
    serviceItemId: number;
    unitPrice: number;
}

export interface IZonePriceListSummary {
    id: number;
    zoneId: number;
    zoneName: string;
    name: string;
    version: number;
    effectiveFrom: string;
    effectiveTo?: string | null;
    isActive: boolean;
}

export interface IZonePriceListAdmin extends IZonePriceListSummary {
    details: IZonePriceListDetail[];
}

export interface ICreateZonePriceListRequest {
    name: string;
    effectiveFrom: string;
    effectiveTo?: string | null;
    activate: boolean;
    details: IZonePriceListDetailRequest[];
}

export interface IUpdateZonePriceListRequest {
    name: string;
    effectiveFrom: string;
    effectiveTo?: string | null;
    details: IZonePriceListDetailRequest[];
}
