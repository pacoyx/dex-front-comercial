import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import { IGeneratePayrollResponse, IPayrollPeriod, IPayrollPeriodCreateRequest, IPayrollSummary } from '../interfaces/IPayroll';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  crearPeriodo(req: IPayrollPeriodCreateRequest): Observable<IResponseGeneric<IPayrollPeriod>> {
    return this.http.post<IResponseGeneric<IPayrollPeriod>>(`${this.apiUrl}${environment.EPPayrollPeriods}`, req, { headers: this.headers });
  }

  listarPeriodos(): Observable<IResponseGeneric<IPayrollPeriod[]>> {
    return this.http.get<IResponseGeneric<IPayrollPeriod[]>>(`${this.apiUrl}${environment.EPPayrollPeriods}`, { headers: this.headers });
  }

  generarPlanilla(periodId: number): Observable<IResponseGeneric<IGeneratePayrollResponse>> {
    return this.http.post<IResponseGeneric<IGeneratePayrollResponse>>(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}/generate`, {}, { headers: this.headers });
  }

  obtenerPlanilla(periodId: number): Observable<IResponseGeneric<IPayrollSummary[]>> {
    return this.http.get<IResponseGeneric<IPayrollSummary[]>>(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}/payroll`, { headers: this.headers });
  }

}
