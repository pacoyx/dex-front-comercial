import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import {
  IEnablePortalRequest,
  IEnablePortalResponse,
  IGenerateActivationLinkResponse,
  IPortalCustomerAdminItem,
  IPortalStatus,
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

}
