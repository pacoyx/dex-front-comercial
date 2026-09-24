import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import { IAttendanceRecord, IAttendanceIncident, IExtraHour } from '../interfaces/IAttendance';
import { ILoanReportItem, ILoanReportFilters, IPayrollReportFilters, IPayrollReportItem, IAttendanceReportFilters, IExtraHourReportFilters } from '../interfaces/IReports';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  reportePlanillas(filtros: IPayrollReportFilters): Observable<IResponseGeneric<IPayrollReportItem[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.payrollPeriodId != null) params['payrollPeriodId'] = String(filtros.payrollPeriodId);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    return this.http.get<IResponseGeneric<IPayrollReportItem[]>>(`${this.apiUrl}${environment.EPHrReports}/payroll`, { headers: this.headers, params });
  }

  reportePrestamos(filtros: ILoanReportFilters): Observable<IResponseGeneric<ILoanReportItem[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    if (filtros.isClosed != null) params['isClosed'] = String(filtros.isClosed);
    return this.http.get<IResponseGeneric<ILoanReportItem[]>>(`${this.apiUrl}${environment.EPHrReports}/loans`, { headers: this.headers, params });
  }

  reporteAdelantos(filtros: ILoanReportFilters): Observable<IResponseGeneric<ILoanReportItem[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    if (filtros.isClosed != null) params['isClosed'] = String(filtros.isClosed);
    return this.http.get<IResponseGeneric<ILoanReportItem[]>>(`${this.apiUrl}${environment.EPHrReports}/advances`, { headers: this.headers, params });
  }

  reporteAsistencia(filtros: IAttendanceReportFilters): Observable<IResponseGeneric<IAttendanceRecord[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    return this.http.get<IResponseGeneric<IAttendanceRecord[]>>(`${this.apiUrl}${environment.EPHrReports}/attendance`, { headers: this.headers, params });
  }

  reporteTardanzas(filtros: IAttendanceReportFilters): Observable<IResponseGeneric<IAttendanceIncident[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    return this.http.get<IResponseGeneric<IAttendanceIncident[]>>(`${this.apiUrl}${environment.EPHrReports}/late-arrivals`, { headers: this.headers, params });
  }

  reporteHorasExtra(filtros: IExtraHourReportFilters): Observable<IResponseGeneric<IExtraHour[]>> {
    const params: Record<string, string> = {};
    if (filtros.employeeId != null) params['employeeId'] = String(filtros.employeeId);
    if (filtros.approved != null) params['approved'] = String(filtros.approved);
    if (filtros.startDate) params['startDate'] = filtros.startDate;
    if (filtros.endDate) params['endDate'] = filtros.endDate;
    return this.http.get<IResponseGeneric<IExtraHour[]>>(`${this.apiUrl}${environment.EPHrReports}/extra-hours`, { headers: this.headers, params });
  }

}
