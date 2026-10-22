import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import {
  IAddScheduledEmailRecipientRequest,
  ICreateScheduledEmailNotificationRequest,
  IScheduledEmailExecution,
  IScheduledEmailNotification,
  IScheduledEmailNotificationSummary,
  IScheduledEmailPreview,
  IScheduledEmailRecipient,
  IUpdateScheduledEmailNotificationRequest,
} from '../interfaces/IScheduledEmailNotification';

@Injectable({
  providedIn: 'root'
})
export class ScheduledEmailNotificationsService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  private url(path = ''): string {
    return `${this.apiUrl}${environment.EPScheduledEmailNotifications}${path}`;
  }

  listar(): Observable<IResponseGeneric<IScheduledEmailNotificationSummary[]>> {
    return this.http.get<IResponseGeneric<IScheduledEmailNotificationSummary[]>>(this.url(), { headers: this.headers });
  }

  obtenerPorId(id: number): Observable<IResponseGeneric<IScheduledEmailNotification>> {
    return this.http.get<IResponseGeneric<IScheduledEmailNotification>>(this.url(`/${id}`), { headers: this.headers });
  }

  crear(req: ICreateScheduledEmailNotificationRequest): Observable<IResponseGeneric<IScheduledEmailNotification>> {
    return this.http.post<IResponseGeneric<IScheduledEmailNotification>>(this.url(), req, { headers: this.headers });
  }

  actualizar(id: number, req: IUpdateScheduledEmailNotificationRequest): Observable<IResponseGeneric<IScheduledEmailNotification>> {
    return this.http.put<IResponseGeneric<IScheduledEmailNotification>>(this.url(`/${id}`), req, { headers: this.headers });
  }

  habilitar(id: number): Observable<IResponseGeneric<IScheduledEmailNotification>> {
    return this.http.post<IResponseGeneric<IScheduledEmailNotification>>(this.url(`/${id}/enable`), {}, { headers: this.headers });
  }

  deshabilitar(id: number): Observable<IResponseGeneric<IScheduledEmailNotification>> {
    return this.http.post<IResponseGeneric<IScheduledEmailNotification>>(this.url(`/${id}/disable`), {}, { headers: this.headers });
  }

  agregarDestinatario(id: number, req: IAddScheduledEmailRecipientRequest): Observable<IResponseGeneric<IScheduledEmailRecipient>> {
    return this.http.post<IResponseGeneric<IScheduledEmailRecipient>>(this.url(`/${id}/recipients`), req, { headers: this.headers });
  }

  eliminarDestinatario(id: number, recipientId: number): Observable<IResponseGeneric<string>> {
    return this.http.delete<IResponseGeneric<string>>(this.url(`/${id}/recipients/${recipientId}`), { headers: this.headers });
  }

  ejecutarAhora(id: number): Observable<IResponseGeneric<IScheduledEmailExecution>> {
    return this.http.post<IResponseGeneric<IScheduledEmailExecution>>(this.url(`/${id}/execute`), {}, { headers: this.headers });
  }

  enviarPrueba(id: number, testEmail: string): Observable<IResponseGeneric<string>> {
    return this.http.post<IResponseGeneric<string>>(this.url(`/${id}/send-test`), { testEmail }, { headers: this.headers });
  }

  vistaPrevia(id: number): Observable<IResponseGeneric<IScheduledEmailPreview>> {
    return this.http.post<IResponseGeneric<IScheduledEmailPreview>>(this.url(`/${id}/preview`), {}, { headers: this.headers });
  }

  historialEjecuciones(id: number): Observable<IResponseGeneric<IScheduledEmailExecution[]>> {
    return this.http.get<IResponseGeneric<IScheduledEmailExecution[]>>(this.url(`/${id}/executions`), { headers: this.headers });
  }

}
