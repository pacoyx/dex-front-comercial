
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
  cajaId: number;
  usuario: string;
  tipoPago: string;
  totalAdelanto: number;
  totalImporte: number;
  flag: boolean;
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



export interface DataResumenCaja {
  cashBoxDetail: DataResumenCajaCashBoxDetail[];
  expenseBox: DataResumenCajaExpenseBox[];
}

export interface DataResumenCajaExpenseBox {
  fechaGasto: string;
  importe: number;
  detallesEgreso: string;
}

export interface DataResumenCajaCashBoxDetail {
  adelanto: number;
  importe: number;
  tipoPago: string;
  customerId: number;
  cliente: string;
  serie: string;
  numero: string;
  fechaHora: string;
}

export interface ICajasPorFecha {
  cajaId: number;
  usuario: string;
  fechaHoraApertura: string;
  saldoInicial: number;
  saldoFinal: number;
  totalIngreso: number;
  totalSalida: number;
  estadoCaja: string;
  userId: number;
}


export interface ISucursalesCombo {
  id: number;
  description: string;
}




export interface IDashboardCashResponseDto {
  branchSalesId: number;
  descripcion: string;
  detalles: IDashboardCashDetailDto[];
}

export interface IDashboardCashDetailDto {
  tipoPago: string;
  montoTotal: number;
}