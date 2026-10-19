import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import { ICompanyBankAccount, ICompanyBankAccountRequest } from '../interfaces/ICompanyBankAccounts';

@Injectable({
  providedIn: 'root'
})
export class CompanyBankAccountsService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  private base(companyId: number): string {
    return `${this.apiUrl}${environment.EPCompanies}/${companyId}/bank-accounts`;
  }

  listarCuentas(companyId: number): Observable<IResponseGeneric<ICompanyBankAccount[]>> {
    return this.http.get<IResponseGeneric<ICompanyBankAccount[]>>(this.base(companyId), { headers: this.headers });
  }

  crearCuenta(companyId: number, req: ICompanyBankAccountRequest): Observable<IResponseGeneric<ICompanyBankAccount>> {
    return this.http.post<IResponseGeneric<ICompanyBankAccount>>(this.base(companyId), req, { headers: this.headers });
  }

  actualizarCuenta(companyId: number, id: number, req: ICompanyBankAccountRequest): Observable<IResponseGeneric<ICompanyBankAccount>> {
    return this.http.put<IResponseGeneric<ICompanyBankAccount>>(`${this.base(companyId)}/${id}`, req, { headers: this.headers });
  }

  habilitarCuenta(companyId: number, id: number): Observable<IResponseGeneric<ICompanyBankAccount>> {
    return this.http.patch<IResponseGeneric<ICompanyBankAccount>>(`${this.base(companyId)}/${id}/enable`, {}, { headers: this.headers });
  }

  deshabilitarCuenta(companyId: number, id: number): Observable<IResponseGeneric<ICompanyBankAccount>> {
    return this.http.patch<IResponseGeneric<ICompanyBankAccount>>(`${this.base(companyId)}/${id}/disable`, {}, { headers: this.headers });
  }

}
