export interface ICreateUserRequest {
    name: string;
    userName: string;
    password: string;
    role: string;
    employeeId?: number | null;
}

export interface ICreateUserResponse {
    id: number;
    name: string;
    userName: string;
    role: string;
}


export interface IUpdateUserRequest {
    id: number;
    name: string;
    userName: string;
    password: string;
    email: string;
    role: string;
    status: string;
    employeeId?: number | null;
}


export interface IGetUserResponse {
    id: number;
    name: string;
    userName: string;
    email: string;
    role: string;
    status: string;
    employeeId?: number | null;
}