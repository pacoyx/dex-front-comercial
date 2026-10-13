import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import { ICreateVehicleRequest, IUpdateVehicleRequest, IVehicle } from '../interfaces/IVehicle';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  listar(includeInactive = false): Observable<IResponseGeneric<IVehicle[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let params = new HttpParams();
    if (includeInactive) params = params.set('includeInactive', 'true');
    return this.http.get<IResponseGeneric<IVehicle[]>>(`${this.apiUrl}${environment.EPVehicles}`, { headers, params });
  }

  obtenerPorId(id: number): Observable<IResponseGeneric<IVehicle>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IVehicle>>(`${this.apiUrl}${environment.EPVehicles}/${id}`, { headers });
  }

  crear(req: ICreateVehicleRequest): Observable<IResponseGeneric<IVehicle>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IVehicle>>(`${this.apiUrl}${environment.EPVehicles}`, req, { headers });
  }

  actualizar(id: number, req: IUpdateVehicleRequest): Observable<IResponseGeneric<IVehicle>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<IVehicle>>(`${this.apiUrl}${environment.EPVehicles}/${id}`, req, { headers });
  }

  desactivar(id: number): Observable<IResponseGeneric<{ id: number; isActive: boolean }>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<IResponseGeneric<{ id: number; isActive: boolean }>>(`${this.apiUrl}${environment.EPVehicles}/${id}`, { headers });
  }

}
