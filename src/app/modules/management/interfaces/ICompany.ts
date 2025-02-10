export interface ICreateCompanyRequest {
  nameComercial: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  usuarioId: number;
  nameCompany: string;
  documentType: string;
  numberType: string;
  logo: string;
  facebook: string;
  twitter: string;
  instagram: string;
}


export interface IUpdateCompanyRequest {
  id: number;
  nameComercial: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  usuarioId: number;
  nameCompany: string;
  documentType: string;
  numberType: string;
  logo: string;
  facebook: string;
  twitter: string;
  instagram: string;
  status: string;
}


export interface IGetCompanyResponse {
  id: number;
  nameComercial: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  usuarioId: number;
  nameCompany: string;
  documentType: string;
  numberType: string;
  logo: string;
  facebook: string;
  twitter: string;
  instagram: string;
}


export interface IGetCompaniesResponse {
  id: number;
  nameComercial: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  usuarioId: number;
  nameCompany: string;
  documentType: string;
  numberType: string;
  logo: string;
  facebook: string;
  twitter: string;
  instagram: string;
}

export interface IGetCompanyByUserResponse {
  id: number;
  nameComercial: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  webSite: string;
  usuarioId: number;
  nameCompany: string;
  documentType: string;
  numberType: string;
  logo: string;
  facebook: string;
  twitter: string;
  instagram: string;
  status: string;
}