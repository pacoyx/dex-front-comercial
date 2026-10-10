import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import {
  IChangePickupGuideStatusRequest,
  ICreatePickupGuideRequest,
  IPickupGuide,
  IPickupGuideFilters,
  IPickupGuideSummary,
  IUpdatePickupGuideRequest,
} from '../interfaces/IPickupGuide';

@Injectable({
  providedIn: 'root'
})
export class PickupGuidesService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listar(filtros: IPickupGuideFilters): Observable<IResponseGeneric<IPickupGuideSummary[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();
    if (filtros.customerId != null) params = params.set('customerId', String(filtros.customerId));
    if (filtros.status != null) params = params.set('status', String(filtros.status));
    if (filtros.fromDate) params = params.set('fromDate', filtros.fromDate);
    if (filtros.toDate) params = params.set('toDate', filtros.toDate);
    return this.http.get<IResponseGeneric<IPickupGuideSummary[]>>(`${this.apiUrl}${environment.EPPickupGuides}`, { headers, params });
  }

  obtenerPorId(id: number): Observable<IResponseGeneric<IPickupGuide>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPickupGuide>>(`${this.apiUrl}${environment.EPPickupGuides}/${id}`, { headers });
  }

  crear(req: ICreatePickupGuideRequest): Observable<IResponseGeneric<IPickupGuide>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IPickupGuide>>(`${this.apiUrl}${environment.EPPickupGuides}`, req, { headers });
  }

  actualizar(id: number, req: IUpdatePickupGuideRequest): Observable<IResponseGeneric<IPickupGuide>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<IPickupGuide>>(`${this.apiUrl}${environment.EPPickupGuides}/${id}`, req, { headers });
  }

  cambiarEstado(id: number, req: IChangePickupGuideStatusRequest): Observable<IResponseGeneric<unknown>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<unknown>>(`${this.apiUrl}${environment.EPPickupGuides}/${id}/status`, req, { headers });
  }

}
