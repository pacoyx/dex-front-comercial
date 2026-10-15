import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import {
  CreateItemInspectionRequest,
  InspectionSummaryResponse,
  ItemInspectionResponse,
  ItemPhotoResponse,
  SneakerBrandResponse,
  SneakerDetailResponse,
  SneakerReportFilters,
  SneakerReportRowResponse,
  UpsertSneakerDetailRequest,
  WorkGuidePhotosResponse
} from '../interfaces/IInspeccion';

@Injectable({
  providedIn: 'root'
})
export class InspeccionService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listarMarcasZapatilla() {
    return this.http.get<IResponseGeneric<SneakerBrandResponse[]>>(`${this.apiUrl}${environment.EPSneakerBrands}`);
  }

  guardarInfoZapatilla(workGuideDetailId: number, body: UpsertSneakerDetailRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWorkGuideDetails}/${workGuideDetailId}/sneaker`;
    return this.http.post<IResponseGeneric<SneakerDetailResponse>>(url, body, { headers });
  }

  obtenerInfoZapatilla(workGuideDetailId: number) {
    const url = `${this.apiUrl}${environment.EPWorkGuideDetails}/${workGuideDetailId}/sneaker`;
    return this.http.get<IResponseGeneric<SneakerDetailResponse>>(url);
  }

  guardarInspeccion(workGuideDetailId: number, body: CreateItemInspectionRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPWorkGuideDetails}/${workGuideDetailId}/inspection`;
    return this.http.post<IResponseGeneric<ItemInspectionResponse>>(url, body, { headers });
  }

  obtenerInspeccion(workGuideDetailId: number) {
    const url = `${this.apiUrl}${environment.EPWorkGuideDetails}/${workGuideDetailId}/inspection`;
    return this.http.get<IResponseGeneric<ItemInspectionResponse>>(url);
  }

  agregarFotoGuia(workGuideId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.apiUrl}${environment.EPWorkGuides}/${workGuideId}/photos`;
    return this.http.post<IResponseGeneric<ItemPhotoResponse>>(url, formData);
  }

  obtenerResumenInspeccionPorGuia(workGuideId: number) {
    const url = `${this.apiUrl}${environment.EPWorkGuides}/${workGuideId}/inspection-summary`;
    return this.http.get<IResponseGeneric<InspectionSummaryResponse>>(url);
  }

  obtenerFotosPorGuia(workGuideId: number) {
    const url = `${this.apiUrl}${environment.EPWorkGuides}/${workGuideId}/photos`;
    return this.http.get<IResponseGeneric<WorkGuidePhotosResponse>>(url);
  }

  descargarFotoGuia(photoId: number) {
    const url = `${this.apiUrl}${environment.EPWorkGuides}/photos/${photoId}/download`;
    return this.http.get(url, { responseType: 'blob' });
  }

  obtenerReporteZapatillas(filtros: SneakerReportFilters) {
    let params = new HttpParams();
    if (filtros.dateFrom) params = params.set('dateFrom', filtros.dateFrom);
    if (filtros.dateTo) params = params.set('dateTo', filtros.dateTo);
    if (filtros.branchId) params = params.set('branchId', filtros.branchId);
    if (filtros.brandId) params = params.set('brandId', filtros.brandId);
    if (filtros.ticketStatus) params = params.set('ticketStatus', filtros.ticketStatus);
    if (filtros.pendingDelivery) params = params.set('pendingDelivery', filtros.pendingDelivery);

    const url = `${this.apiUrl}${environment.EPReporteSneakers}`;
    return this.http.get<IResponseGeneric<SneakerReportRowResponse[]>>(url, { params });
  }
}
