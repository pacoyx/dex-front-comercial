import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import { FindClothingWorkerReqDto, FindClothingWorkerResponseDto } from '../interfaces/ClothingWorker';
import { ICreateTicketRequest, ICreateTicketResponse } from '../interfaces/Tickets';

@Injectable({
  providedIn: 'root'
})
export class RoperiaService {

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

  getTrabajadirPorIdDni(req: FindClothingWorkerReqDto) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<FindClothingWorkerResponseDto>>(`${this.apiUrl}${environment.EPGetClothingWorkerById}`, req, { headers });
  }


  createTicket(ticket: ICreateTicketRequest) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}${environment.EPCreateTicket}`;
    return this.http.post<IResponseGeneric<ICreateTicketResponse>>(url, ticket, { headers });
  }

}
