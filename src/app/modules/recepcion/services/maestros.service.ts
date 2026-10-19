import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IResponseGeneric';
import { IGetClientesPaginadoResponse } from '../interfaces/ICliente';
import { IClienteCreate, IClienteUpdate } from '../interfaces/IClienteCreate';
import { IActuaizarProdServicesRequest, ICrearProdServicesRequest, IGetProdServicesPaginadoResponse } from '../interfaces/IProdServices';
import { IAsignarUbicacionDetalleRequest, IRequestRegistrarUbicacion, IUbicacionesCreateResponseDto, IUbicacionesEditDto, IUbicacionesResponseDto, IWorkGuideDetailLocationResponse } from '../interfaces/IUbicaciones';
import { ISucursalesCombo } from '../interfaces/IReports';
import { IBranchSalesCreateDto, IBranchSalesEditDto, IBranchSalesResponseDto, IBranchSalesUserCreateDto, IBranchSalesUserEditDto, IBranchSalesUserResponseDto, IUsuarioSistema } from '../interfaces/IBranchSales';
import { IPrinterCreateDto, IPrinterEditDto, IPrinterResponseDto } from '../interfaces/IPrinter';
import { IWorkerNodeCreateDto, IWorkerNodeEditDto, IWorkerNodeResponseDto } from '../interfaces/IWorkerNode';
import { IPrintQueueResponseDto } from '../../management/interfaces/IPrintQueue';

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

  obtenerSucursales() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IBranchSalesResponseDto[]>>(`${this.apiUrl}${environment.EPListarSucursales}`, { headers });
  }

  crearSucursal(sucursal: IBranchSalesCreateDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPCrearSucursal}`, sucursal, { headers });
  }

  actualizarSucursal(sucursal: IBranchSalesEditDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPActualizarSucursal}/${sucursal.id}`, sucursal, { headers });
  }

  eliminarSucursal(idSucursal: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPEliminarSucursal}/${idSucursal}`;
    return this.http.delete<IResponseGeneric<string>>(url, { headers });
  }

  registrarUbicacionPrenda(ubicacion: IRequestRegistrarUbicacion) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPRegistrarUbicacion}`, ubicacion, { headers });
  }

  asignarUbicacionDetalle(workGuideDetailId: number, req: IAsignarUbicacionDetalleRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPAsignarUbicacionDetalle}/${workGuideDetailId}/assign`;
    return this.http.post<IResponseGeneric<IWorkGuideDetailLocationResponse>>(url, req, { headers });
  }

  obtenerSucursalesCombo() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ISucursalesCombo[]>>(`${this.apiUrl}${environment.EPListarSucursales}`, { headers });
  }

  obtenerSucursalUsuariosPorSucursal(branchId: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IBranchSalesUserResponseDto[]>>(`${this.apiUrl}${environment.EPListarSucursalUsuariosPorSucursal}/${branchId}`, { headers });
  }

  crearSucursalUsuario(sucursalUsuario: IBranchSalesUserCreateDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPCrearSucursalUsuario}`, sucursalUsuario, { headers });
  }

  actualizarSucursalUsuario(sucursalUsuario: IBranchSalesUserEditDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPActualizarSucursalUsuario}/${sucursalUsuario.id}`, sucursalUsuario, { headers });
  }

  eliminarSucursalUsuario(idSucursalUsuario: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPEliminarSucursalUsuario}/${idSucursalUsuario}`;
    return this.http.delete<IResponseGeneric<string>>(url, { headers });
  }

  obtenerUsuariosSistema() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IUsuarioSistema[]>>(`${this.apiUrl}${environment.EPGetUsers}`, { headers });
  }

  obtenerImpresoras() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPrinterResponseDto[]>>(`${this.apiUrl}${environment.EPListarImpresoras}`, { headers });
  }

  crearImpresora(impresora: IPrinterCreateDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPCrearImpresora}`, impresora, { headers });
  }

  actualizarImpresora(impresora: IPrinterEditDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPActualizarImpresora}/${impresora.id}`, impresora, { headers });
  }

  eliminarImpresora(idImpresora: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPEliminarImpresora}/${idImpresora}`;
    return this.http.delete<IResponseGeneric<string>>(url, { headers });
  }

  obtenerWorkerNodes() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IWorkerNodeResponseDto[]>>(`${this.apiUrl}${environment.EPListarWorkerNodes}`, { headers });
  }

  crearWorkerNode(workerNode: IWorkerNodeCreateDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPCrearWorkerNode}`, workerNode, { headers });
  }

  actualizarWorkerNode(workerNode: IWorkerNodeEditDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPActualizarWorkerNode}/${workerNode.id}`, workerNode, { headers });
  }

  eliminarWorkerNode(idWorkerNode: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPEliminarWorkerNode}/${idWorkerNode}`;
    return this.http.delete<IResponseGeneric<string>>(url, { headers });
  }

  obtenerImpresionesPendientes(): Observable<IPrintQueueResponseDto[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IPrintQueueResponseDto[]>(`${this.apiUrl}${environment.EPListarImpresionesPendientes}`, { headers });
  }

  cancelarImpresionPendiente(idImpresionPendiente: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPCancelarImpresionPendiente}/${idImpresionPendiente}/cancel`;
    return this.http.post<IResponseGeneric<string>>(url, {}, { headers });
  }

  reimprimirImpresionPendiente(idImpresionPendiente: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPReimprimirImpresionPendiente}/${idImpresionPendiente}/reprint`;
    return this.http.post<IResponseGeneric<string>>(url, {}, { headers });
  }

}
