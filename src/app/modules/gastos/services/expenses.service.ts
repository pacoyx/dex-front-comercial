import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import { ICreateExpenseRequest, IExpense, IExpenseFilters, IExpenseSummary } from '../interfaces/IExpense';
import { ICreateExpenseAttachmentRequest, IExpenseAttachment } from '../interfaces/IExpenseAttachment';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  crear(req: ICreateExpenseRequest): Observable<IResponseGeneric<IExpense>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IExpense>>(`${this.apiUrl}${environment.EPExpenses}`, req, { headers });
  }

  actualizar(id: number, req: ICreateExpenseRequest): Observable<IResponseGeneric<IExpense>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<IExpense>>(`${this.apiUrl}${environment.EPExpenses}/${id}`, req, { headers });
  }

  obtenerPorId(id: number): Observable<IResponseGeneric<IExpense>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IExpense>>(`${this.apiUrl}${environment.EPExpenses}/${id}`, { headers });
  }

  listar(filtros: IExpenseFilters): Observable<IResponseGeneric<IExpenseSummary[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params: Record<string, string> = {};
    if (filtros.dateFrom) params['dateFrom'] = filtros.dateFrom;
    if (filtros.dateTo) params['dateTo'] = filtros.dateTo;
    if (filtros.branchSalesId != null) params['branchSalesId'] = String(filtros.branchSalesId);
    if (filtros.expenseCategoryId != null) params['expenseCategoryId'] = String(filtros.expenseCategoryId);
    if (filtros.sourceType) params['sourceType'] = filtros.sourceType;
    return this.http.get<IResponseGeneric<IExpenseSummary[]>>(`${this.apiUrl}${environment.EPExpenses}`, { headers, params });
  }

  eliminar(id: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPExpenses}/${id}`, { headers });
  }

  listarAdjuntos(expenseId: number): Observable<IResponseGeneric<IExpenseAttachment[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IExpenseAttachment[]>>(`${this.apiUrl}${environment.EPExpenses}/${expenseId}/attachments`, { headers });
  }

  crearAdjunto(expenseId: number, req: ICreateExpenseAttachmentRequest): Observable<IResponseGeneric<IExpenseAttachment>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IExpenseAttachment>>(`${this.apiUrl}${environment.EPExpenses}/${expenseId}/attachments`, req, { headers });
  }

}
