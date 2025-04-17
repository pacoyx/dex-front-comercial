import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ICreateUserRequest, IGetUserResponse, IUpdateUserRequest } from '../interfaces/IUsers';
import { environment } from '../../../../environments/environment';
import { IResponseGeneric } from '../../../core/interfaces/IShared';
import { ICreateCompanyRequest, IGetCompaniesResponse, IGetCompanyByUserResponse, IGetCompanyResponse, IUpdateCompanyRequest } from '../interfaces/ICompany';


@Injectable({
  providedIn: 'root'
})
export class ManagentSystemService {

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

  crearUsuario(req: ICreateUserRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPPostUsers}`, req, { headers });
  }

  actualizarUsuario(req: IUpdateUserRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPPutUsers}/${req.id}`, req, { headers });
  }

  eliminarUsuario(id: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPDeleteUsers}/${id}`, { headers });
  }

  listarUsuario(id: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetUserResponse>>(`${this.apiUrl}${environment.EPGetUser}/${id}`, { headers });
  }

  listarUsuarios() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetUserResponse[]>>(`${this.apiUrl}${environment.EPGetUsers}`, { headers });
  }

  crearEmpresa(req: ICreateCompanyRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPCreateCompany}`, req, { headers });
  }

  actualizarEmpresa(req: IUpdateCompanyRequest): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPUpdateCompany}`, req, { headers });
  }

  eliminarEmpresa(id: number): Observable<IResponseGeneric<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete<IResponseGeneric<string>>(`${this.apiUrl}${environment.EPUpdateCompany}/${id}`, { headers });
  }

  listarEmpresas() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetCompaniesResponse[]>>(`${this.apiUrl}${environment.EPGetCompanies}`, { headers });
  }

  obtenerEmpresa(id: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetCompanyResponse[]>>(`${this.apiUrl}${environment.EPGetCompany}/${id}`, { headers });
  }

  obtenerEmpresaPorUsuario(idUsuario: number) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<IResponseGeneric<IGetCompanyByUserResponse>>(`${this.apiUrl}${environment.EPGetCompanyByUser}/${idUsuario}`, { headers });
  }

}
