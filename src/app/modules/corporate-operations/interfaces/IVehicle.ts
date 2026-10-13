export interface IVehicle {
  id: number;
  plate: string;
  description: string;
  isActive: boolean;
}

export interface ICreateVehicleRequest {
  plate: string;
  description: string;
}

export interface IUpdateVehicleRequest {
  plate: string;
  description: string;
  isActive: boolean;
}
