import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import { IValuationReportFilters, IValuationReportResponse } from '../interfaces/IValuationReport';

@Injectable({
  providedIn: 'root'
})
export class ValuationReportService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  private construirParams(filtros: IValuationReportFilters): Record<string, string> {
    return {
      customerId: String(filtros.customerId),
      fromDate: filtros.fromDate,
      toDate: filtros.toDate,
    };
  }

  consultar(filtros: IValuationReportFilters): Observable<IResponseGeneric<IValuationReportResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IValuationReportResponse>>(`${this.apiUrl}${environment.EPValuationReport}`, {
      headers,
      params: this.construirParams(filtros),
    });
  }

  descargarFotosPdf(filtros: IValuationReportFilters): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${environment.EPValuationReportPhotosPdf}`, {
      params: this.construirParams(filtros),
      responseType: 'blob',
      observe: 'response',
    });
  }

  descargarResumenPdf(filtros: IValuationReportFilters): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${environment.EPValuationReportSummaryPdf}`, {
      params: this.construirParams(filtros),
      responseType: 'blob',
      observe: 'response',
    });
  }

  descargarResumenExcel(filtros: IValuationReportFilters): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${environment.EPValuationReportSummaryExcel}`, {
      params: this.construirParams(filtros),
      responseType: 'blob',
      observe: 'response',
    });
  }
}
