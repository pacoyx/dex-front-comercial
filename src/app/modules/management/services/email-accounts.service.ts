import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import { ICreateEmailAccountRequest, IEmailAccount, IUpdateEmailAccountRequest } from '../interfaces/IEmailAccount';

@Injectable({
  providedIn: 'root'
})
export class EmailAccountsService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  listarCuentas(): Observable<IResponseGeneric<IEmailAccount[]>> {
    return this.http.get<IResponseGeneric<IEmailAccount[]>>(`${this.apiUrl}${environment.EPEmailAccounts}`, { headers: this.headers });
  }

  obtenerCuenta(id: number): Observable<IResponseGeneric<IEmailAccount>> {
    return this.http.get<IResponseGeneric<IEmailAccount>>(`${this.apiUrl}${environment.EPEmailAccounts}/${id}`, { headers: this.headers });
  }

  crearCuenta(req: ICreateEmailAccountRequest): Observable<IResponseGeneric<IEmailAccount>> {
    return this.http.post<IResponseGeneric<IEmailAccount>>(`${this.apiUrl}${environment.EPEmailAccounts}`, req, { headers: this.headers });
  }

  actualizarCuenta(id: number, req: IUpdateEmailAccountRequest): Observable<IResponseGeneric<IEmailAccount>> {
    return this.http.put<IResponseGeneric<IEmailAccount>>(`${this.apiUrl}${environment.EPEmailAccounts}/${id}`, req, { headers: this.headers });
  }

  eliminarCuenta(id: number): Observable<IResponseGeneric<string>> {
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPEmailAccounts}/${id}`, { headers: this.headers });
  }

}
