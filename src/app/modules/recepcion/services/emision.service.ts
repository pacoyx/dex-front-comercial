import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IListaCategorias } from '../interfaces/IListaCategorias';
import { IListaItemsBusqueda } from '../interfaces/IListaItemsBusqueda';
import { ResponseIClienteBusqueda } from '../components/dialog-cliente/dialog-cliente.component';
import { IClienteCreate } from '../interfaces/IClienteCreate';
import { ICliente } from '../interfaces/ICliente';
import { INumeracionDoc } from '../interfaces/INumeracionDoc';
import { ICreateGuideWork } from '../interfaces/ICreateGuideWork';
import { IResponseGeneric } from '../interfaces/IResponseGeneric';
import { IGuiaRetiro } from '../interfaces/IDetalleGuiaRetiro';
import { IReqGuiaInfoPay } from '../interfaces/IReqGuiaInfoPay';
import { ICreateAlertaRequest, ICreateAlertaResponse, IListarAlertasResponse } from '../interfaces/IAlertas';
import { IDevolucionPrendaRequest } from '../interfaces/IDevoluciones';


@Injectable({
  providedIn: 'root'
})
export class EmisionService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  obtenerNumeracion(branchId: number, typeDoc: string, serieDoc: string): Observable<IResponseGeneric<INumeracionDoc>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { branchId: branchId.toString(), typeDoc, serieDoc };
    return this.http.get<IResponseGeneric<INumeracionDoc>>(this.apiUrl + environment.EPObtenerNumeracion, { headers, params });
  }

  listarCategoriasSevicios(): Observable<IListaCategorias[]> {
    // const body = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IListaCategorias[]>(this.apiUrl + environment.EPListarCategoriasServicios, { headers });
  }

  listarSeviciosXCategorias(idcat: number): Observable<IListaItemsBusqueda[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPListarServiciosPorCat}/${idcat}`;
    return this.http.get<IListaItemsBusqueda[]>(url, { headers });
  }

  filtrarClientesPorPatron(patron: string): Observable<ResponseIClienteBusqueda> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPFiltrarClientesPorPatron}/${patron}`;
    return this.http.get<ResponseIClienteBusqueda>(url, { headers });
  }

  registrarCliente(cliente: IClienteCreate): Observable<ICliente> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPRegistrarCliente}`;
    return this.http.post<ICliente>(url, cliente, { headers });
  }

  filtrarServiciosPorPatron(patron: string): Observable<IListaItemsBusqueda[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPFiltrarServiciosPorPatron}/${patron}`;
    return this.http.get<IListaItemsBusqueda[]>(url, { headers });
  }

  grabarGuiaTrabajo(guia: ICreateGuideWork): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPGrabarGuiaTrabajo}`;
    return this.http.post<any>(url, guia, { headers });
  }

  ObtenerGuiaPorId(numGuia: number): Observable<IResponseGeneric<IGuiaRetiro>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPRetiroGuiaTrabajo}/${numGuia}`;
    return this.http.get<IResponseGeneric<IGuiaRetiro>>(url, { headers });
  }

  ObtenerGuiaPorDocumento(serieGuia: string, numGuia: string): Observable<IResponseGeneric<IGuiaRetiro>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPObtenerGuiaPorDocumento}/${serieGuia}/${numGuia}`;
    return this.http.get<IResponseGeneric<IGuiaRetiro>>(url, { headers });
  }

  ActualizarGuiaInfoPago(idGuia: number, guiaInfoPago: IReqGuiaInfoPay): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPActualizarGuiaInfoPago}/${idGuia}`;
    return this.http.put<IResponseGeneric<string>>(url, guiaInfoPago, { headers });
  }

  ActualizarEstadoRecojo(idGuia: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPActualizarEstadoRecojo}/${idGuia}`;
    return this.http.put<IResponseGeneric<string>>(url, {}, { headers });
  }

  AnularGuia(idGuia: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPAnularGuia}/${idGuia}`;
    return this.http.put<IResponseGeneric<string>>(url, {}, { headers });
  }

  CrearAlerta(alerta: ICreateAlertaRequest): Observable<IResponseGeneric<ICreateAlertaResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPCrearAlerta}`;
    return this.http.post<IResponseGeneric<ICreateAlertaResponse>>(url, alerta, { headers });
  }

  ListarAlertasPorGuiaId(idGuia: number): Observable<IResponseGeneric<IListarAlertasResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPListarAlertas}/${idGuia}`;
    return this.http.get<IResponseGeneric<IListarAlertasResponse>>(url, { headers });
  }

  DevolverPrendas(idItem: number, req: IDevolucionPrendaRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPDevolverPrendas}/${idItem}`;
    return this.http.put<IResponseGeneric<string>>(url, req, { headers });
  }

}
