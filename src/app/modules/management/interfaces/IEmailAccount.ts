export interface IEmailAccount {
    id: number;
    operacion: string;
    provider: string;
    host: string;
    port: number;
    userName: string;
    enableSsl: boolean;
    isActive: boolean;
    hasPassword: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface ICreateEmailAccountRequest {
    operacion: string;
    provider: string;
    host: string;
    port: number;
    userName: string;
    password: string;
    enableSsl: boolean;
}

export interface IUpdateEmailAccountRequest {
    operacion: string;
    provider: string;
    host: string;
    port: number;
    userName: string;
    password: string | null;
    enableSsl: boolean;
    isActive: boolean;
}

export interface IEmailOperationOption {
    value: string;
    label: string;
}

// Lista cerrada validada tambien en el backend (EmailOperationCodes). Si se agrega un
// quinto valor hay que coordinar con backend antes de habilitarlo aqui.
export const EMAIL_ACCOUNT_OPERATIONS: IEmailOperationOption[] = [
    { value: 'ope_corporativas', label: 'Operaciones Corporativas' },
    { value: 'alertas_internas', label: 'Alertas Internas' },
    { value: 'alertas_externas', label: 'Alertas Externas' },
    { value: 'tareas_automatizadas', label: 'Tareas Automatizadas' },
];
