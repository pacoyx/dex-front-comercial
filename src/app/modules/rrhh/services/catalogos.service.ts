import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IArea, ICatalogCreateRequest, ICatalogUpdateRequest, IDocumentType, IPosition } from '../interfaces/ICatalogos';
import { IResponseGeneric } from '../interfaces/IShared';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  // Áreas

  listarAreas(onlyActive?: boolean): Observable<IResponseGeneric<IArea[]>> {
    const params: Record<string, string> = {};
    if (onlyActive != null) params['onlyActive'] = String(onlyActive);
    return this.http.get<IResponseGeneric<IArea[]>>(`${this.apiUrl}${environment.EPHrAreas}`, { headers: this.headers, params });
  }

  crearArea(req: ICatalogCreateRequest): Observable<IResponseGeneric<IArea>> {
    return this.http.post<IResponseGeneric<IArea>>(`${this.apiUrl}${environment.EPHrAreas}`, req, { headers: this.headers });
  }

  actualizarArea(id: number, req: ICatalogUpdateRequest): Observable<IResponseGeneric<IArea>> {
    return this.http.put<IResponseGeneric<IArea>>(`${this.apiUrl}${environment.EPHrAreas}/${id}`, req, { headers: this.headers });
  }

  eliminarArea(id: number): Observable<IResponseGeneric<null>> {
    return this.http.delete<IResponseGeneric<null>>(`${this.apiUrl}${environment.EPHrAreas}/${id}`, { headers: this.headers });
  }

  // Cargos

  listarCargos(onlyActive?: boolean): Observable<IResponseGeneric<IPosition[]>> {
    const params: Record<string, string> = {};
    if (onlyActive != null) params['onlyActive'] = String(onlyActive);
    return this.http.get<IResponseGeneric<IPosition[]>>(`${this.apiUrl}${environment.EPHrPositions}`, { headers: this.headers, params });
  }

  crearCargo(req: ICatalogCreateRequest): Observable<IResponseGeneric<IPosition>> {
    return this.http.post<IResponseGeneric<IPosition>>(`${this.apiUrl}${environment.EPHrPositions}`, req, { headers: this.headers });
  }

  actualizarCargo(id: number, req: ICatalogUpdateRequest): Observable<IResponseGeneric<IPosition>> {
    return this.http.put<IResponseGeneric<IPosition>>(`${this.apiUrl}${environment.EPHrPositions}/${id}`, req, { headers: this.headers });
  }

  eliminarCargo(id: number): Observable<IResponseGeneric<null>> {
    return this.http.delete<IResponseGeneric<null>>(`${this.apiUrl}${environment.EPHrPositions}/${id}`, { headers: this.headers });
  }

  // Tipos de documento

  listarTiposDocumento(): Observable<IResponseGeneric<IDocumentType[]>> {
    return this.http.get<IResponseGeneric<IDocumentType[]>>(`${this.apiUrl}${environment.EPHrDocumentTypes}`, { headers: this.headers });
  }

}
