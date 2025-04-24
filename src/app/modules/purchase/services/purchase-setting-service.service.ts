import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IGetCategoriaProductoShortResponse, IGetProductsPaginadoResponse, IGetSupplierPaginadoResponse, IGetUniMedidaShortResponse, IProductCreateRequest, IProductCreateResponse, IProductListarPatronResponse, IProductListarResponse, IProductUpdateRequest, IResponseGeneric, ISupplierCreateRequest, ISupplierCreateResponse, ISupplierListarPorPatronResponse, ISupplierListarResponse, ISupplierUpdateRequest } from '../interfaces/IMaestros';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PurchaseSettingServiceService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  crearProveedor(req: ISupplierCreateRequest): Observable<IResponseGeneric<ISupplierCreateResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<ISupplierCreateResponse>>(`${this.apiUrl}${environment.EPCrearProveedor}`, req, { headers });
  }

  actualizarProveedor(req: ISupplierUpdateRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPActualizarProveedor}`, req, { headers });
  }

  listarProveedores() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ISupplierListarResponse>>(`${this.apiUrl}${environment.EPListarProveedores}`, { headers });
  }

  listarProveedoresPaginado(page: number, pageSize: number, filtro: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { nameSupplier: filtro };
    return this.http.get<IResponseGeneric<IGetSupplierPaginadoResponse>>(`${this.apiUrl}${environment.EPListarProveedoresPaginator}/${page}/${pageSize}`, { headers, params });
  }

  listarProveedoresPorPatron(patron: string): Observable<IResponseGeneric<ISupplierListarPorPatronResponse[]>> {    
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ISupplierListarPorPatronResponse[]>>(`${this.apiUrl}${environment.EPListarProveedoresPorPatron}/${patron}`, { headers });
  }

  listarProductosPaginado(page: number, pageSize: number, filtro: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { nameProduct: filtro };
    return this.http.get<IResponseGeneric<IGetProductsPaginadoResponse>>(`${this.apiUrl}${environment.EPListarProductosPaginator}/${page}/${pageSize}`, { headers, params });
  }

  listarProductosPorPatron(patron: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IProductListarPatronResponse[]>>(`${this.apiUrl}${environment.EPListarProductosPorPatron}/${patron}`, { headers });
  }


  crearProducto(req: IProductCreateRequest): Observable<IResponseGeneric<IProductCreateResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IProductCreateResponse>>(`${this.apiUrl}${environment.EPCrearProducto}`, req, { headers });
  }

  actualizarProducto(req: IProductUpdateRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPActualizarProducto}`, req, { headers });
  }


  listarUnidadesMedidasCombo() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetUniMedidaShortResponse[]>>(`${this.apiUrl}${environment.EPListarUnidadMedidaShort}`, { headers });
  }

  listarCategoriasProductoCombo() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetCategoriaProductoShortResponse[]>>(`${this.apiUrl}${environment.EPListarCategoriaProductoShort}`, { headers });
  }







}
