export interface IUbicacionesResponseDto {
    id: number;
    name: string;
    description: string;    
}

export interface IUbicacionesCreateResponseDto {
    nombre: string;
    descripcion: string;
}


export interface IRegistrarUbicacionRequest {
  locationClothesId: number;
  numeroGuia: string;
  comments: string;
}


export interface IUbicacionesEditDto {
  id:number;
  nombre: string;
  descripcion: string;
}