import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import { ISalesRegisterFilters, ISalesRegisterResponse } from '../interfaces/IReports';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  private construirParams(filtros: ISalesRegisterFilters): Record<string, string> {
    const params: Record<string, string> = {
      fromDate: filtros.fromDate,
      toDate: filtros.toDate,
    };
    if (filtros.branchId != null) params['branchId'] = String(filtros.branchId);
    if (filtros.customerId != null) params['customerId'] = String(filtros.customerId);
    if (filtros.status) params['status'] = filtros.status;
    return params;
  }

  obtenerRegistroVentas(filtros: ISalesRegisterFilters): Observable<IResponseGeneric<ISalesRegisterResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = this.construirParams(filtros);
    return this.http.get<IResponseGeneric<ISalesRegisterResponse>>(`${this.apiUrl}${environment.EPSalesRegisterReport}`, { headers, params });
  }

  descargarRegistroVentasPdf(filtros: ISalesRegisterFilters): Observable<HttpResponse<Blob>> {
    const params = this.construirParams(filtros);
    return this.http.get(`${this.apiUrl}${environment.EPSalesRegisterReportPdf}`, {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }

  descargarRegistroVentasExcel(filtros: ISalesRegisterFilters): Observable<HttpResponse<Blob>> {
    const params = this.construirParams(filtros);
    return this.http.get(`${this.apiUrl}${environment.EPSalesRegisterReportExcel}`, {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }
}
