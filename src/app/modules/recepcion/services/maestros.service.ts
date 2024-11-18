import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { IResponseGeneric } from '../interfaces/IResponseGeneric';
import { IGetClientesPaginadoResponse } from '../interfaces/ICliente';
import { IClienteCreate, IClienteUpdate } from '../interfaces/IClienteCreate';
import { IActuaizarProdServicesRequest, ICrearProdServicesRequest, IGetProdServicesPaginadoResponse } from '../interfaces/IProdServices';

@Injectable({
  providedIn: 'root'
})
export class MaestrosService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('An error occurred:', error.error.message);
    } else {
      // Error del lado del servidor
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError(error);
  }


  obtenerClientes(pagina: number, numFilas: number): Observable<IResponseGeneric<IGetClientesPaginadoResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetClientesPaginadoResponse>>(`${this.apiUrl}${environment.EPListarClientes}/${pagina}/${numFilas}`, { headers });
  }

  registrarCliente(cliente: IClienteCreate): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPRegistrarCliente}`;
    return this.http.post<IResponseGeneric<string>>(url, cliente, { headers });
  }

  actualizarCliente(cliente: IClienteUpdate): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPActualizarCliente}/${cliente.id}`;
    return this.http.put<IResponseGeneric<string>>(url, cliente, { headers });
  }

  eliminarCliente(idCliente:number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPActualizarCliente}/${idCliente}`;
    return this.http.delete<IResponseGeneric<string>>(url, { headers });
  }



  obtenerProdServices(pagina: number, numFilas: number): Observable<IResponseGeneric<IGetProdServicesPaginadoResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetProdServicesPaginadoResponse>>(`${this.apiUrl}${environment.EPListarProdServices}/${pagina}/${numFilas}`, { headers });
  }

  registrarProdService(prodService: ICrearProdServicesRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPRegistrarProdServices}`;
    return this.http.post<IResponseGeneric<string>>(url, prodService, { headers });
  }

  actualizarProdService(prodService: IActuaizarProdServicesRequest, id:number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPActualizarProdServices}/${id}`;
    return this.http.put<IResponseGeneric<string>>(url, prodService, { headers });
  }

  eliminarProdService(idProdService:number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPREliminarProdServices}/${idProdService}`;
    return this.http.delete<IResponseGeneric<string>>(url, { headers });
  }

}
