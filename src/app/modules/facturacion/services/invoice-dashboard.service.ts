import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import {
  IBranchSalesItem,
  ICustomerSalesFilters,
  ICustomerSalesItem,
  IInvoiceAccountReceivableTop,
  IInvoiceDashboardSummary,
  IInvoiceMonthlySales,
  IInvoiceStatusSummary,
  IOverdueInvoice,
  IRecentInvoice,
  IServiceSalesItem,
  ITopCustomer,
} from '../interfaces/IInvoiceDashboard';

@Injectable({
  providedIn: 'root'
})
export class InvoiceDashboardService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  obtenerResumen(): Observable<IResponseGeneric<IInvoiceDashboardSummary>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IInvoiceDashboardSummary>>(`${this.apiUrl}${environment.EPInvoiceDashboard}`, { headers });
  }

  obtenerVentasPorMes(): Observable<IResponseGeneric<IInvoiceMonthlySales[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IInvoiceMonthlySales[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/monthly-sales`, { headers });
  }

  obtenerResumenPorEstado(): Observable<IResponseGeneric<IInvoiceStatusSummary[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IInvoiceStatusSummary[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/status-summary`, { headers });
  }

  obtenerCuentasPorCobrarTop(): Observable<IResponseGeneric<IInvoiceAccountReceivableTop[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IInvoiceAccountReceivableTop[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/accounts-receivable`, { headers });
  }

  obtenerFacturasVencidas(): Observable<IResponseGeneric<IOverdueInvoice[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IOverdueInvoice[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/overdue-invoices`, { headers });
  }

  obtenerTopClientes(): Observable<IResponseGeneric<ITopCustomer[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ITopCustomer[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/top-customers`, { headers });
  }

  obtenerFacturasRecientes(): Observable<IResponseGeneric<IRecentInvoice[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IRecentInvoice[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/recent-invoices`, { headers });
  }

  obtenerVentasPorCliente(filtros: ICustomerSalesFilters): Observable<IResponseGeneric<ICustomerSalesItem[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();
    if (filtros.dateFrom) {
      params = params.set('dateFrom', filtros.dateFrom);
    }
    if (filtros.dateTo) {
      params = params.set('dateTo', filtros.dateTo);
    }
    return this.http.get<IResponseGeneric<ICustomerSalesItem[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/customer-sales`, { headers, params });
  }

  obtenerVentasPorSucursal(): Observable<IResponseGeneric<IBranchSalesItem[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IBranchSalesItem[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/branch-sales`, { headers });
  }

  obtenerVentasPorServicio(): Observable<IResponseGeneric<IServiceSalesItem[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IServiceSalesItem[]>>(`${this.apiUrl}${environment.EPInvoiceDashboard}/service-sales`, { headers });
  }

}
