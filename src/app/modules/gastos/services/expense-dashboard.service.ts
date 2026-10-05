import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import {
  IExpenseByBranch,
  IExpenseByCategory,
  IExpenseDashboardSummary,
  IExpenseMonthlyTrend,
  IExpenseRecentOrTop,
} from '../interfaces/IExpenseDashboard';

@Injectable({
  providedIn: 'root'
})
export class ExpenseDashboardService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  obtenerResumen(): Observable<IResponseGeneric<IExpenseDashboardSummary>> {
    return this.http.get<IResponseGeneric<IExpenseDashboardSummary>>(`${this.apiUrl}${environment.EPExpenseDashboard}`, { headers: this.headers });
  }

  obtenerPorCategoria(): Observable<IResponseGeneric<IExpenseByCategory[]>> {
    return this.http.get<IResponseGeneric<IExpenseByCategory[]>>(`${this.apiUrl}${environment.EPExpenseDashboard}/by-category`, { headers: this.headers });
  }

  obtenerPorSucursal(): Observable<IResponseGeneric<IExpenseByBranch[]>> {
    return this.http.get<IResponseGeneric<IExpenseByBranch[]>>(`${this.apiUrl}${environment.EPExpenseDashboard}/by-branch`, { headers: this.headers });
  }

  obtenerTendenciaMensual(): Observable<IResponseGeneric<IExpenseMonthlyTrend[]>> {
    return this.http.get<IResponseGeneric<IExpenseMonthlyTrend[]>>(`${this.apiUrl}${environment.EPExpenseDashboard}/monthly-trend`, { headers: this.headers });
  }

  obtenerRecientes(): Observable<IResponseGeneric<IExpenseRecentOrTop[]>> {
    return this.http.get<IResponseGeneric<IExpenseRecentOrTop[]>>(`${this.apiUrl}${environment.EPExpenseDashboard}/recent-expenses`, { headers: this.headers });
  }

  obtenerTop(): Observable<IResponseGeneric<IExpenseRecentOrTop[]>> {
    return this.http.get<IResponseGeneric<IExpenseRecentOrTop[]>>(`${this.apiUrl}${environment.EPExpenseDashboard}/top-expenses`, { headers: this.headers });
  }

}
