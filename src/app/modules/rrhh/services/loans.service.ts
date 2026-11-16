import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import { ILoan, ILoanCreateRequest, ILoanDeleteResponse, ILoanListFilters } from '../interfaces/ILoans';

@Injectable({
  providedIn: 'root'
})
export class LoansService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  crearPrestamo(employeeId: number, req: ILoanCreateRequest): Observable<IResponseGeneric<ILoan>> {
    return this.http.post<IResponseGeneric<ILoan>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/loans`, req, { headers: this.headers });
  }

  crearAdelanto(employeeId: number, req: ILoanCreateRequest): Observable<IResponseGeneric<ILoan>> {
    return this.http.post<IResponseGeneric<ILoan>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/salary-advances`, req, { headers: this.headers });
  }

  listarPrestamos(filtros: ILoanListFilters): Observable<IResponseGeneric<ILoan[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.loanType != null) params['loanType'] = String(filtros.loanType);
    if (filtros.isClosed != null) params['isClosed'] = String(filtros.isClosed);
    return this.http.get<IResponseGeneric<ILoan[]>>(`${this.apiUrl}${environment.EPLoans}`, { headers: this.headers, params });
  }

  /** Solo se permite si ninguna cuota ha sido cobrada; regenera el cronograma de cuotas. */
  editarPrestamo(loanId: number, req: ILoanCreateRequest): Observable<IResponseGeneric<ILoan>> {
    return this.http.put<IResponseGeneric<ILoan>>(`${this.apiUrl}${environment.EPLoans}/${loanId}`, req, { headers: this.headers });
  }

  /** Solo se permite si ninguna cuota ha sido cobrada; elimina el préstamo/adelanto y sus cuotas. */
  eliminarPrestamo(loanId: number): Observable<IResponseGeneric<ILoanDeleteResponse>> {
    return this.http.delete<IResponseGeneric<ILoanDeleteResponse>>(`${this.apiUrl}${environment.EPLoans}/${loanId}`, { headers: this.headers });
  }

}
