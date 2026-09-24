export interface IArea {
  id: number;
  name: string;
  isActive: boolean;
}

export interface IPosition {
  id: number;
  name: string;
  isActive: boolean;
}

export interface ICatalogCreateRequest {
  name: string;
}

export interface ICatalogUpdateRequest {
  name: string;
  isActive: boolean;
}

export interface IDocumentType {
  id: number;
  name: string;
}
