import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import {
  IInvoiceCancelResponse,
  IInvoiceCreateRequest,
  IInvoiceCreateResponse,
  IInvoiceDetail,
  IInvoiceListFilters,
  IInvoiceListItem,
  IInvoicePayment,
  IPaymentCreateRequest,
} from '../interfaces/IInvoices';
import { IAccountReceivable } from '../interfaces/IAccountsReceivable';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  crearFactura(req: IInvoiceCreateRequest): Observable<IResponseGeneric<IInvoiceCreateResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IInvoiceCreateResponse>>(`${this.apiUrl}${environment.EPSalesInvoices}`, req, { headers });
  }

  obtenerFacturaPorId(id: number): Observable<IResponseGeneric<IInvoiceDetail>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IInvoiceDetail>>(`${this.apiUrl}${environment.EPSalesInvoices}/${id}`, { headers });
  }

  listarFacturas(filtros: IInvoiceListFilters): Observable<IResponseGeneric<IInvoiceListItem[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params: Record<string, string> = {};
    if (filtros.customerId != null) params['customerId'] = String(filtros.customerId);
    if (filtros.dateFrom) params['dateFrom'] = filtros.dateFrom;
    if (filtros.dateTo) params['dateTo'] = filtros.dateTo;
    if (filtros.status != null) params['status'] = String(filtros.status);
    return this.http.get<IResponseGeneric<IInvoiceListItem[]>>(`${this.apiUrl}${environment.EPSalesInvoices}`, { headers, params });
  }

  anularFactura(id: number): Observable<IResponseGeneric<IInvoiceCancelResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IInvoiceCancelResponse>>(`${this.apiUrl}${environment.EPSalesInvoices}/${id}/cancel`, {}, { headers });
  }

  registrarPago(invoiceId: number, req: IPaymentCreateRequest): Observable<IResponseGeneric<IInvoicePayment>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IInvoicePayment>>(`${this.apiUrl}${environment.EPSalesInvoices}/${invoiceId}/payments`, req, { headers });
  }

  listarPagos(invoiceId: number): Observable<IResponseGeneric<IInvoicePayment[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IInvoicePayment[]>>(`${this.apiUrl}${environment.EPSalesInvoices}/${invoiceId}/payments`, { headers });
  }

  obtenerCuentasPorCobrar(): Observable<IResponseGeneric<IAccountReceivable[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IAccountReceivable[]>>(`${this.apiUrl}${environment.EPAccountsReceivable}`, { headers });
  }

}
