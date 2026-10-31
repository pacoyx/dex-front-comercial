import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import {
  ICreateFixedAssetMaintenanceRequest,
  ICreateFixedAssetRequest,
  IDisposeFixedAssetRequest,
  IFixedAssetCategory,
  IFixedAssetDetail,
  IFixedAssetListFilters,
  IFixedAssetListItem,
  IFixedAssetMaintenance,
  IFixedAssetMaintenanceAttachment,
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

}
