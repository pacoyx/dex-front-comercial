import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponseGeneric } from '../interfaces/IMaestros';
import {
  IPurchaseDashboardSummary,
  IPurchaseMonthlyPurchase,
  IPurchaseRecentPurchase,
  IPurchaseTopProduct,
} from '../interfaces/IPurchaseDashboard';
import { IAccountPayable } from '../interfaces/IAccountsPayable';

@Injectable({
  providedIn: 'root'
})
export class PurchaseDashboardService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  obtenerResumen(): Observable<IResponseGeneric<IPurchaseDashboardSummary>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPurchaseDashboardSummary>>(`${this.apiUrl}${environment.EPPurchaseDashboard}`, { headers });
  }

  obtenerComprasPorMes(): Observable<IResponseGeneric<IPurchaseMonthlyPurchase[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPurchaseMonthlyPurchase[]>>(`${this.apiUrl}${environment.EPPurchaseDashboard}/monthly-purchases`, { headers });
  }

  obtenerTopProductos(): Observable<IResponseGeneric<IPurchaseTopProduct[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPurchaseTopProduct[]>>(`${this.apiUrl}${environment.EPPurchaseDashboard}/top-products`, { headers });
  }

  obtenerComprasRecientes(): Observable<IResponseGeneric<IPurchaseRecentPurchase[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPurchaseRecentPurchase[]>>(`${this.apiUrl}${environment.EPPurchaseDashboard}/recent-purchases`, { headers });
  }

  obtenerCuentasPorPagarTop(): Observable<IResponseGeneric<IAccountPayable[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IAccountPayable[]>>(`${this.apiUrl}${environment.EPPurchaseDashboard}/accounts-payable`, { headers });
  }

}
