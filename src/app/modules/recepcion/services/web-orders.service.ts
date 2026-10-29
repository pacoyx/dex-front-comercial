import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IResponseGeneric';
import { IConfirmWebOrderResponse, IRejectWebOrderRequest, IScheduleWebOrderRequest, IWebOrderAdminSummary, WebOrderStatus } from '../interfaces/IWebOrderAdmin';
import { ICreateDistrictRequest, IDistrictAdmin, IUpdateDistrictRequest, IZone } from '../interfaces/IDistrict';
import { ICreateZonePriceListRequest, IUpdateZonePriceListRequest, IZonePriceListAdmin, IZonePriceListSummary } from '../interfaces/IZonePriceList';

@Injectable({
  providedIn: 'root'
})
export class WebOrdersService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listarPedidosWeb(status?: WebOrderStatus): Observable<IResponseGeneric<IWebOrderAdminSummary[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}`;
    return this.http.get<IResponseGeneric<IWebOrderAdminSummary[]>>(url, { headers, params });
  }

  confirmarPedido(id: number): Observable<IResponseGeneric<IConfirmWebOrderResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/${id}/confirm`;
    return this.http.post<IResponseGeneric<IConfirmWebOrderResponse>>(url, {}, { headers });
  }

  rechazarPedido(id: number, req: IRejectWebOrderRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/${id}/reject`;
    return this.http.put<IResponseGeneric<string>>(url, req, { headers });
  }

  programarPedido(id: number, req: IScheduleWebOrderRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/${id}/schedule`;
    return this.http.put<IResponseGeneric<string>>(url, req, { headers });
  }

  obtenerZonas(): Observable<IResponseGeneric<IZone[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrderZones}`;
    return this.http.get<IResponseGeneric<IZone[]>>(url, { headers });
  }

  // Distritos

  listarDistritos(): Observable<IResponseGeneric<IDistrictAdmin[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/districts`;
    return this.http.get<IResponseGeneric<IDistrictAdmin[]>>(url, { headers });
  }

  crearDistrito(req: ICreateDistrictRequest): Observable<IResponseGeneric<IDistrictAdmin>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/districts`;
    return this.http.post<IResponseGeneric<IDistrictAdmin>>(url, req, { headers });
  }

  actualizarDistrito(id: number, req: IUpdateDistrictRequest): Observable<IResponseGeneric<IDistrictAdmin>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/districts/${id}`;
    return this.http.put<IResponseGeneric<IDistrictAdmin>>(url, req, { headers });
  }

  // Tarifas por zona

  listarTarifasPorZona(zoneId: number): Observable<IResponseGeneric<IZonePriceListSummary[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/zones/${zoneId}/price-lists`;
    return this.http.get<IResponseGeneric<IZonePriceListSummary[]>>(url, { headers });
  }

  obtenerTarifaPorZona(id: number): Observable<IResponseGeneric<IZonePriceListAdmin>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/zone-price-lists/${id}`;
    return this.http.get<IResponseGeneric<IZonePriceListAdmin>>(url, { headers });
  }

  crearTarifaPorZona(zoneId: number, req: ICreateZonePriceListRequest): Observable<IResponseGeneric<IZonePriceListAdmin>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/zones/${zoneId}/price-lists`;
    return this.http.post<IResponseGeneric<IZonePriceListAdmin>>(url, req, { headers });
  }

  actualizarTarifaPorZona(id: number, req: IUpdateZonePriceListRequest): Observable<IResponseGeneric<IZonePriceListAdmin>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/zone-price-lists/${id}`;
    return this.http.put<IResponseGeneric<IZonePriceListAdmin>>(url, req, { headers });
  }

  activarTarifaPorZona(id: number): Observable<IResponseGeneric<{ id: number; isActive: boolean }>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/zone-price-lists/${id}/activate`;
    return this.http.post<IResponseGeneric<{ id: number; isActive: boolean }>>(url, {}, { headers });
  }

  desactivarTarifaPorZona(id: number): Observable<IResponseGeneric<{ id: number; isActive: boolean }>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWebOrdersAdmin}/zone-price-lists/${id}/deactivate`;
    return this.http.post<IResponseGeneric<{ id: number; isActive: boolean }>>(url, {}, { headers });
  }

}
