export interface ICreateUserRequest {
    name: string;
    userName: string;
    password: string;
    role: string;
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
}


export interface IGetUserResponse {
    id: number;
    name: string;
    userName: string;
    email: string;
    role: string;
    status: string;
}