
export interface IReportGetGuiasPaginadoResponse {
  totalCount: number;
  guias: IReportGuiasDetalleResponse[];
}


export interface IReportGuiasDetalleResponse {
  id: number;
  serieGuia: string;
  numeroGuia: string;
  fechaOperacion: string;
  fechaHoraEntrega: string;
  observaciones: string;
  tipoPago: string;
  descripcionPago: string;
  tipoRecepcion: string;
  total: number;
  acuenta: number;
  saldo: number;
  nombreCliente: string;
  telefonoCliente: string;
  estadoPago: string;
  fechaPag: string;
  estadoRegistro: string;
  estadoSituacion: string;
  fechaRecojo: null;
  tipoPagoCancelacion: string;
  detalles: IReportGuiasDetalleDetalleResponse[];
}

export interface IReportGuiasDetalleDetalleResponse {
  id: number;
  cant: number;
  precio: number;
  total: number;
  servicio: string;
  observaciones: string;
  ubicacion: string;
  estadoTrabajo: string;
  estadoRegistro: string;
  estadoSituacion: string;
  estadoPago: string;
  fechaRecojo: string;
  fechaDevolucion: string;
}

export interface IReportResumenCajaPorFechaResponse {
  cajaId:number;
  usuario: string;
  tipoPago: string;
  totalAdelanto: number;
  totalImporte: number;
  detalle: IResumenCajaDetalle[];
}

export interface IResumenCajaDetalle {
  adelanto: number;
  importe: number;
  tipoPago: string;
  customerId: number;
  cliente: string;
  serie: string;
  numero: string;
}
