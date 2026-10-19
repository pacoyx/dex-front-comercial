import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

  /**
   * POST /api/customer devuelve el Customer creado tal cual (sin envoltorio
   * ApiResponse), a diferencia de la mayoria de endpoints de este modulo.
   * Se usa un tipo de retorno aparte (en vez de reusar registrarCliente) para
   * poder leer el id del cliente recien creado, por ejemplo para encadenar la
   * creacion de su perfil de facturacion.
   */
  registrarClienteObtenerId(cliente: ICustomerCreateRequest): Observable<{ id: number }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ id: number }>(`${this.apiUrl}${environment.EPRegistrarCliente}`, cliente, { headers });
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
    return this.http.get<unknown>(`${this.apiUrl}${environment.EPListarClientes}/${id}`, { headers }).pipe(
      map(raw => this.normalizarRespuestaCliente(raw))
    );
  }

  /**
   * GET /api/customer/{id} es un endpoint legado: a veces devuelve el cliente
   * envuelto en { success, data, ... } y a veces el objeto del cliente directo
   * (sin envoltorio), además con el campo "firtsName" (typo del backend) en vez
   * de "firstName". Normalizamos ambos casos para que el resto del frontend
   * siempre reciba un IResponseGeneric<ICustomer> consistente.
   */
  private normalizarRespuestaCliente(raw: unknown): IResponseGeneric<ICustomer> {
    const body = raw as Record<string, unknown> | null;
    const estaEnvuelto = !!body && typeof body === 'object' && 'data' in body;
    const clienteRaw = (estaEnvuelto ? body!['data'] : body) as (ICustomer & { firtsName?: string }) | null;

    if (clienteRaw && !clienteRaw.firstName && clienteRaw.firtsName) {
      clienteRaw.firstName = clienteRaw.firtsName;
    }

    if (estaEnvuelto) {
      return body as unknown as IResponseGeneric<ICustomer>;
    }

    return {
      success: !!clienteRaw,
      message: '',
      data: clienteRaw as ICustomer,
      errors: [],
      statusCode: 200,
    };
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
