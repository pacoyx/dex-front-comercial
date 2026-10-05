import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import {
  IExpenseAggregateReportResponse,
  IExpenseDetailReportResponse,
  IExpenseReportFilters,
} from '../interfaces/IExpenseReports';

@Injectable({
  providedIn: 'root'
})
export class ExpenseReportsService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  private construirParams(filtros: IExpenseReportFilters): Record<string, string> {
    const params: Record<string, string> = {
      fromDate: filtros.fromDate,
      toDate: filtros.toDate,
    };
    if (filtros.branchSalesId != null) params['branchSalesId'] = String(filtros.branchSalesId);
    if (filtros.expenseCategoryId != null) params['expenseCategoryId'] = String(filtros.expenseCategoryId);
    if (filtros.sourceType) params['sourceType'] = filtros.sourceType;
    return params;
  }

  private obtenerDetalle(sufijo: string, filtros: IExpenseReportFilters): Observable<IResponseGeneric<IExpenseDetailReportResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = this.construirParams(filtros);
    return this.http.get<IResponseGeneric<IExpenseDetailReportResponse>>(`${this.apiUrl}${environment.EPExpenseReports}/${sufijo}`, { headers, params });
  }

  private obtenerAgregado(sufijo: string, filtros: IExpenseReportFilters): Observable<IResponseGeneric<IExpenseAggregateReportResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = this.construirParams(filtros);
    return this.http.get<IResponseGeneric<IExpenseAggregateReportResponse>>(`${this.apiUrl}${environment.EPExpenseReports}/${sufijo}`, { headers, params });
  }

  private descargar(sufijo: string, filtros: IExpenseReportFilters): Observable<HttpResponse<Blob>> {
    const params = this.construirParams(filtros);
    return this.http.get(`${this.apiUrl}${environment.EPExpenseReports}/${sufijo}`, {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }

  // Por periodo
  obtenerPorPeriodo(filtros: IExpenseReportFilters) { return this.obtenerDetalle('by-period', filtros); }
  descargarPorPeriodoPdf(filtros: IExpenseReportFilters) { return this.descargar('by-period/pdf', filtros); }
  descargarPorPeriodoExcel(filtros: IExpenseReportFilters) { return this.descargar('by-period/excel', filtros); }

  // Con documento de sustento
  obtenerConDocumento(filtros: IExpenseReportFilters) { return this.obtenerDetalle('with-supporting-documents', filtros); }
  descargarConDocumentoPdf(filtros: IExpenseReportFilters) { return this.descargar('with-supporting-documents/pdf', filtros); }
  descargarConDocumentoExcel(filtros: IExpenseReportFilters) { return this.descargar('with-supporting-documents/excel', filtros); }

  // Por categoria
  obtenerPorCategoria(filtros: IExpenseReportFilters) { return this.obtenerAgregado('by-category', filtros); }
  descargarPorCategoriaPdf(filtros: IExpenseReportFilters) { return this.descargar('by-category/pdf', filtros); }
  descargarPorCategoriaExcel(filtros: IExpenseReportFilters) { return this.descargar('by-category/excel', filtros); }

  // Por sucursal
  obtenerPorSucursal(filtros: IExpenseReportFilters) { return this.obtenerAgregado('by-branch', filtros); }
  descargarPorSucursalPdf(filtros: IExpenseReportFilters) { return this.descargar('by-branch/pdf', filtros); }
  descargarPorSucursalExcel(filtros: IExpenseReportFilters) { return this.descargar('by-branch/excel', filtros); }

}
