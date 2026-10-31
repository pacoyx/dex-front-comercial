export interface IGuiaRemision {
  id: number;
  invoiceId: number;
  invoiceSerie: string;
  invoiceNumero: string;
  serie: string;
  numero: string;
  fechaEmision: string;
  fechaTraslado: string;
  motivoTraslado: string;
  driverName: string;
  driverDni: string;
  originAddress: string;
  deliveryAddress: string;
  vehicleId: number | null;
  vehiclePlate: string | null;
  customerName: string;
  customerTaxId: string;
}

export interface IGuiaRemisionCreateRequest {
  serie: string;
  numero: string;
  driverName: string;
  driverDni: string;
  deliveryAddress: string;
  fechaTraslado: string;
  motivoTraslado?: string;
  vehicleId?: number | null;
  originAddress?: string;
}

export interface IGuiaRemisionListFilters {
  invoiceNumero?: string;
  desde?: string;
  hasta?: string;
}
