import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IResponseGeneric';
import { IGetClientesPaginadoResponse } from '../interfaces/ICliente';
import { IClienteCreate, IClienteUpdate } from '../interfaces/IClienteCreate';
import { IActuaizarProdServicesRequest, ICrearProdServicesRequest, IGetProdServicesPaginadoResponse } from '../interfaces/IProdServices';
import { IRequestRegistrarUbicacion, IUbicacionesCreateResponseDto, IUbicacionesEditDto, IUbicacionesResponseDto } from '../interfaces/IUbicaciones';
import { ISucursalesCombo } from '../interfaces/IReports';

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

  obtenerClientesFiltrarPaginator(pagina: number, numFilas: number, nombreFiltro: string): Observable<IResponseGeneric<IGetClientesPaginadoResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { name: nombreFiltro };
    return this.http.get<IResponseGeneric<IGetClientesPaginadoResponse>>(`${this.apiUrl}${environment.EPListarClientesPaginator}/${pagina}/${numFilas}`, { headers, params });
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

  eliminarCliente(idCliente: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPEliminarCliente}/${idCliente}`;
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

  actualizarProdService(prodService: IActuaizarProdServicesRequest, id: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPActualizarProdServices}/${id}`;
    return this.http.put<IResponseGeneric<string>>(url, prodService, { headers });
  }

  eliminarProdService(idProdService: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPREliminarProdServices}/${idProdService}`;
    return this.http.delete<IResponseGeneric<string>>(url, { headers });
  }




  obtenerUbicaciones() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IUbicacionesResponseDto[]>>(`${this.apiUrl}${environment.EPListarUbicaciones}`, { headers });
  }

  crearUbicacion(ubicacion: IUbicacionesCreateResponseDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IUbicacionesResponseDto>>(`${this.apiUrl}${environment.EPCrearUbicacion}`, ubicacion, { headers });
  }

  actualizarUbicacion(ubicacion: IUbicacionesEditDto) {
    //TODO: Cambiar todo para actualizar
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<IUbicacionesResponseDto>>(`${this.apiUrl}${environment.EPActualizarUbicacion}/${ubicacion.id}`, ubicacion, { headers });
  }

  eliminarUbicacion(idUbicacin: number): Observable<IResponseGeneric<string>> {
    //TODO: Cambiar todo para eliminar
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPActualizarUbicacion}/${idUbicacin}`;
    return this.http.delete<IResponseGeneric<string>>(url, { headers });
  }

  registrarUbicacionPrenda(ubicacion: IRequestRegistrarUbicacion) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPRegistrarUbicacion}`, ubicacion, { headers });
  }

  obtenerSucursalesCombo() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ISucursalesCombo[]>>(`${this.apiUrl}${environment.EPListarSucursales}`, { headers });
  }


}
