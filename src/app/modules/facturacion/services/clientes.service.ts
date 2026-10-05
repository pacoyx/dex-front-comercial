import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import {
  IAccountSummary,
  IBillingProfile,
  IBillingProfileRequest,
  ICompanySearchFilters,
  ICompanySearchResult,
  ICustomer,
  ICustomerContact,
  ICustomerContactRequest,
  ICustomerCreateRequest,
  ICustomerPaginatedResponse,
  ICustomerUpdateRequest,
} from '../interfaces/ICustomer';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  obtenerClientes(pagina: number, numFilas: number): Observable<IResponseGeneric<ICustomerPaginatedResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICustomerPaginatedResponse>>(`${this.apiUrl}${environment.EPListarClientes}/${pagina}/${numFilas}`, { headers });
  }

  obtenerClientesFiltrarPaginator(pagina: number, numFilas: number, nombreFiltro: string): Observable<IResponseGeneric<ICustomerPaginatedResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { name: nombreFiltro };
    return this.http.get<IResponseGeneric<ICustomerPaginatedResponse>>(`${this.apiUrl}${environment.EPListarClientesPaginator}/${pagina}/${numFilas}`, { headers, params });
  }

  registrarCliente(cliente: ICustomerCreateRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPRegistrarCliente}`, cliente, { headers });
  }

  actualizarCliente(cliente: ICustomerUpdateRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPActualizarCliente}/${cliente.id}`, cliente, { headers });
  }

  eliminarCliente(id: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPEliminarCliente}/${id}`, { headers });
  }

  obtenerClientePorId(id: number): Observable<IResponseGeneric<ICustomer>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICustomer>>(`${this.apiUrl}${environment.EPListarClientes}/${id}`, { headers });
  }

  obtenerPerfilFacturacion(customerId: number): Observable<IResponseGeneric<IBillingProfile>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IBillingProfile>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/billing-profile`, { headers });
  }

  crearPerfilFacturacion(customerId: number, req: IBillingProfileRequest): Observable<IResponseGeneric<IBillingProfile>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IBillingProfile>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/billing-profile`, req, { headers });
  }

  actualizarPerfilFacturacion(customerId: number, req: IBillingProfileRequest): Observable<IResponseGeneric<IBillingProfile>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<IBillingProfile>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/billing-profile`, req, { headers });
  }

  listarContactos(customerId: number): Observable<IResponseGeneric<ICustomerContact[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICustomerContact[]>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/contacts`, { headers });
  }

  crearContacto(customerId: number, req: ICustomerContactRequest): Observable<IResponseGeneric<ICustomerContact>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<ICustomerContact>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/contacts`, req, { headers });
  }

  actualizarContacto(contactId: number, req: ICustomerContactRequest): Observable<IResponseGeneric<ICustomerContact>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<ICustomerContact>>(`${this.apiUrl}${environment.EPCustomerContactItem}/${contactId}`, req, { headers });
  }

  eliminarContacto(contactId: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPCustomerContactItem}/${contactId}`, { headers });
  }

  buscarEmpresas(filtros: ICompanySearchFilters): Observable<IResponseGeneric<ICompanySearchResult[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();
    if (filtros.ruc) params = params.set('ruc', filtros.ruc);
    if (filtros.businessName) params = params.set('businessName', filtros.businessName);
    if (filtros.commercialName) params = params.set('commercialName', filtros.commercialName);
    return this.http.get<IResponseGeneric<ICompanySearchResult[]>>(`${this.apiUrl}${environment.EPCustomerCompanySearch}`, { headers, params });
  }

  obtenerResumenCuenta(customerId: number): Observable<IResponseGeneric<IAccountSummary>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IAccountSummary>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/account-summary`, { headers });
  }

}
