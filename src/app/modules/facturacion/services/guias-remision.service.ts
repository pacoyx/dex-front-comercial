import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import { IGuiaRemision, IGuiaRemisionCreateRequest, IGuiaRemisionListFilters } from '../interfaces/IGuiaRemision';

@Injectable({
  providedIn: 'root'
})
export class GuiasRemisionService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  crearGuiaRemision(req: IGuiaRemisionCreateRequest): Observable<IResponseGeneric<IGuiaRemision>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IGuiaRemision>>(`${this.apiUrl}${environment.EPGuiasRemision}`, req, { headers });
  }

  listarGuiasRemision(filtros: IGuiaRemisionListFilters): Observable<IResponseGeneric<IGuiaRemision[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params: Record<string, string> = {};
    if (filtros.invoiceNumero) params['invoiceNumero'] = filtros.invoiceNumero;
    if (filtros.desde) params['desde'] = filtros.desde;
    if (filtros.hasta) params['hasta'] = filtros.hasta;
    return this.http.get<IResponseGeneric<IGuiaRemision[]>>(`${this.apiUrl}${environment.EPGuiasRemision}`, { headers, params });
  }

  obtenerGuiaRemisionPorFactura(invoiceId: number): Observable<IResponseGeneric<IGuiaRemision>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGuiaRemision>>(`${this.apiUrl}${environment.EPGuiasRemision}/by-invoice/${invoiceId}`, { headers });
  }

  /**
   * Devuelve el PDF como blob para abrirlo en una pestaña nueva, igual que
   * InvoicesService.descargarFacturaPdf.
   */
  descargarGuiaRemisionPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${environment.EPGuiasRemision}/${id}/pdf`, { responseType: 'blob' });
  }

}
