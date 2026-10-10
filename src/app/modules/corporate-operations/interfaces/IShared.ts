export interface IResponseGeneric<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
  errors: string[];
}
