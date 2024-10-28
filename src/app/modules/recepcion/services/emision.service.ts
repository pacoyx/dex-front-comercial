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

  grabarGuiaTrabajo(guia:ICreateGuideWork): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPGrabarGuiaTrabajo}`;
    return this.http.post<any>(url, guia, { headers });
  }

}
