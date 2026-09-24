import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import { IEmployeesByArea, IHrDashboardSummary, IPendingLoanItem, IUpcomingBirthday } from '../interfaces/IHrDashboard';

@Injectable({
  providedIn: 'root'
})
export class HrDashboardService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  obtenerResumen(): Observable<IResponseGeneric<IHrDashboardSummary>> {
    return this.http.get<IResponseGeneric<IHrDashboardSummary>>(`${this.apiUrl}${environment.EPHrDashboard}`, { headers: this.headers });
  }

  obtenerTrabajadoresPorArea(): Observable<IResponseGeneric<IEmployeesByArea[]>> {
    return this.http.get<IResponseGeneric<IEmployeesByArea[]>>(`${this.apiUrl}${environment.EPHrDashboard}/employees-by-area`, { headers: this.headers });
  }

  obtenerPrestamosPendientes(): Observable<IResponseGeneric<IPendingLoanItem[]>> {
    return this.http.get<IResponseGeneric<IPendingLoanItem[]>>(`${this.apiUrl}${environment.EPHrDashboard}/pending-loans`, { headers: this.headers });
  }

  obtenerProximosCumpleanos(days?: number): Observable<IResponseGeneric<IUpcomingBirthday[]>> {
    const params: Record<string, string> = {};
    if (days != null) params['days'] = String(days);
    return this.http.get<IResponseGeneric<IUpcomingBirthday[]>>(`${this.apiUrl}${environment.EPHrDashboard}/upcoming-birthdays`, { headers: this.headers, params });
  }

}
