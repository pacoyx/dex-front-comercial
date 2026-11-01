export interface ICatService {
    id: number;
    name: string;
    description: string;
    icon: string;
}

export interface ICatServiceCreateDto {
    name: string;
    description: string;
    icon: string;
}

export interface ICatServiceEditDto {
    id: number;
    name: string;
    description: string;
    icon: string;
}
