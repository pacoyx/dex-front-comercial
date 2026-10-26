/** Coincide con el enum DayOfWeek de .NET devuelto por el backend. */
export type DayOfWeekName =
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday';

export interface IAccessScheduleWindow {
    id: number;
    dayOfWeek: DayOfWeekName;
    /** Formato "HH:mm:ss" */
    startTime: string;
    /** Formato "HH:mm:ss" */
    endTime: string;
    isActive: boolean;
}

export interface IUserAccessScheduleResponse {
    userId: number;
    userName: string;
    /** Arreglo vacio significa que el usuario no tiene restriccion (acceso libre). */
    windows: IAccessScheduleWindow[];
}

export interface IUpdateAccessScheduleWindowRequest {
    dayOfWeek: DayOfWeekName;
    /** Acepta "HH:mm" o "HH:mm:ss" */
    startTime: string;
    /** Acepta "HH:mm" o "HH:mm:ss" */
    endTime: string;
}

export interface IUpdateUserAccessScheduleRequest {
    /** Reemplaza la lista completa de rangos del usuario (no es incremental). */
    windows: IUpdateAccessScheduleWindowRequest[];
}
