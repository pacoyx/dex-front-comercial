export interface IResponseGeneric<T> {
    statusCode: string;
    message: string;
    data: T;
    success: string;
    errors: string[];
}