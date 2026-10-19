import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import {
  IBank, IBankAccountType, IBankAccountTypeCreateRequest, IBankAccountTypeLookup,
  IBankAccountTypeUpdateRequest, IBankCreateRequest, IBankLookup, IBankUpdateRequest,
} from '../interfaces/IBanks';

@Injectable({
  providedIn: 'root'
})
export class BankCatalogsService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  // Bancos

  listarBancos(): Observable<IResponseGeneric<IBank[]>> {
    return this.http.get<IResponseGeneric<IBank[]>>(`${this.apiUrl}${environment.EPBanks}`, { headers: this.headers });
  }

  crearBanco(req: IBankCreateRequest): Observable<IResponseGeneric<IBank>> {
    return this.http.post<IResponseGeneric<IBank>>(`${this.apiUrl}${environment.EPBanks}`, req, { headers: this.headers });
  }

  actualizarBanco(id: number, req: IBankUpdateRequest): Observable<IResponseGeneric<IBank>> {
    return this.http.put<IResponseGeneric<IBank>>(`${this.apiUrl}${environment.EPBanks}/${id}`, req, { headers: this.headers });
  }

  // Lookup sin envoltorio ApiResponse: array plano, solo bancos activos.
  listarBancosLookup(): Observable<IBankLookup[]> {
    return this.http.get<IBankLookup[]>(`${this.apiUrl}${environment.EPBanks}/lookup`);
  }

  // Tipos de Cuenta Bancaria

  listarTiposCuenta(): Observable<IResponseGeneric<IBankAccountType[]>> {
    return this.http.get<IResponseGeneric<IBankAccountType[]>>(`${this.apiUrl}${environment.EPBankAccountTypes}`, { headers: this.headers });
  }

  crearTipoCuenta(req: IBankAccountTypeCreateRequest): Observable<IResponseGeneric<IBankAccountType>> {
    return this.http.post<IResponseGeneric<IBankAccountType>>(`${this.apiUrl}${environment.EPBankAccountTypes}`, req, { headers: this.headers });
  }

  actualizarTipoCuenta(id: number, req: IBankAccountTypeUpdateRequest): Observable<IResponseGeneric<IBankAccountType>> {
    return this.http.put<IResponseGeneric<IBankAccountType>>(`${this.apiUrl}${environment.EPBankAccountTypes}/${id}`, req, { headers: this.headers });
  }

  // Lookup sin envoltorio ApiResponse: array plano, solo tipos activos.
  listarTiposCuentaLookup(): Observable<IBankAccountTypeLookup[]> {
    return this.http.get<IBankAccountTypeLookup[]>(`${this.apiUrl}${environment.EPBankAccountTypes}/lookup`);
  }

}
