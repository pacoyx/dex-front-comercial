import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IInvoiceCreateRequest, IInvoiceCreateResponse } from '../interfaces/IOperaciones';
import { IResponseGeneric } from '../interfaces/IMaestros';
import { IFacturasPorParamsResponse, IListInvoiceByIdResponse } from '../interfaces/IReportes';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOperationsService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  crearInvoice(req: IInvoiceCreateRequest): Observable<IResponseGeneric<IInvoiceCreateResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IInvoiceCreateResponse>>(`${this.apiUrl}${environment.EPCrearInvoice}`, req, { headers });
  }

  obtenerInvoicePorId(invoiceId: number): Observable<IResponseGeneric<IListInvoiceByIdResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IListInvoiceByIdResponse>>(`${this.apiUrl}${environment.EPListarInvoice}/${invoiceId}`, { headers });
  }

  obtenerFacturasPorMes(ayo: number, mes: number, pageIndex: number, pageSize: number): Observable<IResponseGeneric<IFacturasPorParamsResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IFacturasPorParamsResponse>>(`${this.apiUrl}${environment.EPFacturasPorMes}/${pageIndex}/${pageSize}/${mes}/${ayo}`, { headers });
  }

  obtenerFacturasPorFechas(fechaInicio: string, fechaFin: string, pageIndex: number, pageSize: number): Observable<IResponseGeneric<IFacturasPorParamsResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { startDate: fechaInicio, endDate: fechaFin };
    return this.http.get<IResponseGeneric<IFacturasPorParamsResponse>>(`${this.apiUrl}${environment.EPFacturasPorFechas}/${pageIndex}/${pageSize}`, { headers, params });
  }

  obtenerFacturasPorProveedor(supplierId: number, pageIndex: number, pageSize: number): Observable<IResponseGeneric<IFacturasPorParamsResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IFacturasPorParamsResponse>>(`${this.apiUrl}${environment.EPFacturasPorProveedor}/${pageIndex}/${pageSize}/${supplierId}`, { headers });
  }

  obtenerFacturasPorProducto(producto: string, pageIndex: number, pageSize: number): Observable<IResponseGeneric<IFacturasPorParamsResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IFacturasPorParamsResponse>>(`${this.apiUrl}${environment.EPFacturasPorProducto}/${pageIndex}/${pageSize}/${producto}`, { headers });
  }



}
