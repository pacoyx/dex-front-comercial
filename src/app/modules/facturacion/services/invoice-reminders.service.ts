import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/ICatalogos';
import {
  IInvoiceReminderLog,
  IInvoiceReminderLogFilters,
  IInvoiceReminderPreview,
  ISendTestInvoiceReminderRequest,
} from '../interfaces/IInvoiceReminder';

@Injectable({
  providedIn: 'root'
})
export class InvoiceRemindersService {

  private apiUrl = environment.apiUrlBase;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  private url(path = ''): string {
    return `${this.apiUrl}${environment.EPInvoiceReminders}${path}`;
  }

  ejecutarAhora(): Observable<IResponseGeneric<string>> {
    return this.http.post<IResponseGeneric<string>>(this.url('/execute'), {}, { headers: this.headers });
  }

  vistaPrevia(customerId: number): Observable<IResponseGeneric<IInvoiceReminderPreview>> {
    return this.http.post<IResponseGeneric<IInvoiceReminderPreview>>(this.url(`/preview/${customerId}`), {}, { headers: this.headers });
  }

  enviarPrueba(req: ISendTestInvoiceReminderRequest): Observable<IResponseGeneric<string>> {
    return this.http.post<IResponseGeneric<string>>(this.url('/send-test'), req, { headers: this.headers });
  }

  listarHistorial(filtros: IInvoiceReminderLogFilters): Observable<IResponseGeneric<IInvoiceReminderLog[]>> {
    let params = new HttpParams();
    if (filtros.customerId != null) params = params.set('customerId', String(filtros.customerId));
    if (filtros.fromDate) params = params.set('fromDate', filtros.fromDate);
    if (filtros.toDate) params = params.set('toDate', filtros.toDate);
    if (filtros.status != null) params = params.set('status', String(filtros.status));
    return this.http.get<IResponseGeneric<IInvoiceReminderLog[]>>(this.url('/logs'), { headers: this.headers, params });
  }

}
