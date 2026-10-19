import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import {
  IEmployeeCreateRequest,
  IEmployeeDetail,
  IEmployeeListFilters,
  IEmployeeListResponse,
  IEmployeeResponse,
  IEmployeeTerminateRequest,
  IEmployeeUpdateRequest,
} from '../interfaces/IEmployees';
import { IEmployeeDocument, IEmployeeDocumentCreateRequest } from '../interfaces/IEmployeeDocuments';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  crearTrabajador(req: IEmployeeCreateRequest): Observable<IResponseGeneric<IEmployeeResponse>> {
    return this.http.post<IResponseGeneric<IEmployeeResponse>>(`${this.apiUrl}${environment.EPEmployees}`, req, { headers: this.headers });
  }

  listarTrabajadores(filtros: IEmployeeListFilters): Observable<IResponseGeneric<IEmployeeListResponse>> {
    const params: Record<string, string> = {};
    if (filtros.pageNumber != null) params['pageNumber'] = String(filtros.pageNumber);
    if (filtros.pageSize != null) params['pageSize'] = String(filtros.pageSize);
    if (filtros.onlyActive != null) params['onlyActive'] = String(filtros.onlyActive);
    if (filtros.areaId != null) params['areaId'] = String(filtros.areaId);
    if (filtros.search) params['search'] = filtros.search;
    return this.http.get<IResponseGeneric<IEmployeeListResponse>>(`${this.apiUrl}${environment.EPEmployees}`, { headers: this.headers, params });
  }

  obtenerTrabajador(id: number): Observable<IResponseGeneric<IEmployeeDetail>> {
    return this.http.get<IResponseGeneric<IEmployeeDetail>>(`${this.apiUrl}${environment.EPEmployees}/${id}`, { headers: this.headers });
  }

  actualizarTrabajador(id: number, req: IEmployeeUpdateRequest): Observable<IResponseGeneric<IEmployeeResponse>> {
    return this.http.put<IResponseGeneric<IEmployeeResponse>>(`${this.apiUrl}${environment.EPEmployees}/${id}`, req, { headers: this.headers });
  }

  darDeBaja(id: number, req: IEmployeeTerminateRequest): Observable<IResponseGeneric<IEmployeeResponse>> {
    return this.http.post<IResponseGeneric<IEmployeeResponse>>(`${this.apiUrl}${environment.EPEmployees}/${id}/terminate`, req, { headers: this.headers });
  }

  // Documentos

  listarDocumentos(employeeId: number): Observable<IResponseGeneric<IEmployeeDocument[]>> {
    return this.http.get<IResponseGeneric<IEmployeeDocument[]>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/documents`, { headers: this.headers });
  }

  agregarDocumento(employeeId: number, req: IEmployeeDocumentCreateRequest): Observable<IResponseGeneric<IEmployeeDocument>> {
    const formData = new FormData();
    formData.append('file', req.file);
    formData.append('documentTypeId', String(req.documentTypeId));
    if (req.notes) formData.append('notes', req.notes);
    // No se setea el header Content-Type: el browser debe agregar el boundary del multipart.
    return this.http.post<IResponseGeneric<IEmployeeDocument>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/documents`, formData);
  }

  descargarDocumento(employeeId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/documents/${documentId}/download`, { responseType: 'blob' });
  }

  eliminarDocumento(employeeId: number, documentId: number): Observable<IResponseGeneric<null>> {
    return this.http.delete<IResponseGeneric<null>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/documents/${documentId}`, { headers: this.headers });
  }

}
