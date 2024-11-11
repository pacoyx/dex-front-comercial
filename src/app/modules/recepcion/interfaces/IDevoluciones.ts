export interface IDevolucionPrendaRequest {
    devolverEfectivo: boolean;
    monto: number;
    userId: number;
}

export interface IRecogerItemRequest {
  cobrarEfectivo: boolean;
  monto: number;
  userId: number;
  tipoPago: string;
  descripcionPago: string;
}