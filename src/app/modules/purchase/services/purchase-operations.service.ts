import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IInvoiceCreateRequest, IInvoiceCreateResponse } from '../interfaces/IOperaciones';
import { IResponseGeneric } from '../interfaces/IMaestros';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOperationsService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  crearInvoice(req: IInvoiceCreateRequest): Observable<IResponseGeneric<IInvoiceCreateResponse>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<IInvoiceCreateResponse>>(`${this.apiUrl}${environment.EPCrearInvoice}`, req, { headers });
  }

}
