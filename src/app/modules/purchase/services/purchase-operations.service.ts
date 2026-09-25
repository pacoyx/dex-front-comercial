import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IInvoiceCreateRequest,
  IInvoiceCreateResponse,
  IPurchaseInvoiceCancelResponse,
  IPurchaseInvoiceListFilters,
  IPurchaseInvoiceListItem,
  IPurchaseInvoicePayment,
  IRegisterPurchasePaymentRequest,
} from '../interfaces/IOperaciones';
import { IResponseGeneric } from '../interfaces/IMaestros';
import { IFacturasPorParamsResponse, IListInvoiceByIdResponse, IPurchaseRegisterFilters, IPurchaseRegisterResponse } from '../interfaces/IReportes';
import { IAccountPayable } from '../interfaces/IAccountsPayable';

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

  listarFacturas(filtros: IPurchaseInvoiceListFilters): Observable<IResponseGeneric<IPurchaseInvoiceListItem[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();
    if (filtros.supplierId) {
      params = params.set('supplierId', filtros.supplierId);
    }
    if (filtros.dateFrom) {
      params = params.set('dateFrom', filtros.dateFrom);
    }
    if (filtros.dateTo) {
      params = params.set('dateTo', filtros.dateTo);
    }
    if (filtros.status) {
      params = params.set('status', filtros.status);
    }
    return this.http.get<IResponseGeneric<IPurchaseInvoiceListItem[]>>(`${this.apiUrl}${environment.EPListarInvoice}`, { headers, params });
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

  registrarPago(purchaseInvoiceId: number, req: IRegisterPurchasePaymentRequest): Observable<IResponseGeneric<IPurchaseInvoicePayment>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IPurchaseInvoicePayment>>(`${this.apiUrl}${environment.EPListarInvoice}/${purchaseInvoiceId}/payments`, req, { headers });
  }

  listarPagos(purchaseInvoiceId: number): Observable<IResponseGeneric<IPurchaseInvoicePayment[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPurchaseInvoicePayment[]>>(`${this.apiUrl}${environment.EPListarInvoice}/${purchaseInvoiceId}/payments`, { headers });
  }

  anularCompra(purchaseInvoiceId: number): Observable<IResponseGeneric<IPurchaseInvoiceCancelResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IPurchaseInvoiceCancelResponse>>(`${this.apiUrl}${environment.EPListarInvoice}/${purchaseInvoiceId}/cancel`, {}, { headers });
  }

  obtenerCuentasPorPagar(): Observable<IResponseGeneric<IAccountPayable[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IAccountPayable[]>>(`${this.apiUrl}${environment.EPAccountsPayable}`, { headers });
  }

  private construirParamsRegistroCompras(filtros: IPurchaseRegisterFilters): Record<string, string> {
    const params: Record<string, string> = {
      fromDate: filtros.fromDate,
      toDate: filtros.toDate,
    };
    if (filtros.supplierId != null) params['supplierId'] = String(filtros.supplierId);
    if (filtros.status != null) params['status'] = String(filtros.status);
    return params;
  }

  obtenerRegistroCompras(filtros: IPurchaseRegisterFilters): Observable<IResponseGeneric<IPurchaseRegisterResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = this.construirParamsRegistroCompras(filtros);
    return this.http.get<IResponseGeneric<IPurchaseRegisterResponse>>(`${this.apiUrl}${environment.EPPurchaseRegisterReport}`, { headers, params });
  }

  descargarRegistroComprasPdf(filtros: IPurchaseRegisterFilters): Observable<HttpResponse<Blob>> {
    const params = this.construirParamsRegistroCompras(filtros);
    return this.http.get(`${this.apiUrl}${environment.EPPurchaseRegisterReportPdf}`, {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }

  descargarRegistroComprasExcel(filtros: IPurchaseRegisterFilters): Observable<HttpResponse<Blob>> {
    const params = this.construirParamsRegistroCompras(filtros);
    return this.http.get(`${this.apiUrl}${environment.EPPurchaseRegisterReportExcel}`, {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }

}
