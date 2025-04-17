import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IGetProductsPaginadoResponse, IGetSupplierPaginadoResponse, IProductCreateRequest, IProductCreateResponse, IProductListarResponse, IProductUpdateRequest, IResponseGeneric, ISupplierCreateRequest, ISupplierCreateResponse, ISupplierListarResponse, ISupplierUpdateRequest } from '../interfaces/IMaestros';
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


  listarProductosPaginado(page: number, pageSize: number, filtro: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { nameProduct: filtro };
    return this.http.get<IResponseGeneric<IGetProductsPaginadoResponse>>(`${this.apiUrl}${environment.EPListarProductosPaginator}/${page}/${pageSize}`, { headers, params });
  }

  crearProducto(req: IProductCreateRequest): Observable<IResponseGeneric<IProductCreateResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IProductCreateResponse>>(`${this.apiUrl}${environment.EPCrearProducto}`, req, { headers });
  }

  actualizarProducto(req: IProductUpdateRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPActualizarProducto}`, req, { headers });
  }


}
