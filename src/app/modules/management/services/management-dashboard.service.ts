import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import { IManagementDashboard } from '../interfaces/IManagementDashboard';

@Injectable({
  providedIn: 'root'
})
export class ManagementDashboardService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  obtenerResumen(): Observable<IResponseGeneric<IManagementDashboard>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IManagementDashboard>>(`${this.apiUrl}${environment.EPManagementDashboard}`, { headers });
  }

}
