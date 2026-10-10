import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IBranchSales,
  ICustomerSearchResult,
  IPaymentMethod,
  IProdServiceCatalogPaginatedResponse,
  IProdServiceSearchResult,
  IResponseGeneric,
  ITypeDocument,
} from '../interfaces/ICatalogos';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  buscarClientesPorPatron(patron: string): Observable<IResponseGeneric<ICustomerSearchResult[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICustomerSearchResult[]>>(`${this.apiUrl}${environment.EPBuscarClientesPorPatron}/${patron}`, { headers });
  }

  obtenerSucursales(): Observable<IResponseGeneric<IBranchSales[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IBranchSales[]>>(`${this.apiUrl}${environment.EPListarSucursales}`, { headers });
  }

  obtenerTiposDocumento(): Observable<IResponseGeneric<ITypeDocument[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ITypeDocument[]>>(`${this.apiUrl}${environment.EPTypeDocuments}`, { headers });
  }

  obtenerMetodosPago(): Observable<IResponseGeneric<IPaymentMethod[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPaymentMethod[]>>(`${this.apiUrl}${environment.EPPaymentMethods}`, { headers });
  }

  buscarServiciosPorPatron(patron: string): Observable<IProdServiceSearchResult[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IProdServiceSearchResult[]>(`${this.apiUrl}${environment.EPFiltrarServiciosPorPatron}/${patron}`, { headers });
  }

  /** Catálogo completo de servicios configurados (para armar tarifas y resolver el flag "Es Peso?"). */
  listarCatalogoServicios(numFilas = 1000): Observable<IResponseGeneric<IProdServiceCatalogPaginatedResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IProdServiceCatalogPaginatedResponse>>(`${this.apiUrl}${environment.EPListarProdServices}/1/${numFilas}`, { headers });
  }

}
