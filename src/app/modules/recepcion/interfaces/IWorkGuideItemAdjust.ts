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
    // Exactamente uno de los dos: newQuantity (ajusta cantidad) o newTotal (ajusta total,
    // recalculando cantidad si el servicio es por peso, o precio si es por unidad).
    newQuantity?: number;
    newTotal?: number;
    observation?: string;
}

export interface IAdjustWorkGuideItemQuantityResponse {
    workGuideDetailId: number;
    newQuantity: number;
    newPrecio: number;
    newItemTotal: number;
    newTotal: number;
}
