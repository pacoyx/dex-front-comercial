import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ILoginResponse } from '../interfaces/ILoginResponse';
import { ILoginRequest } from '../interfaces/ILoginRequest';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = environment.apiUrlBase;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<ILoginResponse> {
    const body: ILoginRequest = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ILoginResponse>(this.apiUrl + environment.EPlogin, body, { headers });
  }
}
