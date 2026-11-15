import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import { IDeletePayrollResponse, IGeneratePayrollResponse, IPayrollDiscount, IPayrollDiscountChangeResponse, IPayrollDiscountCreateRequest, IPayrollPeriod, IPayrollPeriodCreateRequest, IPayrollSummary } from '../interfaces/IPayroll';

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

  eliminarPlanilla(periodId: number): Observable<IResponseGeneric<IDeletePayrollResponse>> {
    return this.http.delete<IResponseGeneric<IDeletePayrollResponse>>(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}/payroll`, { headers: this.headers });
  }

  /** Elimina el periodo completo: planillas generadas (revirtiendo cuotas), descuentos y el periodo. */
  eliminarPeriodo(periodId: number): Observable<IResponseGeneric<IDeletePayrollResponse>> {
    return this.http.delete<IResponseGeneric<IDeletePayrollResponse>>(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}`, { headers: this.headers });
  }

  exportarPlanillaExcel(periodId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}/payroll/excel`, { observe: 'response', responseType: 'blob' });
  }

  exportarPlanillaPdf(periodId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}/payroll/pdf`, { observe: 'response', responseType: 'blob' });
  }

  listarDescuentos(periodId: number, employeeId?: number): Observable<IResponseGeneric<IPayrollDiscount[]>> {
    const params: Record<string, string> = {};
    if (employeeId != null) params['employeeId'] = String(employeeId);
    return this.http.get<IResponseGeneric<IPayrollDiscount[]>>(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}/discounts`, { headers: this.headers, params });
  }

  agregarDescuento(periodId: number, req: IPayrollDiscountCreateRequest): Observable<IResponseGeneric<IPayrollDiscountChangeResponse>> {
    return this.http.post<IResponseGeneric<IPayrollDiscountChangeResponse>>(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}/discounts`, req, { headers: this.headers });
  }

  eliminarDescuento(periodId: number, discountId: number): Observable<IResponseGeneric<IPayrollDiscountChangeResponse>> {
    return this.http.delete<IResponseGeneric<IPayrollDiscountChangeResponse>>(`${this.apiUrl}${environment.EPPayrollPeriods}/${periodId}/discounts/${discountId}`, { headers: this.headers });
  }

}
