export interface ICreateGuideWork {
  serieGuia: string;
  numeroGuia: string;  
  mensajeAlertas: string;
  observaciones: string;
  tipoPago: string;
  descripcionPago: string;
  tipoRecepcion: string;
  direccionContacto: string;
  telefonoContacto: string;
  total: number;
  acuenta: number;
  saldo: number;
  customerId: number;
  branchStoreId: number;
  typeDocument: string;
  userId: number;
  estadoPago:string;  
  estadoRegistro:string;
  estadoSituacion:string;  
  workGuideDetailsDTO: WorkGuideDetailsDTO[];
}

interface WorkGuideDetailsDTO {
  cant: number;
  precio: number;
  total: number;
  observaciones: string;
  tipoLavado: string;
  ubicacion: string;
  estadoTrabajo: string;
  productId: number;
  estadoRegistro: string;
  estadoSituacion: string;
  estadoPago: string;
  identificador: string;
}


export interface ICreateGuiaWorkResponse {
  idWorkGuide: number;
  tipoDocumento: string;
  serieDocumento: string;
  numeroDocumento: string;
  fechaOperacion: string;
  fechaHoraEntrega: string;
}