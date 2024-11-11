export interface IListaGastosPorUserResponse {
  id: number;
  categoryGasto: string;
  personalAutoriza: string;
  fechaGasto: string;
  importe: number;
  detallesEgreso: string;
  estadoRegistro: string;
}


export interface ICreateGastoRequest {
  categoriaGasto: string;
  personalAutoriza: string;  
  importe: number;
  detallesEgreso: string;
  estadoRegistro: string;
  userId: number;
}

export interface IActualizarGastoRequest {
  categoryGasto: string;
  personalAutoriza: string;
  importe: number;
  detallesEgreso: string;
}


export interface ICreateGastoResponse {
  id: number;
  categoryGasto: string;
  personalAutoriza: string;
  fechaGasto: string;
  importe: number;
  detallesEgreso: string;
  estadoRegistro: string;
  userId: number;
  cashBoxMainId: number;
}
