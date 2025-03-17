export interface IResponseServiceQuickAccess {
  id: number;
  shortName: string;
  iconName: string;
}

export interface IDataPrenda {
  idPrenda: number;
  descripcion: string;
}


export interface ICreateTicketResponse {
  "id": number;
}


export interface ICreateTicketRequest {
  clothingWorkerId: number;
  userRef: number;
  ticketClothes: TicketClothe[];
}

interface TicketClothe {
  item: number;
  clothingItemId: number;
  customObservations: string;
  observations: Observation[];
}

interface Observation {
  typeObservationId: number;
  observationSectionId: number;
  observations: string;
}


// STORE TICKET
export interface IStoreTicketItem {
  item: number;
  IdPrenda: number;
  prenda: string;
  observaciones: string;
}

export interface IStoreWorker {
  id: number;
  name: string;
}