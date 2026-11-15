import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICreateSaleRequest, IPosContext, IResponseGeneric, ISaleDetail, ISaleListItem, ISaleProduct, SaleStatus } from '../interfaces/IVentas';

@Injectable({ providedIn: 'root' })
export class VentasService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrlBase}${environment.EPSales}`;

  private params(values: Record<string, string | number | boolean | null | undefined>): HttpParams {
    let params = new HttpParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') params = params.set(key, String(value));
    });
    return params;
  }

  contextoPos(): Observable<IResponseGeneric<IPosContext>> {
    return this.http.get<IResponseGeneric<IPosContext>>(`${this.base}/pos-context`);
  }

  buscarProductos(q: string, warehouseId: number | null): Observable<IResponseGeneric<ISaleProduct[]>> {
    return this.http.get<IResponseGeneric<ISaleProduct[]>>(`${this.base}/products`, { params: this.params({ q, warehouseId }) });
  }

  registrarVenta(req: ICreateSaleRequest): Observable<IResponseGeneric<ISaleDetail>> {
    return this.http.post<IResponseGeneric<ISaleDetail>>(`${this.base}`, req);
  }

  listarVentas(from: string | null, to: string | null, status: SaleStatus | null, paymentType: string | null): Observable<IResponseGeneric<ISaleListItem[]>> {
    return this.http.get<IResponseGeneric<ISaleListItem[]>>(`${this.base}`, { params: this.params({ from, to, status, paymentType }) });
  }

  obtenerVenta(id: number): Observable<IResponseGeneric<ISaleDetail>> {
    return this.http.get<IResponseGeneric<ISaleDetail>>(`${this.base}/${id}`);
  }

  anularVenta(id: number, reason: string): Observable<IResponseGeneric<{ id: number }>> {
    return this.http.post<IResponseGeneric<{ id: number }>>(`${this.base}/${id}/cancel`, { reason });
  }

  descargarReporte(formato: 'excel' | 'pdf', from: string | null, to: string | null): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.base}/reports/sales/${formato}`, {
      params: this.params({ from, to }), observe: 'response', responseType: 'blob'
    });
  }
}
