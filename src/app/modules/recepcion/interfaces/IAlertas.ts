export interface ICreateAlertaRequest {
  titulo: string;
  tipoAlerta: string;
  mensaje: string;
  workGuideMainId: number;
}


export interface ICreateAlertaResponse {
  id: number;
  titulo: string;
  tipoAlerta: string;
  mensaje: string;
  workGuideMainId: number;
}

export interface IListarAlertasResponse {
  id: number;
  titulo: string;
  tipoAlerta: string;
  mensaje: string;
}