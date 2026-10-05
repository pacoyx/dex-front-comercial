import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IBranchSales, IResponseGeneric } from '../interfaces/IShared';

@Injectable({
  providedIn: 'root'
})
export class CatalogosGastosService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  obtenerSucursales(): Observable<IResponseGeneric<IBranchSales[]>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IBranchSales[]>>(`${this.apiUrl}${environment.EPListarSucursales}`, { headers });
  }

}
