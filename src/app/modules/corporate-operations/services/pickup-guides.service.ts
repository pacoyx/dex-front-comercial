import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import {
  IChangePickupGuideStatusRequest,
  ICreatePickupGuideRequest,
  ICreatePickupGuideRevisionRequest,
  IPickupGuide,
  IPickupGuideFilters,
  IPickupGuideRevision,
  IPickupGuideSummary,
  IResendEmailResult,
  IUpdatePickupGuideRequest,
} from '../interfaces/IPickupGuide';

@Injectable({
  providedIn: 'root'
})
export class PickupGuidesService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listar(filtros: IPickupGuideFilters): Observable<IResponseGeneric<IPickupGuideSummary[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();
    if (filtros.customerId != null) params = params.set('customerId', String(filtros.customerId));
    if (filtros.status != null) params = params.set('status', String(filtros.status));
    if (filtros.fromDate) params = params.set('fromDate', filtros.fromDate);
    if (filtros.toDate) params = params.set('toDate', filtros.toDate);
    return this.http.get<IResponseGeneric<IPickupGuideSummary[]>>(`${this.apiUrl}${environment.EPPickupGuides}`, { headers, params });
  }

  obtenerPorId(id: number): Observable<IResponseGeneric<IPickupGuide>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPickupGuide>>(`${this.apiUrl}${environment.EPPickupGuides}/${id}`, { headers });
  }

  crear(req: ICreatePickupGuideRequest): Observable<IResponseGeneric<IPickupGuide>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IPickupGuide>>(`${this.apiUrl}${environment.EPPickupGuides}`, req, { headers });
  }

  actualizar(id: number, req: IUpdatePickupGuideRequest): Observable<IResponseGeneric<IPickupGuide>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<IPickupGuide>>(`${this.apiUrl}${environment.EPPickupGuides}/${id}`, req, { headers });
  }

  cambiarEstado(id: number, req: IChangePickupGuideStatusRequest): Observable<IResponseGeneric<unknown>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<unknown>>(`${this.apiUrl}${environment.EPPickupGuides}/${id}/status`, req, { headers });
  }

  reenviarCorreo(id: number): Observable<IResponseGeneric<IResendEmailResult>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IResendEmailResult>>(`${this.apiUrl}${environment.EPPickupGuides}/${id}/resend-email`, {}, { headers });
  }

  /**
   * Descarga el binario de un adjunto (foto, firma o PDF). El endpoint exige el mismo
   * Bearer token que el resto de la API, por eso no se puede enlazar directo con <img>/<a>:
   * hay que traer el blob vía HttpClient (el interceptor agrega el header) y exponerlo
   * con URL.createObjectURL en el componente.
   */
  descargarAdjunto(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${environment.EPPickupGuides}/attachments/${attachmentId}/download`, { responseType: 'blob' });
  }

  // ===== Revisiones =====

  crearRevision(pickupGuideId: number, req: ICreatePickupGuideRevisionRequest): Observable<IResponseGeneric<IPickupGuideRevision>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IPickupGuideRevision>>(`${this.apiUrl}${environment.EPPickupGuides}/${pickupGuideId}/revisions`, req, { headers });
  }

  listarRevisiones(pickupGuideId: number): Observable<IResponseGeneric<IPickupGuideRevision[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IPickupGuideRevision[]>>(`${this.apiUrl}${environment.EPPickupGuides}/${pickupGuideId}/revisions`, { headers });
  }

  agregarFotoRevision(revisionId: number, file: File): Observable<IResponseGeneric<unknown>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<IResponseGeneric<unknown>>(`${this.apiUrl}${environment.EPPickupGuides}/revisions/${revisionId}/photos`, formData);
  }

  /**
   * Descarga el binario de una foto de revisión. Requiere Bearer token (igual que
   * descargarAdjunto), por eso se trae como blob vía HttpClient en vez de enlazarla
   * directo en un <img>.
   */
  descargarFotoRevision(photoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${environment.EPPickupGuides}/revisions/photos/${photoId}/download`, { responseType: 'blob' });
  }

}
