export type WebOrderStatus = 'Pendiente' | 'Confirmado' | 'Programado' | 'Recogido' | 'Rechazado' | 'Cancelado';

export interface IWebOrderAdminSummary {
    id: number;
    orderNumber: string;
    status: WebOrderStatus;
    customerName: string;
    contactPhone: string;
    deliveryAddress: string;
    total: number;
    createdAt: string;
    requestedPickupDate?: string | null;
    scheduledPickupDate?: string | null;
    additionalItemsNote?: string | null;
}

export interface IConfirmWebOrderResponse {
    webOrderId: number;
    workGuideMainId: number;
    serieGuia: string;
    numeroGuia: string;
}

export interface IRejectWebOrderRequest {
    reason?: string;
}

export interface IScheduleWebOrderRequest {
    vehicleId: number;
    employeeId: number;
    scheduledPickupDate: string;
}
