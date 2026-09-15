import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import {
  ICollectionSheet,
  ICollectionSheetCloseResponse,
  ICollectionSheetCreateRequest,
  ICollectionSheetPaymentRequest,
} from '../interfaces/ICollectionSheets';
import { IInvoicePayment } from '../interfaces/IInvoices';

@Injectable({
  providedIn: 'root'
})
export class CollectionSheetsService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  crearPlanilla(req: ICollectionSheetCreateRequest): Observable<IResponseGeneric<ICollectionSheet>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<ICollectionSheet>>(`${this.apiUrl}${environment.EPCollectionSheets}`, req, { headers });
  }

  obtenerPlanillaPorId(id: number): Observable<IResponseGeneric<ICollectionSheet>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICollectionSheet>>(`${this.apiUrl}${environment.EPCollectionSheets}/${id}`, { headers });
  }

  listarPlanillas(): Observable<IResponseGeneric<ICollectionSheet[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICollectionSheet[]>>(`${this.apiUrl}${environment.EPCollectionSheets}`, { headers });
  }

  agregarCobro(collectionSheetId: number, req: ICollectionSheetPaymentRequest): Observable<IResponseGeneric<IInvoicePayment>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IInvoicePayment>>(`${this.apiUrl}${environment.EPCollectionSheets}/${collectionSheetId}/payments`, req, { headers });
  }

  listarCobros(collectionSheetId: number): Observable<IResponseGeneric<IInvoicePayment[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IInvoicePayment[]>>(`${this.apiUrl}${environment.EPCollectionSheets}/${collectionSheetId}/payments`, { headers });
  }

  cerrarPlanilla(id: number): Observable<IResponseGeneric<ICollectionSheetCloseResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<ICollectionSheetCloseResponse>>(`${this.apiUrl}${environment.EPCollectionSheets}/${id}/close`, {}, { headers });
  }

}
