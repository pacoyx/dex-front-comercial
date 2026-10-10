import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../interfaces/IShared';
import { ICustomerPriceListActive } from '../interfaces/ICustomerPriceList';

@Injectable({
  providedIn: 'root'
})
export class CustomerActivePriceListService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  obtenerActiva(customerId: number): Observable<IResponseGeneric<ICustomerPriceListActive>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<ICustomerPriceListActive>>(`${this.apiUrl}${environment.EPCustomersBase}/${customerId}/price-lists/active`, { headers });
  }

}
