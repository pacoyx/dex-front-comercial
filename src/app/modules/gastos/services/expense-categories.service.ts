import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import {
  ICreateExpenseCategoryRequest,
  IExpenseCategory,
  IUpdateExpenseCategoryRequest,
} from '../interfaces/IExpenseCategory';

@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoriesService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listar(isActive?: boolean): Observable<IResponseGeneric<IExpenseCategory[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params: Record<string, string> = {};
    if (isActive !== undefined) {
      params['isActive'] = String(isActive);
    }
    return this.http.get<IResponseGeneric<IExpenseCategory[]>>(`${this.apiUrl}${environment.EPExpenseCategories}`, { headers, params });
  }

  crear(req: ICreateExpenseCategoryRequest): Observable<IResponseGeneric<IExpenseCategory>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IExpenseCategory>>(`${this.apiUrl}${environment.EPExpenseCategories}`, req, { headers });
  }

  actualizar(id: number, req: IUpdateExpenseCategoryRequest): Observable<IResponseGeneric<IExpenseCategory>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<IExpenseCategory>>(`${this.apiUrl}${environment.EPExpenseCategories}/${id}`, req, { headers });
  }

}
