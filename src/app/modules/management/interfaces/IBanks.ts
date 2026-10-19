export interface IBank {
  id: number;
  name: string;
  shortName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface IBankCreateRequest {
  name: string;
  shortName: string | null;
}

export interface IBankUpdateRequest {
  name: string;
  shortName: string | null;
  isActive: boolean;
}

export interface IBankLookup {
  id: number;
  name: string;
}

export interface IBankAccountType {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface IBankAccountTypeCreateRequest {
  name: string;
}

export interface IBankAccountTypeUpdateRequest {
  name: string;
  isActive: boolean;
}

export interface IBankAccountTypeLookup {
  id: number;
  name: string;
}
