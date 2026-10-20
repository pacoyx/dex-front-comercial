import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import {
  ICustomerUserAdmin,
  IEnablePortalRequest,
  IEnablePortalResponse,
  IGenerateActivationLinkResponse,
  IPortalCustomerAdminItem,
  IPortalStatus,
  IResetCustomerUserPasswordResponse,
} from '../interfaces/IPortal';

@Injectable({
  providedIn: 'root'
})
export class CustomerPortalService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  habilitar(customerId: number, req: IEnablePortalRequest): Observable<IResponseGeneric<IEnablePortalResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IEnablePortalResponse>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/portal-enable`, req, { headers });
  }

  obtenerEstado(customerId: number): Observable<IResponseGeneric<IPortalStatus>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPortalStatus>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/portal-status`, { headers });
  }

  regenerarLink(customerId: number): Observable<IResponseGeneric<IGenerateActivationLinkResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IGenerateActivationLinkResponse>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/portal-admin/regenerate-activation-link`, {}, { headers });
  }

  listarAdmin(): Observable<IResponseGeneric<IPortalCustomerAdminItem[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPortalCustomerAdminItem[]>>(`${this.apiUrl}${environment.EPCustomerPortalAdmin}/customers`, { headers });
  }

  buscarUsuariosPortal(customerId?: number, userName?: string): Observable<IResponseGeneric<ICustomerUserAdmin[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();
    if (customerId) params = params.set('customerId', customerId);
    if (userName) params = params.set('userName', userName);
    return this.http.get<IResponseGeneric<ICustomerUserAdmin[]>>(`${this.apiUrl}${environment.EPCustomerUsersAdmin}`, { headers, params });
  }

  resetearPasswordUsuario(id: number, newPassword: string): Observable<IResponseGeneric<IResetCustomerUserPasswordResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IResetCustomerUserPasswordResponse>>(`${this.apiUrl}${environment.EPCustomerUsersAdmin}/${id}/reset-password`, { newPassword }, { headers });
  }

}
