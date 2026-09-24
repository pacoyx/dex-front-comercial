import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import {
  IAttendanceIncident,
  IAttendanceIncidentCreateRequest,
  IAttendanceIncidentListFilters,
  IAttendanceListFilters,
  IAttendanceRecord,
  IAttendanceUpsertRequest,
  IExtraHour,
  IExtraHourCreateRequest,
  IExtraHourListFilters,
} from '../interfaces/IAttendance';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  marcar(req: IAttendanceUpsertRequest): Observable<IResponseGeneric<IAttendanceRecord>> {
    return this.http.post<IResponseGeneric<IAttendanceRecord>>(`${this.apiUrl}${environment.EPAttendance}`, req, { headers: this.headers });
  }

  listarAsistencia(filtros: IAttendanceListFilters): Observable<IResponseGeneric<IAttendanceRecord[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    return this.http.get<IResponseGeneric<IAttendanceRecord[]>>(`${this.apiUrl}${environment.EPAttendance}`, { headers: this.headers, params });
  }

  registrarFalta(employeeId: number, req: IAttendanceIncidentCreateRequest): Observable<IResponseGeneric<IAttendanceIncident>> {
    return this.http.post<IResponseGeneric<IAttendanceIncident>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/absences`, req, { headers: this.headers });
  }

  registrarTardanza(employeeId: number, req: IAttendanceIncidentCreateRequest): Observable<IResponseGeneric<IAttendanceIncident>> {
    return this.http.post<IResponseGeneric<IAttendanceIncident>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/late-arrivals`, req, { headers: this.headers });
  }

  registrarPermiso(employeeId: number, req: IAttendanceIncidentCreateRequest): Observable<IResponseGeneric<IAttendanceIncident>> {
    return this.http.post<IResponseGeneric<IAttendanceIncident>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/permissions`, req, { headers: this.headers });
  }

  listarIncidencias(filtros: IAttendanceIncidentListFilters): Observable<IResponseGeneric<IAttendanceIncident[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.type != null) params['type'] = String(filtros.type);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    return this.http.get<IResponseGeneric<IAttendanceIncident[]>>(`${this.apiUrl}${environment.EPAttendanceIncidents}`, { headers: this.headers, params });
  }

  registrarHoraExtra(employeeId: number, req: IExtraHourCreateRequest): Observable<IResponseGeneric<IExtraHour>> {
    return this.http.post<IResponseGeneric<IExtraHour>>(`${this.apiUrl}${environment.EPEmployees}/${employeeId}/extra-hours`, req, { headers: this.headers });
  }

  listarHorasExtra(filtros: IExtraHourListFilters): Observable<IResponseGeneric<IExtraHour[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.approved != null) params['approved'] = String(filtros.approved);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    return this.http.get<IResponseGeneric<IExtraHour[]>>(`${this.apiUrl}${environment.EPExtraHours}`, { headers: this.headers, params });
  }

  aprobarHoraExtra(id: number): Observable<IResponseGeneric<IExtraHour>> {
    return this.http.post<IResponseGeneric<IExtraHour>>(`${this.apiUrl}${environment.EPExtraHours}/${id}/approve`, {}, { headers: this.headers });
  }

}
