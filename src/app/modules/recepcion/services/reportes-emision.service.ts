import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IResponseGeneric';
import { DataResumenCaja, ICajasPorFecha, IDashboardCashResponseDto, IReportGetGuiasPaginadoResponse, IReportResumenCajaPorFechaResponse, IResumenCajaDetalle } from '../interfaces/IReports';

@Injectable({
  providedIn: 'root'
})
export class ReportesEmisionService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('An error occurred:', error.error.message);
    } else {
      // Error del lado del servidor
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError(error);
  }

  obtenerGuiasPorFecha(fecha: string, pageIndex: number, pageSize: number): Observable<IResponseGeneric<IReportGetGuiasPaginadoResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { date: fecha };
    return this.http.get<IResponseGeneric<IReportGetGuiasPaginadoResponse>>(`${this.apiUrl}${environment.EPGuiasPorFecha}/${pageIndex}/${pageSize}`, { headers, params });
  }

  obtenerGuiasPorCliente(customerId: number, pageIndex: number, pageSize: number): Observable<IResponseGeneric<IReportGetGuiasPaginadoResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IReportGetGuiasPaginadoResponse>>(`${this.apiUrl}${environment.EPGuiasPorCliente}/${customerId}/${pageIndex}/${pageSize}`, { headers });
  }

  obtenerReprteResumenCajaPorFecha(fecha: string, userId: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { fecha: fecha, userId };
    return this.http.get<IResponseGeneric<IReportResumenCajaPorFechaResponse[]>>(`${this.apiUrl}${environment.EPResumenCajaPorFecha}`, { headers, params });
  }

  obtenerDetalleResumenPorUsuarioYTipoPago(cajaId: number, tipoPago: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<DataResumenCaja>>(`${this.apiUrl}${environment.EPResumenCajaPorFechaDetallePorId}/${cajaId}/${tipoPago}`, { headers });
  }

  obtenerCajasPorFecha(fecha: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { fecha: fecha };
    return this.http.get<IResponseGeneric<ICajasPorFecha[]>>(`${this.apiUrl}${environment.EPObtenerCajasPorFecha}`, { headers, params });
  }

  obtenerCajaDashboard(fecha: string, sucursal: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { date: fecha, sucursal: sucursal };
    return this.http.get<IResponseGeneric<IDashboardCashResponseDto[]>>(`${this.apiUrl}${environment.EPdashboardcash}`, { headers, params });
  }

}
