import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IAreaOption, IBranchOption, IConsumptionRow, ICreateMovementRequest, IKardex, IMovementDetail, IMovementFilters,
  IMovementListItem, IProductOption, IProductStockByWarehouse, IResponseGeneric, ISaveWarehouseRequest, IStockItem, IWarehouse
} from '../interfaces/IInventario';

@Injectable({ providedIn: 'root' })
export class InventarioService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrlBase}${environment.EPInventory}`;

  /** Construye HttpParams omitiendo valores vacíos. */
  private params(values: Record<string, string | number | boolean | null | undefined>): HttpParams {
    let params = new HttpParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  // ---- Almacenes ----

  listarAlmacenes(onlyActive = false): Observable<IResponseGeneric<IWarehouse[]>> {
    return this.http.get<IResponseGeneric<IWarehouse[]>>(`${this.base}/warehouses`, { params: this.params({ onlyActive }) });
  }

  crearAlmacen(req: ISaveWarehouseRequest): Observable<IResponseGeneric<{ id: number }>> {
    return this.http.post<IResponseGeneric<{ id: number }>>(`${this.base}/warehouses`, req);
  }

  actualizarAlmacen(id: number, req: ISaveWarehouseRequest): Observable<IResponseGeneric<{ id: number }>> {
    return this.http.put<IResponseGeneric<{ id: number }>>(`${this.base}/warehouses/${id}`, req);
  }

  // ---- Movimientos ----

  listarMovimientos(filtros: IMovementFilters): Observable<IResponseGeneric<IMovementListItem[]>> {
    return this.http.get<IResponseGeneric<IMovementListItem[]>>(`${this.base}/movements`, {
      params: this.params({ ...filtros })
    });
  }

  obtenerMovimiento(id: number): Observable<IResponseGeneric<IMovementDetail>> {
    return this.http.get<IResponseGeneric<IMovementDetail>>(`${this.base}/movements/${id}`);
  }

  crearMovimiento(req: ICreateMovementRequest): Observable<IResponseGeneric<IMovementDetail>> {
    return this.http.post<IResponseGeneric<IMovementDetail>>(`${this.base}/movements`, req);
  }

  anularMovimiento(id: number, reason: string): Observable<IResponseGeneric<{ id: number; number: string }>> {
    return this.http.post<IResponseGeneric<{ id: number; number: string }>>(`${this.base}/movements/${id}/cancel`, { reason });
  }

  // ---- Stock y kardex ----

  consultarStock(warehouseId: number | null, belowMin: boolean, search: string | null): Observable<IResponseGeneric<IStockItem[]>> {
    return this.http.get<IResponseGeneric<IStockItem[]>>(`${this.base}/stock`, {
      params: this.params({ warehouseId, belowMin: belowMin || null, search })
    });
  }

  stockPorProducto(productId: number): Observable<IResponseGeneric<IProductStockByWarehouse[]>> {
    return this.http.get<IResponseGeneric<IProductStockByWarehouse[]>>(`${this.base}/stock/product/${productId}`);
  }

  obtenerKardex(productId: number, warehouseId: number, from: string, to: string): Observable<IResponseGeneric<IKardex>> {
    return this.http.get<IResponseGeneric<IKardex>>(`${this.base}/kardex`, { params: this.params({ productId, warehouseId, from, to }) });
  }

  descargarKardex(formato: 'excel' | 'pdf', productId: number, warehouseId: number, from: string, to: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.base}/kardex/${formato}`, {
      params: this.params({ productId, warehouseId, from, to }), observe: 'response', responseType: 'blob'
    });
  }

  // ---- Reportes ----

  consumoPorArea(from: string, to: string, warehouseId: number | null, areaId: number | null): Observable<IResponseGeneric<IConsumptionRow[]>> {
    return this.http.get<IResponseGeneric<IConsumptionRow[]>>(`${this.base}/reports/consumption`, {
      params: this.params({ from, to, warehouseId, areaId })
    });
  }

  /** Descarga un reporte: stock-valued (excel|pdf), consumption (excel|pdf) o reorder (excel). */
  descargarReporte(reporte: 'stock-valued' | 'consumption' | 'reorder', formato: 'excel' | 'pdf',
    filtros: Record<string, string | number | null | undefined>): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.base}/reports/${reporte}/${formato}`, {
      params: this.params(filtros), observe: 'response', responseType: 'blob'
    });
  }

  // ---- Catálogos para selectores ----

  listarAreas(): Observable<IResponseGeneric<IAreaOption[]>> {
    return this.http.get<IResponseGeneric<IAreaOption[]>>(`${this.base}/lookups/areas`);
  }

  listarSucursales(): Observable<IResponseGeneric<IBranchOption[]>> {
    return this.http.get<IResponseGeneric<IBranchOption[]>>(`${this.base}/lookups/branches`);
  }

  buscarProductos(q: string, warehouseId: number | null): Observable<IResponseGeneric<IProductOption[]>> {
    return this.http.get<IResponseGeneric<IProductOption[]>>(`${this.base}/lookups/products`, { params: this.params({ q, warehouseId }) });
  }
}
