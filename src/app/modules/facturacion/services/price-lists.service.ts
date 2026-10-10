import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import {
  IClonePriceListRequest,
  ICreatePriceListRequest,
  ICustomerPriceList,
  ICustomerPriceListSummary,
  IUpdatePriceListRequest,
} from '../interfaces/IPriceList';

@Injectable({
  providedIn: 'root'
})
export class PriceListsService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listarPorCliente(customerId: number): Observable<IResponseGeneric<ICustomerPriceListSummary[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICustomerPriceListSummary[]>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/price-lists`, { headers });
  }

  obtenerActiva(customerId: number): Observable<IResponseGeneric<ICustomerPriceList>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICustomerPriceList>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/price-lists/active`, { headers });
  }

  crear(customerId: number, req: ICreatePriceListRequest): Observable<IResponseGeneric<ICustomerPriceList>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<ICustomerPriceList>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/price-lists`, req, { headers });
  }

  obtenerPorId(id: number): Observable<IResponseGeneric<ICustomerPriceList>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICustomerPriceList>>(`${this.apiUrl}${environment.EPPriceLists}/${id}`, { headers });
  }

  actualizar(id: number, req: IUpdatePriceListRequest): Observable<IResponseGeneric<ICustomerPriceList>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<ICustomerPriceList>>(`${this.apiUrl}${environment.EPPriceLists}/${id}`, req, { headers });
  }

  clonar(id: number, req: IClonePriceListRequest): Observable<IResponseGeneric<ICustomerPriceList>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<ICustomerPriceList>>(`${this.apiUrl}${environment.EPPriceLists}/${id}/clone`, req, { headers });
  }

  activar(id: number): Observable<IResponseGeneric<unknown>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<unknown>>(`${this.apiUrl}${environment.EPPriceLists}/${id}/activate`, {}, { headers });
  }

  desactivar(id: number): Observable<IResponseGeneric<unknown>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<unknown>>(`${this.apiUrl}${environment.EPPriceLists}/${id}/deactivate`, {}, { headers });
  }

}
