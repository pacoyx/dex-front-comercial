import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import {
  ICreateFixedAssetMaintenanceRequest,
  ICreateFixedAssetRequest,
  IDisposeFixedAssetRequest,
  IFinishFixedAssetMaintenanceRequest,
  IFixedAssetCategory,
  IFixedAssetDetail,
  IFixedAssetListFilters,
  IFixedAssetListItem,
  IFixedAssetMaintenance,
  IFixedAssetMaintenanceAttachment,
  IFixedAssetPhoto,
  IFixedAssetHistoryFilters,
  IFixedAssetHistoryReport,
  IReassignFixedAssetRequest,
  IUpdateFixedAssetRequest,
} from '../interfaces/IFixedAsset';

@Injectable({
  providedIn: 'root'
})
export class FixedAssetsService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listarCategorias(): Observable<IResponseGeneric<IFixedAssetCategory[]>> {
    return this.http.get<IResponseGeneric<IFixedAssetCategory[]>>(`${this.apiUrl}${environment.EPFixedAssetCategories}`);
  }

  crear(req: ICreateFixedAssetRequest): Observable<IResponseGeneric<IFixedAssetListItem>> {
    return this.http.post<IResponseGeneric<IFixedAssetListItem>>(`${this.apiUrl}${environment.EPFixedAssets}`, req);
  }

  actualizar(id: number, req: IUpdateFixedAssetRequest): Observable<IResponseGeneric<IFixedAssetListItem>> {
    return this.http.put<IResponseGeneric<IFixedAssetListItem>>(`${this.apiUrl}${environment.EPFixedAssets}/${id}`, req);
  }

  listar(filtros: IFixedAssetListFilters): Observable<IResponseGeneric<IFixedAssetListItem[]>> {
    let params = new HttpParams();
    if (filtros.branchId != null) params = params.set('branchId', filtros.branchId);
    if (filtros.categoryId != null) params = params.set('categoryId', filtros.categoryId);
    if (filtros.status != null) params = params.set('status', filtros.status);
    return this.http.get<IResponseGeneric<IFixedAssetListItem[]>>(`${this.apiUrl}${environment.EPFixedAssets}`, { params });
  }

  obtenerDetalle(id: number): Observable<IResponseGeneric<IFixedAssetDetail>> {
    return this.http.get<IResponseGeneric<IFixedAssetDetail>>(`${this.apiUrl}${environment.EPFixedAssets}/${id}`);
  }

  reasignar(id: number, req: IReassignFixedAssetRequest): Observable<IResponseGeneric<string>> {
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPFixedAssets}/${id}/reassign`, req);
  }

  darDeBaja(id: number, req: IDisposeFixedAssetRequest): Observable<IResponseGeneric<string>> {
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPFixedAssets}/${id}/dispose`, req);
  }

  registrarMantenimiento(id: number, req: ICreateFixedAssetMaintenanceRequest): Observable<IResponseGeneric<IFixedAssetMaintenance>> {
    return this.http.post<IResponseGeneric<IFixedAssetMaintenance>>(`${this.apiUrl}${environment.EPFixedAssets}/${id}/maintenances`, req);
  }

  /** Cierra un mantenimiento en curso y devuelve el activo a su estado anterior. */
  finalizarMantenimiento(maintenanceId: number, req: IFinishFixedAssetMaintenanceRequest): Observable<IResponseGeneric<IFixedAssetMaintenance>> {
    return this.http.post<IResponseGeneric<IFixedAssetMaintenance>>(
      `${this.apiUrl}${environment.EPFixedAssets}/maintenances/${maintenanceId}/finish`, req
    );
  }

  /**
   * Un archivo por request; la subida de varios se hace secuencialmente
   * desde el componente (mismo patron que las fotos de revision de guias de recojo).
   */
  agregarAdjuntoMantenimiento(maintenanceId: number, file: File): Observable<IResponseGeneric<IFixedAssetMaintenanceAttachment>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<IResponseGeneric<IFixedAssetMaintenanceAttachment>>(
      `${this.apiUrl}${environment.EPFixedAssets}/maintenances/${maintenanceId}/attachments`, formData
    );
  }

  descargarAdjuntoMantenimiento(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${environment.EPFixedAssets}/maintenances/attachments/${attachmentId}/download`, { responseType: 'blob' });
  }

  /** Sube o reemplaza la foto del activo (el backend la re-comprime a JPEG y la guarda en Azure Blob). */
  subirFoto(id: number, file: Blob, fileName = 'foto.jpg'): Observable<IResponseGeneric<IFixedAssetPhoto>> {
    const formData = new FormData();
    formData.append('file', file, fileName);
    return this.http.post<IResponseGeneric<IFixedAssetPhoto>>(`${this.apiUrl}${environment.EPFixedAssets}/${id}/photo`, formData);
  }

  /** Se descarga como blob porque el endpoint requiere el token (no sirve un <img src> directo). */
  obtenerFoto(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${environment.EPFixedAssets}/${id}/photo`, { responseType: 'blob' });
  }

  eliminarFoto(id: number): Observable<IResponseGeneric<string>> {
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPFixedAssets}/${id}/photo`);
  }

  // ---- Reportes ----

  obtenerReporteHistorial(filtros: IFixedAssetHistoryFilters): Observable<IResponseGeneric<IFixedAssetHistoryReport>> {
    return this.http.get<IResponseGeneric<IFixedAssetHistoryReport>>(
      `${this.apiUrl}${environment.EPFixedAssets}/reports/history`, { params: this.paramsHistorial(filtros) }
    );
  }

  descargarReporteHistorialExcel(filtros: IFixedAssetHistoryFilters): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${environment.EPFixedAssets}/reports/history/excel`, {
      params: this.paramsHistorial(filtros), responseType: 'blob', observe: 'response',
    });
  }

  descargarFichaPdf(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${environment.EPFixedAssets}/${id}/sheet/pdf`, {
      responseType: 'blob', observe: 'response',
    });
  }

  private paramsHistorial(filtros: IFixedAssetHistoryFilters): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filtros)) {
      if (value !== null && value !== undefined && value !== '') params = params.set(key, value);
    }
    return params;
  }

}
