export interface IAddWorkGuideItemRequest {
    serviceItemId: number;
    quantity: number;
    unitPrice: number;
    observation?: string;
}

export interface IAddWorkGuideItemResponse {
    workGuideDetailId: number;
    newTotal: number;
}

export interface IAdjustWorkGuideItemQuantityRequest {
    newQuantity: number;
    observation?: string;
}

export interface IAdjustWorkGuideItemQuantityResponse {
    workGuideDetailId: number;
    newTotal: number;
}
