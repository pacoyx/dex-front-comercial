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
  numeroGuia: string[];
  comments: string;
  nativo:boolean;
}


export interface IUbicacionesEditDto {
  id:number;
  nombre: string;
  descripcion: string;
}


export interface IRequestRegistrarUbicacion {
  locationClothesId: number;
  guias: Guia[];
  comments: string;
}

interface Guia {
  numeroGuia: string;
  referencia: string;
  isSystem: boolean;
}