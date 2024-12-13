export interface IResponseGeneric<T> {
    statusCode: string;
    message: string;
    data: T;
    success: boolean;
    errors: string[];
}