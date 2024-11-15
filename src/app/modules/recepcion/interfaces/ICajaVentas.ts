export interface IAperturaCajaRequest {
  saldoInicial: number;
  observaciones: string;
  branchSalesId: number;
  workShiftId: number;
  userId: number;
}

export interface IDetalleCajaRequest {
  tipoComprobante: string;
  serieComprobante: string;
  numComprobante: string;
  fechaComprobante: string;
  importe: number;
  adelanto: number;
  tipoPago: string;
  descripcionPago: string;
  observaciones: string;
  estadoRegistro: string;
  customerId: number;
  cashBoxMainId: number;
}

export interface IDetalleCajaRequestOtherIn {
  serieComprobante: string;
  numComprobante: string;
  importe: number;
  tipoPago: string;
  descripcionPago: string;
  observaciones: string;
  userId: number;
  customerId: number | null;
}

export interface ICerrarCajaRequest {
  id: number;
  estadoCaja: string;
  saldoFinal: number;
  totalIngreso: number;
  totalSalida: number;
  observacionesCierre: string;
}

export interface IListarCajaPorUsuarioResponse {
  id: number;
  fechaCaja: string;
  fechaHoraApertura: string;
  fechaHoraCierre: null | string;
  estadoCaja: string;
  saldoInicial: number;
  saldoFinal: number;
  totalIngreso: number;
  totalSalida: number;
  observaciones: string;
  observacionesCierre: string;
  estadoRegistro: string;
  branchSalesId: number;
  workShiftId: number;
  userId: number;
}


export interface ICashBoxDetailResponseDto {
  id: number;
  tipoComprobante: string;
  serieComprobante: string;
  numComprobante: string;
  fechaComprobante: string;
  importe: number;
  adelanto: number;
  tipoPago: string;
  descripcionPago: string;
  observaciones: string;
  customer: Customer;
}

interface Customer {
  id: number;
  firtsName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  docPersonal: string;
  status: string;
}

export interface ITotalizadoPorTipoPago {
  tipoPago: string;
  totalImporte: number;
  totalAdelanto: number;
  total: number;
}